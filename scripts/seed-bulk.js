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
 * The script creates users, posts, and reactions in batches for performance.
 * Reactions are stored in a separate collection (matches current architecture).
 */

const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/buddy-script";

// ─── Schemas (must match lib/models exactly) ────────────────────────────────

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
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
    // No embedded reactions — stored in separate Reaction collection
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
  { timestamps: true },
);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ isPrivate: 1, createdAt: -1 });

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
      sparse: true,
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

ReactionSchema.index({ post: 1, user: 1 }, { unique: true, sparse: true });
ReactionSchema.index({ post: 1, createdAt: -1 });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
const Reaction =
  mongoose.models.Reaction || mongoose.model("Reaction", ReactionSchema);

// ─── Data generators ────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Henry",
  "Iris",
  "Jack",
  "Kate",
  "Leo",
  "Mia",
  "Noah",
  "Olivia",
  "Paul",
  "Quinn",
  "Ryan",
  "Sara",
  "Tom",
  "Uma",
  "Victor",
  "Wendy",
  "Xavier",
  "Yara",
  "Zack",
  "Aria",
  "Blake",
  "Chloe",
  "Derek",
  "Elena",
  "Felix",
  "Georgia",
  "Hugo",
  "Ivy",
  "Jasper",
  "Kylie",
  "Liam",
  "Maya",
  "Nathan",
];

const LAST_NAMES = [
  "Anderson",
  "Brown",
  "Clark",
  "Davis",
  "Evans",
  "Foster",
  "Garcia",
  "Harris",
  "Irwin",
  "Jones",
  "King",
  "Lee",
  "Miller",
  "Nelson",
  "Owens",
  "Parker",
  "Quinn",
  "Roberts",
  "Smith",
  "Taylor",
  "Underwood",
  "Vance",
  "Williams",
  "Young",
  "Zhang",
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
  const REACTION_BATCH = 50000;

  console.log(
    `\n🚀 Starting bulk seed: ${targetPosts.toLocaleString()} posts\n`,
  );

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  // Step 1: Create users (target ~10% of post count, min 100, max 50000)
  const userCount = Math.min(
    50000,
    Math.max(100, Math.floor(targetPosts * 0.1)),
  );
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
        process.stdout.write(
          `\r   Created: ${users.length + existingUserCount} users`,
        );
        userBatches.length = 0;
      }
    }
    console.log("");
  }

  users = await User.find().limit(userCount).lean();
  console.log(`   Total users: ${users.length}\n`);

  // Step 2: Check existing posts
  const existingPostCount = await Post.countDocuments();
  if (existingPostCount > 0) {
    console.log(
      `⚠️  Found ${existingPostCount.toLocaleString()} existing posts. Appending...\n`,
    );
  }

  // Step 3: Create posts in batches (no embedded reactions)
  console.log(`📝 Creating ${targetPosts.toLocaleString()} posts...`);
  const startTime = Date.now();
  let created = 0;
  const postBatches = [];
  const newPostIds = []; // Track new posts for reaction creation

  for (let i = 0; i < targetPosts; i++) {
    const author = randomFrom(users);
    const content = randomFrom(POST_CONTENTS);
    const isPrivate = Math.random() < 0.05;
    const daysAgo = randomInt(0, 365);
    const createdAt = new Date(Date.now() - daysAgo * 86400000);

    postBatches.push({
      author: author._id,
      content,
      isPrivate,
      reactionCounts: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
      reactionsCount: 0,
      commentsCount: randomInt(0, 50),
      createdAt,
      updatedAt: createdAt,
    });

    if (postBatches.length >= BATCH_SIZE || i === targetPosts - 1) {
      const inserted = await Post.insertMany(postBatches, { ordered: false });
      newPostIds.push(
        ...inserted.map((p) => ({ _id: p._id, author: p.author })),
      );
      created += postBatches.length;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = Math.floor((created / (Date.now() - startTime)) * 1000);
      process.stdout.write(
        `\r   Posts: ${created.toLocaleString()} / ${targetPosts.toLocaleString()} (${rate}/s, ${elapsed}s)`,
      );
      postBatches.length = 0;
    }
  }

  const postTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n   ✅ Posts done in ${postTime}s\n`);

  // Step 4: Create reactions only for new posts
  console.log(
    `📝 Creating reactions for ${newPostIds.length.toLocaleString()} new posts...`,
  );
  const reactionStart = Date.now();
  let reactionCount = 0;
  const reactionBatches = [];
  const postUpdates = new Map();

  for (const post of newPostIds) {
    const numReactions = randomInt(0, 15);
    const reactionUsers = new Set(); // per-post: prevent same user reacting twice
    const counts = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
    let total = 0;

    for (let j = 0; j < numReactions; j++) {
      const reactor = randomFrom(users);
      if (reactor._id.toString() === post.author.toString()) continue;
      if (reactionUsers.has(reactor._id.toString())) continue;
      reactionUsers.add(reactor._id.toString());

      const rType = randomFrom(REACTION_TYPES);
      reactionBatches.push({ post: post._id, user: reactor._id, type: rType });
      counts[rType]++;
      total++;
    }

    if (total > 0) {
      postUpdates.set(post._id.toString(), { counts, total });
    }

    if (reactionBatches.length >= REACTION_BATCH) {
      await Reaction.insertMany(reactionBatches, { ordered: false });
      reactionCount += reactionBatches.length;
      process.stdout.write(`\r   Reactions: ${reactionCount.toLocaleString()}`);
      reactionBatches.length = 0;
    }
  }

  // Flush remaining reactions
  if (reactionBatches.length > 0) {
    await Reaction.insertMany(reactionBatches, { ordered: false });
    reactionCount += reactionBatches.length;
  }

  const reactionTime = ((Date.now() - reactionStart) / 1000).toFixed(1);
  console.log(
    `\n   ✅ ${reactionCount.toLocaleString()} reactions in ${reactionTime}s\n`,
  );

  // Step 5: Update post reaction counts via bulkWrite
  console.log(`📝 Updating reaction counts on posts...`);
  const bulkOps = [];
  for (const [postId, { counts, total }] of postUpdates) {
    bulkOps.push({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(postId) },
        update: { $set: { reactionCounts: counts, reactionsCount: total } },
      },
    });
    if (bulkOps.length >= BATCH_SIZE) {
      await Post.bulkWrite(bulkOps);
      bulkOps.length = 0;
    }
  }
  if (bulkOps.length > 0) {
    await Post.bulkWrite(bulkOps);
  }
  console.log(`   ✅ Counts updated\n`);

  // Step 6: Summary
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const finalUsers = await User.countDocuments();
  const finalPosts = await Post.countDocuments();
  const finalReactions = await Reaction.countDocuments();

  console.log(`📊 Database Summary:`);
  console.log(`   Users:     ${finalUsers.toLocaleString()}`);
  console.log(`   Posts:     ${finalPosts.toLocaleString()}`);
  console.log(`   Reactions: ${finalReactions.toLocaleString()}`);
  console.log(`   Total time: ${totalTime}s\n`);

  await mongoose.disconnect();
  console.log("👋 Done!\n");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
