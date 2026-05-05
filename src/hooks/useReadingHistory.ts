import { useEffect, useState, useCallback } from "react";

export interface HistoryEntry {
  chapterId: string;
  chapterName: string;
  timestamp: number;
  novelTitle?: string;
  novelCover?: string;
  detailPath?: string;
}

const KEY = "readingHistory";
const EVENT = "reading-history-updated";

function read(): Record<string, HistoryEntry> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveHistory(novelId: string, entry: Partial<HistoryEntry>) {
  const all = read();
  all[novelId] = { ...(all[novelId] || {}), ...entry, timestamp: Date.now() } as HistoryEntry;
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function removeHistory(novelId: string) {
  const all = read();
  delete all[novelId];
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useReadingHistory() {
  const [entries, setEntries] = useState<Record<string, HistoryEntry>>(() => read());

  const refresh = useCallback(() => setEntries(read()), []);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", (e) => {
      if (e.key === KEY) refresh();
    });
    // Light polling fallback so cross-tab and same-tab edits never miss
    const id = setInterval(refresh, 5000);
    return () => {
      window.removeEventListener(EVENT, handler);
      clearInterval(id);
    };
  }, [refresh]);

  const sorted = Object.entries(entries)
    .map(([novelId, e]) => ({ novelId, ...e }))
    .sort((a, b) => b.timestamp - a.timestamp);

  return { entries, sorted, refresh };
}
