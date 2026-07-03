import { filterCandidates } from "@/lib/search/filter";
import { buildSearchQueries } from "@/lib/search/queries";
import { googleSearch, getGoogleConfig } from "@/lib/search/google";
import { getSerperApiKey, serperSearch } from "@/lib/search/serper";
import type { SearchCandidate, SourceSearchResult } from "@/lib/types/search";

export type SearchProvider = "serper" | "google";

function resolveProvider(): SearchProvider {
  if (process.env.SERPER_API_KEY) return "serper";
  if (
    (process.env.GOOGLE_API_KEY ?? process.env.GOOGLE_SEARCH_API_KEY) &&
    process.env.GOOGLE_CSE_ID
  ) {
    return "google";
  }
  throw new Error(
    "Search not configured. Set SERPER_API_KEY (recommended) or GOOGLE_API_KEY + GOOGLE_CSE_ID.",
  );
}

async function runSearch(query: string, num = 10): Promise<SearchCandidate[]> {
  const provider = resolveProvider();
  return provider === "serper" ? serperSearch(query, num) : googleSearch(query, num);
}

export async function searchSources(text: string): Promise<SourceSearchResult> {
  const queries = buildSearchQueries(text);
  const batches = await Promise.all(queries.map((q) => runSearch(q, 10)));
  const candidates = filterCandidates(batches.flat(), 12);

  return { candidates, queries };
}

export function getSearchProviderInfo(): {
  provider: SearchProvider;
  configured: boolean;
} {
  try {
    const provider = resolveProvider();
    if (provider === "serper") {
      getSerperApiKey();
    } else {
      getGoogleConfig();
    }
    return { provider, configured: true };
  } catch {
    return { provider: "serper", configured: false };
  }
}

export { resolveProvider, runSearch };
