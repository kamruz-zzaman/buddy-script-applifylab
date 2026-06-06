import Link from "next/link";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon, SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function SuggestedPeopleSection() {
  const people = [
    {
      img: "/assets/images/people1.png",
      name: "Steve Jobs",
      role: "CEO of Apple",
    },
    {
      img: "/assets/images/people2.png",
      name: "Ryan Roslansky",
      role: "CEO of Linkedin",
    },
    {
      img: "/assets/images/people3.png",
      name: "Dylan Field",
      role: "CEO of Figma",
    },
  ];

  return (
    <div className="_layout_left_sidebar_inner">
      <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
        <div className="_left_inner_area_suggest_content _mar_b24">
          <h4 className="_left_inner_area_suggest_content_title _title5">
            Suggested People
          </h4>
          <span className="_left_inner_area_suggest_content_txt">
            <Link
              className="_left_inner_area_suggest_content_txt_link"
              href="#0"
            >
              See All
            </Link>
          </span>
        </div>
        {people.map((p, i) => (
          <div className="_left_inner_area_suggest_info" key={i}>
            <div className="_left_inner_area_suggest_info_box">
              <div className="_left_inner_area_suggest_info_image">
                <Link href="#0">
                  <img
                    src={p.img}
                    alt="Image"
                    className={i === 0 ? "_info_img" : "_info_img1"}
                  />
                </Link>
              </div>
              <div className="_left_inner_area_suggest_info_txt">
                <Link href="#0">
                  <h4 className="_left_inner_area_suggest_info_title">
                    {p.name}
                  </h4>
                </Link>
                <p className="_left_inner_area_suggest_info_para">{p.role}</p>
              </div>
            </div>
            <div className="_left_inner_area_suggest_info_link">
              <Link href="#0" className="_info_link">
                Connect
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SuggestedPeopleSection;
