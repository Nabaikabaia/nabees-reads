import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NovelCard from "@/components/NovelCard";
import NovelCardSkeleton from "@/components/NovelCardSkeleton";
import { Link, useNavigate } from "react-router-dom";
import { Search, TrendingUp, Star, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";

const GENRES = [
  "Fantasy", "Romance", "Action", "Adventure", "Sci-Fi",
  "Mystery", "Horror", "Comedy", "Drama", "Urban",
];

function Section({ title, icon, children, linkTo }: { title: string; icon: React.ReactNode; children: React.ReactNode; linkTo?: string }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          {icon}
          {title}
        </h2>
        {linkTo && (
          <Link to={linkTo} className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const featured = useQuery({ queryKey: ["featured"], queryFn: () => api.getFeatured(1, 10) });
  const trending = useQuery({ queryKey: ["trending"], queryFn: () => api.getRankings(2, 1, 10) });
  const topRated = useQuery({ queryKey: ["topRated"], queryFn: () => api.getRankings(3, 1, 10) });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const skeletons = Array.from({ length: 5 }, (_, i) => <NovelCardSkeleton key={i} />);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-8 md:p-16 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2EpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-2xl space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Your Gateway to<br />Infinite Stories
          </h1>
          <p className="text-lg opacity-90">
            Discover thousands of novels across every genre. Read anytime, anywhere.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for novels..."
                className="w-full rounded-lg bg-primary-foreground/20 backdrop-blur-sm border border-primary-foreground/20 pl-10 pr-4 py-3 text-primary-foreground placeholder:text-primary-foreground/60 outline-none focus:bg-primary-foreground/30 transition-all"
              />
            </div>
            <button type="submit" className="rounded-lg bg-primary-foreground px-6 py-3 font-semibold text-primary hover:opacity-90 transition-opacity">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Genres */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Browse Genres</h2>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <Link
              key={g}
              to={`/search?q=${encodeURIComponent(g)}`}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              {g}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <Section title="Featured Novels" icon={<Sparkles className="h-6 w-6 text-primary" />}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {featured.isLoading
            ? skeletons
            : featured.data?.contentList?.map((n) => <NovelCard key={n.novelId} novel={n} />)}
        </div>
      </Section>

      {/* Trending */}
      <Section title="Trending Now" icon={<TrendingUp className="h-6 w-6 text-primary" />} linkTo="/rankings">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trending.isLoading
            ? skeletons
            : trending.data?.list?.map((n, i) => <NovelCard key={n.novelId} novel={n} rank={i + 1} />)}
        </div>
      </Section>

      {/* Top Rated */}
      <Section title="Top Rated" icon={<Star className="h-6 w-6 text-amber-500" />} linkTo="/rankings">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {topRated.isLoading
            ? skeletons
            : topRated.data?.list?.map((n, i) => <NovelCard key={n.novelId} novel={n} rank={i + 1} />)}
        </div>
      </Section>
    </div>
  );
}
