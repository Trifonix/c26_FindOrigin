import { z } from "zod";
import { getAIClient } from "@/lib/ai/client";
import { getAIModel } from "@/lib/ai/errors";
import { fetchCandidatesContent } from "@/lib/ai/fetch-content";
import { parseAIJson } from "@/lib/ai/parse-json";
import type { RankedSource, SearchCandidate } from "@/lib/types/search";

const rankingSchema = z.object({
  sources: z
    .array(
      z.object({
        url: z.string(),
        confidence: z.number().min(0).max(100),
        reasoning: z.string(),
      }),
    )
    .max(3),
  noReliableSource: z.boolean().optional(),
});

const SYSTEM_PROMPT = `You find original sources of information.
Compare the MEANING of the user's text with candidate pages — not literal word match.
Pick 1-3 best sources that likely originated or first published this information.
Assign confidence 0-100 for each.
Respond in the same language as the user's text.
Return ONLY valid JSON, no markdown, no code fences.
Return JSON: { "sources": [{ "url", "confidence", "reasoning" }], "noReliableSource": boolean }
If none are reliable (confidence below 40), set noReliableSource to true and return empty sources.`;

export async function rankSources(
  userText: string,
  candidates: SearchCandidate[],
): Promise<RankedSource[]> {
  if (candidates.length === 0) {
    return [];
  }

  const contents = await fetchCandidatesContent(candidates);
  const client = getAIClient();

  const candidateList = candidates
    .map((c, i) => {
      const content = contents.get(c.url) ?? c.snippet;
      return `[${i + 1}] URL: ${c.url}
Title: ${c.title}
Snippet: ${c.snippet}
Content excerpt: ${content.slice(0, 1500)}`;
    })
    .join("\n\n");

  const response = await client.chat.completions.create({
    model: getAIModel(),
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `User text:\n${userText}\n\nCandidates:\n${candidateList}`,
      },
    ],
    temperature: 0.2,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty AI ranking response");
  }

  const parsed = rankingSchema.parse(parseAIJson(raw));

  if (parsed.noReliableSource || parsed.sources.length === 0) {
    return [];
  }

  const titleByUrl = new Map(candidates.map((c) => [c.url, c.title]));

  return parsed.sources
    .filter((s) => s.confidence >= 40)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)
    .map((s) => ({
      url: s.url,
      title: titleByUrl.get(s.url) ?? s.url,
      confidence: s.confidence,
      reasoning: s.reasoning,
    }));
}

export { rankingSchema };
