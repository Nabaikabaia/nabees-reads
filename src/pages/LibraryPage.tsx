import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NovelCard from "@/components/NovelCard";
import NovelCardSkeleton from "@/components/NovelCardSkeleton";
import { BookOpen, Trash2 } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { useState, useEffect } from "react";
import type { Novel } from "@/types/novel";

export default function LibraryPage() {
  const [savedPaths, setSavedPaths] = useState<string[]>([]);

  useEffect(() => {
    setSavedPaths(JSON.parse(localStorage.getItem("library") || "[]"));
  }, []);

  const remove = (path: string) => {
    const updated = savedPaths.filter((p) => p !== path);
    setSavedPaths(updated);
    localStorage.setItem("library", JSON.stringify(updated));
  };

  return (
    <PageTransition>
    <div className="space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <BookOpen className="h-8 w-8 text-primary" /> My Library
      </h1>

      {savedPaths.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>Your library is empty. Add novels from their detail pages!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPaths.map((path) => (
            <LibraryItem key={path} detailPath={path} onRemove={() => remove(path)} />
          ))}
        </div>
      )}
    </div>
    </PageTransition>
  );
}

function LibraryItem({ detailPath, onRemove }: { detailPath: string; onRemove: () => void }) {
  const { data: novel, isLoading } = useQuery({
    queryKey: ["novel", detailPath],
    queryFn: () => api.getNovel(detailPath),
  });

  if (isLoading) return <div className="h-24 bg-muted rounded-xl animate-pulse" />;
  if (!novel) return null;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <img src={novel.cover?.url} alt={novel.title} className="h-20 w-14 rounded-lg object-cover" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{novel.title}</h3>
        <p className="text-sm text-muted-foreground">{novel.author}</p>
        <p className="text-xs text-muted-foreground">{novel.totalChapters} chapters · {novel.totalWordsFormat} words</p>
      </div>
      <button onClick={onRemove} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
