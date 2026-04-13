import { useEffect, useRef, useCallback } from "react";

export function useInfiniteScroll(
  onLoadMore: () => void,
  { enabled = true, threshold = 200 }: { enabled?: boolean; threshold?: number } = {}
) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { rootMargin: `${threshold}px` }
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [onLoadMore, enabled, threshold]);

  return sentinelRef;
}
