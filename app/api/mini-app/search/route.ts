import { formatAIError } from "@/lib/ai/errors";
import { runPipeline } from "@/lib/pipeline/process";
import { formatSearchError } from "@/lib/search/errors";
import { isInitDataValidationSkipped, validateInitData } from "@/lib/telegram/init-data";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  text: z.string().min(1),
});

function formatError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const aiMsg = formatAIError(error);
  const searchMsg = formatSearchError(error);
  return aiMsg !== raw ? aiMsg : searchMsg !== raw ? searchMsg : raw;
}

export async function POST(request: NextRequest) {
  const initData = request.headers.get("x-telegram-init-data");

  if (!isInitDataValidationSkipped()) {
    if (!initData) {
      return NextResponse.json({ ok: false, error: "Откройте приложение из Telegram" }, { status: 401 });
    }

    try {
      validateInitData(initData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unauthorized";
      return NextResponse.json({ ok: false, error: message }, { status: 401 });
    }
  }

  let body: z.infer<typeof requestSchema>;

  try {
    body = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный запрос" }, { status: 400 });
  }

  try {
    const result = await runPipeline(body.text.trim());

    return NextResponse.json({
      ok: true,
      query: result.input.text,
      inputType: result.input.type,
      sourceUrl: result.input.sourceUrl,
      sources: result.sources,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: formatError(error) }, { status: 500 });
  }
}
