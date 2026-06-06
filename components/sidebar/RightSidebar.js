import Link from "next/link";
import Image from "next/image";
import FriendsSection from "./FriendsSection";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon, SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function RightSidebar() {
  return (
    <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
      <div className="_layout_right_sidebar_wrap">
        <div className="_layout_right_sidebar_inner">
          <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
            <div className="_right_inner_area_info_content _mar_b24">
              <h4 className="_right_inner_area_info_content_title _title5">
                You Might Like
              </h4>
              <span className="_right_inner_area_info_content_txt">
                <Link
                  className="_right_inner_area_info_content_txt_link"
                  href="#0"
                >
                  See All
                </Link>
              </span>
            </div>
            <hr className="_underline" />
            <div className="_right_inner_area_info_ppl">
              <div className="_right_inner_area_info_box">
                <div className="_right_inner_area_info_box_image">
                  <Link href="#0">
                    <Image src="/assets/images/Avatar.png" alt="Image" width={800} height={600} className="_ppl_img" />
                  </Link>
                </div>
                <div className="_right_inner_area_info_box_txt">
                  <Link href="#0">
                    <h4 className="_right_inner_area_info_box_title">
                      Radovan SkillArena
                    </h4>
                  </Link>
                  <p className="_right_inner_area_info_box_para">
                    Founder & CEO at Trophy
                  </p>
                </div>
              </div>
              <div className="_right_info_btn_grp">
                <button type="button" className="_right_info_btn_link">
                  Ignore
                </button>
                <button
                  type="button"
                  className="_right_info_btn_link _right_info_btn_link_active"
                >
                  Follow
                </button>
              </div>
            </div>
          </div>
        </div>
        <FriendsSection />
      </div>
    </div>
  );
}

export default RightSidebar;
