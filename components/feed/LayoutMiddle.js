"use client";

import StoriesDesktop from "./StoriesDesktop";
import StoriesMobile from "./StoriesMobile";
import PostComposer from "./PostComposer";
import TimelinePost from "./TimelinePost";
import PostSkeleton from "./PostSkeleton";
import { useFeedContext } from "../common/FeedContext";

function LayoutMiddle() {
  const { posts, initialLoading, loadingMore, hasMore, loadMore } = useFeedContext();

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

          {/* Load more */}
          {hasMore && posts.length > 0 && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              {loadingMore ? (
                <div style={{ color: "#65676b", fontSize: "14px" }}>Loading more posts...</div>
              ) : (
                <button onClick={loadMore} className="_btn2">
                  Load More
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LayoutMiddle;
