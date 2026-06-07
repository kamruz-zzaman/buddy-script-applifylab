import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/utils/auth";

// Paths that do NOT require authentication
const publicPaths = [
  "/login",
  "/registration",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/seed",
];

// Paths that ALWAYS require authentication
const protectedPaths = ["/feed"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

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
    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    // No access token at all
    if (!accessToken) {
      // If there's a refresh token, redirect to refresh (auto-refresh flow)
      // This handles the case where access token expired and browser auto-sends request
      if (refreshToken && !pathname.startsWith("/api/auth/refresh")) {
        // For API calls, return a specific status so the client can retry
        if (pathname.startsWith("/api/")) {
          return Response.json(
            {
              success: false,
              error: "Access token expired",
              code: "TOKEN_EXPIRED",
            },
            { status: 401 },
          );
        }
        // For page loads, redirect to login (the page component should handle refresh)
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (pathname.startsWith("/api/")) {
        return Response.json(
          { success: false, error: "Not authenticated" },
          { status: 401 },
        );
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verify the access token
    const decoded = await verifyAccessToken(accessToken);
    if (!decoded) {
      // Access token expired or invalid — tell the client to refresh
      if (pathname.startsWith("/api/")) {
        // For API routes, return 401 and the client-side FeedClient will handle refresh
        return Response.json(
          {
            success: false,
            error: "Token expired",
            code: "TOKEN_EXPIRED",
          },
          { status: 401 },
        );
      }
      // For pages, redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("access_token", "", { maxAge: 0, path: "/" });
      return response;
    }

    // Token is valid — add userId to request headers
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
