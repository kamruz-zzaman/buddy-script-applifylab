import dbConnect from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import Comment from "@/lib/models/Comment";
import Reaction from "@/lib/models/Reaction";
import cache from "@/lib/utils/cache";
import cloudinary from "@/lib/cloudinary";
import {
  getCurrentUserId,
  successResponse,
  errorResponse,
} from "@/lib/utils/auth";

// POST - Create a new post (supports FormData with optional file)
export async function POST(request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const formData = await request.formData();
    const content = formData.get("content")?.trim() || "";
    const isPrivate = formData.get("isPrivate") === "true";
    const file = formData.get("file");

    if (!content && !file) {
      return errorResponse("Post must have either text content or an image");
    }

    let imageUrl = null;

    // Upload file to Cloudinary if provided
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileType = file.type;
      const resourceType = fileType.startsWith("video/") ? "video" : "image";

      const result = await new Promise((resolve, reject) => {
        const { Readable } = require("stream");
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "buddy-script/posts",
            resource_type: resourceType,
            transformation:
              resourceType === "image"
                ? [{ quality: "auto", fetch_format: "auto" }]
                : undefined,
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

    const post = await Post.create({
      author: userId,
      content,
      imageUrl,
      isPrivate,
    });

    await post.populate("author", "firstName lastName");

    // Invalidate feed cache — new post changes the feed
    cache.invalidatePrefix("feed:");

    return successResponse({ post }, 201);
  } catch (error) {
    console.error("Create post error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// GET - Cursor-based pagination (newest first, public + own private) — cached
export async function GET(request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit")) || 10),
    );
    const cursor = searchParams.get("cursor");

    // Cache key: unique per user + cursor + limit
    const cacheKey = `feed:${userId}:${cursor || "home"}:${limit}`;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && !cached.stale) {
      return new Response(
        JSON.stringify({ success: true, data: cached.value }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "private, max-age=5, stale-while-revalidate=30",
            "X-Cache": "HIT",
          },
        },
      );
    }

    // If stale, return stale data but refresh in background
    if (cached?.stale) {
      // Fire-and-forget background refresh
      refreshFeedCache(cacheKey, userId, cursor, limit);
      return new Response(
        JSON.stringify({ success: true, data: cached.value }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "private, max-age=5, stale-while-revalidate=30",
            "X-Cache": "STALE",
          },
        },
      );
    }

    // Cache miss — fetch from DB
    const data = await fetchFeedFromDB(userId, cursor, limit);

    // Store in cache (5s TTL, 30s stale window)
    cache.set(cacheKey, data, 5000, 30000);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=5, stale-while-revalidate=30",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// ── DB fetch helper (extracted for cache + background refresh) ──────

async function fetchFeedFromDB(userId, cursor, limit) {
  await dbConnect();

  const query = {
    $or: [{ isPrivate: false }, { isPrivate: true, author: userId }],
  };

  if (cursor) {
    const { default: mongoose } = await import("mongoose");
    query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  const posts = await Post.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate("author", "firstName lastName")
    .lean();

  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();

  const COMMENT_PREVIEW = 2;
  const postsWithComments = await Promise.all(
    posts.map(async (post) => {
      const topReactions = await Reaction.find({ post: post._id })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("user", "firstName lastName")
        .lean();

      const totalComments = await Comment.countDocuments({
        post: post._id,
        parent: null,
      });
      let comments = [];
      if (totalComments > 0) {
        const topComments = await Comment.find({
          post: post._id,
          parent: null,
        })
          .sort({ createdAt: -1 })
          .limit(COMMENT_PREVIEW)
          .populate("author", "firstName lastName")
          .lean();
        comments = await Promise.all(
          topComments.map(async (c) => {
            const replies = await Comment.find({ parent: c._id })
              .sort({ createdAt: 1 })
              .populate("author", "firstName lastName")
              .lean();
            return { ...c, replies };
          }),
        );
      }
      return { ...post, comments, totalComments, topReactions };
    }),
  );

  const nextCursor =
    postsWithComments.length > 0
      ? postsWithComments[postsWithComments.length - 1]._id
      : null;

  return {
    posts: postsWithComments,
    pagination: { limit, nextCursor, hasMore },
  };
}

// Background refresh — don't await, no error response needed
function refreshFeedCache(cacheKey, userId, cursor, limit) {
  fetchFeedFromDB(userId, cursor, limit)
    .then((data) => cache.set(cacheKey, data, 5000, 30000))
    .catch((err) =>
      console.error("Background feed refresh failed:", err.message),
    );
}
