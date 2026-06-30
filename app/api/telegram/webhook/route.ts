import { processUserMessage } from "@/lib/pipeline/process";
import type { TelegramUpdate } from "@/lib/types/telegram";
import { sendMessage } from "@/lib/telegram/client";
import { waitUntil } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return true;

  const header = request.headers.get("x-telegram-bot-api-secret-token");
  return header === secret;
}

export async function POST(request: NextRequest) {
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let update: TelegramUpdate;

  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = update.message;
  const chatId = message?.chat?.id;
  const text = message?.text?.trim();

  if (!chatId || !text) {
    return NextResponse.json({ ok: true });
  }

  // Quick ack — don't block webhook
  sendMessage(chatId, "Ищу источники…").catch((err) =>
    console.error("Failed to send ack:", err),
  );

  waitUntil(
    processUserMessage(chatId, text).catch((err) =>
      console.error("Background processing failed:", err),
    ),
  );

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    status: "FindOrigin webhook is running",
    endpoint: "/api/telegram/webhook",
  });
}
