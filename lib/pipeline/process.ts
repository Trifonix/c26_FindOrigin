import { extractEntities } from "@/lib/extractor/extract";
import { parseInput } from "@/lib/parser/input";
import { sendMessage } from "@/lib/telegram/client";
import type { ExtractedData, NormalizedInput } from "@/lib/types";

export interface ProcessResult {
  input: NormalizedInput;
  extracted: ExtractedData;
}

function formatExtractedPreview(extracted: ExtractedData): string {
  const lines: string[] = ["<b>Извлечённые данные:</b>", ""];

  lines.push(`<b>Резюме:</b> ${escapeHtml(extracted.summary)}`);
  lines.push("");

  if (extracted.claims.length > 0) {
    lines.push("<b>Ключевые утверждения:</b>");
    extracted.claims.forEach((claim, i) => {
      lines.push(`${i + 1}. ${escapeHtml(claim)}`);
    });
    lines.push("");
  }

  if (extracted.dates.length > 0) {
    lines.push(`<b>Даты:</b> ${extracted.dates.map(escapeHtml).join(", ")}`);
  }

  if (extracted.numbers.length > 0) {
    lines.push(`<b>Числа:</b> ${extracted.numbers.map(escapeHtml).join(", ")}`);
  }

  if (extracted.names.length > 0) {
    lines.push(`<b>Имена:</b> ${extracted.names.map(escapeHtml).join(", ")}`);
  }

  if (extracted.links.length > 0) {
    lines.push(`<b>Ссылки в тексте:</b> ${extracted.links.map(escapeHtml).join(", ")}`);
  }

  lines.push("");
  lines.push("<i>Поиск источников будет добавлен на следующем этапе.</i>");

  return lines.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function processUserMessage(chatId: number, rawText: string): Promise<void> {
  const parsed = await parseInput(rawText);

  if (!parsed.ok) {
    await sendMessage(chatId, parsed.error);
    return;
  }

  try {
    const extracted = await extractEntities(parsed.data.text);
    const preview = formatExtractedPreview(extracted);

    await sendMessage(chatId, preview, { parse_mode: "HTML" });

    console.log("Processed message", {
      chatId,
      inputType: parsed.data.type,
      claimsCount: extracted.claims.length,
    });
  } catch (error) {
    console.error("Processing failed:", error);
    const message =
      error instanceof Error ? error.message : "Произошла ошибка при обработке";
    await sendMessage(chatId, `Ошибка: ${message}`);
  }
}

export async function runPipeline(rawText: string): Promise<ProcessResult> {
  const parsed = await parseInput(rawText);

  if (!parsed.ok) {
    throw new Error(parsed.error);
  }

  const extracted = await extractEntities(parsed.data.text);

  return {
    input: parsed.data,
    extracted,
  };
}

export { formatExtractedPreview };
