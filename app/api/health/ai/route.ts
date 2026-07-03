import { getAIModel } from "@/lib/ai/errors";
import { getAIClient } from "@/lib/ai/client";
import { formatAIError } from "@/lib/ai/errors";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const configured = Boolean(
    process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  );

  if (!configured) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error: formatAIError(new Error("OPENROUTER_API_KEY or OPENAI_API_KEY is not configured")),
      },
      { status: 500 },
    );
  }

  try {
    const client = getAIClient();
    const response = await client.chat.completions.create({
      model: getAIModel(),
      messages: [{ role: "user", content: "Reply with OK" }],
      max_tokens: 5,
    });

    return NextResponse.json({
      ok: true,
      model: getAIModel(),
      provider: process.env.OPENROUTER_API_KEY ? "openrouter" : "openai",
      reply: response.choices[0]?.message?.content,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        model: getAIModel(),
        provider: process.env.OPENROUTER_API_KEY ? "openrouter" : "openai",
        error: formatAIError(error),
      },
      { status: 500 },
    );
  }
}
