const GOOGLE_ENABLE_URL =
  "https://console.cloud.google.com/apis/library/customsearch.googleapis.com";

export function formatSearchError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("search not configured") || lower.includes("serper_api_key")) {
    return [
      "Поиск не настроен.",
      "",
      "Google отключил «Поиск во всём интернете» в Programmable Search Engine.",
      "Используйте Serper — это Google-поиск через API:",
      "",
      "1. Зарегистрируйтесь на serper.dev",
      "2. Скопируйте API key",
      "3. Добавьте SERPER_API_KEY в Vercel Environment Variables",
      "4. Redeploy",
    ].join("\n");
  }

  if (
    lower.includes("does not have the access") ||
    lower.includes("access to custom search json api")
  ) {
    return [
      "Проект Google Cloud не имеет доступа к Custom Search JSON API.",
      "",
      "Проверьте по порядку:",
      "1. Проект «findallorigin» → APIs & Services → Library → «Custom Search API» → Enable",
      "2. Billing → привязать платёжный аккаунт к этому проекту",
      "3. API-ключ создан в том же проекте, где включён API",
      "4. Credentials → ключ → Application restrictions = None",
      "5. programmablesearchengine.google.com → FindOrigin → включить «Поиск во всём интернете»",
      "",
      "⚠️ Google отключил эту функцию для новых аккаунтов.",
      "Используйте Serper (serper.dev) — добавьте SERPER_API_KEY в Vercel.",
      "",
      `Ссылка: ${GOOGLE_ENABLE_URL}`,
    ].join("\n");
  }

  if (lower.includes("has not been used") || lower.includes("it is disabled")) {
    return [
      "Google Custom Search API не включён в вашем проекте Google Cloud.",
      "",
      "Что сделать:",
      "1. Откройте Google Cloud Console → APIs & Services → Library",
      "2. Найдите «Custom Search API» и нажмите Enable",
      "3. Подключите биллинг (Billing) — без него API не работает",
      "4. Подождите 2–5 минут и попробуйте снова",
      "",
      `Ссылка: ${GOOGLE_ENABLE_URL}`,
    ].join("\n");
  }

  if (lower.includes("blocked")) {
    return [
      "Google Search API заблокировал запросы.",
      "",
      "Частые причины:",
      "1. Custom Search API ещё не активирован или биллинг не подключён",
      "2. У API-ключа стоят ограничения «HTTP referrers» — для Vercel нужно «None»",
      "3. Ключ создан в другом проекте, не том где включён API",
      "",
      "Проверьте: APIs & Services → Credentials → ваш ключ → Application restrictions = None",
    ].join("\n");
  }

  if (lower.includes("api key not valid") || lower.includes("invalid api key")) {
    return "Неверный GOOGLE_API_KEY. Проверьте ключ в Vercel Environment Variables.";
  }

  if (lower.includes("invalid") && lower.includes("cx")) {
    return "Неверный GOOGLE_CSE_ID. Создайте поисковую машину на programmablesearchengine.google.com.";
  }

  if (lower.includes("quota") || lower.includes("rate limit")) {
    return "Превышена квота Google Search (бесплатно ~100 запросов/день). Попробуйте завтра или увеличьте лимит.";
  }

  if (lower.includes("not configured")) {
    return `Не задана переменная окружения: ${message}`;
  }

  return message;
}
