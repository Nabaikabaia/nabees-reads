export interface NovelCover {
  id: string;
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  blurHash: string;
  averageHueLight: string;
  averageHueDark: string;
}

export interface Novel {
  novelId: string;
  novelType: number;
  title: string;
  cover: NovelCover;
  summary: string;
  score: string;
  totalViews: string;
  totalChapters: number;
  genres: string[];
  tags: string[];
  totalWords: number;
  totalWordsFormat: string;
  detailPath: string;
  author: string;
  language: string;
  novelStatus: number;
  novelStatusDesc: string;
}

export interface Chapter {
  chapterId: string;
  chapterName: string;
  seq: number;
  totalWords: number;
  fileUrl: string;
  novelId: string;
}

export interface ChapterContent {
  novelId: string;
  chapterId: string;
  chapterName: string;
  seq: number;
  content: string;
}

export interface Pager {
  hasMore: boolean;
  nextPage: string;
  page: string;
  perPage: number;
  totalCount: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface FeaturedResponse {
  title: string;
  contentList: Novel[];
}

export interface RankingsResponse {
  title: string;
  list: Novel[];
  rankings: { rankingId: number; title: string }[];
}

export interface SearchResponse {
  list: Novel[];
  pager: Pager;
}

export interface ChaptersResponse {
  chapterList: Chapter[];
  pager: Pager;
}
