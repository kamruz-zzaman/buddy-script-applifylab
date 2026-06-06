import Link from "next/link";
import { PhotoIcon, VideoIcon, EventIcon, ArticleIcon, SaveIcon, NotifyIcon, HideIcon, EditIcon, DeleteIcon, LearningIcon, InsightsIcon, FindFriendsIcon, BookmarksIcon, GroupIcon, GamingIcon, Settings2Icon, SavePostIcon, SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function StoriesMobile() {
  const storyItems = [
    {
      img: "/assets/images/mobile_story_img.png",
      label: "Your Story",
      active: false,
      hasBtn: true,
    },
    {
      img: "/assets/images/mobile_story_img1.png",
      label: "Ryan...",
      active: true,
      hasBtn: false,
    },
    {
      img: "/assets/images/mobile_story_img2.png",
      label: "Ryan...",
      active: false,
      hasBtn: false,
    },
    {
      img: "/assets/images/mobile_story_img1.png",
      label: "Ryan...",
      active: true,
      hasBtn: false,
    },
    {
      img: "/assets/images/mobile_story_img2.png",
      label: "Ryan...",
      active: false,
      hasBtn: false,
    },
    {
      img: "/assets/images/mobile_story_img1.png",
      label: "Ryan...",
      active: true,
      hasBtn: false,
    },
    {
      img: "/assets/images/mobile_story_img.png",
      label: "Ryan...",
      active: false,
      hasBtn: false,
    },
    {
      img: "/assets/images/mobile_story_img1.png",
      label: "Ryan...",
      active: true,
      hasBtn: false,
    },
  ];

  return (
    <div className="_feed_inner_ppl_card_mobile _mar_b16">
      <div className="_feed_inner_ppl_card_area">
        <ul className="_feed_inner_ppl_card_area_list">
          {storyItems.map((item, i) => (
            <li className="_feed_inner_ppl_card_area_item" key={i}>
              <Link href="#0" className="_feed_inner_ppl_card_area_link">
                <div
                  className={
                    item.active
                      ? "_feed_inner_ppl_card_area_story_active"
                      : item.hasBtn
                        ? "_feed_inner_ppl_card_area_story"
                        : "_feed_inner_ppl_card_area_story_inactive"
                  }
                >
                  <img
                    src={item.img}
                    alt="Image"
                    className={
                      item.hasBtn ? "_card_story_img" : "_card_story_img1"
                    }
                  />
                  {item.hasBtn && (
                    <div className="_feed_inner_ppl_btn">
                      <button
                        className="_feed_inner_ppl_btn_link"
                        type="button"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          fill="none"
                          viewBox="0 0 12 12"
                        >
                          <path
                            stroke="#fff"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 2.5v7M2.5 6h7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p
                  className={
                    item.hasBtn
                      ? "_feed_inner_ppl_card_area_link_txt"
                      : "_feed_inner_ppl_card_area_txt"
                  }
                >
                  {item.label}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StoriesMobile;
