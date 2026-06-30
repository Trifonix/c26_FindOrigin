import { describe, expect, it } from "vitest";
import {
  cleanText,
  isTelegramPostUrl,
  normalizeTelegramUrl,
  validateTextLength,
  MIN_TEXT_LENGTH,
} from "@/lib/parser/utils";

describe("isTelegramPostUrl", () => {
  it("recognizes t.me links", () => {
    expect(isTelegramPostUrl("https://t.me/channel/123")).toBe(true);
    expect(isTelegramPostUrl("t.me/channel/123")).toBe(true);
    expect(isTelegramPostUrl("https://telegram.me/s/channel/123")).toBe(true);
  });

  it("rejects plain text", () => {
    expect(isTelegramPostUrl("Это просто текст новости")).toBe(false);
  });
});

describe("cleanText", () => {
  it("normalizes whitespace", () => {
    expect(cleanText("  hello   world  ")).toBe("hello world");
    expect(cleanText("line1\n\n\n\nline2")).toBe("line1\n\nline2");
  });
});

describe("validateTextLength", () => {
  it("rejects short text", () => {
    expect(validateTextLength("короткий")).toMatch(/слишком короткий/i);
  });

  it("accepts long enough text", () => {
    const text = "а".repeat(MIN_TEXT_LENGTH);
    expect(validateTextLength(text)).toBeNull();
  });
});

describe("normalizeTelegramUrl", () => {
  it("adds https prefix", () => {
    expect(normalizeTelegramUrl("t.me/test/1")).toBe("https://t.me/test/1");
  });

  it("removes trailing slash", () => {
    expect(normalizeTelegramUrl("https://t.me/test/1/")).toBe("https://t.me/test/1");
  });
});
