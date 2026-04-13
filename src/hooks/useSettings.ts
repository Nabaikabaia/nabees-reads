import { useState, useEffect, useCallback } from "react";

export interface AppSettings {
  fontFamily: "sans" | "serif" | "mono";
  fontSize: number;
  scrollDirection: "vertical" | "horizontal";
  darkMode: boolean;
}

const DEFAULTS: AppSettings = {
  fontFamily: "serif",
  fontSize: 18,
  scrollDirection: "vertical",
  darkMode: false,
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem("appSettings");
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULTS, darkMode: document.documentElement.classList.contains("dark") };
}

function saveSettings(s: AppSettings) {
  localStorage.setItem("appSettings", JSON.stringify(s));
}

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);

  const setSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  // Sync dark mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  return { settings, setSettings };
}

// Initialize dark mode on load
(function initDarkMode() {
  try {
    const raw = localStorage.getItem("appSettings");
    if (raw) {
      const s = JSON.parse(raw);
      if (s.darkMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
  } catch {}
})();
