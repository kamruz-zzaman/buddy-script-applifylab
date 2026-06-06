import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import Post from "@/lib/models/Post";
import Comment from "@/lib/models/Comment";
import { successResponse, errorResponse } from "@/lib/utils/auth";

export async function GET() {
  try {
    await dbConnect();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
    ]);

    // Seed users (password: "password123")
    const users = await User.create([
      { firstName: "Karim", lastName: "Saif", email: "karim@example.com", password: "password123" },
      { firstName: "Sarah", lastName: "Ahmed", email: "sarah@example.com", password: "password123" },
      { firstName: "Mohammad", lastName: "Ali", email: "mohammad@example.com", password: "password123" },
      { firstName: "Fatima", lastName: "Hassan", email: "fatima@example.com", password: "password123" },
      { firstName: "Omar", lastName: "Rahman", email: "omar@example.com", password: "password123" },
    ]);

    // Seed posts
    const posts = await Post.create([
      {
        author: users[0]._id,
        content: "Just finished building a new feature for our health tracking app! The real-time analytics dashboard is looking amazing. Can't wait to share more details soon!",
        isPrivate: false,
      },
      {
        author: users[1]._id,
        content: "Beautiful sunrise this morning! Nature never ceases to amaze me 🌅",
        isPrivate: false,
      },
      {
        author: users[2]._id,
        content: "Excited to announce that I'll be speaking at the Tech Conference 2024 about AI and its impact on modern web development. Who's attending?",
        isPrivate: false,
      },
      {
        author: users[0]._id,
        content: "This is my private journal entry for today - working on some personal goals.",
        isPrivate: true,
      },
      {
        author: users[3]._id,
        content: "Just finished reading 'Clean Code' by Robert Martin. Highly recommend it to every developer out there! The principles in this book are timeless.",
        isPrivate: false,
      },
      {
        author: users[4]._id,
        content: "Working on a new open-source project. Stay tuned! 🚀",
        isPrivate: false,
      },
      {
        author: users[1]._id,
        content: "Had an amazing dinner with the team tonight. Great food, better conversations!",
        isPrivate: false,
      },
    ]);

    // Add some likes
    await Promise.all(
      posts.map((post, idx) => {
        // Each post gets likes from 2-3 random users (excluding author)
        const otherUsers = users.filter((u) => u._id.toString() !== post.author.toString());
        const shuffled = otherUsers.sort(() => 0.5 - Math.random());
        const likers = shuffled.slice(0, 2 + (idx % 2));
        post.likes = likers.map((u) => u._id);
        post.likesCount = likers.length;
        return post.save();
      })
    );

    // Seed comments
    const comments = await Comment.create([
      {
        post: posts[0]._id,
        author: users[1]._id,
        content: "That sounds amazing! Can't wait to see the analytics dashboard!",
      },
      {
        post: posts[0]._id,
        author: users[2]._id,
        content: "What tech stack are you using for the real-time features?",
      },
      {
        post: posts[2]._id,
        author: users[0]._id,
        content: "I'll definitely be there! Which day is your talk scheduled?",
      },
      {
        post: posts[2]._id,
        author: users[3]._id,
        content: "Count me in! AI in web dev is such a hot topic right now.",
      },
      {
        post: posts[4]._id,
        author: users[0]._id,
        content: "Absolutely agree! Clean Code changed the way I write software.",
      },
      {
        post: posts[5]._id,
        author: users[1]._id,
        content: "Open source for the win! What's the project about?",
      },
    ]);

    // Add likes to comments
    comments[0].likes = [users[0]._id, users[2]._id];
    comments[0].likesCount = 2;
    comments[1].likes = [users[1]._id];
    comments[1].likesCount = 1;
    await Promise.all(comments.map((c) => c.save()));

    // Add replies to comments
    await Comment.create([
      {
        post: posts[0]._id,
        author: users[0]._id,
        content: "Thanks Sarah! We're using Next.js and WebSockets for the real-time features.",
        parent: comments[0]._id,
      },
      {
        post: posts[0]._id,
        author: users[0]._id,
        content: "We're using Next.js with Server-Sent Events for real-time updates. It's been a great experience!",
        parent: comments[1]._id,
      },
      {
        post: posts[2]._id,
        author: users[2]._id,
        content: "My talk is on Day 2 at 2 PM. See you there!",
        parent: comments[2]._id,
      },
    ]);

    // Update comment counts on posts
    for (const post of posts) {
      const count = await Comment.countDocuments({ post: post._id });
      post.commentsCount = count;
      await post.save();
    }

    return successResponse({
      message: "Database seeded successfully!",
      summary: {
        users: users.length,
        posts: posts.length,
        comments: await Comment.countDocuments({}),
      },
      testAccounts: [
        { email: "karim@example.com", password: "password123" },
        { email: "sarah@example.com", password: "password123" },
        { email: "mohammad@example.com", password: "password123" },
        { email: "fatima@example.com", password: "password123" },
        { email: "omar@example.com", password: "password123" },
      ],
    });
  } catch (error) {
    console.error("Seed error:", error);
    return errorResponse("Failed to seed database: " + error.message, 500);
  }
}
