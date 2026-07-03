import { processUserMessage } from "@/lib/pipeline/process";
import type { TelegramUpdate } from "@/lib/types/telegram";
import { sendMessage } from "@/lib/telegram/client";
import { waitUntil } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";

const START_MESSAGE = `Привет! Я FindOrigin — помогаю найти источник информации.

Пришлите текст новости или ссылку на Telegram-пост (минимум 20 символов), и я попробую найти первоисточник.`;

function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return true;

  const header = request.headers.get("x-telegram-bot-api-secret-token");
  return header === secret;
}

export async function handleTelegramWebhook(request: NextRequest): Promise<NextResponse> {
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

  if (text === "/start") {
    waitUntil(
      sendMessage(chatId, START_MESSAGE).catch((err) =>
        console.error("Failed to send start message:", err),
      ),
    );
    return NextResponse.json({ ok: true });
  }

  waitUntil(
    (async () => {
      try {
        await sendMessage(chatId, "Ищу источники…");
        await processUserMessage(chatId, text);
      } catch (err) {
        console.error("Webhook processing failed:", err);
      }
    })(),
  );

  return NextResponse.json({ ok: true });
}

export function webhookStatusResponse() {
  return NextResponse.json({
    status: "FindOrigin webhook is running",
    endpoints: ["/api/webhook", "/api/telegram/webhook"],
  });
}
