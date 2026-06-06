"use client";

import Link from "next/link";
import Image from "next/image";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon } from "../common/icons";

function ProfileDropdownItem({ icon, label }) {
  return (
    <li className="_nav_dropdown_list_item">
      <Link href="#0" className="_nav_dropdown_link">
        <div className="_nav_drop_info">
          <span>{icon}</span>
          {label}
        </div>
        <button type="button" className="_nav_drop_btn_link">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="6"
            height="10"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              fill="#112032"
              d="M5 5l.354.354L5.707 5l-.353-.354L5 5zM1.354 9.354l4-4-.708-.708-4 4 .708.708zm4-4.708l-4-4-.708.708 4 4 .708-.708z"
              opacity=".5"
            />
          </svg>
        </button>
      </Link>
    </li>
  );
}

export default ProfileDropdownItem;
