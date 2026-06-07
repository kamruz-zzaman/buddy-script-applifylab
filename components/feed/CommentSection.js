"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFeedContext } from "../common/FeedContext";
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
  const { currentUser } = useFeedContext();
  const initialMyReaction =
    comment.reactions?.find(
      (r) => (r.user?._id || r.user) === currentUser?.id,
    )?.type || null;

  const [myReaction, setMyReaction] = useState(initialMyReaction);
  const [reactionCounts, setReactionCounts] = useState(
    comment.reactionCounts || {},
  );
  const [reactionsCount, setReactionsCount] = useState(
    comment.reactionsCount || 0,
  );
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

  const handleReply = useCallback(
    (newComment) => {
      setShowReplyBox(false);
      if (onReplyAdded) onReplyAdded(newComment);
    },
    [onReplyAdded],
  );

  const totalReacts = reactionsCount;

  return (
    <div
      className="_comment_main"
      style={{ paddingLeft: depth > 0 ? "30px" : "0" }}
    >
      <div className="_comment_image">
        <Link href="#0" className="_comment_image_link">
          <Image
            src="/assets/images/txt_img.png"
            alt=""
            width={800}
            height={600}
            className="_comment_img1"
          />
        </Link>
      </div>
      <div className="_comment_area">
        <div className="_comment_details">
          <div className="_comment_details_top">
            <div className="_comment_name">
              <Link href="#0">
                <h4 className="_comment_name_title">
                  {comment.author?.firstName} {comment.author?.lastName}
                </h4>
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
              <Image
                src={comment.imageUrl}
                alt=""
                width={200}
                height={150}
                style={{
                  borderRadius: "8px",
                  maxWidth: "100%",
                  height: "auto",
                }}
                unoptimized
              />
            </div>
          )}
          {totalReacts > 0 && (
            <div className="_total_reactions">
              <div className="_total_react">
                {Object.entries(reactionCounts).map(([type, count]) =>
                  count > 0 ? (
                    <span
                      key={type}
                      style={{ fontSize: "14px", marginRight: "2px" }}
                      title={`${count} ${type}`}
                    >
                      {REACTIONS.find((r) => r.type === type)?.emoji}
                    </span>
                  ) : null,
                )}
              </div>
              <span className="_total">{totalReacts}</span>
            </div>
          )}
          <div className="_comment_reply">
            <div className="_comment_reply_num">
              <ul className="_comment_reply_list">
                <li>
                  <span
                    style={{
                      cursor: "pointer",
                      color: myReaction ? "#0d6efd" : "#65676b",
                      fontWeight: myReaction ? 600 : 400,
                    }}
                    onClick={handleReaction}
                  >
                    Like
                  </span>
                </li>
                <li>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowReplyBox((s) => !s)}
                  >
                    Reply
                  </span>
                </li>
                <li>
                  <span>Share</span>
                </li>
                <li>
                  <span className="_time_link">{timeAgo(comment.createdAt)}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {showReplyBox && (
          <CommentBox
            postId={postId}
            parentId={comment._id}
            onCommentAdded={handleReply}
          />
        )}
      </div>
    </div>
  );
}

export default function CommentSection({
  postId,
  refreshKey,
  optimisticComment,
  initialComments,
  totalComments: initialTotal,
}) {
  const [allComments, setAllComments] = useState(initialComments || []);
  const [loading, setLoading] = useState(!initialComments);
  const [totalComments, setTotalComments] = useState(initialTotal ?? 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] =
    useState(!!initialComments);

  const INITIAL_LIMIT = 2;
  const LOAD_MORE_LIMIT = 50;

  // Fetch initial batch (only when no initial comments provided)
  const fetchInitial = useCallback(async () => {
    if (hasInitiallyLoaded) return;
    try {
      const res = await fetch(
        `/api/posts/${postId}/comments?limit=${INITIAL_LIMIT}`,
      );
      const data = await res.json();
      if (data?.success) {
        setAllComments(data.data.comments);
        setTotalComments(data.data.pagination?.total || 0);
        setHasInitiallyLoaded(true);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [postId, hasInitiallyLoaded]);

  // Load all remaining comments with deduplication (avoids page-alignment issues with embedded comments)
  const loadMorePage = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/posts/${postId}/comments?limit=${LOAD_MORE_LIMIT}`,
      );
      const data = await res.json();
      if (data?.success) {
        setAllComments((prev) => {
          const existingIds = new Set(prev.map((c) => c._id));
          const newOnes = data.data.comments.filter(
            (c) => !existingIds.has(c._id),
          );
          return [...prev, ...newOnes];
        });
        setTotalComments(data.data.pagination?.total || 0);
      }
    } catch {
    } finally {
      setLoadingMore(false);
    }
  }, [postId, loadingMore]);

  useEffect(() => {
    if (initialComments) {
      setAllComments(initialComments);
      setTotalComments(initialTotal ?? 0);
      setHasInitiallyLoaded(true);
      setLoading(false);
    } else {
      setLoading(true);
      fetchInitial();
    }
  }, [fetchInitial, refreshKey, initialComments, initialTotal]);

  const handleReplyAdded = useCallback(() => {
    // For replies, just reload current state — keep it simple
    setLoading(true);
    fetchInitial();
  }, [fetchInitial]);

  // Add optimistic comment immediately
  useEffect(() => {
    if (optimisticComment?.comment) {
      setAllComments((prev) => {
        if (prev.some((c) => c._id === optimisticComment.comment._id))
          return prev;
        return [optimisticComment.comment, ...prev];
      });
      setTotalComments((t) => t + 1);
      setLoading(false);
    }
  }, [optimisticComment]);

  const remainingCount = totalComments - allComments.length;

  if (loading) {
    return (
      <div className="_timline_comment_main">
        <p style={{ fontSize: "13px", color: "#65676b", padding: "12px 24px" }}>
          Loading comments...
        </p>
      </div>
    );
  }

  if (allComments.length === 0) return null;

  return (
    <div className="_timline_comment_main">
      {/* View previous comments — progressive pagination */}
      {remainingCount > 0 && (
        <div style={{ padding: "4px 24px 8px" }}>
          <button
            onClick={loadMorePage}
            disabled={loadingMore}
            style={{
              background: "none",
              border: "none",
              color: "#65676b",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            {loadingMore
              ? "Loading..."
              : `View ${remainingCount} previous comment${remainingCount > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {allComments.map((comment) => (
        <div key={comment._id}>
          <SingleComment
            comment={comment}
            postId={postId}
            onReplyAdded={handleReplyAdded}
          />
          {comment.replies?.map((reply) => (
            <SingleComment
              key={reply._id}
              comment={reply}
              postId={postId}
              onReplyAdded={handleReplyAdded}
              depth={1}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
