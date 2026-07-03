import { formatSearchError } from "@/lib/search/errors";
import { getSearchProviderInfo, resolveProvider, runSearch } from "@/lib/search/search-sources";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getEnvStatus() {
  return {
    serperConfigured: Boolean(process.env.SERPER_API_KEY),
    googleConfigured: Boolean(
      (process.env.GOOGLE_API_KEY ?? process.env.GOOGLE_SEARCH_API_KEY) &&
        process.env.GOOGLE_CSE_ID,
    ),
    activeProvider: (() => {
      try {
        return resolveProvider();
      } catch {
        return null;
      }
    })(),
  };
}

export async function GET() {
  const envStatus = getEnvStatus();

  if (!envStatus.serperConfigured && !envStatus.googleConfigured) {
    return NextResponse.json(
      {
        ok: false,
        ...envStatus,
        hint: "Добавьте SERPER_API_KEY в Vercel → Settings → Environment Variables (не в локальный .env)",
        error: formatSearchError(new Error("Search not configured")),
      },
      { status: 500 },
    );
  }

  if (!envStatus.serperConfigured && envStatus.googleConfigured) {
    return NextResponse.json(
      {
        ok: false,
        ...envStatus,
        hint:
          "SERPER_API_KEY не найден на Vercel. Локальный .env не деплоится — добавьте ключ в Vercel Dashboard и сделайте Redeploy.",
        error: formatSearchError(
          new Error("This project does not have the access to Custom Search JSON API."),
        ),
      },
      { status: 500 },
    );
  }

  try {
    const { provider } = getSearchProviderInfo();
    const results = await runSearch("test query", 1);

    return NextResponse.json({
      ok: true,
      provider,
      ...envStatus,
      message:
        provider === "serper"
          ? "Serper (Google Search) работает"
          : "Google Custom Search API работает",
      sampleResults: results.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        ...envStatus,
        error: formatSearchError(error),
      },
      { status: 500 },
    );
  }
}
