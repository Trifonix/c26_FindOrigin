import { describe, expect, it } from "vitest";
import { buildSearchQueries } from "@/lib/search/queries";

describe("buildSearchQueries", () => {
  it("uses full text when short", () => {
    const text = "Центробанк повысил ключевую ставку до 16 процентов.";
    expect(buildSearchQueries(text)).toEqual([text]);
  });

  it("creates multiple queries for long text", () => {
    const text =
      "По данным Reuters, инфляция в еврозоне в марте 2024 года составила 2,4 процента, что ниже прогнозов аналитиков. Европейский центральный банк сохранил ставку без изменений на заседании в четверг.";

    const queries = buildSearchQueries(text);
    expect(queries.length).toBeGreaterThanOrEqual(2);
    expect(queries[0].length).toBeLessThanOrEqual(120);
  });
});
