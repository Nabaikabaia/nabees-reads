import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { ChevronRight } from "lucide-react";

export default function ChaptersPage() {
  const { detailPath } = useParams<{ detailPath: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("p") || "1");
  const order = searchParams.get("order") || "ASC";

  const { data: novel } = useQuery({
    queryKey: ["novel", detailPath],
    queryFn: () => api.getNovel(detailPath!),
    enabled: !!detailPath,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["chapters", novel?.novelId, order, page],
    queryFn: () => api.getChapters(novel!.novelId, order, page, 100),
    enabled: !!novel?.novelId,
  });

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/novel/${detailPath}`} className="hover:text-foreground truncate">{novel?.title || "Novel"}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Chapters</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{novel?.title} — Chapters</h1>
        <button
          onClick={() => setSearchParams({ p: "1", order: order === "ASC" ? "DESC" : "ASC" })}
          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          {order === "ASC" ? "Oldest first" : "Newest first"}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
          {data?.chapterList?.map((ch) => (
            <Link
              key={ch.chapterId}
              to={`/read/${ch.chapterId}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors"
            >
              <span className="text-sm">{ch.chapterName}</span>
              <span className="text-xs text-muted-foreground">{ch.totalWords} words</span>
            </Link>
          ))}
        </div>
      )}

      {data?.pager && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setSearchParams({ p: String(page - 1), order })}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground px-4">Page {page}</span>
          <button
            onClick={() => setSearchParams({ p: String(page + 1), order })}
            disabled={!data.pager.hasMore}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
