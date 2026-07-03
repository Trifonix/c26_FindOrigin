export function getAIModel(): string {
  if (process.env.OPENROUTER_API_KEY || process.env.OPENAI_BASE_URL?.includes("openrouter")) {
    return "openai/gpt-4o-mini";
  }
  return "gpt-4o-mini";
}

export function formatAIError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

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
    return "Неверный API-ключ для AI. Проверьте OPENROUTER_API_KEY или OPENAI_API_KEY на Vercel.";
  }

  if (lower.includes("429") || lower.includes("rate limit")) {
    return "Превышен лимит запросов к AI. Подождите минуту и попробуйте снова.";
  }

  if (lower.includes("not configured")) {
    return "AI не настроен. Добавьте OPENROUTER_API_KEY или OPENAI_API_KEY в Vercel.";
  }

  return message;
}
