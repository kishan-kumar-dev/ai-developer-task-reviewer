import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({
  apiKey,
});

async function main() {
  try {
    console.log("Testing Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Reply with exactly: Gemini test successful",
    });

    console.log("SUCCESS:");
    console.log(response.text);
  } catch (error) {
    console.error("GEMINI TEST FAILED:");
    console.error(error);
  }
}

main();
