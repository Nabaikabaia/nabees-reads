import type {
  ApiResponse,
  FeaturedResponse,
  RankingsResponse,
  SearchResponse,
  ChaptersResponse,
  ChapterContent,
  Novel,
} from "@/types/novel";

const API_BASE = "https://novel-api.nabaikabaiaguo.workers.dev";

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json: ApiResponse<T> = await res.json();
  if (json.code !== 0) throw new Error(json.message);
  return json.data;
}

export const api = {
  search: (q: string, p = 1, l = 20) =>
    fetchApi<SearchResponse>(`/search?q=${encodeURIComponent(q)}&p=${p}&l=${l}`),

  getNovel: (detailPath: string) =>
    fetchApi<Novel>(`/novel/${detailPath}`),

  getChapters: (novelId: string, order = "ASC", p = 1, l = 100) =>
    fetchApi<ChaptersResponse>(`/chapters?id=${novelId}&order=${order}&p=${p}&l=${l}`),

  getChapter: (chapterId: string) =>
    fetchApi<ChapterContent>(`/chapter/${chapterId}`),

  getRecommendations: (novelId: string, p = 1, l = 10) =>
    fetchApi<{ list: Novel[] }>(`/recommend?id=${novelId}&p=${p}&l=${l}`),

  getFeatured: (p = 1, l = 20) =>
    fetchApi<FeaturedResponse>(`/featured?p=${p}&l=${l}`),

  getRankings: (rank = 2, p = 1, l = 20) =>
    fetchApi<RankingsResponse>(`/rankings?rank=${rank}&p=${p}&l=${l}`),
};
