"use client";

import { useEffect, useRef, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import StoriesDesktop from "./StoriesDesktop";
import StoriesMobile from "./StoriesMobile";
import PostComposer from "./PostComposer";
import TimelinePost from "./TimelinePost";
import PostSkeleton from "./PostSkeleton";
import { useFeedContext } from "../common/FeedContext";

function LayoutMiddle() {
  const { posts, initialLoading, loadingMore, hasMore, loadMore } =
    useFeedContext();

  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  const { ref: sentinelRef, inView } = useInView({
    rootMargin: "400px",
    skip: !hasMore || loadingMore,
  });

  const loadingRef = useRef(false);

  // Trigger loadMore when sentinel comes into view
  useEffect(() => {
    if (inView && hasMore && !loadingMore && !loadingRef.current) {
      loadingRef.current = true;
      loadMoreRef.current().finally(() => {
        loadingRef.current = false;
      });
    }
  }, [inView, hasMore, loadingMore]);

  // Desktop fallback: if not enough posts to cause scroll, try loading
  useEffect(() => {
    if (initialLoading || posts.length === 0 || !hasMore || loadingMore) return;
    const timer = setTimeout(() => {
      const pageBottom = document.documentElement.scrollHeight;
      const viewBottom = window.innerHeight + window.scrollY;
      if (pageBottom - viewBottom < 800) {
        loadMoreRef.current();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [initialLoading, posts.length, hasMore, loadingMore]);

  return (
    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
      <div className="_layout_middle_wrap">
        <div className="_layout_middle_inner">
          <StoriesDesktop />
          <StoriesMobile />
          <PostComposer />

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

          {/* Intersection Observer sentinel */}
          <div ref={sentinelRef} style={{ height: "1px" }} />

          {loadingMore && (
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
