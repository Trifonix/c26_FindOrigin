import { categorizeUrl } from "@/lib/search/filter";
import type { SearchCandidate } from "@/lib/types/search";

interface SerperOrganicResult {
  title?: string;
  link?: string;
  snippet?: string;
}

interface SerperResponse {
  organic?: SerperOrganicResult[];
  message?: string;
}

function getSerperApiKey(): string {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured");
  }
  return apiKey;
}

export async function serperSearch(query: string, num = 10): Promise<SearchCandidate[]> {
  const apiKey = getSerperApiKey();

  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: Math.min(num, 10) }),
    signal: AbortSignal.timeout(10_000),
  });

  const data = (await response.json()) as SerperResponse;

  if (!response.ok) {
    const detail = data.message ?? `HTTP ${response.status}`;
    throw new Error(`Serper: ${detail}`);
  }

  return (data.organic ?? [])
    .filter((item) => item.link && item.title)
    .map((item) => ({
      url: item.link!,
      title: item.title!,
      snippet: item.snippet ?? "",
      category: categorizeUrl(item.link!),
    }));
}

export { getSerperApiKey };
