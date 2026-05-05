import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NovelCard from "@/components/NovelCard";
import NovelCardSkeleton from "@/components/NovelCardSkeleton";
import AutoGenreCarousel from "@/components/AutoGenreCarousel";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, BookOpen, Loader2, Trophy, Flame, Star, Compass } from "lucide-react";
import { useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import { StaggerContainer, StaggerItem } from "@/components/StaggerAnimations";
import { motion } from "framer-motion";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { GENRES } from "@/lib/genres";

export default function HomePage() {
  const { sorted: history } = useReadingHistory();
  const lastRead = history[0];

  const featured = useInfiniteQuery({
    queryKey: ["featured-infinite"],
    queryFn: ({ pageParam = 1 }) => api.getFeatured(pageParam, 10),
    getNextPageParam: (lastPage, allPages) =>
      (lastPage.contentList?.length ?? 0) >= 10 ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  });

  const mustRead = useQuery({ queryKey: ["mustRead"], queryFn: () => api.getRankings(1, 1, 6) });
  const trending = useQuery({ queryKey: ["trending"], queryFn: () => api.getRankings(2, 1, 6) });
  const topRated = useQuery({ queryKey: ["topRated"], queryFn: () => api.getRankings(3, 1, 6) });

  const featuredNovels = featured.data?.pages.flatMap((p) => p.contentList || []) || [];
  const mosaicCovers = featuredNovels.slice(0, 6);

  const loadMoreFeatured = useCallback(() => {
    if (featured.hasNextPage && !featured.isFetchingNextPage) featured.fetchNextPage();
  }, [featured]);

  const featuredSentinel = useInfiniteScroll(loadMoreFeatured, {
    enabled: !!featured.hasNextPage,
  });

  const skeletons = Array.from({ length: 5 }, (_, i) => <NovelCardSkeleton key={i} />);

  // Pick genres for auto-rolling carousels
  const carouselGenres = GENRES.slice(0, 8);

  return (
    <PageTransition>
      <div className="space-y-12">
        {/* HERO — clean promo, no search bar */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="relative grid md:grid-cols-2 gap-0 text-primary-foreground">
            <div className="p-6 sm:p-10 md:p-14 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome to Nabees Novel Zone
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight">
                Stories that never sleep.
                <br className="hidden sm:block" />
                <span className="opacity-90">Read free, anywhere.</span>
              </h1>

              <p className="text-sm sm:text-base opacity-85 max-w-md">
                Thousands of novels across every genre — pick a vibe, dive in,
                continue any time.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {lastRead ? (
                  <Link
                    to={`/read/${lastRead.chapterId}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-5 py-2.5 text-sm font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
                  >
                    <BookOpen className="h-4 w-4" />
                    Continue:{" "}
                    <span className="font-semibold underline-offset-2 truncate max-w-[140px]">
                      {lastRead.novelTitle || lastRead.chapterName}
                    </span>
                  </Link>
                ) : (
                  <Link
                    to="/genres"
                    className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-5 py-2.5 text-sm font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
                  >
                    <Compass className="h-4 w-4" /> Start exploring
                  </Link>
                )}
                <Link
                  to="/rankings"
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur text-white px-5 py-2.5 text-sm font-semibold hover:bg-white/25 active:scale-95 transition-all"
                >
                  <Trophy className="h-4 w-4" /> Rankings
                </Link>
              </div>
            </div>

            <div className="relative hidden md:block min-h-[320px] overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-3 gap-2 p-6 rotate-3 scale-110">
                {(mosaicCovers.length ? mosaicCovers : Array.from({ length: 6 })).map((n: any, i) => (
                  <Link
                    key={n?.novelId || i}
                    to={n ? `/novel/${n.detailPath}` : "/"}
                    className="aspect-[3/4] rounded-lg overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm hover:scale-105 active:scale-95 transition-transform"
                  >
                    {n?.cover?.url ? (
                      <img src={n.cover.url} alt={n.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-white/10 animate-pulse" />
                    )}
                  </Link>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-primary/40 pointer-events-none" />
            </div>
          </div>
        </motion.section>

        {/* RANKING CARDS — each links to its tab on rankings page */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Ranking
            </h2>
            <Link to="/rankings" className="flex items-center gap-1 text-sm text-primary hover:underline font-medium active:opacity-70">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { rank: 1, title: "Must Read", icon: Trophy, color: "from-violet-500/15 to-fuchsia-500/10", q: mustRead },
              { rank: 2, title: "Trending", icon: Flame, color: "from-sky-500/15 to-cyan-500/10", q: trending },
              { rank: 3, title: "Top Rated", icon: Star, color: "from-amber-500/15 to-orange-500/10", q: topRated },
            ].map((card) => (
              <Link
                key={card.rank}
                to={`/rankings?tab=${card.rank}`}
                className={`block rounded-2xl border border-border bg-gradient-to-br ${card.color} p-4 sm:p-5 hover:shadow-md active:scale-[0.99] transition-all touch-manipulation`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <card.icon className="h-4 w-4" />
                    {card.title}
                  </div>
                  <span className="text-xs text-foreground/60">More →</span>
                </div>
                <ul className="space-y-2.5">
                  {(card.q.data?.list || Array.from({ length: 5 })).slice(0, 5).map((n: any, i) => (
                    <li key={n?.novelId || i}>
                      {n ? (
                        <div className="flex items-center gap-3 group rounded-lg p-1.5 -mx-1.5 hover:bg-card/60 transition-colors">
                          <span className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold ${i < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {i + 1}
                          </span>
                          <img
                            src={n.cover?.url}
                            alt={n.title}
                            className="w-10 h-14 object-cover rounded-md shadow-sm shrink-0"
                            loading="lazy"
                            onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.svg")}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium line-clamp-1">{n.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{n.author}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-1.5">
                          <div className="w-6 h-6 rounded-md bg-muted animate-pulse" />
                          <div className="w-10 h-14 rounded-md bg-muted animate-pulse" />
                          <div className="flex-1 space-y-1">
                            <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                            <div className="h-2 w-1/2 bg-muted animate-pulse rounded" />
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </section>

        {/* GENRE CHIPS — names always visible */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Browse Genres</h2>
            <Link to="/genres" className="flex items-center gap-1 text-sm text-primary hover:underline font-medium active:opacity-70">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <Link
                key={g.genreId}
                to={`/genres?id=${g.genreId}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95 transition-all hover:shadow-md touch-manipulation"
              >
                {g.title}
              </Link>
            ))}
          </div>
        </section>

        {/* AUTO-ROLLING GENRE CAROUSELS */}
        {carouselGenres.map((g, i) => (
          <AutoGenreCarousel
            key={g.genreId}
            genreId={g.genreId}
            title={g.title}
            intervalMs={3500 + i * 500}
          />
        ))}

        {/* FEATURED — infinite grid */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Featured Novels
            </h2>
          </div>
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featured.isLoading
              ? skeletons
              : featuredNovels.map((n) => (
                  <StaggerItem key={n.novelId}>
                    <NovelCard novel={n} />
                  </StaggerItem>
                ))}
          </StaggerContainer>
          {featured.isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
          <div ref={featuredSentinel} />
        </section>
      </div>
    </PageTransition>
  );
}
