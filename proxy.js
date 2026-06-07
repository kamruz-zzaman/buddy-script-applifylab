import { NextResponse } from "next/server";
import { verifyAccessToken, decryptCookieValue } from "@/lib/utils/auth";

// Paths that do NOT require authentication
const publicPaths = [
  "/login",
  "/registration",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/seed",
];

// Exact paths that require authentication
const protectedExact = ["/"];

export default async function proxy(request) {
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
    protectedExact.some((p) => pathname === p) ||
    pathname.startsWith("/api/");

  if (isProtected) {
    const encryptedAccess = request.cookies.get("bsid")?.value;
    const encryptedRefresh = request.cookies.get("bsrt")?.value;

    // Decrypt the access token cookie value
    let accessToken = null;
    if (encryptedAccess) {
      accessToken = await decryptCookieValue(encryptedAccess);
    }

    // No access token at all
    if (!accessToken) {
      if (encryptedRefresh && !pathname.startsWith("/api/auth/refresh")) {
        if (pathname.startsWith("/api/")) {
          return Response.json(
            { success: false, error: "Access token expired", code: "TOKEN_EXPIRED" },
            { status: 401 },
          );
        }
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
      if (pathname.startsWith("/api/")) {
        return Response.json(
          { success: false, error: "Token expired", code: "TOKEN_EXPIRED" },
          { status: 401 },
        );
      }
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("bsid", "", { maxAge: 0, path: "/" });
      return response;
    }

    // Token is valid — add userId to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.userId);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
