import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey,
});

const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

export class GeminiRateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds = 60) {
    super(message);
    this.name = "GeminiRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function extractRetrySeconds(message: string): number {
  const match = message.match(/retryDelay["':\s]+["']?(\d+)s/i);

  if (match) {
    return Number(match[1]);
  }

  const secondsMatch = message.match(/retry in\s+([\d.]+)s/i);

  if (secondsMatch) {
    return Math.ceil(Number(secondsMatch[1]));
  }

  return 60;
}

export async function askAI(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      },
    });

    return response.text || "";
  } catch (error: unknown) {
    console.error("Gemini API error:", error);

    const message = error instanceof Error ? error.message : String(error);

    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number((error as { status?: unknown }).status)
        : undefined;

    const lowerMessage = message.toLowerCase();

    if (
      status === 429 ||
      message.includes("429") ||
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("quota") ||
      lowerMessage.includes("resource_exhausted")
    ) {
      const retryAfterSeconds = extractRetrySeconds(message);

      throw new GeminiRateLimitError(
        "Gemini API rate limit or quota exceeded. Please try again later.",
        retryAfterSeconds,
      );
    }

    throw error;
  }
}
