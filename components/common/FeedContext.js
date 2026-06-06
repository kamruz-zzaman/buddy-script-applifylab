"use client";

import { createContext, useContext, useState, useCallback } from "react";

const FeedContext = createContext(null);

export function FeedProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);

  // Close all dropdowns (typically when navigating or clicking outside handled by individual components)
  const closeAllDropdowns = useCallback(() => {
    setProfileOpen(false);
    setNotificationOpen(false);
  }, []);

  return (
    <FeedContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        profileOpen,
        setProfileOpen,
        notificationOpen,
        setNotificationOpen,
        closeAllDropdowns,
      }}
    >
      <div className={darkMode ? "_dark_wrapper" : ""}>{children}</div>
    </FeedContext.Provider>
  );
}

export function useFeedContext() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeedContext must be used within FeedProvider");
  return ctx;
}
