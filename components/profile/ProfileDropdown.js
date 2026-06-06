"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ProfileDropdownItem from "./ProfileDropdownItem";
import { SettingsIcon, HelpIcon, LogoutIcon } from "../common/icons";

function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  return (
    <div className="_header_nav_profile" ref={containerRef}>
      <div className="_header_nav_profile_image">
        <Image src="/assets/images/profile.png" alt="Image" width={24} height={24} className="_nav_profile_img" />
      </div>
      <div className="_header_nav_dropdown">
        <p className="_header_nav_para">Dylan Field</p>
        <button
          className="_header_nav_dropdown_btn _dropdown_toggle"
          type="button"
          onClick={() => setOpen((prev) => !prev)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="6"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              fill="#112032"
              d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z"
            />
          </svg>
        </button>
      </div>
      <div
        className={`_nav_profile_dropdown _profile_dropdown${open ? " show" : ""}`}
      >
        <div className="_nav_profile_dropdown_info">
          <div className="_nav_profile_dropdown_image">
            <Image src="/assets/images/profile.png" alt="Image" width={40} height={40} className="_nav_drop_img" />
          </div>
          <div className="_nav_profile_dropdown_info_txt">
            <h4 className="_nav_dropdown_title">Dylan Field</h4>
            <Link href="#0" className="_nav_drop_profile">
              View Profile
            </Link>
          </div>
        </div>
        <hr />
        <ul className="_nav_dropdown_list">
          <ProfileDropdownItem icon={SettingsIcon} label="Settings" />
          <ProfileDropdownItem icon={HelpIcon} label="Help & Support" />
          <ProfileDropdownItem icon={LogoutIcon} label="Log Out" />
        </ul>
      </div>
    </div>
  );
}

export default ProfileDropdown;
