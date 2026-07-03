import type { RankedSource } from "@/lib/types/search";

const TELEGRAM_MAX_LENGTH = 4096;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function confidenceLabel(confidence: number): string {
  if (confidence >= 75) return "высокая";
  if (confidence >= 55) return "средняя";
  return "низкая";
}

export function formatSourcesResponse(
  summaryHint: string,
  sources: RankedSource[],
): string {
  const lines: string[] = [];

  if (summaryHint) {
    lines.push(`<b>Запрос:</b> ${escapeHtml(summaryHint.slice(0, 200))}${summaryHint.length > 200 ? "…" : ""}`);
    lines.push("");
  }

  if (sources.length === 0) {
    lines.push("Надёжный источник не найден. Попробуйте добавить больше контекста или уточнить формулировку.");
    return lines.join("\n");
  }

  lines.push("<b>Возможные источники:</b>");
  lines.push("");

  sources.forEach((source, index) => {
    lines.push(
      `${index + 1}. <a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a>`,
    );
    lines.push(
      `   Уверенность: ${source.confidence}% (${confidenceLabel(source.confidence)})`,
    );
    lines.push(`   ${escapeHtml(source.reasoning)}`);
    lines.push("");
  });

  return lines.join("\n").trim();
}

export function splitMessage(text: string, maxLength = TELEGRAM_MAX_LENGTH): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    parts.push(remaining.slice(0, maxLength));
    remaining = remaining.slice(maxLength);
  }

  return parts;
}
