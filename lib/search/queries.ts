export function buildSearchQueries(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  const queries = new Set<string>();

  if (normalized.length <= 120) {
    queries.add(normalized);
  } else {
    queries.add(normalized.slice(0, 120));

    const firstSentence = normalized.match(/[^.!?]+[.!?]/)?.[0]?.trim();
    if (firstSentence && firstSentence.length >= 30 && firstSentence.length <= 150) {
      queries.add(firstSentence);
    }

    const words = normalized.split(" ");
    if (words.length > 8) {
      queries.add(words.slice(0, 10).join(" "));
    }
  }

  return [...queries].slice(0, 1);
}
