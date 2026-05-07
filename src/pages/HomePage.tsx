import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NovelCard from "@/components/NovelCard";
import NovelCardSkeleton from "@/components/NovelCardSkeleton";
import AutoGenreCarousel from "@/components/AutoGenreCarousel";
import Seo from "@/components/Seo";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Loader2,
  Trophy,
  Flame,
  Star,
  Compass,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
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
  const heroSpotlight = featuredNovels[0];
  const heroSide = featuredNovels.slice(1, 5);

  const loadMoreFeatured = useCallback(() => {
    if (featured.hasNextPage && !featured.isFetchingNextPage) featured.fetchNextPage();
  }, [featured]);

  const featuredSentinel = useInfiniteScroll(loadMoreFeatured, {
    enabled: !!featured.hasNextPage,
  });

  const skeletons = Array.from({ length: 5 }, (_, i) => <NovelCardSkeleton key={i} />);
  const carouselGenres = GENRES.slice(0, 8);

  return (
    <PageTransition>
      <Seo
        title="Read Free Novels Online"
        description="Discover and read thousands of novels across romance, fantasy, sci-fi, mystery and more — free on Nabees Novel Zone."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Nabees Novel Zone",
          url: "https://nabeesnovelzone.app",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://nabeesnovelzone.app/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />

      <div className="space-y-12">
        {/* HERO — magazine-style spotlight */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-glow)]"
        >
          {/* gradient backdrop */}
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
          {/* spotlight cover blurred bg */}
          {heroSpotlight?.cover?.url && (
            <div
              className="absolute inset-0 opacity-30 mix-blend-overlay bg-center bg-cover blur-2xl scale-110"
              style={{ backgroundImage: `url(${heroSpotlight.cover.url})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-6 p-6 sm:p-8 md:p-12 text-primary-foreground">
            {/* Left: copy + CTAs */}
            <div className="space-y-5 self-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" /> Today's Spotlight
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.05] tracking-tight">
                  {heroSpotlight ? heroSpotlight.title : "Stories that never sleep."}
                </h1>
                {heroSpotlight ? (
                  <p className="mt-2 text-sm sm:text-base opacity-90">
                    by <span className="font-semibold">{heroSpotlight.author}</span>
                    {heroSpotlight.score && (
                      <span className="ml-3 inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                        {heroSpotlight.score}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="mt-2 text-sm sm:text-base opacity-85 max-w-md">
                    Thousands of novels across every genre — pick a vibe, dive in, continue any time.
                  </p>
                )}
              </div>

              {heroSpotlight?.summary && (
                <p className="text-sm opacity-85 line-clamp-3 max-w-xl">
                  {heroSpotlight.summary}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {lastRead ? (
                  <Link
                    to={`/read/${lastRead.chapterId}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-5 py-2.5 text-sm font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Continue
                    <span className="font-semibold underline-offset-2 truncate max-w-[140px]">
                      {lastRead.novelTitle || lastRead.chapterName}
                    </span>
                  </Link>
                ) : heroSpotlight ? (
                  <Link
                    to={`/novel/${heroSpotlight.detailPath}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-5 py-2.5 text-sm font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
                  >
                    <BookOpen className="h-4 w-4" /> Read Now
                  </Link>
                ) : (
                  <Link
                    to="/genres"
                    className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-5 py-2.5 text-sm font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
                  >
                    <Compass className="h-4 w-4" /> Start Exploring
                  </Link>
                )}
                <Link
                  to="/rankings"
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur text-white px-5 py-2.5 text-sm font-semibold hover:bg-white/25 active:scale-95 transition-all"
                >
                  <Trophy className="h-4 w-4" /> Rankings
                </Link>
              </div>

              {/* mini stats strip */}
              <div className="flex gap-6 pt-4 text-xs opacity-80">
                <div>
                  <div className="text-lg font-extrabold">10k+</div>
                  <div className="uppercase tracking-wider">Novels</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold">16</div>
                  <div className="uppercase tracking-wider">Genres</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold">Daily</div>
                  <div className="uppercase tracking-wider">Updates</div>
                </div>
              </div>
            </div>

            {/* Right: spotlight cover + side picks */}
            <div className="relative grid grid-cols-[1.1fr_1fr] gap-3 items-stretch">
              {heroSpotlight ? (
                <Link
                  to={`/novel/${heroSpotlight.detailPath}`}
                  className="group relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20 active:scale-[0.98] transition-transform"
                >
                  <img
                    src={heroSpotlight.cover?.url}
                    alt={heroSpotlight.title}
                    className="w-full h-full object-cover aspect-[3/4]"
                    loading="eager"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="text-[10px] uppercase tracking-widest opacity-80">
                      Featured
                    </div>
                    <div className="text-sm font-bold line-clamp-2">{heroSpotlight.title}</div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl bg-white/10 animate-pulse aspect-[3/4]" />
              )}

              <div className="grid grid-rows-4 gap-2">
                {(heroSide.length ? heroSide : Array.from({ length: 4 })).map((n: any, i) => (
                  <Link
                    key={n?.novelId || i}
                    to={n ? `/novel/${n.detailPath}` : "/"}
                    className="group flex gap-2 rounded-xl bg-white/10 backdrop-blur-sm p-1.5 hover:bg-white/20 active:scale-[0.98] transition-all overflow-hidden"
                  >
                    {n?.cover?.url ? (
                      <img
                        src={n.cover.url}
                        alt={n.title}
                        className="w-10 h-14 object-cover rounded-md shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-10 h-14 rounded-md bg-white/10 animate-pulse shrink-0" />
                    )}
                    <div className="min-w-0 flex-1 self-center">
                      <div className="text-xs font-semibold line-clamp-2 leading-tight">
                        {n?.title || "Loading…"}
                      </div>
                      <div className="text-[10px] opacity-70 line-clamp-1">{n?.author}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* RANKING CARDS — inner novels link to detail; "View more" goes to ranking tab */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Rankings
            </h2>
            <Link
              to="/rankings"
              className="flex items-center gap-1 text-sm text-primary hover:underline font-medium active:opacity-70"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                rank: 1,
                title: "Must Read",
                icon: Trophy,
                color: "from-violet-500/15 to-fuchsia-500/10",
                q: mustRead,
              },
              {
                rank: 2,
                title: "Trending",
                icon: Flame,
                color: "from-sky-500/15 to-cyan-500/10",
                q: trending,
              },
              {
                rank: 3,
                title: "Top Rated",
                icon: Star,
                color: "from-amber-500/15 to-orange-500/10",
                q: topRated,
              },
            ].map((card) => (
              <div
                key={card.rank}
                className={`flex flex-col rounded-2xl border border-border bg-gradient-to-br ${card.color} p-4 sm:p-5 transition-all`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <card.icon className="h-4 w-4" />
                    {card.title}
                  </div>
                  <Link
                    to={`/rankings?tab=${card.rank}`}
                    className="text-xs text-primary hover:underline font-semibold active:opacity-70"
                  >
                    More →
                  </Link>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {(card.q.data?.list || Array.from({ length: 5 }))
                    .slice(0, 5)
                    .map((n: any, i) => (
                      <li key={n?.novelId || i}>
                        {n ? (
                          <Link
                            to={`/novel/${n.detailPath}`}
                            className="flex items-center gap-3 group rounded-lg p-1.5 -mx-1.5 hover:bg-card/60 active:scale-[0.99] transition-all touch-manipulation"
                          >
                            <span
                              className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold ${
                                i < 3
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {i + 1}
                            </span>
                            <img
                              src={n.cover?.url}
                              alt={n.title}
                              className="w-10 h-14 object-cover rounded-md shadow-sm shrink-0"
                              loading="lazy"
                              onError={(e) =>
                                ((e.target as HTMLImageElement).src = "/placeholder.svg")
                              }
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium line-clamp-1">{n.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {n.author}
                              </p>
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
                <Link
                  to={`/rankings?tab=${card.rank}`}
                  className="mt-3 inline-flex items-center justify-center gap-1 rounded-full border border-border bg-card/60 px-4 py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95 transition-all"
                >
                  View full {card.title} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* GENRE CHIPS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Browse Genres</h2>
            <Link
              to="/genres"
              className="flex items-center gap-1 text-sm text-primary hover:underline font-medium active:opacity-70"
            >
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
