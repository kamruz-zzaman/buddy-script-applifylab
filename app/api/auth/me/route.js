import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import {
  getCurrentUserId,
  successResponse,
  errorResponse,
} from "@/lib/utils/auth";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    await dbConnect();

    const user = await User.findById(userId).lean();
    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return errorResponse("Internal server error", 500);
  }
}
