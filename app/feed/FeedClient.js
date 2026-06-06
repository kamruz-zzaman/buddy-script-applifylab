'use client';

import { useEffect, useRef } from 'react';

export default function FeedClient({ children }) {
  const layoutRef = useRef(null);

  useEffect(() => {
    // Dark mode toggle
    const toggleMode = document.querySelector("._layout_swithing_btn_link");
    const layout = document.querySelector("._layout_main_wrapper");
    let darkMode = false;

    if (toggleMode) {
      toggleMode.addEventListener("click", () => {
        darkMode = !darkMode;
        if (darkMode) {
          layout?.classList.add("_dark_wrapper");
        } else {
          layout?.classList.remove("_dark_wrapper");
        }
      });
    }

    // Profile dropdown
    const profileDropdown = document.querySelector("#_prfoile_drop");
    const profileDropShowBtn = document.querySelector("#_profile_drop_show_btn");
    let isDropShow = false;

    if (profileDropShowBtn) {
      profileDropShowBtn.addEventListener("click", function () {
        isDropShow = !isDropShow;
        if (isDropShow) {
          profileDropdown?.classList.add('show');
        } else {
          profileDropdown?.classList.remove('show');
        }
      });
    }

    // Timeline dropdown
    const timelineDropdown = document.querySelector("#_timeline_drop");
    const timelineDropShowBtn = document.querySelector("#_timeline_show_drop_btn");
    let isDropTimelineShow = false;

    if (timelineDropShowBtn) {
      timelineDropShowBtn.addEventListener("click", function () {
        isDropTimelineShow = !isDropTimelineShow;
        if (isDropTimelineShow) {
          timelineDropdown?.classList.add('show');
        } else {
          timelineDropdown?.classList.remove('show');
        }
      });
    }

    // Notification dropdown
    const notifyDropdown = document.querySelector("#_notify_drop");
    const notifyDropShowBtn = document.querySelector("#_notify_btn");
    let isDropShow1 = false;

    if (notifyDropShowBtn) {
      notifyDropShowBtn.addEventListener("click", function () {
        isDropShow1 = !isDropShow1;
        if (isDropShow1) {
          notifyDropdown?.classList.add('show');
        } else {
          notifyDropdown?.classList.remove('show');
        }
      });
    }

    // Notification settings dropdown (3 dots)
    const notifSettingsBtn = document.querySelector("._notification_box_right_link");
    const notifSettingsDrop = document.querySelector("._notifications_drop_right");
    let isNotifSettingsShow = false;

    if (notifSettingsBtn) {
      notifSettingsBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        isNotifSettingsShow = !isNotifSettingsShow;
        if (isNotifSettingsShow) {
          notifSettingsDrop.style.display = 'block';
        } else {
          notifSettingsDrop.style.display = 'none';
        }
      });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function (e) {
      if (profileDropdown && !e.target.closest('#_prfoile_drop') && !e.target.closest('#_profile_drop_show_btn')) {
        profileDropdown.classList.remove('show');
        isDropShow = false;
      }
      if (timelineDropdown && !e.target.closest('#_timeline_drop') && !e.target.closest('#_timeline_show_drop_btn')) {
        timelineDropdown.classList.remove('show');
        isDropTimelineShow = false;
      }
      if (notifyDropdown && !e.target.closest('#_notify_drop') && !e.target.closest('#_notify_btn')) {
        notifyDropdown.classList.remove('show');
        isDropShow1 = false;
      }
      if (notifSettingsDrop && !e.target.closest('._notification_box_right')) {
        notifSettingsDrop.style.display = 'none';
        isNotifSettingsShow = false;
      }
    });

    return () => {
      // cleanup if needed
    };
  }, []);

  return <>{children}</>;
}
