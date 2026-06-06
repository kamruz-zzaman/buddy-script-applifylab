"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

const FeedContext = createContext(null);

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // If 401, redirect to login
  if (res.status === 401) {
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
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, hasMore: true });
  const initialized = useRef(false);

  const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);

  const closeAllDropdowns = useCallback(() => {
    setProfileOpen(false);
    setNotificationOpen(false);
  }, []);

  // Fetch current user on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        const data = await apiFetch("/api/auth/me");
        if (data?.success) {
          setCurrentUser(data.data.user);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // Fetch posts
  const fetchPosts = useCallback(async (page = 1, append = false) => {
    try {
      const data = await apiFetch(`/api/posts?page=${page}&limit=10`);
      if (data?.success) {
        if (append) {
          setPosts((prev) => [...prev, ...data.data.posts]);
        } else {
          setPosts(data.data.posts);
        }
        setPagination({
          page: data.data.pagination.page,
          hasMore: data.data.pagination.hasMore,
        });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (currentUser) {
      fetchPosts(1, false);
    }
  }, [currentUser, fetchPosts]);

  // Load more posts
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || loading) return;
    setLoading(true);
    await fetchPosts(pagination.page + 1, true);
    setLoading(false);
  }, [pagination, loading, fetchPosts]);

  // Create post
  const createPost = useCallback(async (postData) => {
    const data = await apiFetch("/api/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    });
    if (data?.success) {
      setPosts((prev) => [data.data.post, ...prev]);
      return true;
    }
    return false;
  }, []);

  // Toggle reaction on post
  const togglePostReaction = useCallback(async (postId, reactionType = "like") => {
    const data = await apiFetch(`/api/posts/${postId}/like`, {
      method: "POST",
      body: JSON.stringify({ type: reactionType }),
    });
    if (data?.success) {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                reactionCounts: data.data.reactionCounts,
                reactionsCount: data.data.reactionsCount,
              }
            : p
        )
      );
      return data.data;
    }
    return null;
  }, []);

  // Delete post
  const deletePost = useCallback(async (postId) => {
    const data = await apiFetch(`/api/posts/${postId}`, {
      method: "DELETE",
    });
    if (data?.success) {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      return true;
    }
    return false;
  }, []);

  // Logout
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
        loading,
        pagination,
        loadMore,
        createPost,
        togglePostReaction,
        deletePost,
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

