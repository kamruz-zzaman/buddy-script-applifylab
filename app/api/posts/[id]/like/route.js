import dbConnect from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import Reaction from "@/lib/models/Reaction";
import {
  getCurrentUserId,
  successResponse,
  errorResponse,
} from "@/lib/utils/auth";

const VALID_REACTIONS = ["like", "love", "haha", "wow", "sad", "angry"];

// POST - Add/remove/change reaction on a post
export async function POST(request, { params }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reactionType = VALID_REACTIONS.includes(body.type)
      ? body.type
      : "like";

    const post = await Post.findById(id);
    if (!post) {
      return errorResponse("Post not found", 404);
    }

    if (post.isPrivate && post.author.toString() !== userId) {
      return errorResponse("Not authorized", 403);
    }

    // Find existing reaction in Reaction collection
    const existing = await Reaction.findOne({ post: id, user: userId });

    if (existing) {
      if (existing.type === reactionType) {
        // Same reaction — remove (toggle off)
        await Reaction.findByIdAndDelete(existing._id);
        post.reactionCounts[existing.type] = Math.max(
          0,
          (post.reactionCounts[existing.type] || 0) - 1,
        );
        post.reactionsCount = Math.max(0, (post.reactionsCount || 0) - 1);
      } else {
        // Different reaction — change type
        existing.type = reactionType;
        await existing.save();
        post.reactionCounts[existing.type] = Math.max(
          0,
          (post.reactionCounts[existing.type] || 0) - 1,
        );
        // No need to decrement the old type since we changed it
        post.reactionCounts[reactionType] =
          (post.reactionCounts[reactionType] || 0) + 1;
      }
    } else {
      // New reaction
      await Reaction.create({ post: id, user: userId, type: reactionType });
      post.reactionCounts[reactionType] =
        (post.reactionCounts[reactionType] || 0) + 1;
      post.reactionsCount = (post.reactionsCount || 0) + 1;
    }

    await post.save();

    // Get the user's current reaction for response
    const myReaction = await Reaction.findOne({ post: id, user: userId });

    return successResponse({
      myReaction: myReaction ? myReaction.type : null,
      reactionCounts: post.reactionCounts,
      reactionsCount: post.reactionsCount,
    });
  } catch (error) {
    console.error("React post error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// GET - Get reactions for a post (who reacted with what)
export async function GET(request, { params }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const { id } = await params;
    const post = await Post.findById(id).lean();

    if (!post) {
      return errorResponse("Post not found", 404);
    }

    if (post.isPrivate && post.author.toString() !== userId) {
      return errorResponse("Not authorized", 403);
    }

    // Fetch top 3 reactors for display
    const topReactions = await Reaction.find({ post: id })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("user", "firstName lastName")
      .lean();

    const myReaction = await Reaction.findOne({
      post: id,
      user: userId,
    }).lean();

    return successResponse({
      topReactions,
      reactionCounts: post.reactionCounts,
      reactionsCount: post.reactionsCount,
      myReaction: myReaction ? myReaction.type : null,
    });
  } catch (error) {
    console.error("Get reactions error:", error);
    return errorResponse("Internal server error", 500);
  }
}
