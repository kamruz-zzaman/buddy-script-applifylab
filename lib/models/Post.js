import mongoose from "mongoose";

const ReactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
      required: true,
    },
  },
  { _id: false }
);

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: [5000, "Post content cannot exceed 5000 characters"],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    reactions: [ReactionSchema],
    // Denormalized counts for fast reads
    reactionCounts: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
    },
    reactionsCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for feed queries at scale
PostSchema.index({ createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ isPrivate: 1, createdAt: -1 });
PostSchema.index({ "reactions.user": 1, "reactions.type": 1 });

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

export default Post;
