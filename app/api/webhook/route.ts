import {
  handleTelegramWebhook,
  webhookStatusResponse,
} from "@/lib/telegram/webhook-handler";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  return handleTelegramWebhook(request);
}

export async function GET() {
  return webhookStatusResponse();
}
