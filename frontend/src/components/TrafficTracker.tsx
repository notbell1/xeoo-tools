import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../lib/trafficTracker";

export function TrafficTracker() {
  const location = useLocation();
  const previousPathRef = useRef<string>("");

  useEffect(() => {
    const currentPath = location.pathname;

    // Skip admin panel paths
    if (currentPath.startsWith("/mimin")) {
      return;
    }

    // Delay slightly to allow tool pages to update document.title
    const timer = setTimeout(() => {
      trackPageView({
        path: currentPath,
        page_title: document.title,
        referrer: previousPathRef.current
          ? window.location.origin + previousPathRef.current
          : document.referrer,
      });
      previousPathRef.current = currentPath;
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return null;
}

