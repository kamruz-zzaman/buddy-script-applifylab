"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import PostComposerActions from "./PostComposerActions";
import PostComposerActionsMobile from "./PostComposerActionsMobile";
import { useFeedContext } from "../common/FeedContext";

function PostComposer() {
  const { setPosts } = useFeedContext();
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed && !selectedFile) {
      setError("Please write something or attach an image");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("content", trimmed);
      formData.append("isPrivate", isPrivate);
      if (selectedFile) formData.append("file", selectedFile);

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data?.success) {
        setPosts((prev) => [data.data.post, ...prev]);
        setContent("");
        clearFile();
        setIsPrivate(false);
      } else {
        setError(data?.error || "Failed to create post");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <div className="_feed_inner_text_area_box">
        <div className="_feed_inner_text_area_box_image">
          <Image
            src="/assets/images/txt_img.png"
            alt="Image"
            width={800}
            height={600}
            className="_txt_img"
          />
        </div>
        <div className="form-floating _feed_inner_text_area_box_form">
          <textarea
            className="form-control _textarea"
            placeholder="Leave a comment here"
            id="floatingTextarea"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError("");
            }}
            maxLength={5000}
          ></textarea>
          <label className="_feed_textarea_label" htmlFor="floatingTextarea">
            Write something ...
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="23"
              height="24"
              fill="none"
              viewBox="0 0 23 24"
            >
              <path
                fill="#666"
                d="M19.504 19.209c.332 0 .601.289.601.646 0 .326-.226.596-.52.64l-.081.005h-6.276c-.332 0-.602-.289-.602-.645 0-.327.227-.597.52-.64l.082-.006h6.276zM13.4 4.417c1.139-1.223 2.986-1.223 4.125 0l1.182 1.268c1.14 1.223 1.14 3.205 0 4.427L9.82 19.649a2.619 2.619 0 01-1.916.85h-3.64c-.337 0-.61-.298-.6-.66l.09-3.941a3.019 3.019 0 01.794-1.982l8.852-9.5zm-.688 2.562l-7.313 7.85a1.68 1.68 0 00-.441 1.101l-.077 3.278h3.023c.356 0 .698-.133.968-.376l.098-.096 7.35-7.887-3.608-3.87zm3.962-1.65a1.633 1.633 0 00-2.423 0l-.688.737 3.606 3.87.688-.737c.631-.678.666-1.755.105-2.477l-.105-.124-1.183-1.268z"
              />
            </svg>
          </label>
        </div>
      </div>

      {/* Private post toggle */}
      <div style={{ marginTop: "10px" }}>
        <label
          style={{ fontSize: "13px", color: "#65676b", cursor: "pointer" }}
        >
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            style={{ marginRight: "6px" }}
          />
          Private post (only you can see)
        </label>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*"
        style={{ display: "none" }}
      />

      {/* Image preview */}
      {previewUrl && (
        <div style={{ position: "relative", marginTop: "12px" }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              borderRadius: "8px",
              width: "100%",
              maxHeight: "400px",
              objectFit: "cover",
              display: "block",
            }}
          />
          <button
            onClick={clearFile}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              cursor: "pointer",
              fontSize: "14px",
              lineHeight: "28px",
              textAlign: "center",
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger py-1 mt-2 mb-0"
          role="alert"
          style={{ fontSize: "13px" }}
        >
          {error}
        </div>
      )}

      <PostComposerActions
        onSubmit={handleSubmit}
        submitting={submitting}
        onPhotoClick={() => fileInputRef.current?.click()}
        hasContent={!!content.trim() || !!selectedFile}
      />
      <PostComposerActionsMobile
        onSubmit={handleSubmit}
        submitting={submitting}
        onPhotoClick={() => fileInputRef.current?.click()}
        hasContent={!!content.trim() || !!selectedFile}
      />
    </div>
  );
}

export default PostComposer;
