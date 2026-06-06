"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import CommentBox from "./CommentBox";

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function SingleComment({ comment, postId, onReplyAdded, depth = 0 }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/comments/${comment._id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data?.success) {
        setLiked(data.data.liked);
        setLikesCount(data.data.likesCount);
      }
    } catch {
      // ignore
    }
  };

  const handleReply = useCallback(
    (newComment) => {
      setShowReplyBox(false);
      setShowReplies(true);
      if (onReplyAdded) onReplyAdded(newComment);
    },
    [onReplyAdded]
  );

  return (
    <div style={{ marginBottom: "8px", paddingLeft: depth > 0 ? "20px" : "0" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <div>
          <Image
            src="/assets/images/txt_img.png"
            alt=""
            width={32}
            height={32}
            style={{ borderRadius: "50%", width: "32px", height: "32px", objectFit: "cover" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              background: "#f0f2f5",
              borderRadius: "18px",
              padding: "8px 12px",
              display: "inline-block",
              maxWidth: "100%",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "13px" }}>
              {comment.author?.firstName} {comment.author?.lastName}
            </div>
            <div style={{ fontSize: "14px", lineHeight: "1.4" }}>{comment.content}</div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "2px", paddingLeft: "12px" }}>
            <button
              onClick={handleLike}
              style={{
                background: "none",
                border: "none",
                fontSize: "12px",
                color: liked ? "#0d6efd" : "#65676b",
                fontWeight: liked ? 600 : 400,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {liked ? "Liked" : "Like"}
            </button>
            {likesCount > 0 && (
              <span style={{ fontSize: "12px", color: "#65676b" }}>
                {likesCount}
              </span>
            )}
            <button
              onClick={() => setShowReplyBox((s) => !s)}
              style={{
                background: "none",
                border: "none",
                fontSize: "12px",
                color: "#65676b",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Reply
            </button>
            <span style={{ fontSize: "12px", color: "#65676b" }}>{timeAgo(comment.createdAt)}</span>
          </div>

          {showReplyBox && (
            <div style={{ marginTop: "6px" }}>
              <CommentBox
                postId={postId}
                parentId={comment._id}
                placeholder="Write a reply..."
                onCommentAdded={handleReply}
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: "4px" }}>
          {!showReplies && (
            <button
              onClick={() => setShowReplies(true)}
              style={{
                background: "none",
                border: "none",
                fontSize: "12px",
                color: "#65676b",
                cursor: "pointer",
                paddingLeft: "52px",
              }}
            >
              View {comment.replies.length} repl{comment.replies.length > 1 ? "ies" : "y"}
            </button>
          )}
          {showReplies &&
            comment.replies.map((reply) => (
              <SingleComment
                key={reply._id}
                comment={reply}
                postId={postId}
                depth={depth + 1}
                onReplyAdded={onReplyAdded}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default function CommentsList({ postId, refreshKey }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments?limit=20`);
      const data = await res.json();
      if (data?.success) {
        setComments(data.data.comments);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments, refreshKey]);

  const handleNewComment = useCallback(async () => {
    await fetchComments();
  }, [fetchComments]);

  if (loading) {
    return (
      <div className="_padd_l24 _padd_r24" style={{ paddingTop: "12px", paddingBottom: "12px" }}>
        <p style={{ fontSize: "13px", color: "#65676b" }}>Loading comments...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="_padd_l24 _padd_r24" style={{ paddingTop: "12px" }}>
      {comments.map((comment) => (
        <SingleComment
          key={comment._id}
          comment={comment}
          postId={postId}
          onReplyAdded={handleNewComment}
        />
      ))}
    </div>
  );
}
