import Link from "next/link";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon, SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function ExploreItem({ icon, label, badge, href = "#0" }) {
  return (
    <li
      className={`_left_inner_area_explore_item${badge ? " _explore_item" : ""}`}
    >
      <Link href={href} className="_left_inner_area_explore_link">
        {icon}
        {label}
      </Link>
      {badge && (
        <span className="_left_inner_area_explore_link_txt">{badge}</span>
      )}
    </li>
  );
}

export default ExploreItem;
