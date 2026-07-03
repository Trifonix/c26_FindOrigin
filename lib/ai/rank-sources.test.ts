import { describe, expect, it } from "vitest";
import { rankingSchema } from "@/lib/ai/rank-sources";

describe("rankingSchema", () => {
  it("validates ranked sources", () => {
    const data = {
      sources: [
        {
          url: "https://example.com",
          confidence: 85,
          reasoning: "Оригинальная публикация",
        },
      ],
      noReliableSource: false,
    };

    expect(rankingSchema.safeParse(data).success).toBe(true);
  });

  it("rejects invalid confidence", () => {
    const data = {
      sources: [{ url: "https://example.com", confidence: 150, reasoning: "x" }],
    };

    expect(rankingSchema.safeParse(data).success).toBe(false);
  });
});
