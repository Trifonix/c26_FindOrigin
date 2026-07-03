export type SourceCategory = "official" | "news" | "blog" | "research" | "other";

export interface SearchCandidate {
  url: string;
  title: string;
  snippet: string;
  category: SourceCategory;
}

export interface RankedSource {
  url: string;
  title: string;
  confidence: number;
  reasoning: string;
}

export interface SourceSearchResult {
  candidates: SearchCandidate[];
  queries: string[];
}
