import { formatAIError } from "@/lib/ai/errors";
import { rankSources } from "@/lib/ai/rank-sources";
import { parseInput } from "@/lib/parser/input";
import { formatSourcesResponse, splitMessage } from "@/lib/pipeline/format-response";
import { formatSearchError } from "@/lib/search/errors";
import { searchSources } from "@/lib/search";
import { sendMessage } from "@/lib/telegram/client";
import type { NormalizedInput } from "@/lib/types";
import type { RankedSource } from "@/lib/types/search";

export interface ProcessResult {
  input: NormalizedInput;
  sources: RankedSource[];
}

export async function processUserMessage(chatId: number, rawText: string): Promise<void> {
  const parsed = await parseInput(rawText);

  if (!parsed.ok) {
    await sendMessage(chatId, parsed.error);
    return;
  }

  try {
    const { candidates } = await searchSources(parsed.data.text);

    if (candidates.length === 0) {
      await sendMessage(
        chatId,
        "Поиск не дал результатов. Попробуйте переформулировать запрос или добавить детали.",
      );
      return;
    }

    const sources = await rankSources(parsed.data.text, candidates);
    const message = formatSourcesResponse(parsed.data.text, sources);
    const parts = splitMessage(message);

    for (const part of parts) {
      await sendMessage(chatId, part, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    }

    console.log("Processed message", {
      chatId,
      inputType: parsed.data.type,
      candidates: candidates.length,
      sourcesFound: sources.length,
    });
  } catch (error) {
    console.error("Processing failed:", error);
    const raw = error instanceof Error ? error.message : String(error);
    const searchMsg = formatSearchError(error);
    const aiMsg = formatAIError(error);
    const message = searchMsg !== raw ? searchMsg : aiMsg !== raw ? aiMsg : raw;
    await sendMessage(chatId, message, { disable_web_page_preview: true });
  }
}

export async function runPipeline(rawText: string): Promise<ProcessResult> {
  const parsed = await parseInput(rawText);

  if (!parsed.ok) {
    throw new Error(parsed.error);
  }

  const { candidates } = await searchSources(parsed.data.text);
  const sources = await rankSources(parsed.data.text, candidates);

  return {
    input: parsed.data,
    sources,
  };
}
