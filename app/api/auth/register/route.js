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

    // ── Validation ──────────────────────────────────────────────

    const errors = [];

    // First name
    if (!firstName || typeof firstName !== "string") {
      errors.push("First name is required");
    } else {
      const fn = firstName.trim();
      if (fn.length < 2)
        errors.push("First name must be at least 2 characters");
      if (fn.length > 50)
        errors.push("First name must not exceed 50 characters");
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(fn))
        errors.push("First name contains invalid characters");
    }

    // Last name
    if (!lastName || typeof lastName !== "string") {
      errors.push("Last name is required");
    } else {
      const ln = lastName.trim();
      if (ln.length < 2) errors.push("Last name must be at least 2 characters");
      if (ln.length > 50)
        errors.push("Last name must not exceed 50 characters");
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(ln))
        errors.push("Last name contains invalid characters");
    }

    // Email
    if (!email || typeof email !== "string") {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email.trim()))
        errors.push("Please provide a valid email address");
      if (email.length > 254)
        errors.push("Email must not exceed 254 characters");
    }

    // Password
    if (!password || typeof password !== "string") {
      errors.push("Password is required");
    } else {
      if (password.length < 8)
        errors.push("Password must be at least 8 characters");
      if (password.length > 128)
        errors.push("Password must not exceed 128 characters");
      if (!/[A-Z]/.test(password))
        errors.push("Password must contain at least one uppercase letter");
      if (!/[a-z]/.test(password))
        errors.push("Password must contain at least one lowercase letter");
      if (!/[0-9]/.test(password))
        errors.push("Password must contain at least one number");
      if (!/[^A-Za-z0-9]/.test(password))
        errors.push("Password must contain at least one special character");
      // Password should not contain the user's name or email
      if (
        firstName &&
        password.toLowerCase().includes(firstName.trim().toLowerCase())
      )
        errors.push("Password must not contain your first name");
      if (
        lastName &&
        password.toLowerCase().includes(lastName.trim().toLowerCase())
      )
        errors.push("Password must not contain your last name");
      if (email) {
        const emailLocal = email.split("@")[0]?.toLowerCase();
        if (
          emailLocal &&
          emailLocal.length > 2 &&
          password.toLowerCase().includes(emailLocal)
        )
          errors.push("Password must not contain your email username");
      }
    }

    if (errors.length > 0) {
      return errorResponse(errors.join("; "));
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
