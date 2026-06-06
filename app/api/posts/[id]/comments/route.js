import dbConnect from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import Comment from "@/lib/models/Comment";
import { getCurrentUserId, successResponse, errorResponse } from "@/lib/utils/auth";

// GET - Fetch comments for a post
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
    const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;

    // Fetch top-level comments (parent is null) with pagination
    const [comments, total] = await Promise.all([
      Comment.find({ post: postId, parent: null })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "firstName lastName")
        .populate("reactions.user", "firstName lastName")
        .lean(),
      Comment.countDocuments({ post: postId, parent: null }),
    ]);

    // For each top-level comment, fetch its replies
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parent: comment._id })
          .sort({ createdAt: 1 })
          .populate("author", "firstName lastName")
          .populate("reactions.user", "firstName lastName")
          .lean();
        return { ...comment, replies };
      })
    );

    return successResponse({
      comments: commentsWithReplies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + comments.length < total,
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST - Create a new comment or reply
export async function POST(request, { params }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const { id: postId } = await params;
    const body = await request.json();
    const { content, parentId, imageUrl } = body;

    if ((!content || !content.trim()) && !imageUrl) {
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

    const comment = await Comment.create({
      post: postId,
      author: userId,
      content: content?.trim() || "",
      imageUrl: imageUrl || null,
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
