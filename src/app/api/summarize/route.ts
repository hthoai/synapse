import { LLM_CONFIG } from "@/config/llm-config";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";

const LANGUAGES = [
  "en",
  "en-US",
  "en-UK",
  "en-GB",
  "vi",
  "ja",
  "ko",
  "zh-Hans",
  "zh-Hant",
];

async function loadYoutubeTranscript(url: string) {
  for (const language of LANGUAGES) {
    try {
      const loader = YoutubeLoader.createFromUrl(url, {
        language: language,
        addVideoInfo: false,
      });
      const docs = await loader.load();
      return docs;
    } catch {
      // Continue to the next language if this one fails
    }
  }
  // If all languages fail, throw an error
  throw new Error("Failed to load transcript in any supported language");
}

export async function POST(req: Request) {
  const { inputType, inputValue, language, model } = await req.json();

  try {
    let text = "";

    if (inputType === "youtube") {
      try {
        const docs = await loadYoutubeTranscript(inputValue);
        text = docs.map((doc) => doc.pageContent).join("\n");
      } catch (error) {
        return NextResponse.json(
          {
            error: "Failed to fetch YouTube transcript",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 400 }
        );
      }
    } else if (inputType === "article") {
      try {
        const loader = new CheerioWebBaseLoader(inputValue);
        const docs = await loader.load();
        text = docs.map((doc) => doc.pageContent).join("\n");
      } catch (error) {
        return NextResponse.json(
          {
            error: "Failed to load article content",
            details: error instanceof Error ? error.message : String(error),
          },
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

    const selectedModel =
      LLM_CONFIG.models.find((m) => m.name === model) || LLM_CONFIG.models[0];

    const llm = new ChatGoogleGenerativeAI({
      modelName: selectedModel.name,
      maxOutputTokens: 8192,
      temperature: 0.2,
      apiKey: apiKey,
    });

    const template = `
      You are an expert at extracting essential information, identifying key concepts, condensing complex content, recognizing important details, and simplifying comprehensive data from various sources including videos, articles, and podcasts.

      Please analyze all provided content thoroughly and present the information in ${language} using the following structured format:

      ## 🎯 Key Takeaways
      - Bullet points of the most crucial insights
      - Focus on actionable and memorable information

      ## 📝 Detailed Summary

      ### 🔍 Main Concepts
      Break down all the core ideas discussed, ensure to thoroughly read and analyze all texts with great attention to detail, organized by theme or chronology as appropriate
      #### Name of concept
        With each point, please provide a detailed summary of the content, ensure that no information is missed.
      ...

      ### 💡 Notable Insights
      Highlight particularly interesting or surprising information

      ### 🔬 Technical Details
      If applicable, include specific data, statistics, or technical information

      ## 🎓 Expert Perspectives
      Summarize viewpoints and quotes from experts mentioned in the content

      ## 🔗 Related Resources
      List any books, articles, studies, or other resources referenced

      ## 💭 Reflection Questions
      2-3 thought-provoking questions inspired by the content

      ---

      ### Formatting Guidelines:
      - Use headers (##, ###) for clear organization
      - Employ bullet points for easy scanning
      - Include relevant emojis for visual appeal and quick recognition
      - Utilize **bold** for emphasis on key terms
      - Create tables when comparing information
      - Use code blocks for technical terms or specific methodologies
      - Add > blockquotes for significant quotes or statements

      Apply appropriate markdown formatting to ensure the summary is both informative and visually engaging.
      
      {text}
    `;
    const prompt = PromptTemplate.fromTemplate(template);
    const chain = prompt.pipe(llm);

    const result = await chain.invoke({ text: text });

    return NextResponse.json({ summary: result.content });
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
