import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon, SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function ActionBtn({ icon, label }) {
  return (
    <div className="_feed_common">
      <button type="button" className="_feed_inner_text_area_bottom_photo_link">
        <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
          {icon}
        </span>
        {label}
      </button>
    </div>
  );
}

export default ActionBtn;
