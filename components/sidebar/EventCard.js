import Link from "next/link";
import Image from "next/image";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon, SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function EventCard() {
  return (
    <Link className="_left_inner_event_card_link" href="#0">
      <div className="_left_inner_event_card">
        <div className="_left_inner_event_card_iamge">
          <Image src="/assets/images/feed_event1.png" alt="Image" width={800} height={600} className="_card_img" />
        </div>
        <div className="_left_inner_event_card_content">
          <div className="_left_inner_card_date">
            <p className="_left_inner_card_date_para">10</p>
            <p className="_left_inner_card_date_para1">Jul</p>
          </div>
          <div className="_left_inner_card_txt">
            <h4 className="_left_inner_event_card_title">
              No more terrorism no more cry
            </h4>
          </div>
        </div>
        <hr className="_underline" />
        <div className="_left_inner_event_bottom">
          <p className="_left_iner_event_bottom">17 People Going</p>
          <span className="_left_iner_event_bottom_link">
            Going
          </span>
        </div>
      </div>
    </Link>
  );
}

export default EventCard;
