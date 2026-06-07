"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { MicIcon, ImageIcon } from "../common/icons";

function CommentBox({ postId, onCommentAdded, parentId }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if ((!trimmed && !selectedFile) || submitting) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", trimmed);
      if (parentId) formData.append("parentId", parentId);
      if (selectedFile) formData.append("file", selectedFile);

      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data?.success) {
        setContent("");
        clearFile();
        if (onCommentAdded) onCommentAdded(data.data.comment);
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const hasContent = content.trim() || selectedFile;

  return (
    <div className="_feed_inner_timeline_cooment_area">
      <div className="_feed_inner_comment_box">
        <form className="_feed_inner_comment_box_form" onSubmit={handleSubmit}>
          <div className="_feed_inner_comment_box_content">
            <div className="_feed_inner_comment_box_content_image">
              <Image
                src="/assets/images/comment_img.png"
                alt=""
                width={800}
                height={600}
                className="_comment_img"
              />
            </div>
            <div className="_feed_inner_comment_box_content_txt">
              <textarea
                className="form-control _comment_textarea"
                placeholder="Write a comment"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={2000}
              />
            </div>

            {/* Mic — visual only */}
            <span
              className="_feed_inner_comment_box_icon_btn"
              style={{
                flexShrink: 0,
                opacity: 0.5,
                cursor: "default",
                display: "flex",
                alignItems: "center",
              }}
            >
              {MicIcon}
            </span>

            {/* Image upload */}
            <button
              type="button"
              className="_feed_inner_comment_box_icon_btn"
              onClick={() => fileInputRef.current?.click()}
              style={{ flexShrink: 0 }}
            >
              {ImageIcon}
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            style={{ display: "none" }}
          />

          {hasContent && (
            <button
              type="submit"
              disabled={submitting}
              style={{
                flexShrink: 0,
                background: "#0d6efd",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "4px 12px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: submitting ? "default" : "pointer",
                opacity: submitting ? 0.7 : 1,
                marginLeft: "4px",
              }}
            >
              {submitting ? "..." : "Post"}
            </button>
          )}
        </form>

        {previewUrl && (
          <div
            style={{
              position: "relative",
              display: "inline-block",
              margin: "6px 0 0 34px",
            }}
          >
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                borderRadius: "8px",
                maxWidth: "180px",
                maxHeight: "120px",
                objectFit: "cover",
                display: "block",
              }}
            />
            <button
              onClick={clearFile}
              style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "22px",
                height: "22px",
                cursor: "pointer",
                fontSize: "11px",
                lineHeight: "22px",
                textAlign: "center",
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentBox;
