"use client";

import StoriesDesktop from "./StoriesDesktop";
import StoriesMobile from "./StoriesMobile";
import PostComposer from "./PostComposer";
import TimelinePost from "./TimelinePost";
import { useFeedContext } from "../common/FeedContext";

function LayoutMiddle() {
  const { posts, loading, pagination, loadMore } = useFeedContext();

  return (
    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
      <div className="_layout_middle_wrap">
        <div className="_layout_middle_inner">
          {/* Desktop Stories */}
          <StoriesDesktop />
          {/* Mobile Stories */}
          <StoriesMobile />
          {/* Post Composer */}
          <PostComposer />

          {/* Real posts from API */}
          {loading && posts.length === 0 ? (
            <div className="_b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16" style={{ textAlign: "center", color: "#65676b" }}>
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="_b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16" style={{ textAlign: "center", color: "#65676b" }}>
              No posts yet. Be the first to share something!
            </div>
          ) : (
            posts.map((post) => (
              <TimelinePost key={post._id} post={post} />
            ))
          )}

          {/* Load more button */}
          {pagination.hasMore && posts.length > 0 && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <button
                onClick={loadMore}
                disabled={loading}
                className="_btn2"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LayoutMiddle;
