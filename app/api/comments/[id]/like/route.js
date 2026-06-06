import dbConnect from "@/lib/mongodb";
import Comment from "@/lib/models/Comment";
import Post from "@/lib/models/Post";
import {
  getCurrentUserId,
  successResponse,
  errorResponse,
} from "@/lib/utils/auth";

const VALID_REACTIONS = ["like", "love", "haha", "wow", "sad", "angry"];

// POST - Add/remove/change reaction on a comment
export async function POST(request, { params }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const { id: commentId } = await params;
    const body = await request.json().catch(() => ({}));
    const reactionType = VALID_REACTIONS.includes(body.type)
      ? body.type
      : "like";

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return errorResponse("Comment not found", 404);
    }

    // Verify user can view the parent post
    const post = await Post.findById(comment.post).lean();
    if (post && post.isPrivate && post.author.toString() !== userId) {
      return errorResponse("Not authorized", 403);
    }

    // Find existing reaction
    const existingIdx = comment.reactions.findIndex(
      (r) => r.user.toString() === userId,
    );

    if (existingIdx !== -1) {
      const existingType = comment.reactions[existingIdx].type;
      if (existingType === reactionType) {
        comment.reactionCounts[existingType] = Math.max(
          0,
          comment.reactionCounts[existingType] - 1,
        );
        comment.reactionsCount = Math.max(0, comment.reactionsCount - 1);
        comment.reactions.splice(existingIdx, 1);
      } else {
        comment.reactionCounts[existingType] = Math.max(
          0,
          comment.reactionCounts[existingType] - 1,
        );
        comment.reactions[existingIdx].type = reactionType;
        comment.reactionCounts[reactionType] =
          (comment.reactionCounts[reactionType] || 0) + 1;
      }
    } else {
      comment.reactions.push({ user: userId, type: reactionType });
      comment.reactionCounts[reactionType] =
        (comment.reactionCounts[reactionType] || 0) + 1;
      comment.reactionsCount = comment.reactionsCount + 1;
    }

    await comment.save();

    const myReaction = comment.reactions.find(
      (r) => r.user.toString() === userId,
    );

    return successResponse({
      myReaction: myReaction ? myReaction.type : null,
      reactionCounts: comment.reactionCounts,
      reactionsCount: comment.reactionsCount,
    });
  } catch (error) {
    console.error("React comment error:", error);
    return errorResponse("Internal server error", 500);
  }
}
