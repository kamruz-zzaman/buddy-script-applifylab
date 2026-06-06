"use client";

import { useEffect, useRef } from "react";
import StoriesDesktop from "./StoriesDesktop";
import StoriesMobile from "./StoriesMobile";
import PostComposer from "./PostComposer";
import TimelinePost from "./TimelinePost";
import PostSkeleton from "./PostSkeleton";
import { useFeedContext } from "../common/FeedContext";

function LayoutMiddle() {
  const { posts, initialLoading, loadingMore, hasMore, loadMore } =
    useFeedContext();

  // Keep latest values in refs to avoid stale closures
  const stateRef = useRef({ hasMore, loadingMore });
  stateRef.current = { hasMore, loadingMore };

  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  const loadingRef = useRef(false);

  const tryLoadMore = () => {
    if (loadingRef.current) return;
    const { hasMore, loadingMore } = stateRef.current;
    if (!hasMore || loadingMore) return;

    // Check if we're near the bottom of the page
    const scrollBottom = window.innerHeight + window.scrollY;
    const pageBottom = document.documentElement.scrollHeight;

    if (pageBottom - scrollBottom < 600) {
      loadingRef.current = true;
      loadMoreRef.current().finally(() => {
        loadingRef.current = false;
      });
    }
  };

  useEffect(() => {
    // Try immediately on mount (desktop: not enough posts to scroll)
    const timer = setTimeout(tryLoadMore, 300);
    window.addEventListener("scroll", tryLoadMore, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", tryLoadMore);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also try after posts change (new batch loaded, might still have room)
  useEffect(() => {
    if (!initialLoading && posts.length > 0) {
      tryLoadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts.length, initialLoading]);

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
        </div>
      </div>
    </div>
  );
}

export default LayoutMiddle;
