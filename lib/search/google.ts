import { categorizeUrl, filterCandidates } from "@/lib/search/filter";
import { buildSearchQueries } from "@/lib/search/queries";
import { formatSearchError } from "@/lib/search/errors";
import type { SearchCandidate, SourceSearchResult } from "@/lib/types/search";

interface GoogleSearchItem {
  title?: string;
  link?: string;
  snippet?: string;
}

interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
  error?: { message: string };
}

function getGoogleConfig(): { apiKey: string; cseId: string } {
  const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GOOGLE_SEARCH_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }
  if (!cseId) {
    throw new Error("GOOGLE_CSE_ID is not configured");
  }

  return { apiKey, cseId };
}

async function googleSearch(query: string, num = 10): Promise<SearchCandidate[]> {
  const { apiKey, cseId } = getGoogleConfig();

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cseId);
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(Math.min(num, 10)));

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(10_000),
  });

  const data = (await response.json()) as GoogleSearchResponse;

  if (!response.ok) {
    const raw = data.error?.message ?? `Google Search API error: ${response.status}`;
    throw new Error(formatSearchError(new Error(raw)));
  }

  return (data.items ?? [])
    .filter((item) => item.link && item.title)
    .map((item) => ({
      url: item.link!,
      title: item.title!,
      snippet: item.snippet ?? "",
      category: categorizeUrl(item.link!),
    }));
}

export async function searchSources(text: string): Promise<SourceSearchResult> {
  const queries = buildSearchQueries(text);
  const batches = await Promise.all(queries.map((q) => googleSearch(q, 10)));

  const candidates = filterCandidates(batches.flat(), 12);

  return { candidates, queries };
}

export { googleSearch, getGoogleConfig };
