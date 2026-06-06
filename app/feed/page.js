import FeedClient from "../../components/common/FeedClient";
import DarkModeToggle from "../../components/layout/DarkModeToggle";
import HeaderNav from "../../components/layout/HeaderNav";
import MobileMenu from "../../components/layout/MobileMenu";
import MobileBottomNav from "../../components/layout/MobileBottomNav";
import LeftSidebar from "../../components/sidebar/LeftSidebar";
import LayoutMiddle from "../../components/feed/LayoutMiddle";
import RightSidebar from "../../components/sidebar/RightSidebar";

export default function FeedPage() {
  return (
    <FeedClient>
      <div className="_layout _layout_main_wrapper">
        <DarkModeToggle />
        <div className="_main_layout">
          <HeaderNav />
          <MobileMenu />
          <MobileBottomNav />
          <div className="container _custom_container">
            <div className="_layout_inner_wrap">
              <div className="row">
                <LeftSidebar />
                <LayoutMiddle />
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </FeedClient>
  );
}
