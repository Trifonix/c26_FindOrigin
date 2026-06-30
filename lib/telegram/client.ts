import type { SendMessageOptions } from "@/lib/types/telegram";

const TELEGRAM_API = "https://api.telegram.org";

function getBotToken(): string {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    throw new Error("BOT_TOKEN is not configured");
  }
  return token;
}

export async function sendMessage(
  chatId: number,
  text: string,
  options: SendMessageOptions = {},
): Promise<void> {
  const token = getBotToken();
  const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...options,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Telegram sendMessage failed:", response.status, body);
    throw new Error(`Telegram API error: ${response.status}`);
  }
}

export async function setWebhook(url: string, secretToken?: string): Promise<unknown> {
  const token = getBotToken();
  const payload: Record<string, string> = { url };

  if (secretToken) {
    payload.secret_token = secretToken;
  }

  const response = await fetch(`${TELEGRAM_API}/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(`setWebhook failed: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function getWebhookInfo(): Promise<unknown> {
  const token = getBotToken();
  const response = await fetch(`${TELEGRAM_API}/bot${token}/getWebhookInfo`);
  return response.json();
}
