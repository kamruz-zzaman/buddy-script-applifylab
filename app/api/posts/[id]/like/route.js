import dbConnect from "@/lib/mongodb";
import Post from "@/lib/models/Post";
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

    // Find existing reaction by this user
    const existingIdx = post.reactions.findIndex(
      (r) => r.user.toString() === userId,
    );

    if (existingIdx !== -1) {
      const existingType = post.reactions[existingIdx].type;

      if (existingType === reactionType) {
        // Same reaction - remove it (toggle off)
        post.reactionCounts[existingType] = Math.max(
          0,
          post.reactionCounts[existingType] - 1,
        );
        post.reactionsCount = Math.max(0, post.reactionsCount - 1);
        post.reactions.splice(existingIdx, 1);
      } else {
        // Different reaction - change it
        post.reactionCounts[existingType] = Math.max(
          0,
          post.reactionCounts[existingType] - 1,
        );
        post.reactions[existingIdx].type = reactionType;
        post.reactionCounts[reactionType] =
          (post.reactionCounts[reactionType] || 0) + 1;
      }
    } else {
      // New reaction
      post.reactions.push({ user: userId, type: reactionType });
      post.reactionCounts[reactionType] =
        (post.reactionCounts[reactionType] || 0) + 1;
      post.reactionsCount = post.reactionsCount + 1;
    }

    await post.save();

    // Get the user's current reaction
    const myReaction = post.reactions.find((r) => r.user.toString() === userId);

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
    const post = await Post.findById(id)
      .populate("reactions.user", "firstName lastName")
      .lean();

    if (!post) {
      return errorResponse("Post not found", 404);
    }

    if (post.isPrivate && post.author.toString() !== userId) {
      return errorResponse("Not authorized", 403);
    }

    const myReaction = post.reactions.find(
      (r) => r.user._id?.toString() === userId || r.user.toString() === userId,
    );

    return successResponse({
      reactions: post.reactions,
      reactionCounts: post.reactionCounts,
      reactionsCount: post.reactionsCount,
      myReaction: myReaction ? myReaction.type : null,
    });
  } catch (error) {
    console.error("Get reactions error:", error);
    return errorResponse("Internal server error", 500);
  }
}
