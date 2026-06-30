import {
  cleanText,
  isTelegramPostUrl,
  normalizeTelegramUrl,
  validateTextLength,
} from "@/lib/parser/utils";
import type { ParseInputResult } from "@/lib/types";

function extractOgContent(html: string): string | null {
  const ogDescription = html.match(
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
  );
  if (ogDescription?.[1]) {
    return decodeHtmlEntities(ogDescription[1]);
  }

  const metaDescription = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
  );
  if (metaDescription?.[1]) {
    return decodeHtmlEntities(metaDescription[1]);
  }

  const messageText = html.match(
    /<div[^>]+class=["'][^"']*tgme_widget_message_text[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  );
  if (messageText?.[1]) {
    return stripHtmlTags(messageText[1]);
  }

  return null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtmlTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim());
}

export async function fetchTelegramPostText(url: string): Promise<string> {
  const normalizedUrl = normalizeTelegramUrl(url);

  const response = await fetch(normalizedUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; FindOriginBot/1.0; +https://github.com/findorigin)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Не удалось загрузить пост (${response.status})`);
  }

  const html = await response.text();
  const text = extractOgContent(html);

  if (!text) {
    throw new Error(
      "Не удалось извлечь текст из поста. Возможно, канал приватный — скопируйте текст вручную.",
    );
  }

  return cleanText(text);
}

export async function parseInput(rawInput: string): Promise<ParseInputResult> {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return { ok: false, error: "Пустое сообщение. Пришлите текст или ссылку на Telegram-пост." };
  }

  if (isTelegramPostUrl(trimmed)) {
    try {
      const text = await fetchTelegramPostText(trimmed);
      const lengthError = validateTextLength(text);

      if (lengthError) {
        return { ok: false, error: lengthError };
      }

      return {
        ok: true,
        data: {
          type: "telegram_link",
          text,
          sourceUrl: normalizeTelegramUrl(trimmed),
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Неизвестная ошибка";
      return { ok: false, error: message };
    }
  }

  const text = cleanText(trimmed);
  const lengthError = validateTextLength(text);

  if (lengthError) {
    return { ok: false, error: lengthError };
  }

  return {
    ok: true,
    data: {
      type: "text",
      text,
    },
  };
}
