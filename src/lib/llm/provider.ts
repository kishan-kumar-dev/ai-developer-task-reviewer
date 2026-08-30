import { GoogleGenerativeAI } from "@google/generative-ai";

export interface LLMCompleteInput {
  system?: string;
  user: string;
}

export interface LLMProvider {
  complete(input: LLMCompleteInput): Promise<string>;
}

class GeminiProvider implements LLMProvider {
  private readonly client: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured. Add GEMINI_API_KEY to .env.local.",
      );
    }

    this.client = new GoogleGenerativeAI(apiKey);

    this.modelName =
      process.env.GEMINI_MODEL || "gemini-2.5-flash";
  }

  async complete(input: LLMCompleteInput): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: input.system,
    });

    const result = await model.generateContent(input.user);

    return result.response.text();
  }
}

export function createLLMProvider(): LLMProvider {
  return new GeminiProvider();
}