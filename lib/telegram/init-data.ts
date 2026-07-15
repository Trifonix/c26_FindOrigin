import { createHmac } from "crypto";

export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface ValidatedInitData {
  user?: TelegramWebAppUser;
  authDate: number;
  queryId?: string;
}

function getBotToken(): string {
  const token = process.env.BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("BOT_TOKEN is not configured");
  }
  return token;
}

function buildDataCheckString(params: URLSearchParams): string {
  const pairs: string[] = [];

  for (const [key, value] of params.entries()) {
    if (key !== "hash") {
      pairs.push(`${key}=${value}`);
    }
  }

  return pairs.sort().join("\n");
}

export function validateInitData(initData: string): ValidatedInitData {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");

  if (!hash) {
    throw new Error("Invalid init data: missing hash");
  }

  const dataCheckString = buildDataCheckString(params);
  const secretKey = createHmac("sha256", "WebAppData").update(getBotToken()).digest();
  const calculatedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash !== hash) {
    throw new Error("Invalid init data: hash mismatch");
  }

  const authDate = Number(params.get("auth_date"));
  if (!authDate) {
    throw new Error("Invalid init data: missing auth_date");
  }

  const maxAgeSec = Number(process.env.TMA_INIT_DATA_MAX_AGE_SEC ?? 86400);
  if (Date.now() / 1000 - authDate > maxAgeSec) {
    throw new Error("Init data expired");
  }

  const userRaw = params.get("user");
  let user: TelegramWebAppUser | undefined;

  if (userRaw) {
    user = JSON.parse(userRaw) as TelegramWebAppUser;
  }

  return {
    user,
    authDate,
    queryId: params.get("query_id") ?? undefined,
  };
}

export function isInitDataValidationSkipped(): boolean {
  return process.env.NODE_ENV === "development" && process.env.SKIP_TMA_AUTH === "true";
}
