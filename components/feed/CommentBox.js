"use client";

import { useState, useRef } from "react";
import Image from "next/image";

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
    } catch {} finally {
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

  return (
    <div className="_feed_inner_timeline_cooment_area">
      <div className="_feed_inner_comment_box">
        <form className="_feed_inner_comment_box_form" onSubmit={handleSubmit}>
          <div className="_feed_inner_comment_box_content">
            <div className="_feed_inner_comment_box_content_image">
              <Image src="/assets/images/comment_img.png" alt="" width={800} height={600} className="_comment_img" />
            </div>
            <div className="_feed_inner_comment_box_content_txt">
              <textarea
                className="form-control _comment_textarea"
                placeholder="Write a comment"
                id={parentId ? "floatingTextareaReply" : "floatingTextarea3"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={2000}
              ></textarea>
            </div>
          </div>

          {previewUrl && (
            <div style={{ position: "relative", display: "inline-block", marginLeft: "48px", marginTop: "6px" }}>
              <Image src={previewUrl} alt="Preview" width={100} height={75} style={{ borderRadius: "6px", objectFit: "cover" }} unoptimized />
              <button
                onClick={clearFile}
                style={{ position: "absolute", top: "-6px", right: "-6px", background: "#fff", border: "1px solid #ddd", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "11px", lineHeight: "18px", textAlign: "center", padding: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
              >✕</button>
            </div>
          )}

          <div className="_feed_inner_comment_box_icon">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" style={{ display: "none" }} />
            <button className="_feed_inner_comment_box_icon_btn" type="button" onClick={() => fileInputRef.current?.click()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="_feed_inner_comment_box_icon_btn" type="button" onClick={() => fileInputRef.current?.click()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              type="submit"
              disabled={submitting || (!content.trim() && !selectedFile)}
              style={{ background: (content.trim() || selectedFile) ? "#0d6efd" : "#e4e6eb", color: (content.trim() || selectedFile) ? "#fff" : "#bcc0c4", border: "none", borderRadius: "6px", padding: "4px 12px", fontSize: "13px", marginLeft: "8px", cursor: (content.trim() || selectedFile) ? "pointer" : "default" }}
            >
              {submitting ? "..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CommentBox;
