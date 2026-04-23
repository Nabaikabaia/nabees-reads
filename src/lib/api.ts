// novelApi.ts
import type {
  ApiResponse,
  SearchResponse,
  ChaptersResponse,
  ChapterContent,
  Novel,
} from "@/types/novel";

const API_BASE = "https://novel-api.nabaikabaiaguo.workers.dev";

// Helper function with better error handling and CORS support
async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  // Clean the path - remove double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${cleanPath}`;
  
  // Default options with CORS support
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    mode: 'cors', // Enable CORS
    cache: 'default',
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    const res = await fetch(url, mergedOptions);
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    
    const json: ApiResponse<T> = await res.json();
    
    if (json.code !== 0) {
      throw new Error(json.message || `API returned error code: ${json.code}`);
    }
    
    return json.data;
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
}

// Response interfaces
export interface FeaturedResponse {
  title: string;
  contentList: Novel[];
  pager: { hasMore: boolean; nextPage: string; page: string; perPage: number; totalCount: number };
}

export interface RankingsResponse {
  title: string;
  list: Novel[];
  rankings: { rankingId: number; title: string }[];
  pager: { hasMore: boolean; nextPage: string; page: string; perPage: number; totalCount: number };
}

export interface RecommendResponse {
  title: string;
  contentList: Novel[];
  pager: { hasMore: boolean; nextPage: string; page: string; perPage: number; totalCount: number };
}

export interface GenreResponse {
  genreId: string;
  title: string;
  genres: { genreId: string; title: string; link?: string }[];
  list: Novel[];
  pager: { hasMore: boolean; nextPage: string; page: string; perPage: number; totalCount: number };
}

export interface OperationContentResponse {
  title: string;
  link: string;
  contentList: Novel[];
  pager: { hasMore: boolean; nextPage: string; page: string; perPage: number; totalCount: number };
}

// API client
export const api = {
  /**
   * Search for novels by keyword
   * @param q - Search keyword
   * @param p - Page number (default: 1)
   * @param l - Items per page (default: 20, max: 100)
   */
  search: (q: string, p = 1, l = 20): Promise<SearchResponse> =>
    fetchApi(`/search?q=${encodeURIComponent(q)}&p=${p}&l=${l}`),

  /**
   * Get detailed novel information by detailPath
   * @param detailPath - The detailPath from search results (e.g., "mafia-UKvocoYlXH4")
   */
  getNovel: (detailPath: string): Promise<Novel> =>
    fetchApi(`/novel/${detailPath}`),

  /**
   * Get all chapters for a novel
   * @param novelId - Novel ID
   * @param order - ASC (oldest first) or DESC (newest first) (default: ASC)
   * @param p - Page number (default: 1)
   * @param l - Chapters per page (default: 100)
   */
  getChapters: (novelId: string, order: "ASC" | "DESC" = "ASC", p = 1, l = 100): Promise<ChaptersResponse> =>
    fetchApi(`/chapters?id=${novelId}&order=${order}&p=${p}&l=${l}`),

  /**
   * Get single chapter content
   * @param chapterId - Chapter ID
   */
  getChapter: (chapterId: string): Promise<ChapterContent> =>
    fetchApi(`/chapter/${chapterId}`),

  /**
   * Get recommendations based on a novel
   * @param novelId - Novel ID
   * @param p - Page number (default: 1)
   * @param l - Items per page (default: 10)
   */
  getRecommendations: (novelId: string, p = 1, l = 10): Promise<RecommendResponse> =>
    fetchApi(`/recommend?id=${novelId}&p=${p}&l=${l}`),

  /**
   * Get global featured recommendations
   * @param p - Page number (default: 1)
   * @param l - Items per page (default: 20)
   */
  getFeatured: (p = 1, l = 20): Promise<FeaturedResponse> =>
    fetchApi(`/featured?p=${p}&l=${l}`),

  /**
   * Get ranked novel lists
   * @param rank - 1=Must Read, 2=Trending, 3=Top Rated (default: 2)
   * @param p - Page number (default: 1)
   * @param l - Items per page (default: 20)
   */
  getRankings: (rank: 1 | 2 | 3 = 2, p = 1, l = 20): Promise<RankingsResponse> =>
    fetchApi(`/rankings?rank=${rank}&p=${p}&l=${l}`),

  /**
   * Get novels by genre with filtering
   * @param genreId - Genre ID (see genre list)
   * @param status - 0=all, 1=ongoing, 2=completed (default: 0)
   * @param sort - 1=newest, 2=popular (default: 1)
   * @param p - Page number (default: 1)
   * @param l - Items per page (default: 50)
   */
  getGenre: (genreId: string, status: 0 | 1 | 2 = 0, sort: 1 | 2 = 1, p = 1, l = 50): Promise<GenreResponse> =>
    fetchApi(`/genre/${genreId}?status=${status}&sort=${sort}&p=${p}&l=${l}`),

  /**
   * Get curated/promoted content
   * @param op - Operation config ID (default: 52)
   * @param p - Page number (default: 1)
   * @param l - Items per page (default: 10)
   */
  getCurated: (op = 52, p = 1, l = 10): Promise<OperationContentResponse> =>
    fetchApi(`/operation/content?op=${op}&p=${p}&l=${l}`),

  /**
   * Get all available genres
   * @returns Array of genres with IDs and names
   */
  getAllGenres: async (): Promise<{ genreId: string; title: string; link?: string }[]> => {
    const response = await fetchApi<GenreResponse>('/genre/1009?p=1&l=1');
    return response.genres || [];
  },

  /**
   * Health check endpoint
   */
  health: async (): Promise<{ status: string; version: string; endpoints_available: number }> => {
    const res = await fetch(`${API_BASE}/health`, { mode: 'cors' });
    return res.json();
  },
};

// Genre IDs reference for easy access
export const GENRE_IDS = {
  TEEN: '1001',
  MODERN_ROMANCE: '1002',
  FANTASY_ROMANCE: '1003',
  HISTORY_ROMANCE: '1004',
  LGBT: '1005',
  EASTERN_FANTASY: '1006',
  WESTERN_FANTASY: '1007',
  URBAN: '1008',
  GAME_SPORT: '1009',
  MILITARY_HISTORY: '1010',
  HORROR: '1011',
  MYSTERY: '1012',
  SCIFI: '1013',
  FAN_FICTION: '1014',
  LITERATURE: '1015',
  OTHER: '1016',
} as const;

export type GenreId = typeof GENRE_IDS[keyof typeof GENRE_IDS];

// Novel status constants
export const NOVEL_STATUS = {
  ALL: 0,
  ONGOING: 1,
  COMPLETED: 2,
} as const;

// Sort order constants
export const SORT_ORDER = {
  NEWEST: 1,
  POPULAR: 2,
} as const;

// Chapter order constants
export const CHAPTER_ORDER = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

// Ranking type constants
export const RANKING_TYPE = {
  MUST_READ: 1,
  TRENDING: 2,
  TOP_RATED: 3,
} as const;
