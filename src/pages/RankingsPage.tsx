import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NovelCard from "@/components/NovelCard";
import NovelCardSkeleton from "@/components/NovelCardSkeleton";
import { useState } from "react";
import { Trophy, TrendingUp, Star } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const TABS = [
  { rank: 1, label: "Must Read", icon: <Trophy className="h-4 w-4" /> },
  { rank: 2, label: "Trending", icon: <TrendingUp className="h-4 w-4" /> },
  { rank: 3, label: "Top Rated", icon: <Star className="h-4 w-4" /> },
];

export default function RankingsPage() {
  const [activeRank, setActiveRank] = useState(2);

  const { data, isLoading } = useQuery({
    queryKey: ["rankings", activeRank],
    queryFn: () => api.getRankings(activeRank, 1, 20),
  });

  return (
    <PageTransition>
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Rankings</h1>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.rank}
            onClick={() => setActiveRank(t.rank)}
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
          : data?.list?.map((n, i) => <NovelCard key={n.novelId} novel={n} rank={i + 1} />)}
      </div>
    </div>
    </PageTransition>
  );
}
