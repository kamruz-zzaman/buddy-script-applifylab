"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import TimelineDropdownItem from "./TimelineDropdownItem";
import CommentBox from "./CommentBox";
import CommentSection from "./CommentSection";
import { useFeedContext } from "../common/FeedContext";
import {
  SaveIcon,
  NotifyIcon,
  HideIcon,
  EditIcon,
  DeleteIcon,
} from "../common/icons";

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😆", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😡", label: "Angry" },
];

function TimelinePost({ post }) {
  const {
    currentUser,
    togglePostReaction,
    deletePost,
    incrementCommentsCount,
  } = useFeedContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(
    post?.commentsCount || 0,
  );
  const [commentRefreshKey, setCommentRefreshKey] = useState(0);
  const [optimisticComment, setOptimisticComment] = useState(null);
  const dropdownRef = useRef(null);
  const reactionRef = useRef(null);
  const commentBoxRef = useRef(null);
  const reactionTimeout = useRef(null);

  const isOwner = currentUser?.id === post?.author?._id;

  const myReaction =
    post?.reactions?.find((r) => (r.user?._id || r.user) === currentUser?.id)
      ?.type || null;
  const reactionCounts = post?.reactionCounts || {};
  const reactionsCount = post?.reactionsCount || 0;
  const currentReactionInfo = REACTIONS.find((r) => r.type === myReaction);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!dropdownOpen && !showReactions) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (reactionRef.current && !reactionRef.current.contains(e.target))
        setShowReactions(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [dropdownOpen, showReactions]);

  const handleReaction = (type) => {
    setShowReactions(false);
    if (reactionTimeout.current) clearTimeout(reactionTimeout.current);
    togglePostReaction(post._id, type);
  };

  const handleReactionHover = () => {
    reactionTimeout.current = setTimeout(() => setShowReactions(true), 400);
  };
  const handleReactionLeave = () => {
    if (reactionTimeout.current) clearTimeout(reactionTimeout.current);
  };

  const handleDelete = async () => {
    if (confirm("Delete this post?")) await deletePost(post._id);
  };

  const onCommentAdded = useCallback(
    (newComment) => {
      setLocalCommentsCount((c) => c + 1);
      incrementCommentsCount(post._id);
      setOptimisticComment({ comment: newComment, ts: Date.now() });
      setCommentRefreshKey((k) => k + 1);
    },
    [post._id, incrementCommentsCount],
  );

  const topReactors = (post?.reactions || []).slice(0, 3);

  if (!post) return null;

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <Image
                src="/assets/images/post_img.png"
                alt=""
                width={44}
                height={44}
                className="_post_img"
              />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">
                {post.author?.firstName} {post.author?.lastName}
              </h4>
              <p className="_feed_inner_timeline_post_box_para">
                {timeAgo(post.createdAt)} .{" "}
                <Link href="#0">
                  {post.isPrivate ? "🔒 Private" : "Public"}
                </Link>
              </p>
            </div>
          </div>

          <div
            className="_feed_inner_timeline_post_box_dropdown"
            ref={dropdownRef}
          >
            <div className="_feed_timeline_post_dropdown">
              <button
                className="_feed_timeline_post_dropdown_link"
                onClick={() => setDropdownOpen((p) => !p)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="4"
                  height="17"
                  fill="none"
                  viewBox="0 0 4 17"
                >
                  <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                </svg>
              </button>
            </div>
            <div
              className={`_feed_timeline_dropdown _timeline_dropdown${dropdownOpen ? " show" : ""}`}
            >
              <ul className="_feed_timeline_dropdown_list">
                <TimelineDropdownItem icon={SaveIcon} label="Save Post" />
                <TimelineDropdownItem
                  icon={NotifyIcon}
                  label="Turn On Notification"
                />
                <TimelineDropdownItem icon={HideIcon} label="Hide" />
                {isOwner && (
                  <>
                    <TimelineDropdownItem icon={EditIcon} label="Edit Post" />
                    <TimelineDropdownItem
                      icon={DeleteIcon}
                      label="Delete Post"
                      onClick={handleDelete}
                    />
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {post.content && (
          <h4
            className="_feed_inner_timeline_post_title"
            style={{ fontWeight: 400, fontSize: "15px", lineHeight: "1.6" }}
          >
            {post.content}
          </h4>
        )}

        {post.imageUrl && (
          <div className="_feed_inner_timeline_image">
            <Image
              src={post.imageUrl}
              alt=""
              width={600}
              height={400}
              className="_time_img"
              priority
              unoptimized
            />
          </div>
        )}
      </div>

      {/* Reactions Summary */}
      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_image">
          {reactionsCount > 0 ? (
            <>
              {topReactors.map((r, i) => (
                <Image
                  key={i}
                  src="/assets/images/post_img.png"
                  alt={r.user?.firstName || "User"}
                  width={18}
                  height={18}
                  className={i === 0 ? "_react_img1" : "_react_img"}
                  title={`${r.user?.firstName || "User"} reacted with ${r.type}`}
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    marginLeft: i > 0 ? "-6px" : "0",
                    border: "2px solid #fff",
                  }}
                />
              ))}
              {reactionsCount > 3 && (
                <p className="_feed_inner_timeline_total_reacts_para">
                  {reactionsCount}
                </p>
              )}
            </>
          ) : null}
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <Link
              href="#0"
              onClick={(e) => {
                e.preventDefault();
                commentBoxRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
            >
              <span>{localCommentsCount}</span> Comment
              {localCommentsCount !== 1 ? "s" : ""}
            </Link>
          </p>
          <p className="_feed_inner_timeline_total_reacts_para2">
            <span>0</span> Share
          </p>
        </div>
      </div>

      {/* Reaction Bar — keeps original classes, only adds inline spacing for icon+text */}
      <div
        className="_feed_inner_timeline_reaction"
        ref={reactionRef}
        style={{ position: "relative" }}
      >
        <div
          style={{
            position: "relative",
            flex: "1 1",
            display: "flex",
            margin: "0 4px 0 0",
          }}
        >
          <button
            className={`_feed_inner_timeline_reaction_emoji _feed_reaction${myReaction ? " _feed_reaction_active" : ""}`}
            onMouseEnter={handleReactionHover}
            onMouseLeave={handleReactionLeave}
            onClick={() => handleReaction(myReaction || "haha")}
          >
            <span className="_feed_inner_timeline_reaction_link">
              {myReaction ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>
                    {currentReactionInfo?.emoji}
                  </span>
                  <span style={{ color: "#65676b", fontWeight: 600 }}>
                    {currentReactionInfo?.label}
                  </span>
                </span>
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    fill="none"
                    viewBox="0 0 19 19"
                  >
                    <path
                      fill="#FFCC4D"
                      d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"
                    />
                    <path
                      fill="#664500"
                      d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z"
                    />
                    <path
                      fill="#fff"
                      d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z"
                    />
                    <path
                      fill="#664500"
                      d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z"
                    />
                  </svg>
                  <span>Haha</span>
                </span>
              )}
            </span>
          </button>

          {showReactions && (
            <div
              onMouseEnter={() => {
                if (reactionTimeout.current)
                  clearTimeout(reactionTimeout.current);
              }}
              onMouseLeave={() => setShowReactions(false)}
              style={{
                position: "absolute",
                bottom: "100%",
                left: "0",
                background: "#fff",
                borderRadius: "30px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
                padding: "4px 8px",
                display: "flex",
                gap: "4px",
                zIndex: 10,
                whiteSpace: "nowrap",
              }}
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={() => handleReaction(r.type)}
                  title={r.label}
                  style={{
                    background:
                      myReaction === r.type ? "#e7f3ff" : "transparent",
                    border: "none",
                    borderRadius: "50%",
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: "4px",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment Button */}
        <button
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          onClick={() =>
            commentBoxRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            })
          }
        >
          <span className="_feed_inner_timeline_reaction_link">
            <svg
              className="_reaction_svg"
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              fill="none"
              viewBox="0 0 21 21"
              style={{ marginRight: "6px" }}
            >
              <path
                stroke="#000"
                d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z"
              />
              <path
                stroke="#000"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.938 9.313h7.125M10.5 14.063h3.563"
              />
            </svg>
            <span>Comment</span>
          </span>
        </button>

        {/* Share Button */}
        <button className="_feed_inner_timeline_reaction_share _feed_reaction">
          <span className="_feed_inner_timeline_reaction_link">
            <svg
              className="_reaction_svg"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="21"
              fill="none"
              viewBox="0 0 24 21"
              style={{ marginRight: "6px" }}
            >
              <path
                stroke="#000"
                strokeLinejoin="round"
                d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z"
              />
            </svg>
            <span>Share</span>
          </span>
        </button>
      </div>

      {/* Comments — always visible */}
      <div ref={commentBoxRef}>
        <CommentBox postId={post._id} onCommentAdded={onCommentAdded} />
        <CommentSection
          postId={post._id}
          refreshKey={commentRefreshKey}
          optimisticComment={optimisticComment}
          initialComments={post.comments}
          totalComments={post.totalComments}
        />
      </div>
    </div>
  );
}

export default TimelinePost;
