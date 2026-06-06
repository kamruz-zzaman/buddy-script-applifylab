import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import {
  generateToken,
  setAuthCookie,
  successResponse,
  errorResponse,
} from "@/lib/utils/auth";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("Email and password are required");
    }

    // Find user and include password field for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+password"
    );

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse("Invalid email or password", 401);
    }

    // Generate JWT and set cookie
    const token = generateToken(user._id.toString());
    await setAuthCookie(token);

    return successResponse({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Internal server error", 500);
  }
}
