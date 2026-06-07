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
  // Rate limit: 10 login attempts per minute per IP
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const { allowed } = rateLimit(`login_${ip}`, 10, 60000);
  if (!allowed) {
    return errorResponse(
      "Too many login attempts. Please try again later.",
      429,
    );
  }
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("Email and password are required");
    }

    // Find user and include password field for comparison
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse("Invalid email or password", 401);
    }

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

    return successResponse({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      sessionId: session._id,
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Internal server error", 500);
  }
}
