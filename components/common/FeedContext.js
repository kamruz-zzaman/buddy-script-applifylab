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
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    const data = await apiFetch(`/api/posts?limit=10&cursor=${nextCursor}`);
    if (data?.success) {
      setPosts((prev) => [...prev, ...data.data.posts]);
      setNextCursor(data.data.pagination.nextCursor);
      setHasMore(data.data.pagination.hasMore);
    }
    setLoadingMore(false);
  }, [hasMore, loadingMore, nextCursor]);

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
        reactions: [],
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

  // ─── Optimistic: Toggle reaction (no refetch) ────────────────────────
  const togglePostReaction = useCallback(
    async (postId, reactionType = "like") => {
      // Optimistic: update immediately
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const existingReaction = p.reactions?.find(
            (r) => (r.user?._id || r.user) === currentUser?.id,
          );
          const newReactionCounts = { ...p.reactionCounts };
          let newReactions = [...(p.reactions || [])];
          let newReactionsCount = p.reactionsCount || 0;

          if (existingReaction) {
            if (existingReaction.type === reactionType) {
              // Remove reaction
              newReactions = newReactions.filter(
                (r) => (r.user?._id || r.user) !== currentUser?.id,
              );
              newReactionCounts[existingReaction.type] = Math.max(
                0,
                (newReactionCounts[existingReaction.type] || 0) - 1,
              );
              newReactionsCount = Math.max(0, newReactionsCount - 1);
            } else {
              // Change reaction type
              newReactions = newReactions.map((r) =>
                (r.user?._id || r.user) === currentUser?.id
                  ? { ...r, type: reactionType }
                  : r,
              );
              newReactionCounts[existingReaction.type] = Math.max(
                0,
                (newReactionCounts[existingReaction.type] || 0) - 1,
              );
              newReactionCounts[reactionType] =
                (newReactionCounts[reactionType] || 0) + 1;
            }
          } else {
            // Add reaction
            newReactions.push({
              user: { _id: currentUser?.id },
              type: reactionType,
            });
            newReactionCounts[reactionType] =
              (newReactionCounts[reactionType] || 0) + 1;
            newReactionsCount++;
          }
          return {
            ...p,
            reactions: newReactions,
            reactionCounts: newReactionCounts,
            reactionsCount: newReactionsCount,
          };
        }),
      );

      // Server sync (fire and forget)
      apiFetch(`/api/posts/${postId}/like`, {
        method: "POST",
        body: JSON.stringify({ type: reactionType }),
      });
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
