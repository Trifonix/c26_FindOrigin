import { formatSearchError } from "@/lib/search/errors";
import { getSearchProviderInfo, runSearch } from "@/lib/search/search-sources";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { provider } = getSearchProviderInfo();
    const results = await runSearch("test query", 1);

    return NextResponse.json({
      ok: true,
      provider,
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
        error: formatSearchError(error),
      },
      { status: 500 },
    );
  }
}
