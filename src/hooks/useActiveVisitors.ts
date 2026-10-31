import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config/backend";

const DEFAULT_OFFSETS = [13, 17, 9, 15, 11];

function getInitialCount(): number {
  const slot = Math.floor(Date.now() / 600000) % DEFAULT_OFFSETS.length;
  return DEFAULT_OFFSETS[slot] + 1;
}

export function useActiveVisitors() {
  const [onlineCount, setOnlineCount] = useState<number>(getInitialCount);

  useEffect(() => {
    let isMounted = true;

    async function fetchOnlineCount() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/traffic/active.php`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) return;

        const data = await response.json();
        if (isMounted && typeof data.online === "number" && data.online > 0) {
          setOnlineCount(data.online);
        }
      } catch {
        // Fallback to current state on network error
      }
    }

    fetchOnlineCount();

    // Poll every 60 seconds when document is visible
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchOnlineCount();
      }
    }, 60000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchOnlineCount();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return { onlineCount };
}

