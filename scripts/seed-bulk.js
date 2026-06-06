/**
 * Bulk Seed Script - Generates millions of test records
 *
 * Usage:
 *   node scripts/seed-bulk.js [count]
 *
 * Examples:
 *   node scripts/seed-bulk.js 100000    # 100K posts
 *   node scripts/seed-bulk.js 1000000   # 1M posts
 *   node scripts/seed-bulk.js 10000000  # 10M posts
 *
 * The script creates users and posts in batches for performance.
 */

const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/buddy-script";

// ─── Schemas (must match lib/models exactly) ────────────────────────────────

const ReactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
      required: true,
    },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: { type: String, trim: true },
    imageUrl: { type: String, default: null },
    videoUrl: { type: String, default: null },
    isPrivate: { type: Boolean, default: false },
    reactions: [ReactionSchema],
    reactionCounts: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
    },
    reactionsCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ isPrivate: 1, createdAt: -1 });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

// ─── Data generators ────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry",
  "Iris", "Jack", "Kate", "Leo", "Mia", "Noah", "Olivia", "Paul",
  "Quinn", "Ryan", "Sara", "Tom", "Uma", "Victor", "Wendy", "Xavier",
  "Yara", "Zack", "Aria", "Blake", "Chloe", "Derek", "Elena", "Felix",
  "Georgia", "Hugo", "Ivy", "Jasper", "Kylie", "Liam", "Maya", "Nathan",
];

const LAST_NAMES = [
  "Anderson", "Brown", "Clark", "Davis", "Evans", "Foster", "Garcia",
  "Harris", "Irwin", "Jones", "King", "Lee", "Miller", "Nelson",
  "Owens", "Parker", "Quinn", "Roberts", "Smith", "Taylor",
  "Underwood", "Vance", "Williams", "Young", "Zhang",
];

const POST_CONTENTS = [
  "Just finished an amazing project! Can't wait to share the details with everyone. 🚀",
  "Beautiful morning! The sunrise was absolutely stunning today. 🌅",
  "Working on some exciting new features. Stay tuned! 💻",
  "Had a great meeting with the team today. So many creative ideas flowing!",
  "Reading this incredible book about technology and innovation. Highly recommend!",
  "Weekend vibes! Time to relax and recharge. 🏖️",
  "Just hit a major milestone! Celebrating with the team tonight. 🎉",
  "Exploring new technologies and frameworks. The possibilities are endless!",
  "Grateful for all the opportunities coming my way. Hard work pays off! 💪",
  "Sharing some thoughts on productivity and time management. Game changers!",
  "Coffee and coding - the perfect combination for a productive morning. ☕",
  "Attended an amazing conference today. So many inspiring speakers!",
  "Learning never stops. Currently diving deep into system design patterns.",
  "Throwback to our team building event last month. Great memories! 📸",
  "Just published my latest article on best practices for scalable apps.",
  "The sunset from the office window is absolutely breathtaking tonight.",
  "Excited about the upcoming product launch. Months of hard work coming together!",
  "Meditation and mindfulness have completely transformed my daily routine. 🧘",
  "Code review tip: Always leave the code better than you found it.",
  "Traveling to a new city for a tech meetup. Can't wait to network! ✈️",
];

const REACTION_TYPES = ["like", "love", "haha", "wow", "sad", "angry"];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function seed() {
  const targetPosts = parseInt(process.argv[2]) || 100000;
  const BATCH_SIZE = 10000;

  console.log(`\n🚀 Starting bulk seed: ${targetPosts.toLocaleString()} posts\n`);

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  // Step 1: Create users (target ~10% of post count, min 100, max 50000)
  const userCount = Math.min(50000, Math.max(100, Math.floor(targetPosts * 0.1)));
  console.log(`📝 Creating ${userCount.toLocaleString()} users...`);

  const existingUserCount = await User.countDocuments();
  let users = [];

  if (existingUserCount < userCount) {
    const needsNew = userCount - existingUserCount;
    const userBatches = [];
    for (let i = 0; i < needsNew; i++) {
      const firstName = randomFrom(FIRST_NAMES);
      const lastName = randomFrom(LAST_NAMES);
      userBatches.push({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i + existingUserCount}@example.com`,
        password: "$2a$12$dummyhashvalue",
      });

      if (userBatches.length >= BATCH_SIZE || i === needsNew - 1) {
        const created = await User.insertMany(userBatches, { ordered: false });
        users.push(...created);
        process.stdout.write(`\r   Created: ${users.length + existingUserCount} users`);
        userBatches.length = 0;
      }
    }
    console.log("");
  }

  users = await User.find().limit(userCount).lean();
  console.log(`   Total users: ${users.length}\n`);

  // Step 2: Remove existing posts (optional - comment out to append)
  const existingPostCount = await Post.countDocuments();
  if (existingPostCount > 0) {
    console.log(`⚠️  Found ${existingPostCount.toLocaleString()} existing posts.`);
    console.log(`   Appending new posts...\n`);
  }

  // Step 3: Create posts in batches
  console.log(`📝 Creating ${targetPosts.toLocaleString()} posts...`);
  const startTime = Date.now();
  let created = 0;
  const postBatches = [];

  for (let i = 0; i < targetPosts; i++) {
    const author = randomFrom(users);
    const content = randomFrom(POST_CONTENTS);
    const isPrivate = Math.random() < 0.05; // 5% private

    // Random reactions from random users
    const numReactions = randomInt(0, 15);
    const reactionUsers = new Set();
    const reactions = [];

    for (let j = 0; j < numReactions; j++) {
      const reactor = randomFrom(users);
      if (reactor._id.toString() === author._id.toString()) continue;
      if (reactionUsers.has(reactor._id.toString())) continue;
      reactionUsers.add(reactor._id.toString());
      reactions.push({
        user: reactor._id,
        type: randomFrom(REACTION_TYPES),
      });
    }

    const reactionCounts = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
    reactions.forEach((r) => {
      reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
    });

    // Random date within last 365 days
    const daysAgo = randomInt(0, 365);
    const createdAt = new Date(Date.now() - daysAgo * 86400000);

    postBatches.push({
      author: author._id,
      content,
      isPrivate,
      reactions,
      reactionCounts,
      reactionsCount: reactions.length,
      commentsCount: randomInt(0, 50),
      createdAt,
      updatedAt: createdAt,
    });

    if (postBatches.length >= BATCH_SIZE || i === targetPosts - 1) {
      await Post.insertMany(postBatches, { ordered: false });
      created += postBatches.length;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = Math.floor(created / (Date.now() - startTime) * 1000);
      process.stdout.write(
        `\r   Created: ${created.toLocaleString()} / ${targetPosts.toLocaleString()} (${rate}/s, ${elapsed}s)`
      );
      postBatches.length = 0;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n✅ Done! Created ${created.toLocaleString()} posts in ${totalTime}s`);
  console.log(`   Rate: ${Math.floor(created / (Date.now() - startTime) * 1000)} posts/sec\n`);

  // Step 4: Summary
  const finalUsers = await User.countDocuments();
  const finalPosts = await Post.countDocuments();
  console.log(`📊 Database Summary:`);
  console.log(`   Users: ${finalUsers.toLocaleString()}`);
  console.log(`   Posts: ${finalPosts.toLocaleString()}`);
  console.log(`   Indexes: createdAt, author+createdAt, isPrivate+createdAt\n`);

  await mongoose.disconnect();
  console.log("👋 Done!\n");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
