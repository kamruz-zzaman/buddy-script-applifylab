"use client";

/**
 * UserAvatar — deterministic colored initials avatar.
 * No file uploads needed. Each user gets a unique color derived from their ID.
 *
 * Props:
 *   user       – { _id, firstName, lastName }  (or pass individually)
 *   firstName  – string (fallback if user object not provided)
 *   lastName   – string (fallback)
 *   userId     – string (fallback for color seed)
 *   size       – number (default: 40)
 *   className  – additional CSS classes
 *   style      – additional inline styles
 */

// Generate a deterministic HSL color from a string seed
function colorFromId(id = "default") {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 48%)`;
}

// Extract initials from first + last name (max 2 chars)
function getInitials(firstName, lastName) {
  const first = firstName?.trim()?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.trim()?.charAt(0)?.toUpperCase() || "";
  return first + last || "?";
}

export default function UserAvatar({
  user,
  firstName,
  lastName,
  userId,
  size = 40,
  className = "",
  style = {},
}) {
  const id = user?._id?.toString() || userId || "?";
  const fn = firstName || user?.firstName || "";
  const ln = lastName || user?.lastName || "";
  const initials = getInitials(fn, ln);
  const bgColor = colorFromId(id);

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    backgroundColor: bgColor,
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: size * 0.38,
    fontWeight: 600,
    flexShrink: 0,
    lineHeight: 1,
    userSelect: "none",
    ...style,
  };

  return (
    <span
      className={className}
      style={baseStyle}
      title={`${fn} ${ln}`.trim() || "User"}
      aria-label={`${fn} ${ln}`.trim() || "User"}
    >
      {initials}
    </span>
  );
}
