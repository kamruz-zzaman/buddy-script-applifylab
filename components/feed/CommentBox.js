"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

function CommentBox({ postId, onCommentAdded, parentId }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Voice recording
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const clearAudio = () => {
    setAudioBlob(null);
    chunksRef.current = [];
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setRecording(true);
    } catch {
      alert("Microphone access denied. Please allow microphone permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if ((!trimmed && !selectedFile && !audioBlob) || submitting) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", trimmed);
      if (parentId) formData.append("parentId", parentId);
      if (selectedFile) formData.append("file", selectedFile);
      if (audioBlob) formData.append("audio", audioBlob, "voice.webm");

      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data?.success) {
        setContent("");
        clearFile();
        clearAudio();
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

  const hasContent = content.trim() || selectedFile || audioBlob;

  return (
    <div className="_feed_inner_timeline_cooment_area">
      <div className="_feed_inner_comment_box">
        <form className="_feed_inner_comment_box_form" onSubmit={handleSubmit}>
          {/* Avatar */}
          <div className="_feed_inner_comment_box_content_image" style={{ flexShrink: 0 }}>
            <Image
              src="/assets/images/comment_img.png"
              alt="" width={800} height={600}
              className="_comment_img"
            />
          </div>

          {/* Textarea */}
          <div className="_feed_inner_comment_box_content_txt" style={{ flex: 1 }}>
            <textarea
              className="form-control _comment_textarea"
              placeholder="Write a comment"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={2000}
            ></textarea>
          </div>

          {/* Mic button */}
          <button
            type="button"
            className="_feed_inner_comment_box_icon_btn"
            onClick={recording ? stopRecording : startRecording}
            title={recording ? "Stop recording" : "Record voice"}
            style={{
              flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              width: "28px", height: "28px", borderRadius: "50%",
              background: recording ? "#ff4444" : "transparent", transition: "background 0.2s",
            }}
          >
            {recording ? (
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff" }} />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Image button */}
          <button
            type="button"
            className="_feed_inner_comment_box_icon_btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
            style={{ flexShrink: 0 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933z" clipRule="evenodd" />
            </svg>
          </button>

          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" style={{ display: "none" }} />

          {hasContent && (
            <button type="submit" disabled={submitting}
              style={{ flexShrink: 0, background: "#0d6efd", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 12px", fontSize: "13px", fontWeight: 500, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1, marginLeft: "4px" }}
            >{submitting ? "..." : "Post"}</button>
          )}
        </form>

        {recording && <div style={{ padding: "2px 6px", fontSize: "11px", color: "#ff4444", fontWeight: 600 }}>Recording... tap mic to stop</div>}

        {audioBlob && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", margin: "4px 0 0 34px" }}>
            <audio src={URL.createObjectURL(audioBlob)} controls style={{ height: "32px", maxWidth: "200px" }} />
            <button onClick={clearAudio} style={{ background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: "18px", height: "18px", cursor: "pointer", fontSize: "10px", lineHeight: "18px", textAlign: "center", padding: 0 }}>✕</button>
          </div>
        )}

        {previewUrl && (
          <div style={{ position: "relative", display: "inline-block", margin: "6px 0 0 34px" }}>
            <img src={previewUrl} alt="Preview" style={{ borderRadius: "8px", maxWidth: "180px", maxHeight: "120px", objectFit: "cover", display: "block" }} />
            <button onClick={clearFile} style={{ position: "absolute", top: "-6px", right: "-6px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", fontSize: "11px", lineHeight: "22px", textAlign: "center", padding: 0 }}>✕</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentBox;
