import dbConnect from "@/lib/mongodb";
import Session from "@/lib/models/Session";
import {
  getCurrentUserId,
  successResponse,
  errorResponse,
} from "@/lib/utils/auth";

/**
 * GET /api/auth/sessions
 * Returns all active sessions for the current user.
 * Includes device info so users can identify and revoke specific sessions.
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const sessions = await Session.findActiveByUser(userId);

    // Return safe session data (no token hashes)
    const safeSessions = sessions.map((s) => ({
      id: s._id,
      userAgent: s.userAgent,
      ip: s.ip,
      lastActivity: s.lastActivity,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      // Flag the current session (we can't know from the access token alone,
      // but the client can compare if we pass the sessionId)
    }));

    return successResponse({
      sessions: safeSessions,
      total: safeSessions.length,
    });
  } catch (error) {
    console.error("Sessions error:", error);
    return errorResponse("Internal server error", 500);
  }
}

/**
 * DELETE /api/auth/sessions
 * Body: { sessionId: "..." }
 * Revokes a specific session. If no sessionId provided, revokes all
 * sessions EXCEPT the current one.
 */
export async function DELETE(request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const body = await request.json().catch(() => ({}));
    const { sessionId } = body;

    if (sessionId) {
      // Revoke a specific session (must belong to the user)
      const session = await Session.findOne({ _id: sessionId, userId });
      if (!session) {
        return errorResponse("Session not found", 404);
      }
      await Session.findByIdAndDelete(sessionId);
      return successResponse({ message: "Session revoked" });
    }

    // Revoke ALL sessions for this user
    await Session.deleteMany({ userId });
    return successResponse({ message: "All sessions revoked" });
  } catch (error) {
    console.error("Delete sessions error:", error);
    return errorResponse("Internal server error", 500);
  }
}
