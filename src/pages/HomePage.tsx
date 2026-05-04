import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NovelCard from "@/components/NovelCard";
import NovelCardSkeleton from "@/components/NovelCardSkeleton";
import GenreCarousel from "@/components/GenreCarousel";
import { Link, useNavigate } from "react-router-dom";
import { Search, TrendingUp, Star, Sparkles, ArrowRight, BookOpen, Loader2, Trophy, Flame } from "lucide-react";
import { useState, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import { StaggerContainer, StaggerItem } from "@/components/StaggerAnimations";
import { motion } from "framer-motion";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Featured with infinite scroll
  const featured = useInfiniteQuery({
    queryKey: ["featured-infinite"],
    queryFn: ({ pageParam = 1 }) => api.getFeatured(pageParam, 10),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.contentList?.length >= 10) return allPages.length + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  const mustRead = useQuery({ queryKey: ["mustRead"], queryFn: () => api.getRankings(1, 1, 6) });
  const trending = useQuery({ queryKey: ["trending"], queryFn: () => api.getRankings(2, 1, 6) });
  const topRated = useQuery({ queryKey: ["topRated"], queryFn: () => api.getRankings(3, 1, 6) });

  // Real genres for carousels
  const genresQuery = useQuery({
    queryKey: ["genres-list"],
    queryFn: () => api.getGenre("1001", 0, 1, 1, 1),
    staleTime: 30 * 60 * 1000,
  });
  const genres = genresQuery.data?.genres || [];

  // Mosaic covers from featured
  const featuredNovels = featured.data?.pages.flatMap((p) => p.contentList || []) || [];
  const mosaicCovers = featuredNovels.slice(0, 6);

  const loadMoreFeatured = useCallback(() => {
    if (featured.hasNextPage && !featured.isFetchingNextPage) featured.fetchNextPage();
  }, [featured]);

  const featuredSentinel = useInfiniteScroll(loadMoreFeatured, {
    enabled: !!featured.hasNextPage,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const skeletons = Array.from({ length: 5 }, (_, i) => <NovelCardSkeleton key={i} />);

  const lastRead = (() => {
    try {
      const h = JSON.parse(localStorage.getItem("readingHistory") || "{}");
      const entries = Object.entries(h).sort(
        ([, a]: any, [, b]: any) => b.timestamp - a.timestamp
      );
      if (entries.length > 0) return entries[0][1] as any;
    } catch {}
    return null;
  })();

  // Pick 4 genres for dedicated carousels (rotate through what API returns)
  const carouselGenres = genres.slice(0, 6);

  return (
    <PageTransition>
      <div className="space-y-12">
        {/* HERO — NovelHub-inspired promo card with cover mosaic */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="relative grid md:grid-cols-2 gap-0 text-primary-foreground">
            {/* Left content */}
            <div className="p-6 sm:p-10 md:p-14 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome to Nabees Novel Zone
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight">
                Explore endless free novels<span className="opacity-90">,</span>
                <br className="hidden sm:block" />
                <span className="opacity-90"> curated for you.</span>
              </h1>

              <p className="text-sm sm:text-base opacity-85 max-w-md">
                Thousands of novels across every genre — search, read and continue anytime.
              </p>

              <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for something…"
                    className="w-full rounded-full bg-white/95 text-foreground placeholder:text-muted-foreground pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-foreground/90 text-background hover:bg-foreground px-5 py-3 text-sm font-semibold transition-all shadow-lg"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>

              {lastRead && (
                <Link
                  to={`/read/${lastRead.chapterId}`}
                  className="inline-flex items-center gap-2 text-sm opacity-90 hover:opacity-100 transition-opacity"
                >
                  <BookOpen className="h-4 w-4" />
                  Continue reading:
                  <span className="font-medium underline underline-offset-2 truncate max-w-[200px]">
                    {lastRead.novelTitle || "Last chapter"}
                  </span>
                </Link>
              )}
            </div>

            {/* Right cover mosaic */}
            <div className="relative hidden md:block min-h-[320px] overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-3 gap-2 p-6 rotate-3 scale-110">
                {(mosaicCovers.length ? mosaicCovers : Array.from({ length: 6 })).map((n: any, i) => (
                  <Link
                    key={n?.novelId || i}
                    to={n ? `/novel/${n.detailPath}` : "/"}
                    className="aspect-[3/4] rounded-lg overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm hover:scale-105 transition-transform"
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

        {/* RANKING CARDS — like NovelHub Must Read / Trending / Top Rated */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Ranking
            </h2>
            <Link to="/rankings" className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { key: "must", title: "Must Read", icon: Trophy, color: "from-violet-500/15 to-fuchsia-500/10 text-violet-600", q: mustRead },
              { key: "trend", title: "Trending", icon: Flame, color: "from-sky-500/15 to-cyan-500/10 text-sky-600", q: trending },
              { key: "top", title: "Top Rated", icon: Star, color: "from-amber-500/15 to-orange-500/10 text-amber-600", q: topRated },
            ].map((card) => (
              <div
                key={card.key}
                className={`rounded-2xl border border-border bg-gradient-to-br ${card.color} p-4 sm:p-5`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <card.icon className="h-4 w-4" />
                    {card.title}
                  </div>
                  <Link to="/rankings" className="text-xs text-foreground/60 hover:text-primary">
                    More →
                  </Link>
                </div>
                <ul className="space-y-2.5">
                  {(card.q.data?.list || Array.from({ length: 5 })).slice(0, 5).map((n: any, i) => (
                    <li key={n?.novelId || i}>
                      {n ? (
                        <Link
                          to={`/novel/${n.detailPath}`}
                          className="flex items-center gap-3 group rounded-lg p-1.5 -mx-1.5 hover:bg-card/60 transition-colors"
                        >
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
                            <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                              {n.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{n.author}</p>
                          </div>
                        </Link>
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
              </div>
            ))}
          </div>
        </section>

        {/* GENRE CHIPS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Browse Genres</h2>
            <Link to="/genres" className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.length > 0
              ? genres.map((g) => (
                  <Link
                    key={g.genreId}
                    to={`/genres?id=${g.genreId}`}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all hover:shadow-md"
                  >
                    {g.title}
                  </Link>
                ))
              : Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="h-9 w-24 rounded-full bg-muted animate-pulse" />
                ))}
          </div>
        </section>

        {/* GENRE CAROUSELS */}
        {carouselGenres.map((g) => (
          <GenreCarousel key={g.genreId} genreId={g.genreId} title={g.title} />
        ))}

        {/* FEATURED — infinite scroll grid */}
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
