import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import NovelCard from "@/components/NovelCard";
import NovelCardSkeleton from "@/components/NovelCardSkeleton";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import Seo from "@/components/Seo";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("p") || "1");
  const [input, setInput] = useState(q);

  useEffect(() => setInput(q), [q]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", q, page],
    queryFn: () => api.search(q, page, 20),
    enabled: !!q,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ q: input.trim(), p: "1" });
  };

  const goPage = (p: number) => setSearchParams({ q, p: String(p) });

  return (
    <PageTransition>
    <Seo
      title={q ? `Search: ${q}` : "Search Novels"}
      description={q ? `Search results for "${q}" on Nabees Novel Zone.` : "Search thousands of novels by title, author, or keyword."}
      path={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}
    />
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Search Novels</h1>
        <form onSubmit={handleSearch} className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by title, author, or keyword..."
            className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </form>
      </div>

      {q && (
        <p className="text-muted-foreground">
          {isLoading ? "Searching..." : `${data?.pager?.totalCount ?? 0} results for "${q}"`}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 10 }, (_, i) => <NovelCardSkeleton key={i} />)
          : data?.list?.map((n) => <NovelCard key={n.novelId} novel={n} />)}
      </div>

      {data?.pager && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => goPage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground px-4">Page {page}</span>
          <button
            onClick={() => goPage(page + 1)}
            disabled={!data.pager.hasMore}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {!q && !isLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>Enter a search term to discover novels</p>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
