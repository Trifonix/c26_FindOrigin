import { describe, expect, it } from "vitest";
import { formatSearchError } from "@/lib/search/errors";

describe("formatSearchError", () => {
  it("explains missing API access", () => {
    const msg = formatSearchError(
      new Error("This project does not have the access to Custom Search JSON API."),
    );
    expect(msg).toContain("не имеет доступа");
    expect(msg).toContain("Поиск во всём интернете");
  });

  it("explains disabled API", () => {
    const msg = formatSearchError(
      new Error("Custom Search API has not been used in project before or it is disabled"),
    );
    expect(msg).toContain("не включён");
    expect(msg).toContain("Custom Search API");
  });

  it("explains blocked requests", () => {
    const msg = formatSearchError(
      new Error("Requests to this API customsearch method are blocked"),
    );
    expect(msg).toContain("заблокировал");
    expect(msg).toContain("None");
  });
});
