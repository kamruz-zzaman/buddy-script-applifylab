import { clearAuthCookie, successResponse, errorResponse } from "@/lib/utils/auth";

export async function POST() {
  try {
    await clearAuthCookie();
    return successResponse({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse("Internal server error", 500);
  }
}
