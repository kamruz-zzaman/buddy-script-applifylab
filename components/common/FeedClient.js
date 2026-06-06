"use client";

import { FeedProvider } from "./FeedContext";

export default function FeedClient({ children }) {
  return <FeedProvider>{children}</FeedProvider>;
}
