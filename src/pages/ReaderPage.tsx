import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Type as TypeIcon,
  Settings2,
  ArrowLeft,
  List,
  Sun,
  Moon,
  Coffee,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSettings, type ReaderTheme } from "@/hooks/useSettings";
import { saveHistory } from "@/hooks/useReadingHistory";
import { motion, AnimatePresence } from "framer-motion";

const FONT_CLASS_MAP = {
  serif: "font-reading",
  sans: "font-sans",
  mono: "font-mono",
};

const READER_THEMES: Record<
  ReaderTheme,
  { bg: string; fg: string; muted: string; accent: string; label: string; icon: typeof Sun }
> = {
  light: {
    bg: "#fafaf7",
    fg: "#1a1a1a",
    muted: "#6b6b6b",
    accent: "#0ea5e9",
    label: "Light",
    icon: Sun,
  },
  sepia: {
    bg: "#f4ecd8",
    fg: "#3a2f1f",
    muted: "#7a6b50",
    accent: "#a0522d",
    label: "Sepia",
    icon: Coffee,
  },
  dark: {
    bg: "#0f1115",
    fg: "#e5e7eb",
    muted: "#9ca3af",
    accent: "#38bdf8",
    label: "Dark",
    icon: Moon,
  },
};

export default function ReaderPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { settings, setSettings } = useSettings();

  const [chromeVisible, setChromeVisible] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastScrollY = useRef(0);
  const articleRef = useRef<HTMLElement>(null);

  const { data: chapter, isLoading } = useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: () => api.getChapter(chapterId!),
    enabled: !!chapterId,
  });

  const { data: chapters } = useQuery({
    queryKey: ["allChapters", chapter?.novelId],
    queryFn: () => api.getChapters(chapter!.novelId, "ASC", 1, 9999),
    enabled: !!chapter?.novelId,
  });

  const chapterList = chapters?.chapterList || [];
  const currentIndex = chapterList.findIndex((c) => c.chapterId === chapterId);
  const prevChapter = currentIndex > 0 ? chapterList[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapterList.length - 1 ? chapterList[currentIndex + 1] : null;

  // Save reading progress
  useEffect(() => {
    if (chapter && chapterId) {
      saveHistory(chapter.novelId, {
        chapterId,
        chapterName: chapter.chapterName,
      });
    }
  }, [chapter, chapterId]);

  // Reset on chapter change
  useEffect(() => {
    window.scrollTo(0, 0);
    setProgress(0);
    setChromeVisible(true);
  }, [chapterId]);

  // Track reading progress + auto-hide chrome on scroll down
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? Math.min(100, (y / docH) * 100) : 0);

      const dy = y - lastScrollY.current;
      if (Math.abs(dy) > 8) {
        if (dy > 0 && y > 80) setChromeVisible(false);
        else setChromeVisible(true);
        lastScrollY.current = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard nav
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowLeft" && prevChapter) navigate(`/read/${prevChapter.chapterId}`);
      else if (e.key === "ArrowRight" && nextChapter) navigate(`/read/${nextChapter.chapterId}`);
    },
    [prevChapter, nextChapter, navigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const theme = READER_THEMES[settings.readerTheme];
  const fontClass = FONT_CLASS_MAP[settings.fontFamily] || "font-reading";

  // Estimated reading time
  const wordCount = chapter?.content?.split(/\s+/).length || 0;
  const minutes = Math.max(1, Math.round(wordCount / 220));

  // Tap on article toggles chrome
  const onArticleClick = useCallback(() => {
    setChromeVisible((v) => !v);
  }, []);

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-[60] overflow-y-auto"
        style={{ background: theme.bg, color: theme.fg }}
      >
        <div className="max-w-2xl mx-auto px-5 pt-20 space-y-4 animate-pulse">
          <div className="h-8 rounded w-2/3" style={{ background: theme.muted, opacity: 0.2 }} />
          {Array.from({ length: 18 }, (_, i) => (
            <div
              key={i}
              className="h-4 rounded"
              style={{ background: theme.muted, opacity: 0.2, width: `${70 + Math.random() * 30}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!chapter) {
    return <div className="text-center py-16 text-muted-foreground">Chapter not found</div>;
  }

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto transition-colors duration-300"
      style={{ background: theme.bg, color: theme.fg }}
    >
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 z-[70] origin-left transition-transform duration-150"
        style={{
          background: theme.accent,
          transform: `scaleX(${progress / 100})`,
        }}
      />

      {/* Top chrome */}
      <AnimatePresence>
        {chromeVisible && (
          <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-[65] backdrop-blur-xl border-b"
            style={{
              background: `${theme.bg}d9`,
              borderColor: `${theme.muted}33`,
            }}
          >
            <div className="max-w-3xl mx-auto flex items-center justify-between px-4 h-14">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full active:scale-90 transition-transform"
                aria-label="Back"
                style={{ color: theme.fg }}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex-1 mx-3 min-w-0 text-center">
                <p className="text-xs truncate" style={{ color: theme.muted }}>
                  {chapter.chapterName}
                </p>
                <p className="text-[10px]" style={{ color: theme.muted, opacity: 0.7 }}>
                  {minutes} min read · {Math.round(progress)}%
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPanelOpen(true)}
                  className="p-2 rounded-full active:scale-90 transition-transform"
                  aria-label="Reader settings"
                  style={{ color: theme.fg }}
                >
                  <Settings2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Article */}
      <div className="max-w-2xl mx-auto px-5 pt-24 pb-32" onClick={onArticleClick}>
        <div className="mb-2 text-xs uppercase tracking-widest" style={{ color: theme.muted }}>
          Chapter {currentIndex >= 0 ? currentIndex + 1 : ""}
        </div>
        <h1
          className={`text-3xl md:text-4xl font-bold leading-tight mb-8 ${fontClass}`}
        >
          {chapter.chapterName}
        </h1>

        <article
          ref={articleRef}
          className={`${fontClass} whitespace-pre-wrap`}
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            color: theme.fg,
          }}
        >
          {chapter.content}
        </article>

        {/* End of chapter card */}
        <div
          className="mt-12 rounded-2xl p-6 text-center"
          style={{ background: `${theme.muted}14`, border: `1px solid ${theme.muted}33` }}
        >
          <p className="text-sm mb-4" style={{ color: theme.muted }}>
            End of {chapter.chapterName}
          </p>
          <div className="flex items-center justify-center gap-3">
            {prevChapter && (
              <Link
                to={`/read/${prevChapter.chapterId}`}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium border active:scale-95 transition-transform"
                style={{ borderColor: `${theme.muted}55`, color: theme.fg }}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Link>
            )}
            {nextChapter && (
              <Link
                to={`/read/${nextChapter.chapterId}`}
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold active:scale-95 transition-transform"
                style={{ background: theme.accent, color: "#fff" }}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom chrome */}
      <AnimatePresence>
        {chromeVisible && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 right-0 z-[65] backdrop-blur-xl border-t pb-[env(safe-area-inset-bottom)]"
            style={{
              background: `${theme.bg}d9`,
              borderColor: `${theme.muted}33`,
            }}
          >
            <div className="max-w-3xl mx-auto flex items-center gap-2 px-4 h-14">
              {prevChapter ? (
                <Link
                  to={`/read/${prevChapter.chapterId}`}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium active:scale-95 transition-transform"
                  style={{ background: `${theme.muted}1f`, color: theme.fg }}
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              {chapterList.length > 0 && (
                <select
                  value={chapterId}
                  onChange={(e) => navigate(`/read/${e.target.value}`)}
                  className="text-xs rounded-full px-3 py-2 max-w-[140px] truncate outline-none"
                  style={{ background: `${theme.muted}1f`, color: theme.fg, border: "none" }}
                >
                  {chapterList.map((c) => (
                    <option key={c.chapterId} value={c.chapterId} style={{ color: "#000" }}>
                      {c.chapterName}
                    </option>
                  ))}
                </select>
              )}
              {nextChapter ? (
                <Link
                  to={`/read/${nextChapter.chapterId}`}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold active:scale-95 transition-transform"
                  style={{ background: theme.accent, color: "#fff" }}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[75] bg-black/40"
              onClick={() => setPanelOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-[80] rounded-t-3xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl"
              style={{ background: theme.bg, color: theme.fg, border: `1px solid ${theme.muted}33` }}
            >
              <div className="max-w-md mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Reader</h3>
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="p-1.5 rounded-full active:scale-90"
                    style={{ background: `${theme.muted}1f` }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider" style={{ color: theme.muted }}>
                    Background
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(READER_THEMES) as ReaderTheme[]).map((k) => {
                      const t = READER_THEMES[k];
                      const Icon = t.icon;
                      const active = settings.readerTheme === k;
                      return (
                        <button
                          key={k}
                          onClick={() => setSettings({ readerTheme: k })}
                          className="rounded-xl p-3 flex flex-col items-center gap-1 transition-all active:scale-95"
                          style={{
                            background: t.bg,
                            color: t.fg,
                            border: `2px solid ${active ? theme.accent : `${theme.muted}33`}`,
                          }}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-medium">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font family */}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider" style={{ color: theme.muted }}>
                    Typeface
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["serif", "sans", "mono"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setSettings({ fontFamily: f })}
                        className={`rounded-xl py-3 text-base transition-all active:scale-95 ${FONT_CLASS_MAP[f]}`}
                        style={{
                          background: settings.fontFamily === f ? `${theme.accent}22` : `${theme.muted}14`,
                          border: `1px solid ${settings.fontFamily === f ? theme.accent : "transparent"}`,
                          color: theme.fg,
                        }}
                      >
                        Aa
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider" style={{ color: theme.muted }}>
                      Text size
                    </p>
                    <span className="text-xs" style={{ color: theme.muted }}>
                      {settings.fontSize}px
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSettings({ fontSize: Math.max(14, settings.fontSize - 2) })}
                      className="p-3 rounded-xl active:scale-90"
                      style={{ background: `${theme.muted}1f` }}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: `${theme.muted}1f` }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${((settings.fontSize - 14) / (28 - 14)) * 100}%`,
                          background: theme.accent,
                        }}
                      />
                    </div>
                    <button
                      onClick={() => setSettings({ fontSize: Math.min(28, settings.fontSize + 2) })}
                      className="p-3 rounded-xl active:scale-90"
                      style={{ background: `${theme.muted}1f` }}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Line height */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider" style={{ color: theme.muted }}>
                      Line spacing
                    </p>
                    <span className="text-xs" style={{ color: theme.muted }}>
                      {settings.lineHeight.toFixed(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1.5, 1.7, 1.9, 2.1].map((lh) => (
                      <button
                        key={lh}
                        onClick={() => setSettings({ lineHeight: lh })}
                        className="rounded-xl py-2 text-xs font-medium active:scale-95"
                        style={{
                          background: settings.lineHeight === lh ? `${theme.accent}22` : `${theme.muted}14`,
                          border: `1px solid ${settings.lineHeight === lh ? theme.accent : "transparent"}`,
                          color: theme.fg,
                        }}
                      >
                        {lh}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
