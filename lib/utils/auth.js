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

// ── AES-256-GCM encryption key (derived once, cached) ───────────
let _encryptionKey = null;

async function getEncryptionKey() {
  if (_encryptionKey) return _encryptionKey;

  const secret = getJwtSecret();
  // Import the secret as raw key material for HKDF derivation
  const baseKey = await crypto.subtle.importKey("raw", secret, "HKDF", false, [
    "deriveKey",
  ]);

  // Derive a 256-bit AES-GCM key using HKDF
  _encryptionKey = await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode("buddy-script-cookie-encryption"),
      info: new TextEncoder().encode("aes-gcm-cookie-key"),
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );

  return _encryptionKey;
}

// ── Cookie-value encryption ─────────────────────────────────────

/**
 * Encrypt a plaintext token → base64(IV + ciphertext).
 * Uses AES-256-GCM. The IV is 12 random bytes prepended to the ciphertext.
 */
export async function encryptCookieValue(plaintext) {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );

  // Prepend IV to ciphertext, then base64 the whole thing
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a base64(IV + ciphertext) → plaintext token.
 * Returns null on any failure.
 */
export async function decryptCookieValue(encrypted) {
  try {
    const key = await getEncryptionKey();
    const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

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

// ── Cookie helpers (encrypted storage) ──────────────────────────

/** Set the access-token httpOnly cookie (encrypted) */
export async function setAccessTokenCookie(token) {
  const cookieStore = await cookies();
  const encrypted = await encryptCookieValue(token);
  cookieStore.set("bsid", encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });
}

/** Set the refresh-token httpOnly cookie (encrypted) */
export async function setRefreshTokenCookie(token) {
  const cookieStore = await cookies();
  const encrypted = await encryptCookieValue(token);
  cookieStore.set("bsrt", encrypted, {
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
  cookieStore.set("bsid", "", { maxAge: 0, path: "/" });
  cookieStore.set("bsrt", "", {
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

/** Get current userId from the bsid cookie (decrypts first) */
export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const encrypted = cookieStore.get("bsid")?.value;

  if (!encrypted) return null;

  const token = await decryptCookieValue(encrypted);
  if (!token) return null;

  const decoded = await verifyAccessToken(token);
  if (!decoded) return null;

  return decoded.userId;
}

/** Get the decrypted refresh token from cookies (for refresh flow) */
export async function getRefreshTokenFromCookies() {
  const cookieStore = await cookies();
  const encrypted = cookieStore.get("bsrt")?.value;
  if (!encrypted) return null;

  return decryptCookieValue(encrypted);
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
