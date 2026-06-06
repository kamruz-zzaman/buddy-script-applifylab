"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import TimelineDropdownItem from "./TimelineDropdownItem";
import CommentBox from "./CommentBox";
import CommentSection from "./CommentSection";
import { useFeedContext } from "../common/FeedContext";
import { SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon } from "../common/icons";

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
  { type: "like", emoji: "👍", label: "Like", color: "#0d6efd" },
  { type: "love", emoji: "❤️", label: "Love", color: "#e0245e" },
  { type: "haha", emoji: "😆", label: "Haha", color: "#f7b928" },
  { type: "wow", emoji: "😮", label: "Wow", color: "#f7b928" },
  { type: "sad", emoji: "😢", label: "Sad", color: "#f7b928" },
  { type: "angry", emoji: "😡", label: "Angry", color: "#e0433e" },
];

function TimelinePost({ post }) {
  const { currentUser, deletePost } = useFeedContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [myReaction, setMyReaction] = useState(null);
  const [reactionCounts, setReactionCounts] = useState(post?.reactionCounts || {});
  const [reactionsCount, setReactionsCount] = useState(post?.reactionsCount || 0);
  const [localCommentsCount, setLocalCommentsCount] = useState(post?.commentsCount || 0);
  const dropdownRef = useRef(null);
  const reactionRef = useRef(null);

  const isOwner = currentUser?.id === post?.author?._id;

  useEffect(() => {
    if (post?.reactions && currentUser) {
      const found = post.reactions.find(
        (r) => (r.user?._id || r.user) === currentUser.id
      );
      setMyReaction(found?.type || null);
    }
  }, [post, currentUser]);

  useEffect(() => {
    if (!dropdownOpen && !showReactions) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (reactionRef.current && !reactionRef.current.contains(e.target)) {
        setShowReactions(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [dropdownOpen, showReactions]);

  const handleReaction = async (type) => {
    setShowReactions(false);
    try {
      const res = await fetch(`/api/posts/${post._id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data?.success) {
        setMyReaction(data.data.myReaction);
        setReactionCounts(data.data.reactionCounts);
        setReactionsCount(data.data.reactionsCount);
      }
    } catch {}
  };

  const handleDelete = async () => {
    if (confirm("Delete this post?")) {
      await deletePost(post._id);
    }
  };

  const onCommentAdded = useCallback(() => {
    setLocalCommentsCount((c) => c + 1);
  }, []);

  const currentReaction = REACTIONS.find((r) => r.type === myReaction);
  const totalReacts = reactionsCount + localCommentsCount;

  if (!post) return null;

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <Image src="/assets/images/post_img.png" alt="" width={44} height={44} className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">
                {post.author?.firstName} {post.author?.lastName}
              </h4>
              <p className="_feed_inner_timeline_post_box_para">
                {timeAgo(post.createdAt)} . <Link href="#0">{post.isPrivate ? "🔒 Private" : "Public"}</Link>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown" ref={dropdownRef}>
            <div className="_feed_timeline_post_dropdown">
              <button className="_feed_timeline_post_dropdown_link" onClick={() => setDropdownOpen((p) => !p)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                  <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                </svg>
              </button>
            </div>
            <div className={`_feed_timeline_dropdown _timeline_dropdown${dropdownOpen ? " show" : ""}`}>
              <ul className="_feed_timeline_dropdown_list">
                <TimelineDropdownItem icon={SaveIcon} label="Save Post" />
                <TimelineDropdownItem icon={NotifyIcon} label="Turn On Notification" />
                <TimelineDropdownItem icon={HideIcon} label="Hide" />
                {isOwner && (
                  <>
                    <TimelineDropdownItem icon={EditIcon} label="Edit Post" />
                    <TimelineDropdownItem icon={DeleteIcon} label="Delete Post" onClick={handleDelete} />
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {post.content && (
          <h4 className="_feed_inner_timeline_post_title" style={{ fontWeight: 400, fontSize: "15px", lineHeight: "1.6" }}>
            {post.content}
          </h4>
        )}

        {post.imageUrl && (
          <div className="_feed_inner_timeline_image">
            <Image src={post.imageUrl} alt="" width={600} height={400} className="_time_img" priority unoptimized />
          </div>
        )}
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_image">
          {reactionsCount > 0 && (
            <>
              {Object.entries(reactionCounts).map(([type, count]) =>
                count > 0 ? (
                  <span key={type} style={{ fontSize: "16px", marginRight: "2px" }} title={`${count} ${type}`}>
                    {REACTIONS.find((r) => r.type === type)?.emoji}
                  </span>
                ) : null
              )}
              {totalReacts > 0 && (
                <p className="_feed_inner_timeline_total_reacts_para">{totalReacts}</p>
              )}
            </>
          )}
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <Link href="#0" onClick={(e) => { e.preventDefault(); setShowComments((s) => !s); }}>
              <span>{localCommentsCount}</span> Comment
            </Link>
          </p>
          <p className="_feed_inner_timeline_total_reacts_para2">
            <span>0</span> Share
          </p>
        </div>
      </div>

      <div className="_feed_inner_timeline_reaction" ref={reactionRef} style={{ position: "relative" }}>
        <div style={{ position: "relative" }}>
          <button
            className={`_feed_inner_timeline_reaction_emoji _feed_reaction${myReaction ? " _feed_reaction_active" : ""}`}
            onMouseEnter={() => setShowReactions(true)}
            onClick={() => handleReaction(myReaction ? myReaction : "like")}
          >
            <span className="_feed_inner_timeline_reaction_link">
              <span style={{ color: currentReaction?.color }}>
                {currentReaction ? (
                  <>{currentReaction.emoji} {currentReaction.label}</>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                    Like
                  </>
                )}
              </span>
            </span>
          </button>

          {showReactions && (
            <div
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
                    background: myReaction === r.type ? "#e7f3ff" : "transparent",
                    border: "none",
                    borderRadius: "50%",
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: "4px",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="_feed_inner_timeline_reaction_comment _feed_reaction" onClick={() => setShowComments((s) => !s)}>
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
              </svg>
              Comment
            </span>
          </span>
        </button>

        <button className="_feed_inner_timeline_reaction_share _feed_reaction">
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21">
                <path stroke="#000" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z" />
              </svg>
              Share
            </span>
          </span>
        </button>
      </div>

      {showComments && (
        <>
          <CommentBox postId={post._id} onCommentAdded={onCommentAdded} />
          <CommentSection postId={post._id} />
        </>
      )}
    </div>
  );
}

export default TimelinePost;
