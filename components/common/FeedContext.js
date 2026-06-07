"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

const FeedContext = createContext(null);

// Track whether a refresh is in-flight to avoid multiple simultaneous refreshes
let refreshPromise = null;

async function tryRefreshToken() {
  if (refreshPromise) return refreshPromise; // Deduplicate concurrent refreshes

  refreshPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      const data = await res.json();
      refreshPromise = null;
      return data?.success === true;
    } catch {
      refreshPromise = null;
      return false;
    }
  })();

  return refreshPromise;
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  // If token expired, try to refresh once and retry
  if (res.status === 401) {
    try {
      const body = await res.clone().json();
      if (body?.code === "TOKEN_EXPIRED") {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          // Retry the original request with the new access token
          const retryRes = await fetch(url, {
            ...options,
            headers: { "Content-Type": "application/json", ...options.headers },
          });
          if (retryRes.status === 401) {
            window.location.href = "/login";
            return null;
          }
          return retryRes.json();
        }
      }
    } catch {
      // If parsing fails, just redirect
    }
    window.location.href = "/login";
    return null;
  }
  return res.json();
}

export function FeedProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const initialized = useRef(false);

  // Refs to avoid stale closures in loadMore — always read the latest values
  const hasMoreRef = useRef(hasMore);
  const loadingMoreRef = useRef(loadingMore);
  const nextCursorRef = useRef(nextCursor);
  hasMoreRef.current = hasMore;
  loadingMoreRef.current = loadingMore;
  nextCursorRef.current = nextCursor;

  const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);
  const closeAllDropdowns = useCallback(() => {
    setProfileOpen(false);
    setNotificationOpen(false);
  }, []);

  // ─── Fetch current user ──────────────────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      const data = await apiFetch("/api/auth/me");
      if (data?.success) setCurrentUser(data.data.user);
    })();
  }, []);

  // ─── Cursor-based initial fetch ──────────────────────────────────────
  const fetchPosts = useCallback(async (cursor = null) => {
    const url = cursor
      ? `/api/posts?limit=10&cursor=${cursor}`
      : `/api/posts?limit=10`;
    const data = await apiFetch(url);
    if (data?.success) {
      setPosts(data.data.posts);
      setNextCursor(data.data.pagination.nextCursor);
      setHasMore(data.data.pagination.hasMore);
    }
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser) fetchPosts(null);
  }, [currentUser, fetchPosts]);

  // ─── Load more (cursor) ──────────────────────────────────────────────
  // Uses refs for guard checks to avoid stale closures. The callback has
  // no state dependencies, so its reference stays stable across renders.
  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || loadingMoreRef.current || !nextCursorRef.current)
      return;
    setLoadingMore(true);
    try {
      const data = await apiFetch(
        `/api/posts?limit=10&cursor=${nextCursorRef.current}`,
      );
      if (data?.success) {
        setPosts((prev) => [...prev, ...data.data.posts]);
        setNextCursor(data.data.pagination.nextCursor);
        setHasMore(data.data.pagination.hasMore);
      }
    } finally {
      setLoadingMore(false);
    }
  }, []);

  // ─── Optimistic: Create post (no refetch) ────────────────────────────
  const createPost = useCallback(
    async (postData) => {
      // Optimistic: generate temp ID and add immediately
      const tempId = "temp_" + Date.now();
      const optimisticPost = {
        _id: tempId,
        author: {
          _id: currentUser?.id,
          firstName: currentUser?.firstName,
          lastName: currentUser?.lastName,
        },
        content: postData.content || "",
        imageUrl: postData.imageUrl || null,
        isPrivate: postData.isPrivate || false,
        topReactions: [],
        reactionCounts: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
        reactionsCount: 0,
        commentsCount: 0,
        comments: [],
        totalComments: 0,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [optimisticPost, ...prev]);

      const data = await apiFetch("/api/posts", {
        method: "POST",
        body: JSON.stringify(postData),
      });
      if (data?.success) {
        // Replace temp post with real one
        setPosts((prev) =>
          prev.map((p) => (p._id === tempId ? data.data.post : p)),
        );
        return true;
      }
      // Revert on failure
      setPosts((prev) => prev.filter((p) => p._id !== tempId));
      return false;
    },
    [currentUser],
  );

  // ─── Optimistic: Toggle reaction (counts only, server returns full state) ──
  const togglePostReaction = useCallback(
    async (postId, reactionType = "like") => {
      // Optimistic: update reaction counts immediately
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const newReactionCounts = { ...p.reactionCounts };
          // Simple optimistic toggle — server will correct if needed
          newReactionCounts[reactionType] =
            (newReactionCounts[reactionType] || 0) + 1;
          return {
            ...p,
            reactionCounts: newReactionCounts,
            reactionsCount: (p.reactionsCount || 0) + 1,
          };
        }),
      );

      // Server sync — response contains correct counts
      const data = await apiFetch(`/api/posts/${postId}/like`, {
        method: "POST",
        body: JSON.stringify({ type: reactionType }),
      });
      if (data?.success) {
        // Correct with server state
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  reactionCounts: data.data.reactionCounts,
                  reactionsCount: data.data.reactionsCount,
                }
              : p,
          ),
        );
      }
      return true;
    },
    [currentUser],
  );

  // ─── Optimistic: Delete post ─────────────────────────────────────────
  const deletePost = useCallback(async (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    const data = await apiFetch(`/api/posts/${postId}`, { method: "DELETE" });
    return data?.success || false;
  }, []);

  // ─── Optimistic: Increment comments count (no refetch) ───────────────
  const incrementCommentsCount = useCallback((postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
          : p,
      ),
    );
  }, []);

  // ─── Logout ──────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }, []);

  return (
    <FeedContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        profileOpen,
        setProfileOpen,
        notificationOpen,
        setNotificationOpen,
        closeAllDropdowns,
        currentUser,
        posts,
        setPosts,
        initialLoading,
        loadingMore,
        hasMore,
        loadMore,
        createPost,
        togglePostReaction,
        deletePost,
        incrementCommentsCount,
        logout,
      }}
    >
      <div className={darkMode ? "_dark_wrapper" : ""}>{children}</div>
    </FeedContext.Provider>
  );
}

export function useFeedContext() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeedContext must be used within FeedProvider");
  return ctx;
}
