/**
 * Free OpenRouter models often wrap JSON in ```json fences despite response_format.
 */
export function extractJsonFromAIResponse(raw: string): string {
  const trimmed = raw.trim();

  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const inlineFence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (inlineFence?.[1]) {
    return inlineFence[1].trim();
  }

  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd > objectStart) {
    return trimmed.slice(objectStart, objectEnd + 1);
  }

  return trimmed;
}

export function parseAIJson<T>(raw: string): T {
  const jsonText = extractJsonFromAIResponse(raw);
  return JSON.parse(jsonText) as T;
}
