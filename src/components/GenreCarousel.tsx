import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import NovelCard from "@/components/NovelCard";
import NovelCardSkeleton from "@/components/NovelCardSkeleton";

interface Props {
  genreId: string;
  title: string;
}

export default function GenreCarousel({ genreId, title }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["genre-carousel", genreId],
    queryFn: () => api.getGenre(genreId, 0, 2, 1, 12),
    staleTime: 10 * 60 * 1000,
  });

  const novels = data?.list || [];

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!isLoading && novels.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">{title}</h2>
        <div className="flex items-center gap-1">
          <Link
            to={`/genres?id=${genreId}`}
            className="hidden sm:inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium mr-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => scroll("left")}
            className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card hover:bg-muted transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card hover:bg-muted transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin"
        style={{ scrollbarWidth: "thin" }}
      >
        {(isLoading ? Array.from({ length: 6 }) : novels).map((n: any, i) => (
          <div
            key={n?.novelId || i}
            className="snap-start shrink-0 w-[44%] sm:w-[28%] md:w-[22%] lg:w-[16%]"
          >
            {isLoading ? <NovelCardSkeleton /> : <NovelCard novel={n} />}
          </div>
        ))}
      </div>
    </section>
  );
}
