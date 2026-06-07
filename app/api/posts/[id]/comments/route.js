import dbConnect from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import Comment from "@/lib/models/Comment";
import cloudinary from "@/lib/cloudinary";
import {
  getCurrentUserId,
  successResponse,
  errorResponse,
} from "@/lib/utils/auth";

// GET - Fetch comments for a post (cursor-based)
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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit")) || 20),
    );
    const cursor = searchParams.get("cursor");

    // Build query with cursor
    const query = { post: postId, parent: null };
    if (cursor) {
      const { default: mongoose } = await import("mongoose");
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const comments = await Comment.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate("author", "firstName lastName")
      .lean();

    const hasMore = comments.length > limit;
    if (hasMore) comments.pop();

    // For each top-level comment, fetch its replies
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parent: comment._id })
          .sort({ createdAt: 1 })
          .populate("author", "firstName lastName")
          .lean();
        return { ...comment, replies };
      }),
    );

    const total = await Comment.countDocuments({ post: postId, parent: null });
    const nextCursor =
      commentsWithReplies.length > 0
        ? commentsWithReplies[commentsWithReplies.length - 1]._id
        : null;

    return successResponse({
      comments: commentsWithReplies,
      pagination: {
        limit,
        nextCursor,
        hasMore,
        total,
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

    await comment.populate("author", "firstName lastName");

    return successResponse({ comment }, 201);
  } catch (error) {
    console.error("Create comment error:", error);
    return errorResponse("Internal server error", 500);
  }
}
