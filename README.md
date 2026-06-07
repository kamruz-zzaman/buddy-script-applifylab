# Buddy Script — Social Media Platform

A full-stack social media application built with Next.js 16, MongoDB, and Cloudinary. Features a real-time feed, posts, comments, reactions, and a secure authentication system.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (access + refresh tokens) with AES-256-GCM encrypted cookies |
| File Storage | Cloudinary (images/videos) |
| Styling | Bootstrap 5 + custom CSS |
| Runtime | Node.js (Turbopack dev server) |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Setup

```bash
# Install dependencies
pnpm install

# Create .env.local with your credentials
cp .env.example .env.local

# Seed the database with test data
curl http://localhost:3000/api/seed

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test Accounts

| Email | Password |
|-------|----------|
| karim@example.com | password123 |
| sarah@example.com | password123 |
| mohammad@example.com | password123 |

---

## Features

### 🔐 Authentication

- **Dual-token system**: Access token (15 min) + Refresh token (30 days)
- **AES-256-GCM encrypted cookies** — cookie values are fully opaque, not readable JWTs
- **Opaque cookie names** (`bsid`, `bsrt`) — don't reveal their purpose
- **Refresh token rotation** — each refresh invalidates the old token pair
- **Reuse detection** — if a stolen refresh token is reused, all sessions are revoked
- **Session tracking** — MongoDB-backed sessions with IP, user agent, last activity
- **Session management** — `GET /api/auth/sessions` lists active sessions; `DELETE` revokes them
- **httpOnly + SameSite=Lax + Secure** cookies — inaccessible to JavaScript
- **HKDF key derivation** — encryption key derived from `JWT_SECRET`

```
Login/Register → access_token (15min) + refresh_token (30d) + Session in DB
API call → proxy validates bsid cookie → attach x-user-id header
Token expired → 401 {code: "TOKEN_EXPIRED"} → client auto-refreshes → retries
```

### 📝 Registration Validation

- **Names**: 2-50 chars, letters/spaces/hyphens/apostrophes only (supports accented chars)
- **Email**: RFC-compliant regex, max 254 chars, uniqueness check
- **Password**: 8-128 chars, must contain uppercase + lowercase + number + special char
- **Smart checks**: Password cannot contain first name, last name, or email username
- **Rate limiting**: 5 registrations/min per IP

### 📰 Posts

- Create posts with text and/or images (Cloudinary upload)
- Public/private visibility toggle
- Cursor-based pagination for infinite scroll
- Optimistic UI updates — post appears instantly, syncs in background
- Loading skeletons during fetch

### 💬 Comments

- Nested comments (replies) with threaded display
- Support text + image uploads
- Cursor-based pagination (no offset/scan)
- Optimistic comment count updates

### 👍 Reactions

- 6 reaction types: Like, Love, Haha, Wow, Sad, Angry
- **Separate Reaction collection** — scales to millions per post (no 16MB document limit)
- Unique compound indexes: `{post, user}` and `{comment, user}`
- Top 3 reactors displayed with colored initials avatars
- Denormalized counts on Post/Comment for fast reads

### 👤 User Avatars

- **Deterministic colored initials** — no file uploads needed
- Each user gets a unique HSL color derived from their MongoDB `_id`
- Displays first letter of first name + first letter of last name
- Used everywhere: header, post composer, reactions, comments

### ⚡ Caching

- **In-memory LRU cache** with TTL + stale-while-revalidate (no Redis needed)
- Feed: 5s TTL, 30s stale window, background refresh
- `X-Cache: HIT | STALE | MISS` response headers
- Auto-invalidation on: new post, delete, react, comment
- `Cache-Control: private, max-age=5, stale-while-revalidate=30`

### 🛡 Security

- **CSP headers**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Rate limiting**: Configurable per-endpoint (in-memory, migrate to Redis for production)
- **Protected seed route**: Disabled in production without `SEED_TOKEN`
- **Input sanitization**: HTML tag stripping for user-generated content
- **No hardcoded secrets**: `JWT_SECRET` required at startup
- **Proxy-based auth**: All API routes protected by `proxy.js`

### 🏗 Scalability

- **Cursor-based pagination** on posts and comments (O(log n) with indexes)
- **Separate Reaction collection** — handles viral posts with unlimited reactions
- **Denormalized counts** on Post/Comment — fast reads without aggregation
- **Connection pooling**: 100 connections in production
- **Compound indexes**: `{author, createdAt}`, `{post, parent, createdAt}`, `{post, user}`
- **MongoDB TTL index** on sessions for automatic cleanup

---

## Project Structure

```
app/
├── page.js              # Feed (root route, auth-protected)
├── layout.js            # Root layout with Bootstrap + fonts
├── login/page.js        # Login page
├── registration/page.js # Registration page
└── api/
    ├── auth/
    │   ├── login/       # POST — authenticate user
    │   ├── register/    # POST — create account
    │   ├── logout/      # POST — clear session + cookies
    │   ├── me/          # GET  — current user info
    │   ├── refresh/     # POST — rotate tokens
    │   └── sessions/    # GET/DELETE — manage sessions
    ├── posts/
    │   ├── route.js     # GET (feed) + POST (create)
    │   └── [id]/
    │       ├── route.js       # GET + DELETE
    │       ├── like/route.js  # POST (toggle) + GET (list)
    │       └── comments/route.js  # GET + POST
    ├── comments/[id]/like/route.js  # POST — toggle comment reaction
    ├── upload/route.js  # POST — file upload
    └── seed/route.js    # GET  — seed test data (dev only)

lib/
├── models/
│   ├── User.js      # User schema (bcrypt hashed passwords)
│   ├── Post.js      # Post schema (denormalized counts)
│   ├── Comment.js   # Comment schema (nested, denormalized counts)
│   ├── Reaction.js  # Reaction schema (separate collection)
│   └── Session.js   # Session schema (TTL index, token hash)
├── utils/
│   ├── auth.js      # JWT generation, AES-GCM encryption, cookie helpers
│   ├── cache.js     # In-memory LRU cache with TTL + SWR
│   ├── rateLimit.js # In-memory rate limiter
│   └── sanitize.js  # HTML tag stripping
├── mongodb.js       # MongoDB connection (connection pooling)
└── cloudinary.js    # Cloudinary SDK config

components/
├── common/
│   ├── FeedClient.js    # Client-side auth + data provider
│   ├── FeedContext.js   # Global state, optimistic updates, auto-refresh
│   └── UserAvatar.js    # Deterministic colored initials avatar
├── feed/                # Post composer, timeline, comments, reactions
├── layout/              # Header, mobile nav, dark mode
├── profile/             # Profile dropdown
└── sidebar/             # Left & right sidebars

proxy.js                 # Auth proxy (replaces deprecated middleware.js)
```

## API Response Format

```json
{
  "success": true,
  "data": {
    "posts": [...],
    "pagination": {
      "limit": 10,
      "nextCursor": "6a25b04f9150508e3ed0424d",
      "hasMore": true
    }
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Environment Variables

```env
MONGODB_URI=mongodb://127.0.0.1:27017/buddy-script
JWT_SECRET=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
SEED_TOKEN=optional-seed-token-for-production
```

## License

MIT
