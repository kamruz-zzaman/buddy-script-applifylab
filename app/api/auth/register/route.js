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
    const { firstName, lastName, email, password } = body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return errorResponse("All fields are required: firstName, lastName, email, password");
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

    // Generate JWT and set cookie
    const token = await generateToken(user._id.toString());
    await setAuthCookie(token);

    return successResponse(
      {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
      201
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
