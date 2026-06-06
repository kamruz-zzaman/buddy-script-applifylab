import StoriesDesktop from "./StoriesDesktop";
import StoriesMobile from "./StoriesMobile";
import PostComposer from "./PostComposer";
import TimelinePost from "./TimelinePost";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon, SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function LayoutMiddle() {
  return (
    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
      <div className="_layout_middle_wrap">
        <div className="_layout_middle_inner">
          {/* Desktop Stories */}
          <StoriesDesktop />
          {/* Mobile Stories */}
          <StoriesMobile />
          {/* Post Composer */}
          <PostComposer />
          {/* Timeline Post 1 */}
          <TimelinePost />
          {/* Timeline Post 2 */}
          <TimelinePost />
        </div>
      </div>
    </div>
  );
}

export default LayoutMiddle;
