import dbConnect from "@/lib/mongodb";
import Comment from "@/lib/models/Comment";
import Post from "@/lib/models/Post";
import { getCurrentUserId, successResponse, errorResponse } from "@/lib/utils/auth";

// POST - Toggle like/unlike on a comment
export async function POST(request, { params }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const { id: commentId } = await params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return errorResponse("Comment not found", 404);
    }

    // Verify user can view the parent post
    const post = await Post.findById(comment.post).lean();
    if (post && post.isPrivate && post.author.toString() !== userId) {
      return errorResponse("Not authorized", 403);
    }

    const alreadyLiked = comment.likes.some(
      (likeId) => likeId.toString() === userId
    );

    if (alreadyLiked) {
      // Unlike
      comment.likes.pull(userId);
      comment.likesCount = Math.max(0, comment.likesCount - 1);
      await comment.save();
      return successResponse({ liked: false, likesCount: comment.likesCount });
    } else {
      // Like
      comment.likes.push(userId);
      comment.likesCount = comment.likesCount + 1;
      await comment.save();
      return successResponse({ liked: true, likesCount: comment.likesCount });
    }
  } catch (error) {
    console.error("Like comment error:", error);
    return errorResponse("Internal server error", 500);
  }
}
