import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { Clock, BookOpen, Trash2, PlayCircle } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { StaggerContainer, StaggerItem } from "@/components/StaggerAnimations";
import { motion } from "framer-motion";
import { useReadingHistory, removeHistory, clearHistory, type HistoryEntry } from "@/hooks/useReadingHistory";

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<Record<string, HistoryEntry>>({});

  useEffect(() => {
    setEntries(JSON.parse(localStorage.getItem("readingHistory") || "{}"));
  }, []);

  const sortedEntries = Object.entries(entries)
    .sort(([, a], [, b]) => b.timestamp - a.timestamp);

  const clearHistory = () => {
    localStorage.removeItem("readingHistory");
    setEntries({});
  };

  const removeEntry = (novelId: string) => {
    const updated = { ...entries };
    delete updated[novelId];
    setEntries(updated);
    localStorage.setItem("readingHistory", JSON.stringify(updated));
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" /> Reading History
          </h1>
          {sortedEntries.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearHistory}
              className="text-sm text-destructive hover:underline font-medium"
            >
              Clear all
            </motion.button>
          )}
        </div>

        {sortedEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 text-muted-foreground"
          >
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p>No reading history yet. Start reading a novel!</p>
          </motion.div>
        ) : (
          <StaggerContainer className="space-y-3">
            {sortedEntries.map(([novelId, entry]) => (
              <StaggerItem key={novelId}>
                <HistoryItem
                  novelId={novelId}
                  entry={entry}
                  onRemove={() => removeEntry(novelId)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
}

function HistoryItem({
  novelId,
  entry,
  onRemove,
}: {
  novelId: string;
  entry: HistoryEntry;
  onRemove: () => void;
}) {
  // If we have saved novel info, use it; otherwise fetch it
  const { data: novel } = useQuery({
    queryKey: ["novel-history", novelId],
    queryFn: async () => {
      if (entry.detailPath) {
        return api.getNovel(entry.detailPath);
      }
      return null;
    },
    enabled: !entry.novelTitle && !!entry.detailPath,
    staleTime: Infinity,
  });

  const title = entry.novelTitle || novel?.title || `Novel #${novelId.slice(0, 8)}`;
  const cover = entry.novelCover || novel?.cover?.url;
  const detailPath = entry.detailPath || novel?.detailPath;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
    >
      {cover ? (
        <img
          src={cover}
          alt={title}
          className="h-20 w-14 rounded-lg object-cover shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
        />
      ) : (
        <div className="h-20 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {detailPath ? (
          <Link to={`/novel/${detailPath}`} className="font-semibold hover:text-primary transition-colors truncate block">
            {title}
          </Link>
        ) : (
          <p className="font-semibold truncate">{title}</p>
        )}
        <p className="text-sm text-muted-foreground truncate">{entry.chapterName}</p>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{formatTimeAgo(entry.timestamp)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          to={`/read/${entry.chapterId}`}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <PlayCircle className="h-3.5 w-3.5" /> Continue
        </Link>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
