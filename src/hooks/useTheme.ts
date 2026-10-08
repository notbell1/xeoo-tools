import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "xeoo_theme";
const THEME_CHANGE_EVENT = "xeoo_theme_change";

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
  } catch {
    // Ignore storage errors
  }
  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    // Apply class
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore
    }

    // Notify other components
    window.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }),
    );
  }, [theme]);

  // Listen for external theme changes
  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<Theme>;
      if (customEvent.detail && customEvent.detail !== theme) {
        setTheme(customEvent.detail);
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    };
  }, [theme]);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.add("theme-transition");

    setTheme((prev) => (prev === "light" ? "dark" : "light"));

    window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 260);
  };

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
    setTheme,
  };
}
