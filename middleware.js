import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/auth";
import { rateLimit } from "@/lib/utils/rateLimit";

// Paths that do NOT require authentication
const publicPaths = ["/login", "/registration", "/api/auth/login", "/api/auth/register", "/api/seed"];

// Paths that ALWAYS require authentication
const protectedPaths = ["/feed"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to API routes
  if (pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    // Stricter rate limit for auth endpoints
    if (pathname.startsWith("/api/auth/")) {
      const { allowed } = rateLimit(`auth_${ip}`, 10, 60000); // 10 requests per minute
      if (!allowed) {
        return Response.json(
          { success: false, error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    } else {
      const { allowed } = rateLimit(`api_${ip}`, 60, 60000); // 60 requests per minute
      if (!allowed) {
        return Response.json(
          { success: false, error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }
  }

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static assets, images, etc.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if this is a protected route or API
  const isProtected =
    protectedPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/api/");

  if (isProtected) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      // For API routes, return 401 JSON
      if (pathname.startsWith("/api/")) {
        return Response.json(
          { success: false, error: "Not authenticated" },
          { status: 401 }
        );
      }
      // For pages, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      if (pathname.startsWith("/api/")) {
        return Response.json(
          { success: false, error: "Invalid or expired token" },
          { status: 401 }
        );
      }
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("token", "", { maxAge: 0 });
      return response;
    }

    // Add userId to request headers for convenience
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.userId);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
