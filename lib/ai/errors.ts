// Auto-picks an available free model; survives when specific :free slugs are removed
const DEFAULT_OPENROUTER_MODEL = "openrouter/free";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

export function getAIModel(): string {
  if (process.env.AI_MODEL) {
    return process.env.AI_MODEL;
  }

  if (process.env.OPENROUTER_API_KEY || process.env.OPENAI_BASE_URL?.includes("openrouter")) {
    return DEFAULT_OPENROUTER_MODEL;
  }

  return DEFAULT_OPENAI_MODEL;
}

export function formatAIError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("insufficient_quota") || lower.includes("exceeded your current quota")) {
    return [
      "На OpenAI API нет доступных средств.",
      "",
      "⚠️ Бесплатный ChatGPT (3 фото/день) — это НЕ API.",
      "API и ChatGPT — разные продукты с отдельной оплатой.",
      "",
      "Что сделать:",
      "1. platform.openai.com → Settings → Billing → добавить карту",
      "2. Или вернуть OpenRouter с пополненным балансом",
    ].join("\n");
  }

  if (lower.includes("429") || lower.includes("rate limit") || lower.includes("rate_limit")) {
    return [
      "Превышен лимит запросов к OpenAI API.",
      "",
      "Подождите 1–2 минуты и попробуйте снова.",
      "Если повторяется — проверьте биллинг на platform.openai.com",
    ].join("\n");
  }

  if (lower.includes("unexpected token") || lower.includes("is not valid json")) {
    return "AI вернул некорректный JSON. Попробуйте отправить запрос ещё раз.";
  }

  if (lower.includes("no endpoints found") || (lower.includes("404") && lower.includes("endpoint"))) {
    return [
      "Модель AI недоступна на OpenRouter (404).",
      "",
      "Бесплатные модели часто меняются. На Vercel установите:",
      "AI_MODEL=openrouter/free",
      "",
      "Это роутер — сам выбирает доступную бесплатную модель.",
      "Список: openrouter.ai/models?q=free",
    ].join("\n");
  }

  if (lower.includes("402") || lower.includes("insufficient credits")) {
    return [
      "Недостаточно кредитов на OpenRouter.",
      "",
      "Платные модели (openai/gpt-4o-mini) требуют баланс.",
      "Бесплатный вариант — на Vercel:",
      "AI_MODEL=openrouter/free",
      "",
      "Или пополните баланс: openrouter.ai/settings/credits",
    ].join("\n");
  }

  if (lower.includes("401") || lower.includes("invalid api key") || lower.includes("incorrect api key")) {
    return "Неверный API-ключ для AI. Проверьте OPENAI_API_KEY на Vercel (platform.openai.com/api-keys).";
  }

  if (lower.includes("not configured")) {
    return "AI не настроен. Добавьте OPENAI_API_KEY или OPENROUTER_API_KEY в Vercel.";
  }

  return message;
}
