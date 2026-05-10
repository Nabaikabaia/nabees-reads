import { useState, useEffect, useCallback } from "react";

export type ThemeMode = "auto" | "light" | "dark";
export type ReaderTheme = "light" | "sepia" | "dark";

export interface AppSettings {
  fontFamily: "sans" | "serif" | "mono";
  fontSize: number;
  lineHeight: number;
  scrollDirection: "vertical" | "horizontal";
  themeMode: ThemeMode;
  readerTheme: ReaderTheme;
  /** @deprecated kept for backward compat */
  darkMode?: boolean;
}

const DEFAULTS: AppSettings = {
  fontFamily: "serif",
  fontSize: 18,
  lineHeight: 1.9,
  scrollDirection: "vertical",
  themeMode: "auto",
  readerTheme: "light",
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem("appSettings");
    if (raw) {
      const parsed = JSON.parse(raw);
      // migrate old darkMode -> themeMode
      if (parsed.themeMode === undefined && typeof parsed.darkMode === "boolean") {
        parsed.themeMode = parsed.darkMode ? "dark" : "light";
      }
      return { ...DEFAULTS, ...parsed };
    }
  } catch {}
  return { ...DEFAULTS };
}

function saveSettings(s: AppSettings) {
  localStorage.setItem("appSettings", JSON.stringify(s));
}

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveDark(mode: ThemeMode): boolean {
  if (mode === "auto") return systemPrefersDark();
  return mode === "dark";
}

function applyTheme(mode: ThemeMode) {
  const dark = resolveDark(mode);
  document.documentElement.classList.toggle("dark", dark);
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

  useEffect(() => {
    applyTheme(settings.themeMode);
  }, [settings.themeMode]);

  // Listen to system color scheme changes when in auto mode
  useEffect(() => {
    if (settings.themeMode !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("auto");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [settings.themeMode]);

  return { settings, setSettings, isDark: resolveDark(settings.themeMode) };
}

// Initialize on load
(function initTheme() {
  try {
    const raw = localStorage.getItem("appSettings");
    let mode: ThemeMode = "auto";
    if (raw) {
      const s = JSON.parse(raw);
      if (s.themeMode) mode = s.themeMode;
      else if (typeof s.darkMode === "boolean") mode = s.darkMode ? "dark" : "light";
    }
    applyTheme(mode);
  } catch {
    applyTheme("auto");
  }
})();
