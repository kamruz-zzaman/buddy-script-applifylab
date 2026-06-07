import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

function getJwtSecret() {
  const secret =
    process.env.JWT_SECRET || "buddy-script-secret-key-change-in-production";
  return new TextEncoder().encode(secret);
}

// ── Token expiries ──────────────────────────────────────────────
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "30d";

// Cookie maxAge values (in seconds)
const ACCESS_COOKIE_MAX_AGE = 60 * 15; // 15 minutes
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// ── Token generation ────────────────────────────────────────────

/** Short-lived access token (15 min) */
export async function generateAccessToken(userId) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(getJwtSecret());
}

/** Long-lived refresh token (30 days) — includes sessionId for revocation */
export async function generateRefreshToken(userId, sessionId) {
  return new SignJWT({ userId, sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(getJwtSecret());
}

// ── Token verification ──────────────────────────────────────────

/** Verify access token. Returns payload or null. */
export async function verifyAccessToken(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload;
  } catch {
    return null;
  }
}

/** Verify refresh token. Returns payload or null. */
export async function verifyRefreshToken(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload;
  } catch {
    return null;
  }
}

// Alias for backward-compat in middleware
export const verifyToken = verifyAccessToken;

// ── Cookie helpers ──────────────────────────────────────────────

/** Set the access-token httpOnly cookie */
export async function setAccessTokenCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });
}

/** Set the refresh-token httpOnly cookie */
export async function setRefreshTokenCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set("refresh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/refresh", // Only sent to refresh endpoint
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

/** Clear both auth cookies */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set("access_token", "", { maxAge: 0, path: "/" });
  cookieStore.set("refresh_token", "", {
    maxAge: 0,
    path: "/api/auth/refresh",
  });
}

// Backward-compat alias
export async function setAuthCookie(token) {
  return setAccessTokenCookie(token);
}

// Backward-compat alias
export async function clearAuthCookie() {
  return clearAuthCookies();
}

// ── Current user helpers ────────────────────────────────────────

/** Get current userId from the access_token cookie */
export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  const decoded = await verifyAccessToken(token);
  if (!decoded) return null;

  return decoded.userId;
}

/** Get the refresh token from cookies (for refresh flow) */
export async function getRefreshTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get("refresh_token")?.value || null;
}

// ── Refresh token hashing (for DB storage) ──────────────────────

/** Hash a token using SHA-256 (Web Crypto API – works in Edge & Node) */
export async function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── API response helpers ────────────────────────────────────────

export function successResponse(data, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function errorResponse(message, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}
