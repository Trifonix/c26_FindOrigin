import { describe, expect, it, vi, beforeEach } from "vitest";
import { parseInput } from "@/lib/parser/input";

describe("parseInput", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts plain text with sufficient length", async () => {
    const text =
      "По данным Reuters, инфляция в еврозоне в марте 2024 года составила 2,4 процента.";

    const result = await parseInput(text);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.type).toBe("text");
      expect(result.data.text).toContain("инфляция");
    }
  });

  it("rejects empty input", async () => {
    const result = await parseInput("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/пустое/i);
    }
  });

  it("rejects too short text", async () => {
    const result = await parseInput("коротко");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/короткий/i);
    }
  });

  it("extracts text from telegram post HTML", async () => {
    const html = `
      <html>
        <head>
          <meta property="og:description" content="Центробанк повысил ключевую ставку до 16 процентов годовых." />
        </head>
      </html>
    `;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => html,
      }),
    );

    const result = await parseInput("https://t.me/centralbank/42");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.type).toBe("telegram_link");
      expect(result.data.text).toContain("16 процентов");
      expect(result.data.sourceUrl).toBe("https://t.me/centralbank/42");
    }
  });

  it("returns error when telegram post is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    const result = await parseInput("https://t.me/private/1");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/не удалось/i);
    }
  });
});
