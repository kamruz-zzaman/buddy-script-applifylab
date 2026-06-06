"use client";

import { useState } from "react";
import Image from "next/image";

function CommentBox({ postId, onCommentAdded, parentId, placeholder }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmed,
          parentId: parentId || null,
        }),
      });

      const data = await res.json();
      if (data?.success) {
        setContent("");
        if (onCommentAdded) onCommentAdded(data.data.comment);
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="_feed_inner_timeline_cooment_area" style={parentId ? { paddingLeft: "0", paddingRight: "0" } : {}}>
      <div className="_feed_inner_comment_box">
        <form className="_feed_inner_comment_box_form" onSubmit={handleSubmit}>
          <div className="_feed_inner_comment_box_content">
            <div className="_feed_inner_comment_box_content_image">
              <Image src="/assets/images/comment_img.png" alt="" width={32} height={32} className="_comment_img" />
            </div>
            <div className="_feed_inner_comment_box_content_txt" style={{ flex: 1 }}>
              <input
                type="text"
                className="form-control _comment_textarea"
                placeholder={placeholder || "Write a comment..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={2000}
                style={{ height: "36px" }}
              />
            </div>
          </div>
          <button
            className="_feed_inner_comment_box_icon_btn"
            type="submit"
            disabled={submitting || !content.trim()}
            style={{
              background: content.trim() ? "#0d6efd" : "#e4e6eb",
              color: content.trim() ? "#fff" : "#bcc0c4",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "13px",
              cursor: content.trim() ? "pointer" : "default",
            }}
          >
            {submitting ? "..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CommentBox;
