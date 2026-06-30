import { describe, expect, it } from "vitest";
import { extractedSchema } from "@/lib/extractor/extract";

describe("extractedSchema", () => {
  it("validates a typical news extraction", () => {
    const data = {
      claims: [
        "Инфляция в еврозоне составила 2,4% в марте 2024",
        "ЕЦБ сохранил ставку без изменений",
      ],
      dates: ["март 2024"],
      numbers: ["2,4%", "4,5%"],
      names: ["ЕЦБ", "Reuters"],
      links: ["https://example.com/news"],
      summary: "Еврозона: инфляция снизилась, ЕЦБ сохранил ставку",
    };

    const result = extractedSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects empty claims", () => {
    const data = {
      claims: [],
      dates: [],
      numbers: [],
      names: [],
      links: [],
      summary: "test",
    };

    const result = extractedSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects more than 5 claims", () => {
    const data = {
      claims: ["1", "2", "3", "4", "5", "6"],
      dates: [],
      numbers: [],
      names: [],
      links: [],
      summary: "test",
    };

    const result = extractedSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
