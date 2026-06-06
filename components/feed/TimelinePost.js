"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import TimelineDropdownItem from "./TimelineDropdownItem";
import CommentBox from "./CommentBox";
import CommentsList from "./CommentsList";
import { useFeedContext } from "../common/FeedContext";
import { DeleteIcon } from "../common/icons";

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

function TimelinePost({ post }) {
  const { currentUser, togglePostLike, deletePost } = useFeedContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likesCount || 0);
  const [localCommentsCount, setLocalCommentsCount] = useState(post?.commentsCount || 0);
  const dropdownRef = useRef(null);

  const isOwner = currentUser?.id === post?.author?._id;

  // Check if current user has liked
  useEffect(() => {
    if (post?.likes && currentUser) {
      const hasLiked = post.likes.some(
        (like) => (like._id || like) === currentUser.id
      );
      setLiked(hasLiked);
    }
  }, [post, currentUser]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [dropdownOpen]);

  const handleLike = async () => {
    const result = await togglePostLike(post._id);
    if (result) {
      setLiked(result.liked);
      setLikesCount(result.likesCount);
    }
  };

  const handleDelete = async () => {
    if (confirm("Delete this post?")) {
      await deletePost(post._id);
    }
  };

  const onCommentAdded = useCallback(() => {
    setLocalCommentsCount((c) => c + 1);
  }, []);

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
                {timeAgo(post.createdAt)} .{" "}
                <span style={{ fontWeight: post.isPrivate ? 600 : 400 }}>
                  {post.isPrivate ? "🔒 Private" : "Public"}
                </span>
              </p>
            </div>
          </div>

          {isOwner && (
            <div className="_feed_inner_timeline_post_box_dropdown" ref={dropdownRef}>
              <div className="_feed_timeline_post_dropdown">
                <button
                  className="_feed_timeline_post_dropdown_link"
                  onClick={() => setDropdownOpen((p) => !p)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                    <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                    <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                    <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                  </svg>
                </button>
              </div>
              <div className={`_feed_timeline_dropdown _timeline_dropdown${dropdownOpen ? " show" : ""}`}>
                <ul className="_feed_timeline_dropdown_list">
                  <TimelineDropdownItem icon={DeleteIcon} label="Delete Post" onClick={handleDelete} />
                </ul>
              </div>
            </div>
          )}
        </div>

        {post.content && (
          <p className="_feed_inner_timeline_post_title" style={{ fontSize: "15px", lineHeight: "1.6", fontWeight: 400 }}>
            {post.content}
          </p>
        )}

        {post.imageUrl && (
          <div className="_feed_inner_timeline_image">
            <Image src={post.imageUrl} alt="Post image" width={600} height={400} className="_time_img" priority />
          </div>
        )}
      </div>

      {/* Reactions summary */}
      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b20">
        <div className="_feed_inner_timeline_total_reacts_image">
          {likesCount > 0 && (
            <>
              <span style={{ fontSize: "14px", color: "#65676b" }}>
                👍 {likesCount}
              </span>
            </>
          )}
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <button
              onClick={() => setShowComments((s) => !s)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#65676b", fontSize: "14px" }}
            >
              <span>{localCommentsCount}</span> Comment{localCommentsCount !== 1 ? "s" : ""}
            </button>
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="_feed_inner_timeline_reaction" style={{ borderTop: "1px solid #e4e6eb", paddingTop: "4px" }}>
        <button
          className={`_feed_inner_timeline_reaction_comment _feed_reaction${liked ? " _feed_reaction_active" : ""}`}
          onClick={handleLike}
          style={{ flex: 1, justifyContent: "center" }}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span style={{ color: liked ? "#0d6efd" : "#65676b" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={liked ? "#0d6efd" : "none"} stroke={liked ? "#0d6efd" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>{" "}
              {liked ? "Liked" : "Like"}
            </span>
          </span>
        </button>
        <button
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          onClick={() => setShowComments((s) => !s)}
          style={{ flex: 1, justifyContent: "center" }}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 21 21">
                <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
              </svg>
              Comment
            </span>
          </span>
        </button>
      </div>

      {/* Comment box + comments section */}
      {showComments && (
        <>
          <CommentBox postId={post._id} onCommentAdded={onCommentAdded} />
          <CommentsList postId={post._id} refreshKey={localCommentsCount} />
        </>
      )}
    </div>
  );
}

export default TimelinePost;
