import Link from "next/link";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon, SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function TimelineDropdownItem({ icon, label }) {
  return (
    <li className="_feed_timeline_dropdown_item">
      <Link href="#0" className="_feed_timeline_dropdown_link">
        <span>{icon}</span>
        {label}
      </Link>
    </li>
  );
}

export default TimelineDropdownItem;
