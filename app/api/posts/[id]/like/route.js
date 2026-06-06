import dbConnect from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import { getCurrentUserId, successResponse, errorResponse } from "@/lib/utils/auth";

// POST - Toggle like/unlike on a post
export async function POST(request, { params }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const { id } = await params;

    const post = await Post.findById(id);
    if (!post) {
      return errorResponse("Post not found", 404);
    }

    // Check if user can view this post
    if (post.isPrivate && post.author.toString() !== userId) {
      return errorResponse("Not authorized", 403);
    }

    const alreadyLiked = post.likes.some(
      (likeId) => likeId.toString() === userId
    );

    if (alreadyLiked) {
      // Unlike
      post.likes.pull(userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();
      return successResponse({ liked: false, likesCount: post.likesCount });
    } else {
      // Like
      post.likes.push(userId);
      post.likesCount = post.likesCount + 1;
      await post.save();
      return successResponse({ liked: true, likesCount: post.likesCount });
    }
  } catch (error) {
    console.error("Like post error:", error);
    return errorResponse("Internal server error", 500);
  }
}
