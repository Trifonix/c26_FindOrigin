import { describe, expect, it } from "vitest";
import { extractJsonFromAIResponse, parseAIJson } from "@/lib/ai/parse-json";

describe("extractJsonFromAIResponse", () => {
  it("strips markdown code fence", () => {
    const raw = '```json\n{"sources": []}\n```';
    expect(extractJsonFromAIResponse(raw)).toBe('{"sources": []}');
  });

  it("extracts object from surrounding text", () => {
    const raw = 'Here is the result:\n{"ok": true}\nDone.';
    expect(parseAIJson<{ ok: boolean }>(raw)).toEqual({ ok: true });
  });
});
