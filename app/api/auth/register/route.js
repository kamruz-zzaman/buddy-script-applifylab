import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import Session from "@/lib/models/Session";
import { rateLimit } from "@/lib/utils/rateLimit";
import {
  generateAccessToken,
  generateRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  hashToken,
  successResponse,
  errorResponse,
} from "@/lib/utils/auth";

export async function POST(request) {
  // Rate limit: 5 registrations per minute per IP
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const { allowed } = rateLimit(`register_${ip}`, 5, 60000);
  if (!allowed) {
    return errorResponse(
      "Too many registration attempts. Please try again later.",
      429,
    );
  }
  try {
    await dbConnect();

    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return errorResponse(
        "All fields are required: firstName, lastName, email, password",
      );
    }

    if (password.length < 6) {
      return errorResponse("Password must be at least 6 characters");
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Please provide a valid email address");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse("An account with this email already exists", 409);
    }

    // Create user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const userId = user._id.toString();

    // Generate refresh token first so we can store its hash in the session
    const accessToken = await generateAccessToken(userId);

    // We need a session ID for the refresh token — create a temp ObjectId
    const { default: mongoose } = await import("mongoose");
    const sessionId = new mongoose.Types.ObjectId();
    const refreshToken = await generateRefreshToken(
      userId,
      sessionId.toString(),
    );

    // Create session with the hash already populated
    const session = await Session.create({
      _id: sessionId,
      userId,
      refreshTokenHash: await hashToken(refreshToken),
      userAgent: request.headers.get("user-agent") || "Unknown",
      ip,
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Set httpOnly cookies
    await setAccessTokenCookie(accessToken);
    await setRefreshTokenCookie(refreshToken);

    return successResponse(
      {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        sessionId: session._id,
      },
      201,
    );
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return errorResponse(messages.join(", "));
    }
    console.error("Register error:", error);
    return errorResponse("Internal server error", 500);
  }
}
