import { getWebhookInfo, setChatMenuButton, setWebhook } from "@/lib/telegram/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const setupSecret = process.env.SETUP_SECRET;

  if (setupSecret && authHeader !== `Bearer ${setupSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = request.nextUrl.origin;
  const webhookUrl =
    process.env.WEBHOOK_URL ?? `${origin}/api/webhook`;
  const webAppUrl =
    process.env.WEBAPP_URL ?? `${origin}/mini-app`;

  try {
    const result = await setWebhook(webhookUrl, process.env.TELEGRAM_WEBHOOK_SECRET);
    const menuResult = await setChatMenuButton(webAppUrl);
    const info = await getWebhookInfo();

    return NextResponse.json({
      ok: true,
      webhookUrl,
      webAppUrl,
      setWebhook: result,
      setChatMenuButton: menuResult,
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
