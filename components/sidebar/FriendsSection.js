import Link from "next/link";
import Image from "next/image";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon, SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function FriendsSection() {
  const friends = [
    {
      img: "/assets/images/people1.png",
      name: "Steve Jobs",
      role: "CEO of Apple",
      status: "5 minute ago",
    },
    {
      img: "/assets/images/people2.png",
      name: "Ryan Roslansky",
      role: "CEO of Linkedin",
      online: true,
    },
    {
      img: "/assets/images/people3.png",
      name: "Dylan Field",
      role: "CEO of Figma",
      online: true,
    },
    {
      img: "/assets/images/people1.png",
      name: "Steve Jobs",
      role: "CEO of Apple",
      status: "5 minute ago",
    },
    {
      img: "/assets/images/people2.png",
      name: "Ryan Roslansky",
      role: "CEO of Linkedin",
      online: true,
    },
    {
      img: "/assets/images/people3.png",
      name: "Dylan Field",
      role: "CEO of Figma",
      online: true,
    },
    {
      img: "/assets/images/people3.png",
      name: "Dylan Field",
      role: "CEO of Figma",
      online: true,
    },
    {
      img: "/assets/images/people1.png",
      name: "Steve Jobs",
      role: "CEO of Apple",
      status: "5 minute ago",
    },
  ];

  return (
    <div className="_layout_right_sidebar_inner">
      <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
        <div className="_feed_top_fixed">
          <div className="_feed_right_inner_area_card_content _mar_b24">
            <h4 className="_feed_right_inner_area_card_content_title _title5">
              Your Friends
            </h4>
            <span className="_feed_right_inner_area_card_content_txt">
              <Link
                className="_feed_right_inner_area_card_content_txt_link"
                href="#0"
              >
                See All
              </Link>
            </span>
          </div>
          <form className="_feed_right_inner_area_card_form">
            <svg
              className="_feed_right_inner_area_card_form_svg"
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              fill="none"
              viewBox="0 0 17 17"
            >
              <circle cx="7" cy="7" r="6" stroke="#666" />
              <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
            </svg>
            <input
              className="form-control me-2 _feed_right_inner_area_card_form_inpt"
              type="search"
              placeholder="input search text"
              aria-label="Search"
            />
          </form>
        </div>
        <div className="_feed_bottom_fixed">
          {friends.map((f, i) => (
            <div
              className={`_feed_right_inner_area_card_ppl${f.status ? " _feed_right_inner_area_card_ppl_inactive" : ""}`}
              key={i}
            >
              <div className="_feed_right_inner_area_card_ppl_box">
                <div className="_feed_right_inner_area_card_ppl_image">
                  <Link href="#0">
                    <Image src={f.img} alt="" width={40} height={40} className="_box_ppl_img" />
                  </Link>
                </div>
                <div className="_feed_right_inner_area_card_ppl_txt">
                  <Link href="#0">
                    <h4 className="_feed_right_inner_area_card_ppl_title">
                      {f.name}
                    </h4>
                  </Link>
                  <p className="_feed_right_inner_area_card_ppl_para">
                    {f.role}
                  </p>
                </div>
              </div>
              <div className="_feed_right_inner_area_card_ppl_side">
                {f.status ? (
                  <span>{f.status}</span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <rect
                      width="12"
                      height="12"
                      x="1"
                      y="1"
                      fill="#0ACF83"
                      stroke="#fff"
                      strokeWidth="2"
                      rx="6"
                    />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FriendsSection;
