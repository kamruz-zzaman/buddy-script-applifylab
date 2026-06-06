import dbConnect from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import { getCurrentUserId, successResponse, errorResponse } from "@/lib/utils/auth";

// POST - Create a new post
export async function POST(request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const body = await request.json();
    const { content, imageUrl, isPrivate } = body;

    if (!content && !imageUrl) {
      return errorResponse("Post must have either text content or an image");
    }

    const post = await Post.create({
      author: userId,
      content: content?.trim() || "",
      imageUrl: imageUrl || null,
      isPrivate: Boolean(isPrivate),
    });

    // Populate author info
    await post.populate("author", "firstName lastName");

    return successResponse({ post }, 201);
  } catch (error) {
    console.error("Create post error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// GET - Fetch feed posts (newest first, public + user's own private)
export async function GET(request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit")) || 10));
    const skip = (page - 1) * limit;

    // Build query: public posts + own private posts
    const query = {
      $or: [{ isPrivate: false }, { isPrivate: true, author: userId }],
    };

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "firstName lastName")
        .populate("likes", "firstName lastName")
        .lean(),
      Post.countDocuments(query),
    ]);

    return successResponse({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return errorResponse("Internal server error", 500);
  }
}
