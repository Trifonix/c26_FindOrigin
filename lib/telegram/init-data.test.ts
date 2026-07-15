import { createHmac } from "crypto";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { validateInitData } from "@/lib/telegram/init-data";

function signInitData(botToken: string, params: Record<string, string>): string {
  const search = new URLSearchParams(params);
  const pairs: string[] = [];

  for (const [key, value] of search.entries()) {
    if (key !== "hash") {
      pairs.push(`${key}=${value}`);
    }
  }

  const dataCheckString = pairs.sort().join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const hash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  search.set("hash", hash);
  return search.toString();
}

describe("validateInitData", () => {
  beforeEach(() => {
    vi.stubEnv("BOT_TOKEN", "test-bot-token");
  });

  it("validates correct init data", () => {
    const authDate = String(Math.floor(Date.now() / 1000));
    const initData = signInitData("test-bot-token", {
      auth_date: authDate,
      user: JSON.stringify({ id: 42, first_name: "Test" }),
    });

    const result = validateInitData(initData);
    expect(result.user?.id).toBe(42);
    expect(result.authDate).toBe(Number(authDate));
  });

  it("rejects invalid hash", () => {
    const initData = "auth_date=123&user=%7B%22id%22%3A1%7D&hash=bad";
    expect(() => validateInitData(initData)).toThrow(/hash mismatch/i);
  });
});
