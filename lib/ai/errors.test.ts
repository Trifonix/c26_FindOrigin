import { describe, expect, it } from "vitest";
import { formatAIError } from "@/lib/ai/errors";

describe("formatAIError", () => {
  it("explains OpenAI quota vs ChatGPT", () => {
    const msg = formatAIError(new Error("429 You exceeded your current quota, please check your plan and billing details."));
    expect(msg).toContain("ChatGPT");
    expect(msg).toContain("Billing");
  });

  it("explains unavailable free model", () => {
    const msg = formatAIError(
      new Error("404 No endpoints found for google/gemma-2-9b-it:free."),
    );
    expect(msg).toContain("openrouter/free");
  });
});
