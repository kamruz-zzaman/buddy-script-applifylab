"use client";

import Link from "next/link";
import Image from "next/image";
import NotificationItems from "./NotificationItems";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon } from "../common/icons";

function NotificationDropdown() {
  return (
    <>
      <div className="_notifications_content">
        <h4 className="_notifications_content_title">Notifications</h4>
        <div className="_notification_box_right">
          <button type="button" className="_notification_box_right_link">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="4"
              height="17"
              fill="none"
              viewBox="0 0 4 17"
            >
              <circle cx="2" cy="2" r="2" fill="#C4C4C4"></circle>
              <circle cx="2" cy="8" r="2" fill="#C4C4C4"></circle>
              <circle cx="2" cy="15" r="2" fill="#C4C4C4"></circle>
            </svg>
          </button>
          <div className="_notifications_drop_right">
            <ul className="_notification_list">
              <li className="_notification_item">
                <span className="_notification_link">Mark as all read</span>
              </li>
              <li className="_notification_item">
                <span className="_notification_link">
                  Notifications settings
                </span>
              </li>
              <li className="_notification_item">
                <span className="_notification_link">Open Notifications</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="_notifications_drop_box">
        <div className="_notifications_drop_btn_grp">
          <button className="_notifications_btn_link">All</button>
          <button className="_notifications_btn_link1">Unread</button>
        </div>
        <div className="_notifications_all">
          <NotificationItems />
        </div>
      </div>
    </>
  );
}

export default NotificationDropdown;
