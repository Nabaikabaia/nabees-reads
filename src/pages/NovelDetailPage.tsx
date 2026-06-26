import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import NovelCard from "@/components/NovelCard";
import { Star, Eye, BookOpen, Clock, ChevronRight, BookmarkCheck, BookmarkPlus, Check, Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import Seo from "@/components/Seo";
import ShareButton from "@/components/ShareButton";
import { saveHistory } from "@/hooks/useReadingHistory";
import { downloadNovelPdf } from "@/lib/downloadNovelPdf";

export default function NovelDetailPage() {
  const { detailPath } = useParams<{ detailPath: string }>();
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dlProgress, setDlProgress] = useState({ pct: 0, msg: "" });

  const handleDownload = async () => {
    if (!novel || downloading) return;
    setDownloading(true);
    setDlProgress({ pct: 0, msg: "Starting…" });
    const tId = toast.loading("Preparing your PDF…", { description: "0%" });
    try {
      await downloadNovelPdf(novel, (msg, pct) => {
        setDlProgress({ pct, msg });
        toast.loading(msg, { id: tId, description: `${pct}%` });
      });
      toast.success("Download ready", { id: tId, description: `${novel.title}.pdf saved` });
    } catch (e: any) {
      toast.error("Download failed", { id: tId, description: e?.message || "Try again later" });
    } finally {
      setDownloading(false);
      setDlProgress({ pct: 0, msg: "" });
    }
  };

  useEffect(() => {
    if (!detailPath) return;
    const libs: string[] = JSON.parse(localStorage.getItem("library") || "[]");
    setInLibrary(libs.includes(detailPath));
  }, [detailPath]);

  const toggleLibrary = (novelTitle: string) => {
    if (!detailPath) return;
    const libs: string[] = JSON.parse(localStorage.getItem("library") || "[]");
    const next = libs.includes(detailPath)
      ? libs.filter((p) => p !== detailPath)
      : [...libs, detailPath];
    localStorage.setItem("library", JSON.stringify(next));
    const added = next.includes(detailPath);
    setInLibrary(added);
    if (added) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
      toast.success("Added to your library", { description: novelTitle });
    } else {
      toast("Removed from library", { description: novelTitle });
    }
  };


  const { data: novel, isLoading } = useQuery({
    queryKey: ["novel", detailPath],
    queryFn: () => api.getNovel(detailPath!),
    enabled: !!detailPath,
  });

  const { data: chapters } = useQuery({
    queryKey: ["chapters-preview", novel?.novelId],
    queryFn: () => api.getChapters(novel!.novelId, "ASC", 1, 10),
    enabled: !!novel?.novelId,
  });

  const { data: recs } = useQuery({
    queryKey: ["recommend", novel?.novelId],
    queryFn: () => api.getRecommendations(novel!.novelId, 1, 10),
    enabled: !!novel?.novelId,
  });

  const recNovels = recs?.contentList || [];

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-48 aspect-[3/4] rounded-xl bg-muted shrink-0" />
          <div className="space-y-4 flex-1">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!novel) return <div className="text-center py-16 text-muted-foreground">Novel not found</div>;

  const firstChapter = chapters?.chapterList?.[0];

  return (
    <PageTransition>
    <Seo
      title={`${novel.title} by ${novel.author}`}
      description={novel.summary || `Read ${novel.title} by ${novel.author} — ${novel.totalChapters} chapters available on Nabees Novel Zone.`}
      image={novel.cover?.url}
      path={`/novel/${novel.detailPath}`}
      type="book"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Book",
        name: novel.title,
        author: { "@type": "Person", name: novel.author },
        description: novel.summary,
        image: novel.cover?.url,
        genre: novel.genres,
        numberOfPages: novel.totalChapters,
        aggregateRating: novel.score
          ? { "@type": "AggregateRating", ratingValue: novel.score, bestRating: "5" }
          : undefined,
      }}
    />
    <div className="space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate">{novel.title}</span>
      </nav>

      {/* Novel Info */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-48 shrink-0 mx-auto md:mx-0">
          <img
            src={novel.cover?.url}
            alt={novel.title}
            className="w-full rounded-xl shadow-lg"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-bold">{novel.title}</h1>
            <p className="text-muted-foreground mt-1">by {novel.author}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 font-semibold">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> {novel.score}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Eye className="h-4 w-4" /> {novel.totalViews}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="h-4 w-4" /> {novel.totalChapters} chapters
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" /> {novel.totalWordsFormat} words
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${novel.novelStatus === 1 ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
              {novel.novelStatus === 1 ? "Ongoing" : "Completed"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {novel.genres?.map((g) => (
              <span key={g} className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">{g}</span>
            ))}
            {novel.tags?.map((t) => (
              <span key={t} className="rounded-full bg-muted text-muted-foreground px-3 py-1 text-xs">{t}</span>
            ))}
          </div>

          <div>
            <p className={`text-sm leading-relaxed text-muted-foreground ${!showFullSummary ? "line-clamp-3" : ""}`}>
              {novel.summary}
            </p>
            {novel.summary?.length > 200 && (
              <button onClick={() => setShowFullSummary(!showFullSummary)} className="text-primary text-sm mt-1 hover:underline">
                {showFullSummary ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {firstChapter && (
              <Link
                to={`/read/${firstChapter.chapterId}`}
                onClick={() => {
                  saveHistory(novel.novelId, {
                    chapterId: firstChapter.chapterId,
                    chapterName: firstChapter.chapterName,
                    novelTitle: novel.title,
                    novelCover: novel.cover?.url,
                    detailPath: novel.detailPath,
                  });
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <BookOpen className="h-4 w-4" /> Start Reading
              </Link>
            )}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => toggleLibrary(novel.title)}
              aria-pressed={inLibrary}
              className={`relative inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all overflow-hidden ${
                inLibrary
                  ? "bg-primary/10 text-primary border border-primary/40"
                  : "border border-border hover:bg-muted"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {justAdded ? (
                  <motion.span
                    key="added"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" /> Added!
                  </motion.span>
                ) : inLibrary ? (
                  <motion.span
                    key="in"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-2"
                  >
                    <BookmarkCheck className="h-4 w-4 fill-primary" /> In Library
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-2"
                  >
                    <BookmarkPlus className="h-4 w-4" /> Add to Library
                  </motion.span>
                )}
              </AnimatePresence>
              {justAdded && (
                <motion.span
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0 rounded-lg bg-primary/30 pointer-events-none"
                />
              )}
            </motion.button>
            <ShareButton
              title={novel.title}
              text={`Read "${novel.title}" by ${novel.author} on Nabees Novel Zone`}
            />
          </div>
        </div>
      </div>

      {/* First chapters preview (truncated) */}
      {chapters?.chapterList && chapters.chapterList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Chapters</h2>
            <span className="text-xs text-muted-foreground">
              Showing first 5 of {novel.totalChapters}
            </span>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
            {chapters.chapterList.slice(0, 5).map((ch) => (
              <Link
                key={ch.chapterId}
                to={`/read/${ch.chapterId}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted active:bg-muted/70 transition-colors touch-manipulation"
              >
                <span className="text-sm truncate pr-3">{ch.chapterName}</span>
                <span className="text-xs text-muted-foreground shrink-0">{ch.totalWords} words</span>
              </Link>
            ))}
          </div>
          <div className="flex justify-center">
            <Link
              to={`/novel/${detailPath}/chapters`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors active:scale-95"
            >
              View all {novel.totalChapters} chapters →
            </Link>
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recNovels.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recNovels.map((n) => (
              <NovelCard key={n.novelId} novel={n} />
            ))}
          </div>
        </section>
      )}
    </div>
    </PageTransition>
  );
}
