import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon, SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function PostComposerActionsMobile() {
  return (
    <div className="_feed_inner_text_area_bottom_mobile">
      <div className="_feed_inner_text_mobile">
        <div className="_feed_inner_text_area_item">
          <div className="_feed_inner_text_area_bottom_photo _feed_common">
            <button
              type="button"
              className="_feed_inner_text_area_bottom_photo_link"
            >
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                {PhotoIcon}
              </span>
            </button>
          </div>
          <div className="_feed_inner_text_area_bottom_video _feed_common">
            <button
              type="button"
              className="_feed_inner_text_area_bottom_photo_link"
            >
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                {VideoIcon}
              </span>
            </button>
          </div>
          <div className="_feed_inner_text_area_bottom_event _feed_common">
            <button
              type="button"
              className="_feed_inner_text_area_bottom_photo_link"
            >
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                {EventIcon}
              </span>
            </button>
          </div>
          <div className="_feed_inner_text_area_bottom_article _feed_common">
            <button
              type="button"
              className="_feed_inner_text_area_bottom_photo_link"
            >
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                {ArticleIcon}
              </span>
            </button>
          </div>
        </div>
        <div className="_feed_inner_text_area_btn">
          <button type="button" className="_feed_inner_text_area_btn_link">
            <svg
              className="_mar_img"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="13"
              fill="none"
              viewBox="0 0 14 13"
            >
              <path
                fill="#fff"
                fillRule="evenodd"
                d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z"
                clipRule="evenodd"
              />
            </svg>
            <span>Post</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostComposerActionsMobile;
