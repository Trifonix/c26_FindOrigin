import OpenAI from "openai";
import { getAIModel } from "@/lib/ai/errors";

export const AI_MODEL = getAIModel();

export function getAIClient(): OpenAI {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;

  if (openRouterKey) {
    return new OpenAI({
      apiKey: openRouterKey,
      baseURL: baseURL ?? "https://openrouter.ai/api/v1",
    });
  }

  if (openaiKey) {
    return new OpenAI({
      apiKey: openaiKey,
      ...(baseURL ? { baseURL } : {}),
    });
  }

  throw new Error("OPENROUTER_API_KEY or OPENAI_API_KEY is not configured");
}
