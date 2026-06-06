import ExploreItem from "./ExploreItem";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon, SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function ExploreSection() {
  return (
    <div className="_layout_left_sidebar_inner">
      <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
        <h4 className="_left_inner_area_explore_title _title5 _mar_b24">
          Explore
        </h4>
        <ul className="_left_inner_area_explore_list">
          <ExploreItem icon={LearningIcon} label="Learning" badge="New" />
          <ExploreItem icon={InsightsIcon} label="Insights" />
          <ExploreItem
            icon={FindFriendsIcon}
            label="Find friends"
            href="/find-friends"
          />
          <ExploreItem icon={BookmarksIcon} label="Bookmarks" />
          <ExploreItem icon={GroupIcon} label="Group" href="/group" />
          <ExploreItem icon={GamingIcon} label="Gaming" badge="New" />
          <ExploreItem icon={Settings2Icon} label="Settings" />
          <ExploreItem icon={SavePostIcon} label="Save post" />
        </ul>
      </div>
    </div>
  );
}

export default ExploreSection;
