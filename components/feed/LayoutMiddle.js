"use client";

import { useRef, useEffect, useCallback } from "react";
import StoriesDesktop from "./StoriesDesktop";
import StoriesMobile from "./StoriesMobile";
import PostComposer from "./PostComposer";
import TimelinePost from "./TimelinePost";
import PostSkeleton from "./PostSkeleton";
import { useFeedContext } from "../common/FeedContext";

function LayoutMiddle() {
  const { posts, initialLoading, loadingMore, hasMore, loadMore } =
    useFeedContext();
  const sentinelRef = useRef(null);
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (initialLoading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // If sentinel is already in view (desktop: not enough posts to scroll),
    // trigger load immediately
    if (hasMore && !loadingMore) {
      const rect = sentinel.getBoundingClientRect();
      if (rect.top < window.innerHeight + 400) {
        loadMoreRef.current();
        return;
      }
    }

    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreRef.current();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore, initialLoading, posts.length]);

  return (
    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
      <div className="_layout_middle_wrap">
        <div className="_layout_middle_inner">
          <StoriesDesktop />
          <StoriesMobile />
          <PostComposer />

          {/* Skeleton loading */}
          {initialLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts.length === 0 ? (
            <div
              className="_b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16"
              style={{ textAlign: "center", color: "#65676b" }}
            >
              No posts yet. Be the first to share something!
            </div>
          ) : (
            posts.map((post) => <TimelinePost key={post._id} post={post} />)
          )}

          {/* Sentinel for infinite scroll + loading indicator */}
          <div ref={sentinelRef} style={{ height: "1px" }} />
          {loadingMore && posts.length > 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "16px 0",
                color: "#65676b",
                fontSize: "14px",
              }}
            >
              Loading more posts...
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "16px 0",
                color: "#65676b",
                fontSize: "13px",
              }}
            >
              You're all caught up!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LayoutMiddle;
