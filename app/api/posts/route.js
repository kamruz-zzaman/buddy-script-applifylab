import dbConnect from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import Comment from "@/lib/models/Comment";
import Reaction from "@/lib/models/Reaction";
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

    return successResponse({ post }, 201);
  } catch (error) {
    console.error("Create post error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// GET - Cursor-based pagination (newest first, public + own private)
export async function GET(request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit")) || 10),
    );
    const cursor = searchParams.get("cursor"); // last post _id from previous page

    // Build query
    const query = {
      $or: [{ isPrivate: false }, { isPrivate: true, author: userId }],
    };

    // Cursor-based: fetch posts before the cursor
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
    if (hasMore) posts.pop(); // remove the extra item

    // Embed first 2 comments (with replies) and top reactors for each post
    const COMMENT_PREVIEW = 2;
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        // Fetch top 3 reactors for display
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
          // Fetch replies for each comment
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

    return successResponse({
      posts: postsWithComments,
      pagination: {
        limit,
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return errorResponse("Internal server error", 500);
  }
}
