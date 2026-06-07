"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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

  // Keep loadMore in a ref so the effect always calls the latest version
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  const [containerEl, setContainerEl] = useState(null);
  const scrollContainerRef = useCallback((node) => {
    setContainerEl(node);
  }, []);

  // Intersection observer scoped to the actual scroll container.
  const { ref: sentinelRef, inView } = useInView({
    root: containerEl,
    rootMargin: "0px 0px 400px 0px",
    threshold: 0,
  });

  // Single effect for all pagination — fires
  useEffect(() => {
    if (inView && hasMore && !loadingMore && !initialLoading) {
      loadMoreRef.current();
    }
  }, [inView, hasMore, loadingMore, initialLoading]);

  return (
    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
      <div className="_layout_middle_wrap" ref={scrollContainerRef}>
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
              You&apos;re all caught up!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LayoutMiddle;
