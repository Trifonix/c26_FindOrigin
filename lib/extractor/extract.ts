import OpenAI from "openai";
import { z } from "zod";
import type { ExtractedData } from "@/lib/types";

const extractedSchema = z.object({
  claims: z.array(z.string()).min(1).max(5),
  dates: z.array(z.string()),
  numbers: z.array(z.string()),
  names: z.array(z.string()),
  links: z.array(z.string()),
  summary: z.string(),
});

const SYSTEM_PROMPT = `You extract structured facts from news text or social media posts.
Return JSON with:
- claims: 1-5 key factual statements (not opinions)
- dates: any dates or time periods mentioned
- numbers: statistics, amounts, percentages
- names: people and organizations
- links: URLs already present in the text
- summary: one-sentence summary of the main topic

Respond in the same language as the input text.`;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

function extractLinksFromText(text: string): string[] {
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  return [...new Set(text.match(urlPattern) ?? [])];
}

export async function extractEntities(text: string): Promise<ExtractedData> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Extract structured data from this text:\n\n${text}`,
      },
    ],
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed = extractedSchema.parse(JSON.parse(content));
  const textLinks = extractLinksFromText(text);

  return {
    ...parsed,
    links: [...new Set([...parsed.links, ...textLinks])],
  };
}

export { extractedSchema };
