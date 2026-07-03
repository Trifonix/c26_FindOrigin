export function getAIModel(): string {
  if (process.env.OPENROUTER_API_KEY || process.env.OPENAI_BASE_URL?.includes("openrouter")) {
    return "openai/gpt-4o-mini";
  }
  return "gpt-4o-mini";
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

  if (lower.includes("402") || lower.includes("insufficient credits")) {
    return [
      "Недостаточно кредитов на OpenRouter для AI-анализа.",
      "",
      "Варианты:",
      "1. Пополнить баланс: openrouter.ai/settings/credits",
      "2. Или использовать прямой OpenAI API:",
      "   — удалите OPENROUTER_API_KEY и OPENAI_BASE_URL на Vercel",
      "   — добавьте OPENAI_API_KEY от platform.openai.com",
      "   — Redeploy",
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
