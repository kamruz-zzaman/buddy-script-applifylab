"use client";

import { useRef, useEffect } from "react";
import StoriesDesktop from "./StoriesDesktop";
import StoriesMobile from "./StoriesMobile";
import PostComposer from "./PostComposer";
import TimelinePost from "./TimelinePost";
import PostSkeleton from "./PostSkeleton";
import { useFeedContext } from "../common/FeedContext";

function LayoutMiddle() {
  const { posts, initialLoading, loadingMore, hasMore, loadMore } = useFeedContext();
  const sentinelRef = useRef(null);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" } // trigger 200px before reaching the sentinel
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

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
            <div className="_b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16" style={{ textAlign: "center", color: "#65676b" }}>
              No posts yet. Be the first to share something!
            </div>
          ) : (
            posts.map((post) => (
              <TimelinePost key={post._id} post={post} />
            ))
          )}

          {/* Sentinel for infinite scroll + loading indicator */}
          <div ref={sentinelRef} style={{ height: "1px" }} />
          {loadingMore && posts.length > 0 && (
            <div style={{ textAlign: "center", padding: "16px 0", color: "#65676b", fontSize: "14px" }}>
              Loading more posts...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LayoutMiddle;
