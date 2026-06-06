"use client";

import { useState } from "react";
import Image from "next/image";
import { useFeedContext } from "../common/FeedContext";

function PostComposer() {
  const { currentUser, createPost } = useFeedContext();
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Please write something");
      return;
    }

    setSubmitting(true);
    setError("");

    const success = await createPost({
      content: trimmed,
      isPrivate,
    });

    if (success) {
      setContent("");
      setIsPrivate(false);
    } else {
      setError("Failed to create post");
    }

    setSubmitting(false);
  };

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <div className="_feed_inner_text_area_box">
        <div className="_feed_inner_text_area_box_image">
          <Image src="/assets/images/txt_img.png" alt="Avatar" width={44} height={44} className="_txt_img" />
        </div>
        <div className="form-floating _feed_inner_text_area_box_form" style={{ flex: 1 }}>
          <textarea
            className="form-control _textarea"
            placeholder="What's on your mind?"
            id="floatingTextarea"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError("");
            }}
            maxLength={5000}
          />
          <label className="_feed_textarea_label" htmlFor="floatingTextarea">
            Write something ...
          </label>
        </div>
      </div>

      <div className="_feed_inner_text_area_bottom">
        <div className="_feed_inner_area_bottom_box">
          <div className="_feed_common">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="privatePost"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="privatePost" style={{ fontSize: "13px" }}>
                Private post (only you can see)
              </label>
            </div>
          </div>
        </div>
        <div className="_feed_inner_area_bottom_right">
          <button
            type="button"
            className="_btn2"
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-1 mt-2 mb-0" role="alert" style={{ fontSize: "13px" }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default PostComposer;
