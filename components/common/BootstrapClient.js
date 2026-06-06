"use client";

import { useEffect } from "react";

export default function BootstrapClient({ children }) {
  useEffect(() => {
    // Dynamic import of Bootstrap JS bundle
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return <>{children}</>;
}
