import { describe, expect, it } from "vitest";
import { formatSourcesResponse } from "@/lib/pipeline/format-response";

describe("formatSourcesResponse", () => {
  it("formats found sources", () => {
    const message = formatSourcesResponse("Тестовый запрос", [
      {
        url: "https://example.com/news",
        title: "Example News",
        confidence: 82,
        reasoning: "Первоисточник публикации.",
      },
    ]);

    expect(message).toContain("Example News");
    expect(message).toContain("82%");
    expect(message).toContain("высокая");
  });

  it("handles no sources", () => {
    const message = formatSourcesResponse("Запрос", []);
    expect(message).toContain("не найден");
  });
});
