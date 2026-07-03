const SOCIAL_DOMAINS = [
  "t.me",
  "telegram.me",
  "twitter.com",
  "x.com",
  "facebook.com",
  "fb.com",
  "vk.com",
  "instagram.com",
  "tiktok.com",
  "youtube.com",
  "youtu.be",
];

const RESEARCH_DOMAINS = [
  "arxiv.org",
  "pubmed.ncbi.nlm.nih.gov",
  "ncbi.nlm.nih.gov",
  "doi.org",
  "scholar.google",
  "researchgate.net",
  "nature.com",
  "sciencedirect.com",
];

const NEWS_HINTS = [
  "news",
  "reuters",
  "bbc",
  "cnn",
  "rbc",
  "lenta",
  "kommersant",
  "interceptor",
  "tass",
  "interfax",
  "meduza",
  "gazeta",
  "ria.ru",
];

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function categorizeUrl(url: string): import("@/lib/types/search").SourceCategory {
  const host = getHostname(url);

  if (RESEARCH_DOMAINS.some((d) => host.includes(d))) {
    return "research";
  }

  if (host.endsWith(".gov") || host.endsWith(".edu") || host.endsWith(".gov.ru")) {
    return "official";
  }

  if (host.endsWith(".org") && !host.includes("wordpress")) {
    return "official";
  }

  if (NEWS_HINTS.some((hint) => host.includes(hint))) {
    return "news";
  }

  if (host.includes("blog") || host.includes("medium.com") || host.includes("substack")) {
    return "blog";
  }

  return "other";
}

export function isJunkUrl(url: string): boolean {
  const host = getHostname(url);
  if (!host) return true;

  return SOCIAL_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
}

export function dedupeByUrl<T extends { url: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const normalized = item.url.split("#")[0].replace(/\/$/, "");
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(item);
  }

  return result;
}

export function filterCandidates<T extends { url: string }>(
  items: T[],
  maxCount = 12,
): T[] {
  return dedupeByUrl(items.filter((item) => !isJunkUrl(item.url))).slice(0, maxCount);
}
