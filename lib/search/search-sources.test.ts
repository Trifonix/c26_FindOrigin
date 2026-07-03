import { describe, expect, it, vi, beforeEach } from "vitest";
import { resolveProvider } from "@/lib/search/search-sources";

describe("resolveProvider", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers serper when SERPER_API_KEY is set", () => {
    vi.stubEnv("SERPER_API_KEY", "test-key");
    vi.stubEnv("GOOGLE_API_KEY", "google-key");
    vi.stubEnv("GOOGLE_CSE_ID", "cx-id");

    expect(resolveProvider()).toBe("serper");
  });

  it("falls back to google when only google keys are set", () => {
    vi.stubEnv("SERPER_API_KEY", "");
    vi.stubEnv("GOOGLE_API_KEY", "google-key");
    vi.stubEnv("GOOGLE_CSE_ID", "cx-id");

    expect(resolveProvider()).toBe("google");
  });
});
