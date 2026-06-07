import dbConnect from "@/lib/mongodb";
import Session from "@/lib/models/Session";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  getRefreshTokenFromCookies,
  hashToken,
  successResponse,
  errorResponse,
} from "@/lib/utils/auth";

/**
 * POST /api/auth/refresh
 * Issues a new access + refresh token pair.
 * Uses refresh-token rotation: old token is invalidated.
 */
export async function POST(request) {
  try {
    await dbConnect();

    // 1. Get refresh token from httpOnly cookie
    const refreshToken = await getRefreshTokenFromCookies();
    if (!refreshToken) {
      return errorResponse("No refresh token provided", 401);
    }

    // 2. Verify the JWT
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload || !payload.sessionId) {
      // Token invalid or malformed — clear cookies
      const { clearAuthCookies } = await import("@/lib/utils/auth");
      await clearAuthCookies();
      return errorResponse("Invalid refresh token", 401);
    }

    // 3. Find the session in DB
    const session = await Session.findById(payload.sessionId).select(
      "+refreshTokenHash",
    );

    if (!session) {
      const { clearAuthCookies } = await import("@/lib/utils/auth");
      await clearAuthCookies();
      return errorResponse("Session not found", 401);
    }

    // 4. Check that the token hash matches (prevents reuse of revoked tokens)
    const tokenHash = hashToken(refreshToken);
    if (session.refreshTokenHash !== tokenHash) {
      // Token may have been reused — revoke ALL sessions for this user (breach detection)
      await Session.deleteMany({ userId: session.userId });
      const { clearAuthCookies } = await import("@/lib/utils/auth");
      await clearAuthCookies();
      return errorResponse("Token reuse detected — all sessions revoked", 401);
    }

    // 5. Check session expiry
    if (session.isExpired()) {
      await Session.findByIdAndDelete(session._id);
      const { clearAuthCookies } = await import("@/lib/utils/auth");
      await clearAuthCookies();
      return errorResponse("Session expired", 401);
    }

    // 6. ROTATE: delete old session, create new one (refresh token rotation)
    const userId = session.userId.toString();
    const oldUserAgent = session.userAgent;
    const oldIp = session.ip;

    await Session.findByIdAndDelete(session._id);

    // 7. Create new session
    const newSession = await Session.create({
      userId,
      refreshTokenHash: "", // placeholder — we set it after generating the token
      userAgent: request.headers.get("user-agent") || oldUserAgent,
      ip:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        oldIp,
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // 8. Generate new tokens
    const newAccessToken = await generateAccessToken(userId);
    const newRefreshToken = await generateRefreshToken(
      userId,
      newSession._id.toString(),
    );

    // 9. Store the hash of the new refresh token
    newSession.refreshTokenHash = hashToken(newRefreshToken);
    await newSession.save();

    // 10. Set cookies
    await setAccessTokenCookie(newAccessToken);
    await setRefreshTokenCookie(newRefreshToken);

    return successResponse({
      message: "Tokens refreshed",
      sessionId: newSession._id,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return errorResponse("Internal server error", 500);
  }
}
