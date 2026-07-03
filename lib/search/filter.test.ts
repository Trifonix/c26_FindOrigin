import { describe, expect, it } from "vitest";
import { categorizeUrl, filterCandidates, isJunkUrl } from "@/lib/search/filter";

describe("isJunkUrl", () => {
  it("filters social media", () => {
    expect(isJunkUrl("https://t.me/channel/1")).toBe(true);
    expect(isJunkUrl("https://x.com/user/status/1")).toBe(true);
  });

  it("keeps news sites", () => {
    expect(isJunkUrl("https://www.reuters.com/article/1")).toBe(false);
  });
});

describe("categorizeUrl", () => {
  it("detects official domains", () => {
    expect(categorizeUrl("https://www.whitehouse.gov/news/1")).toBe("official");
  });

  it("detects research domains", () => {
    expect(categorizeUrl("https://arxiv.org/abs/1234")).toBe("research");
  });
});

describe("filterCandidates", () => {
  it("dedupes and limits results", () => {
    const items = [
      { url: "https://example.com/a", title: "A", snippet: "s", category: "other" as const },
      { url: "https://example.com/a/", title: "A dup", snippet: "s", category: "other" as const },
      { url: "https://t.me/post/1", title: "TG", snippet: "s", category: "other" as const },
      { url: "https://example.com/b", title: "B", snippet: "s", category: "other" as const },
    ];

    const filtered = filterCandidates(items, 10);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((i) => i.url)).toEqual([
      "https://example.com/a",
      "https://example.com/b",
    ]);
  });
});
