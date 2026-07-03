import { getWebhookInfo, setWebhook } from "@/lib/telegram/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const setupSecret = process.env.SETUP_SECRET;

  if (setupSecret && authHeader !== `Bearer ${setupSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webhookUrl =
    process.env.WEBHOOK_URL ?? `${request.nextUrl.origin}/api/webhook`;

  try {
    const result = await setWebhook(webhookUrl, process.env.TELEGRAM_WEBHOOK_SECRET);
    const info = await getWebhookInfo();

    return NextResponse.json({
      ok: true,
      webhookUrl,
      setWebhook: result,
      webhookInfo: info,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const info = await getWebhookInfo();
    return NextResponse.json(info);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
