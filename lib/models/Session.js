import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      select: false, // Never expose the hash in queries
    },
    userAgent: {
      type: String,
      default: "Unknown",
    },
    ip: {
      type: String,
      default: "Unknown",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// TTL index: MongoDB auto-deletes expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance method: check if session is expired
SessionSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

// Static: find valid sessions for a user (not expired)
SessionSchema.statics.findActiveByUser = function (userId) {
  return this.find({ userId, expiresAt: { $gt: new Date() } }).sort({
    lastActivity: -1,
  });
};

// Static: count active sessions for a user
SessionSchema.statics.countActiveByUser = function (userId) {
  return this.countDocuments({
    userId,
    expiresAt: { $gt: new Date() },
  });
};

const Session =
  mongoose.models.Session || mongoose.model("Session", SessionSchema);

export default Session;
