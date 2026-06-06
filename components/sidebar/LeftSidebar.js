import ExploreSection from "./ExploreSection";
import SuggestedPeopleSection from "./SuggestedPeopleSection";
import EventsSection from "./EventsSection";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon, SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function LeftSidebar() {
  return (
    <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
      <div className="_layout_left_sidebar_wrap">
        <ExploreSection />
        <SuggestedPeopleSection />
        <EventsSection />
      </div>
    </div>
  );
}

export default LeftSidebar;
