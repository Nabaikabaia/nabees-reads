import { Link } from "react-router-dom";
import { Star, Eye, BookOpen } from "lucide-react";
import type { Novel } from "@/types/novel";

interface NovelCardProps {
  novel: Novel;
  rank?: number;
}

export default function NovelCard({ novel, rank }: NovelCardProps) {
  return (
    <Link
      to={`/novel/${novel.detailPath}`}
      className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] active:opacity-90 touch-manipulation select-none"
    >
      {rank && (
        <div className="absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
          #{rank}
        </div>
      )}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={novel.cover?.url}
          alt={novel.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/80 to-transparent p-3">
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${novel.novelStatus === 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {novel.novelStatus === 1 ? "Ongoing" : "Completed"}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {novel.title}
        </h3>
        <p className="text-xs text-muted-foreground truncate">{novel.author}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-1">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            {novel.score}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {novel.totalViews}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {novel.totalChapters}
          </span>
        </div>
      </div>
    </Link>
  );
}
