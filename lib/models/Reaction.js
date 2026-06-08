import mongoose from "mongoose";

const ReactionSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      index: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
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
  { timestamps: true },
);

// One reaction per user per target (post or comment)
ReactionSchema.index(
  { post: 1, user: 1 },
  {
    unique: true,
    partialFilterExpression: { post: { $type: "objectId" } },
  },
);
ReactionSchema.index(
  { comment: 1, user: 1 },
  {
    unique: true,
    partialFilterExpression: { comment: { $type: "objectId" } },
  },
);
// For fetching top reactors quickly
ReactionSchema.index({ post: 1, createdAt: -1 });
ReactionSchema.index({ comment: 1, createdAt: -1 });

const Reaction =
  mongoose.models.Reaction || mongoose.model("Reaction", ReactionSchema);

export default Reaction;
