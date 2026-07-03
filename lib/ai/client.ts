import OpenAI from "openai";

export const AI_MODEL = "openai/gpt-4o-mini";

export function getAIClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY or OPENAI_API_KEY is not configured");
  }

  const baseURL = process.env.OPENAI_BASE_URL;

  return new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });
}
