import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight, Minus, Plus, Moon, Sun, BookOpen } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSettings } from "@/hooks/useSettings";
import { saveHistory } from "@/hooks/useReadingHistory";

const FONT_CLASS_MAP = {
  serif: "font-reading",
  sans: "font-sans",
  mono: "font-mono",
};

export default function ReaderPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const { settings, setSettings } = useSettings();
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [darkReader, setDarkReader] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

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

  // Save reading progress (real-time across history page)
  useEffect(() => {
    if (chapter && chapterId) {
      saveHistory(chapter.novelId, {
        chapterId,
        chapterName: chapter.chapterName,
      });
    }
  }, [chapter, chapterId]);

  // Reset page on chapter change
  useEffect(() => {
    setCurrentPage(0);
    window.scrollTo(0, 0);
  }, [chapterId]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (settings.scrollDirection === "horizontal") {
        if (e.key === "ArrowRight") {
          setCurrentPage((p) => p + 1);
        } else if (e.key === "ArrowLeft") {
          setCurrentPage((p) => Math.max(0, p - 1));
        }
      }
      if (e.key === "ArrowLeft" && prevChapter && settings.scrollDirection === "vertical") {
        window.location.href = `/read/${prevChapter.chapterId}`;
      } else if (e.key === "ArrowRight" && nextChapter && settings.scrollDirection === "vertical") {
        window.location.href = `/read/${nextChapter.chapterId}`;
      }
    },
    [prevChapter, nextChapter, settings.scrollDirection]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse py-8">
        <div className="h-8 bg-muted rounded w-2/3" />
        <div className="space-y-3">
          {Array.from({ length: 15 }, (_, i) => (
            <div key={i} className="h-4 bg-muted rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!chapter) return <div className="text-center py-16 text-muted-foreground">Chapter not found</div>;

  const isHorizontal = settings.scrollDirection === "horizontal";
  const fontClass = FONT_CLASS_MAP[settings.fontFamily] || "font-reading";

  return (
    <div className={darkReader ? "bg-[hsl(var(--background))] min-h-screen -mx-4 px-4 -mt-8 pt-8" : ""}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Controls */}
        <div className="sticky top-14 z-40 flex items-center justify-between gap-2 rounded-xl border border-border bg-card/90 backdrop-blur-lg p-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground w-8 text-center">{fontSize}</span>
            <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button onClick={() => setDarkReader(!darkReader)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            {darkReader ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {chapterList.length > 0 && (
            <select
              value={chapterId}
              onChange={(e) => {
                window.location.href = `/read/${e.target.value}`;
              }}
              className="text-xs border border-border rounded-lg px-2 py-1.5 bg-card max-w-[200px] truncate"
            >
              {chapterList.map((c) => (
                <option key={c.chapterId} value={c.chapterId}>
                  {c.chapterName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Chapter content */}
        <h1 className={`text-2xl font-bold ${fontClass}`}>{chapter.chapterName}</h1>

        {isHorizontal ? (
          <div className="overflow-hidden">
            <div
              ref={contentRef}
              className={`${fontClass} leading-[1.9] whitespace-pre-wrap h-[70vh] overflow-x-auto overflow-y-hidden`}
              style={{
                fontSize: `${fontSize}px`,
                columnWidth: "min(100vw - 4rem, 600px)",
                columnGap: "2rem",
                columnFill: "auto",
              }}
            >
              {chapter.content}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">Swipe or use ← → keys to scroll</p>
          </div>
        ) : (
          <article
            className={`${fontClass} leading-[1.9] whitespace-pre-wrap`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {chapter.content}
          </article>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between py-8 border-t border-border">
          {prevChapter ? (
            <Link
              to={`/read/${prevChapter.chapterId}`}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Link>
          ) : (
            <div />
          )}
          {nextChapter ? (
            <Link
              to={`/read/${nextChapter.chapterId}`}
              className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
