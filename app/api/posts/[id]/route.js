import dbConnect from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import cache from "@/lib/utils/cache";
import {
  getCurrentUserId,
  successResponse,
  errorResponse,
} from "@/lib/utils/auth";

// GET - Fetch a single post
export async function GET(_, { params }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const { id } = await params;

    const post = await Post.findById(id)
      .populate("author", "firstName lastName")
      .lean();

    if (!post) {
      return errorResponse("Post not found", 404);
    }

    if (post.isPrivate && post.author._id.toString() !== userId) {
      return errorResponse("Not authorized to view this post", 403);
    }

    return successResponse({ post });
  } catch (error) {
    console.error("Get post error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE - Delete a post (only author)
export async function DELETE(_, { params }) {
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

    if (post.author.toString() !== userId) {
      return errorResponse("Not authorized to delete this post", 403);
    }

    await Post.findByIdAndDelete(id);

    // Invalidate feed cache
    cache.invalidatePrefix("feed:");

    return successResponse({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    return errorResponse("Internal server error", 500);
  }
}
