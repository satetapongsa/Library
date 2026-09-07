"use client";

import { useEffect } from "react";

export function ThemeToggle() {
  useEffect(() => {
    // Enforce pure light mode permanently across all sessions
    try {
      localStorage.removeItem("dl_theme");
      document.documentElement.classList.remove("dark");
    } catch (_) {}
  }, []);

  return null;
}
