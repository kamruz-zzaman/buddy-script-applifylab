import Link from "next/link";
import Image from "next/image";
import CommentBox from "./CommentBox";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon, SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function CommentSection() {
  return (
    <div className="_timline_comment_main">
      <div className="_previous_comment">
        <button type="button" className="_previous_comment_txt">
          View 4 previous comments
        </button>
      </div>
      <div className="_comment_main">
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
                  <h4 className="_comment_name_title">Radovan SkillArena</h4>
                </Link>
              </div>
            </div>
            <div className="_comment_status">
              <p className="_comment_status_text">
                <span>
                  It is a long established fact that a reader will be distracted
                  by the readable content of a page when looking at its layout.
                </span>
              </p>
            </div>
            <div className="_total_reactions">
              <div className="_total_react">
                <span className="_reaction_like">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                </span>
                <span className="_reaction_heart">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </span>
              </div>
              <span className="_total">198</span>
            </div>
            <div className="_comment_reply">
              <div className="_comment_reply_num">
                <ul className="_comment_reply_list">
                  <li>
                    <span>Like.</span>
                  </li>
                  <li>
                    <span>Reply.</span>
                  </li>
                  <li>
                    <span>Share</span>
                  </li>
                  <li>
                    <span className="_time_link">.21m</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <CommentBox />
        </div>
      </div>
    </div>
  );
}

export default CommentSection;
