import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NovelCard from "@/components/NovelCard";
import NovelCardSkeleton from "@/components/NovelCardSkeleton";
import { Link, useNavigate } from "react-router-dom";
import { Search, TrendingUp, Star, Sparkles, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import { StaggerContainer, StaggerItem } from "@/components/StaggerAnimations";
import { motion } from "framer-motion";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

function Section({
  title,
  icon,
  children,
  linkTo,
  loading,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  linkTo?: string;
  loading?: boolean;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-xl font-bold">
          {icon}
          {title}
        </h2>
        {linkTo && (
          <Link to={linkTo} className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {children}
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
    </section>
  );
}

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

  const trending = useQuery({ queryKey: ["trending"], queryFn: () => api.getRankings(2, 1, 10) });
  const topRated = useQuery({ queryKey: ["topRated"], queryFn: () => api.getRankings(3, 1, 10) });

  // Fetch real genres from API
  const genresQuery = useQuery({
    queryKey: ["genres-list"],
    queryFn: () => api.getGenre("1001", 0, 1, 1, 1),
    staleTime: 30 * 60 * 1000,
  });
  const genres = genresQuery.data?.genres || [];

  const featuredNovels = featured.data?.pages.flatMap((p) => p.contentList || []) || [];

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

  // Get the reading history for "continue reading"
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

  return (
    <PageTransition>
      <div className="space-y-14">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-secondary to-primary p-1"
        >
          <div className="relative rounded-xl bg-gradient-to-br from-primary/90 to-secondary/90 p-8 md:p-14 text-primary-foreground overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary-foreground/5 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-primary-foreground/5 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-foreground/3 blur-3xl" />
            </div>

            <div className="relative max-w-2xl space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 backdrop-blur-sm px-4 py-1.5 text-sm font-medium"
              >
                <Sparkles className="h-4 w-4" />
                Discover Your Next Adventure
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight"
              >
                Immerse Yourself in
                <br />
                <span className="bg-gradient-to-r from-primary-foreground to-primary-foreground/70 bg-clip-text">
                  Infinite Stories
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base md:text-lg opacity-85 max-w-lg"
              >
                Thousands of novels across every genre. Curated for you, read anytime.
              </motion.p>

              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onSubmit={handleSearch}
                className="flex gap-2 max-w-lg"
              >
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50 group-focus-within:opacity-80 transition-opacity" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for novels..."
                    className="w-full rounded-xl bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 pl-11 pr-4 py-3.5 text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus:bg-primary-foreground/15 focus:border-primary-foreground/40 transition-all text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-primary-foreground px-6 py-3.5 font-semibold text-primary hover:opacity-90 transition-all hover:shadow-lg text-sm"
                >
                  Search
                </button>
              </motion.form>

              {lastRead && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link
                    to={`/read/${lastRead.chapterId}`}
                    className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <BookOpen className="h-4 w-4" />
                    Continue reading: <span className="font-medium underline underline-offset-2">{lastRead.novelTitle || "Last chapter"}</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Genres */}
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

        {/* Featured - Infinite Scroll */}
        <Section title="Featured Novels" icon={<Sparkles className="h-5 w-5 text-primary" />} loading={featured.isFetchingNextPage}>
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featured.isLoading
              ? skeletons
              : featuredNovels.map((n) => (
                  <StaggerItem key={n.novelId}>
                    <NovelCard novel={n} />
                  </StaggerItem>
                ))}
          </StaggerContainer>
          <div ref={featuredSentinel} />
        </Section>

        {/* Trending */}
        <Section title="Trending Now" icon={<TrendingUp className="h-5 w-5 text-primary" />} linkTo="/rankings">
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" delay={0.1}>
            {trending.isLoading
              ? skeletons
              : trending.data?.list?.map((n, i) => (
                  <StaggerItem key={n.novelId}>
                    <NovelCard novel={n} rank={i + 1} />
                  </StaggerItem>
                ))}
          </StaggerContainer>
        </Section>

        {/* Top Rated */}
        <Section title="Top Rated" icon={<Star className="h-5 w-5 text-amber-500" />} linkTo="/rankings">
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" delay={0.2}>
            {topRated.isLoading
              ? skeletons
              : topRated.data?.list?.map((n, i) => (
                  <StaggerItem key={n.novelId}>
                    <NovelCard novel={n} rank={i + 1} />
                  </StaggerItem>
                ))}
          </StaggerContainer>
        </Section>
      </div>
    </PageTransition>
  );
}
