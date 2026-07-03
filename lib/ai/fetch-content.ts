function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

export async function fetchPageContent(url: string, maxLength = 4000): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; FindOriginBot/1.0)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(8_000),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();
  const text = stripHtml(html);

  return text.slice(0, maxLength);
}

export async function fetchCandidatesContent(
  candidates: { url: string; title: string; snippet: string }[],
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  await Promise.allSettled(
    candidates.map(async (candidate) => {
      try {
        const content = await fetchPageContent(candidate.url);
        results.set(
          candidate.url,
          content || candidate.snippet,
        );
      } catch {
        results.set(candidate.url, candidate.snippet);
      }
    }),
  );

  return results;
}
