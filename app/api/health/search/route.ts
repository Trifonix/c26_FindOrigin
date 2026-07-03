import { getGoogleConfig, googleSearch } from "@/lib/search/google";
import { formatSearchError } from "@/lib/search/errors";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    getGoogleConfig();
    const results = await googleSearch("test query", 1);

    return NextResponse.json({
      ok: true,
      message: "Google Custom Search API работает",
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
