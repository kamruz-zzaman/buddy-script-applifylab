"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import CommentBox from "./CommentBox";

const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😆", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😡", label: "Angry" },
];

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
  const [myReaction, setMyReaction] = useState(null);
  const [reactionCounts, setReactionCounts] = useState(comment.reactionCounts || {});
  const [reactionsCount, setReactionsCount] = useState(comment.reactionsCount || 0);
  const [showReplyBox, setShowReplyBox] = useState(false);

  const handleReaction = async () => {
    try {
      const res = await fetch(`/api/comments/${comment._id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: myReaction ? myReaction : "like" }),
      });
      const data = await res.json();
      if (data?.success) {
        setMyReaction(data.data.myReaction);
        setReactionCounts(data.data.reactionCounts);
        setReactionsCount(data.data.reactionsCount);
      }
    } catch {}
  };

  const handleReply = useCallback((newComment) => {
    setShowReplyBox(false);
    if (onReplyAdded) onReplyAdded(newComment);
  }, [onReplyAdded]);

  const totalReacts = reactionsCount;

  return (
    <div className="_comment_main" style={{ paddingLeft: depth > 0 ? "30px" : "0" }}>
      <div className="_comment_image">
        <Link href="#0" className="_comment_image_link">
          <Image src="/assets/images/txt_img.png" alt="" width={800} height={600} className="_comment_img1" />
        </Link>
      </div>
      <div className="_comment_area">
        <div className="_comment_details">
          <div className="_comment_details_top">
            <div className="_comment_name">
              <Link href="#0">
                <h4 className="_comment_name_title">{comment.author?.firstName} {comment.author?.lastName}</h4>
              </Link>
            </div>
          </div>
          <div className="_comment_status">
            <p className="_comment_status_text">
              <span>{comment.content}</span>
            </p>
          </div>
          {comment.imageUrl && (
            <div style={{ marginTop: "6px" }}>
              <Image src={comment.imageUrl} alt="" width={200} height={150} style={{ borderRadius: "8px", maxWidth: "100%", height: "auto" }} unoptimized />
            </div>
          )}
          <div className="_total_reactions">
            <div className="_total_react">
              {reactionsCount > 0 && Object.entries(reactionCounts).map(([type, count]) =>
                count > 0 ? (
                  <span key={type} style={{ fontSize: "14px", marginRight: "2px" }} title={`${count} ${type}`}>
                    {REACTIONS.find((r) => r.type === type)?.emoji}
                  </span>
                ) : null
              )}
            </div>
            {totalReacts > 0 && <span className="_total">{totalReacts}</span>}
          </div>
          <div className="_comment_reply">
            <div className="_comment_reply_num">
              <ul className="_comment_reply_list">
                <li>
                  <span style={{ cursor: "pointer", color: myReaction ? "#0d6efd" : "#65676b", fontWeight: myReaction ? 600 : 400 }} onClick={handleReaction}>
                    {myReaction ? `${REACTIONS.find(r => r.type === myReaction)?.emoji} ${REACTIONS.find(r => r.type === myReaction)?.label}` : "Like"}.
                  </span>
                </li>
                <li>
                  <span style={{ cursor: "pointer" }} onClick={() => setShowReplyBox((s) => !s)}>Reply.</span>
                </li>
                <li>
                  <span>Share</span>
                </li>
                <li>
                  <span className="_time_link">.{timeAgo(comment.createdAt)}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {showReplyBox && (
          <CommentBox postId={postId} parentId={comment._id} onCommentAdded={handleReply} />
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchComments = useCallback(async (pageNum = 1) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments?page=${pageNum}&limit=10`);
      const data = await res.json();
      if (data?.success) {
        if (pageNum === 1) {
          setComments(data.data.comments);
        } else {
          setComments((prev) => [...prev, ...data.data.comments]);
        }
        setHasMore(data.data.pagination.hasMore);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  const handleReplyAdded = useCallback(() => {
    fetchComments(1);
  }, [fetchComments]);

  const loadMore = () => {
    setPage((p) => p + 1);
    fetchComments(page + 1);
  };

  if (loading) {
    return (
      <div className="_timline_comment_main">
        <p style={{ fontSize: "13px", color: "#65676b", padding: "12px 24px" }}>Loading comments...</p>
      </div>
    );
  }

  if (comments.length === 0) return null;

  return (
    <div className="_timline_comment_main">
      {hasMore && page === 1 && (
        <div className="_previous_comment">
          <button type="button" className="_previous_comment_txt" onClick={loadMore}>
            View previous comments
          </button>
        </div>
      )}
      {comments.map((comment) => (
        <div key={comment._id}>
          <SingleComment comment={comment} postId={postId} onReplyAdded={handleReplyAdded} />
          {comment.replies?.map((reply) => (
            <SingleComment key={reply._id} comment={reply} postId={postId} onReplyAdded={handleReplyAdded} depth={1} />
          ))}
        </div>
      ))}
      {hasMore && page > 1 && (
        <div className="_previous_comment">
          <button type="button" className="_previous_comment_txt" onClick={loadMore}>
            Load more comments
          </button>
        </div>
      )}
    </div>
  );
}
