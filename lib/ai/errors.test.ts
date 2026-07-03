import { describe, expect, it } from "vitest";
import { formatAIError } from "@/lib/ai/errors";

describe("formatAIError", () => {
  it("explains OpenRouter insufficient credits", () => {
    const msg = formatAIError(
      new Error("402 Insufficient credits. This account never purchased credits."),
    );
    expect(msg).toContain("кредитов");
    expect(msg).toContain("openrouter.ai/settings/credits");
  });
});
