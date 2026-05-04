import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import NovelCard from "@/components/NovelCard";
import NovelCardSkeleton from "@/components/NovelCardSkeleton";
import { useCallback } from "react";
import { Loader2, BookOpen } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

const STATUS_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Ongoing" },
  { value: 2, label: "Completed" },
];

const SORT_OPTIONS = [
  { value: 1, label: "Newest" },
  { value: 2, label: "Popular" },
];

export default function GenrePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreId = searchParams.get("id") || "1001";
  const status = (parseInt(searchParams.get("status") || "0") as 0 | 1 | 2);
  const sort = (parseInt(searchParams.get("sort") || "1") as 1 | 2);

  // Fetch genre list (use any genre request to get the full genres array)
  const { data: genreData } = useQuery({
    queryKey: ["genre-list"],
    queryFn: () => api.getGenre("1001", 0, 1, 1, 1),
    staleTime: 30 * 60 * 1000,
  });

  const genres = genreData?.genres || [];

  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["genre-novels", genreId, status, sort],
    queryFn: ({ pageParam = 1 }) => api.getGenre(genreId, status, sort, pageParam, 20),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.list?.length >= 20) return allPages.length + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useInfiniteScroll(loadMore, { enabled: !!hasNextPage });
  const novels = data?.pages.flatMap((p) => p.list || []) || [];
  const currentTitle = data?.pages[0]?.title || "Genre";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    if (key !== "id") params.delete("p");
    setSearchParams(params);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Browse by Genre
          </h1>
          <p className="text-muted-foreground mt-1">
            Explore novels across {genres.length || "all"} genres
          </p>
        </div>

        {/* Genre chips */}
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <button
              key={g.genreId}
              onClick={() => updateParam("id", g.genreId)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                genreId === g.genreId
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "border border-border bg-card hover:bg-muted"
              }`}
            >
              {g.title}
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <div className="flex gap-1">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateParam("status", String(opt.value))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    status === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort:</span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateParam("sort", String(opt.value))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    sort === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current genre title */}
        <h2 className="text-xl font-semibold">{currentTitle}</h2>

        {/* Novel grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 10 }, (_, i) => <NovelCardSkeleton key={i} />)
            : novels.map((n, i) => <NovelCard key={`${n.novelId}-${i}`} novel={n} />)}
        </div>

        {!isLoading && novels.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No novels found in this genre with the selected filters.
          </div>
        )}

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        <div ref={sentinelRef} />
      </div>
    </PageTransition>
  );
}
