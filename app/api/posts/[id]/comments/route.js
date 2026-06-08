import dbConnect from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import Comment from "@/lib/models/Comment";
import Reaction from "@/lib/models/Reaction";
import cache from "@/lib/utils/cache";
import cloudinary from "@/lib/cloudinary";
import {
  getCurrentUserId,
  successResponse,
  errorResponse,
} from "@/lib/utils/auth";

// GET - Fetch comments for a post (hierarchical)
export async function GET(request, { params }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const { id: postId } = await params;

    // Verify post exists and user can view it
    const post = await Post.findById(postId).lean();
    if (!post) {
      return errorResponse("Post not found", 404);
    }
    if (post.isPrivate && post.author.toString() !== userId) {
      return errorResponse("Not authorized", 403);
    }

    // Fetch ALL comments for this post to build a tree
    const allComments = await Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .populate("author", "firstName lastName")
      .lean();

    // Fetch user's reactions for all these comments
    const allCommentIds = allComments.map((c) => c._id);
    const userReactions = await Reaction.find({
      user: userId,
      comment: { $in: allCommentIds },
    }).lean();

    const reactionMap = userReactions.reduce((acc, r) => {
      acc[r.comment.toString()] = r;
      return acc;
    }, {});

    // Attach reactions and prepare for tree building
    const commentsWithReactions = allComments.map((c) => ({
      ...c,
      reactions: reactionMap[c._id.toString()] ? [reactionMap[c._id.toString()]] : [],
      replies: [],
    }));

    // Build the tree
    const commentMap = {};
    const roots = [];

    // First pass: Initialize all comment objects in the map
    commentsWithReactions.forEach((c) => {
      commentMap[c._id.toString()] = { ...c, replies: [] };
    });

    // Second pass: Build the hierarchy
    commentsWithReactions.forEach((c) => {
      const commentObj = commentMap[c._id.toString()];
      if (c.parent) {
        const parentId = c.parent.toString();
        const parent = commentMap[parentId];
        if (parent) {
          parent.replies.push(commentObj);
        } else {
          // If parent is missing from this post's comments, treat as root
          roots.push(commentObj);
        }
      } else {
        roots.push(commentObj);
      }
    });

    // Sort roots by newest first
    roots.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    // Ensure all replies are sorted by oldest first (chronological thread)
    const sortReplies = (comment) => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          return aTime - bTime;
        });
        comment.replies.forEach(sortReplies);
      }
    };
    roots.forEach(sortReplies);

    const totalRoots = await Comment.countDocuments({ post: postId, parent: null });
    const totalAll = await Comment.countDocuments({ post: postId });

    return successResponse({
      comments: roots,
      pagination: {
        total: totalRoots,
        totalAll,
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST - Create a new comment or reply (supports FormData with optional file)
export async function POST(request, { params }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const { id: postId } = await params;
    const formData = await request.formData();
    const content = formData.get("content")?.trim() || "";
    const parentId = formData.get("parentId") || null;
    const file = formData.get("file");

    if (!content && !file) {
      return errorResponse("Comment must have content or an image");
    }

    // Verify post exists and user can view it
    const post = await Post.findById(postId);
    if (!post) {
      return errorResponse("Post not found", 404);
    }
    if (post.isPrivate && post.author.toString() !== userId) {
      return errorResponse("Not authorized", 403);
    }

    // If it's a reply, verify parent comment exists
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return errorResponse("Parent comment not found", 404);
      }
    }

    let imageUrl = null;

    // Upload file if provided
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise((resolve, reject) => {
        const { Readable } = require("stream");
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "buddy-script/comments",
            resource_type: "image",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        Readable.from(buffer).pipe(uploadStream);
      });

      imageUrl = result.secure_url;
    }

    const comment = await Comment.create({
      post: postId,
      author: userId,
      content,
      imageUrl,
      parent: parentId || null,
    });

    // Increment post comment count
    post.commentsCount = post.commentsCount + 1;
    await post.save();

    // Invalidate feed cache
    cache.invalidatePrefix("feed:");

    await comment.populate("author", "firstName lastName");

    return successResponse({ comment }, 201);
  } catch (error) {
    console.error("Create comment error:", error);
    return errorResponse("Internal server error", 500);
  }
}
