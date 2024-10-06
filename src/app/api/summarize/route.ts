import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LLMChain } from "langchain/chains";
import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function POST(req: Request) {
  const { inputType, inputValue, language } = await req.json();

  try {
    let text = "";

    if (inputType === "youtube") {
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(inputValue);
        text = transcript.map((item) => item.text).join(" ");
      } catch (error) {
        console.error("Error fetching YouTube transcript:", error);
        return NextResponse.json(
          { error: "Failed to fetch YouTube transcript" },
          { status: 400 }
        );
      }
    } else if (inputType === "article") {
      try {
        const loader = new CheerioWebBaseLoader(inputValue);
        const docs = await loader.load();
        text = docs.map((doc) => doc.pageContent).join("\n");
      } catch (error) {
        console.error("Error loading article content:", error);
        return NextResponse.json(
          { error: "Failed to load article content" },
          { status: 400 }
        );
      }
    } else {
      text = inputValue;
    }

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
      You possess expertise in extracting essential information, pinpointing fundamental ideas, condensing intricate content, recognizing important specifics, and simplifying comprehensive data from a Youtube video.
      You consistently ensure to thoroughly read and analyze all texts with great attention to detail.
      Please present information in a clear, organized, and structured manner.
      Use ${language} language to summarize.


      {text}
    `;
    const prompt = PromptTemplate.fromTemplate(template);
    const chain = new LLMChain({ llm: model, prompt });

    const result = await chain.call({ text: text });

    return NextResponse.json({ summary: result.text });
  } catch (error) {
    console.error("Error summarizing content:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to summarize content",
      },
      { status: 500 }
    );
  }
}
