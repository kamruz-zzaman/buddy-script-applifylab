"use client";

import Link from "next/link";
import Image from "next/image";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon } from "../common/icons";

function NotificationItems() {
  const items = [
    {
      img: "/assets/images/friend-req.png",
      name: "Steve Jobs",
      text: "posted a link in your timeline.",
    },
    {
      img: "/assets/images/profile-1.png",
      name: "Freelacer usa",
      text: "An admin changed the name of the group",
    },
    {
      img: "/assets/images/friend-req.png",
      name: "Steve Jobs",
      text: "posted a link in your timeline.",
    },
    {
      img: "/assets/images/profile-1.png",
      name: "Freelacer usa",
      text: "An admin changed the name of the group",
    },
    {
      img: "/assets/images/friend-req.png",
      name: "Steve Jobs",
      text: "posted a link in your timeline.",
    },
    {
      img: "/assets/images/profile-1.png",
      name: "Freelacer usa",
      text: "An admin changed the name of the group",
    },
    {
      img: "/assets/images/friend-req.png",
      name: "Steve Jobs",
      text: "posted a link in your timeline.",
    },
    {
      img: "/assets/images/profile-1.png",
      name: "Freelacer usa",
      text: "An admin changed the name of the group",
    },
    {
      img: "/assets/images/friend-req.png",
      name: "Steve Jobs",
      text: "posted a link in your timeline.",
    },
    {
      img: "/assets/images/profile-1.png",
      name: "Freelacer usa",
      text: "An admin changed the name of the group",
    },
    {
      img: "/assets/images/friend-req.png",
      name: "Steve Jobs",
      text: "posted a link in your timeline.",
    },
    {
      img: "/assets/images/profile-1.png",
      name: "Freelacer usa",
      text: "An admin changed the name of the group",
    },
  ];

  return items.map((item, i) => (
    <div className="_notification_box" key={i}>
      <div className="_notification_image">
        <Image src={item.img} alt="Image" width={56} height={56} className="_notify_img" />
      </div>
      <div className="_notification_txt">
        <p className="_notification_para">
          <span className="_notify_txt_link">{item.name}</span> {item.text}
        </p>
        <div className="_nitification_time">
          <span>42 minutes ago</span>
        </div>
      </div>
    </div>
  ));
}

export default NotificationItems;
