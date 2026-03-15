import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateContent, generateSEO, summarizeText, translateText } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, prompt, content, language } = await req.json();

    let result = "";

    switch (action) {
      case "generate":
        result = await generateContent(prompt || content);
        break;
      case "seo":
        result = await generateSEO(content);
        break;
      case "summarize":
        result = await summarizeText(content);
        break;
      case "translate":
        result = await translateText(content, language || "Spanish");
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
