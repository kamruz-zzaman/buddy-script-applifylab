import dbConnect from "@/lib/mongodb";
import Comment from "@/lib/models/Comment";
import Reaction from "@/lib/models/Reaction";
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

    // Find existing reaction in Reaction collection
    const existing = await Reaction.findOne({
      comment: commentId,
      user: userId,
    });

    if (existing) {
      if (existing.type === reactionType) {
        await Reaction.findByIdAndDelete(existing._id);
        comment.reactionCounts[existing.type] = Math.max(
          0,
          (comment.reactionCounts[existing.type] || 0) - 1,
        );
        comment.reactionsCount = Math.max(0, (comment.reactionsCount || 0) - 1);
      } else {
        existing.type = reactionType;
        await existing.save();
        comment.reactionCounts[reactionType] =
          (comment.reactionCounts[reactionType] || 0) + 1;
      }
    } else {
      await Reaction.create({
        comment: commentId,
        user: userId,
        type: reactionType,
      });
      comment.reactionCounts[reactionType] =
        (comment.reactionCounts[reactionType] || 0) + 1;
      comment.reactionsCount = (comment.reactionsCount || 0) + 1;
    }

    await comment.save();

    const myReaction = await Reaction.findOne({
      comment: commentId,
      user: userId,
    }).lean();

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
