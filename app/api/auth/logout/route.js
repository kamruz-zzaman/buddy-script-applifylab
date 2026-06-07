import dbConnect from "@/lib/mongodb";
import Session from "@/lib/models/Session";
import {
  clearAuthCookies,
  getRefreshTokenFromCookies,
  verifyRefreshToken,
  successResponse,
  errorResponse,
} from "@/lib/utils/auth";

export async function POST() {
  try {
    // Attempt to delete the session from DB
    const refreshToken = await getRefreshTokenFromCookies();
    if (refreshToken) {
      const payload = await verifyRefreshToken(refreshToken);
      if (payload?.sessionId) {
        await dbConnect();
        await Session.findByIdAndDelete(payload.sessionId);
      }
    }

    // Always clear cookies
    await clearAuthCookies();

    return successResponse({ message: "Logged out successfully" });
  } catch (error) {
    // Still clear cookies even if DB operation fails
    await clearAuthCookies();
    console.error("Logout error:", error);
    return errorResponse("Internal server error", 500);
  }
}
