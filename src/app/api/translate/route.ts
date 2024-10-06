import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text, targetTranslateLanguage } = await req.json();

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("Google GenerativeAI API key is not set");
    }

    const model = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-flash-latest",
      maxOutputTokens: 8192,
      temperature: 0.2,
      apiKey: apiKey,
    });

    const template = `
      You are a professional translator. Please translate the following text into ${targetTranslateLanguage}:

      {text}

      Provide only the translated text without any additional comments or explanations.
    `;
    const prompt = PromptTemplate.fromTemplate(template);
    const chain = prompt.pipe(model);

    const result = await chain.invoke({ text: text });

    return NextResponse.json({ translatedText: result.content });
  } catch (error) {
    console.error("Error translating content:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to translate content",
      },
      { status: 500 }
    );
  }
}
