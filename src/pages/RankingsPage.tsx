import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NovelCard from "@/components/NovelCard";
import NovelCardSkeleton from "@/components/NovelCardSkeleton";
import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Trophy, TrendingUp, Star, Loader2 } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

const TABS = [
  { rank: 1, label: "Must Read", icon: <Trophy className="h-4 w-4" /> },
  { rank: 2, label: "Trending", icon: <TrendingUp className="h-4 w-4" /> },
  { rank: 3, label: "Top Rated", icon: <Star className="h-4 w-4" /> },
];

export default function RankingsPage() {
  const [activeRank, setActiveRank] = useState<1 | 2 | 3>(2);

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["rankings-infinite", activeRank],
    queryFn: ({ pageParam = 1 }) => api.getRankings(activeRank, pageParam, 20),
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

  return (
    <PageTransition>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Rankings</h1>

        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.rank}
              onClick={() => setActiveRank(t.rank as 1 | 2 | 3)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeRank === t.rank
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card hover:bg-muted"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 10 }, (_, i) => <NovelCardSkeleton key={i} />)
            : novels.map((n, i) => <NovelCard key={`${n.novelId}-${i}`} novel={n} rank={i + 1} />)}
        </div>

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
