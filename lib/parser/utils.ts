const TELEGRAM_LINK_PATTERN =
  /^(?:https?:\/\/)?(?:t\.me|telegram\.me|telegram\.dog)\/[\w+/\-?=&%]+$/i;

const MIN_TEXT_LENGTH = 20;

export function isTelegramPostUrl(input: string): boolean {
  const trimmed = input.trim();
  return TELEGRAM_LINK_PATTERN.test(trimmed);
}

export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export function validateTextLength(text: string): string | null {
  if (text.length < MIN_TEXT_LENGTH) {
    return `Текст слишком короткий (минимум ${MIN_TEXT_LENGTH} символов). Пришлите больше контекста — новость, цитату или описание.`;
  }
  return null;
}

export function normalizeTelegramUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith("http")) {
    normalized = `https://${normalized}`;
  }
  return normalized.replace(/\/$/, "");
}

export { MIN_TEXT_LENGTH, TELEGRAM_LINK_PATTERN };
