/**
 * Simple server-side HTML sanitization for user-generated content.
 * Strips HTML tags and dangerous characters.
 */

export function sanitizeText(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

export function sanitizeName(name) {
  if (!name || typeof name !== "string") return "";
  return sanitizeText(name).slice(0, 50);
}
