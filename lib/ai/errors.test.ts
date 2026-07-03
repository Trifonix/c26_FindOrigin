import { describe, expect, it } from "vitest";
import { formatAIError } from "@/lib/ai/errors";

describe("formatAIError", () => {
  it("explains OpenAI quota vs ChatGPT", () => {
    const msg = formatAIError(new Error("429 You exceeded your current quota, please check your plan and billing details."));
    expect(msg).toContain("ChatGPT");
    expect(msg).toContain("Billing");
  });

  it("explains OpenRouter insufficient credits", () => {
    const msg = formatAIError(
      new Error("402 Insufficient credits. This account never purchased credits."),
    );
    expect(msg).toContain("кредитов");
    expect(msg).toContain("openrouter.ai/settings/credits");
  });
});
