import Link from "next/link";
import EventCard from "./EventCard";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon, SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function EventsSection() {
  return (
    <div className="_layout_left_sidebar_inner">
      <div className="_left_inner_area_event _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
        <div className="_left_inner_event_content">
          <h4 className="_left_inner_event_title _title5">Events</h4>
          <Link href="#0" className="_left_inner_event_link">
            See all
          </Link>
        </div>
        <EventCard />
        <EventCard />
      </div>
    </div>
  );
}

export default EventsSection;
