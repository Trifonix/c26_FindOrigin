export interface ExtractedData {
  claims: string[];
  dates: string[];
  numbers: string[];
  names: string[];
  links: string[];
  summary: string;
}

export type InputType = "text" | "telegram_link";

export interface NormalizedInput {
  type: InputType;
  text: string;
  sourceUrl?: string;
}

export interface ParseResult {
  ok: true;
  data: NormalizedInput;
}

export interface ParseError {
  ok: false;
  error: string;
}

export type ParseInputResult = ParseResult | ParseError;
