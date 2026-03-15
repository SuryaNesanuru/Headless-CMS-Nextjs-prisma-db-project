import OpenAI from "openai";

const getAIClient = () => {
  const provider = process.env.AI_PROVIDER || "openai";

  if (provider === "ollama") {
    return new OpenAI({
      baseURL: process.env.OLLAMA_BASE_URL
        ? `${process.env.OLLAMA_BASE_URL}/v1`
        : "http://localhost:11434/v1",
      apiKey: "ollama",
    });
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

const getModel = () => {
  const provider = process.env.AI_PROVIDER || "openai";
  return provider === "ollama" ? "llama3" : "gpt-4o-mini";
};

export async function generateContent(prompt: string): Promise<string> {
  const client = getAIClient();
  const response = await client.chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: "system",
        content:
          "You are a professional content writer. Generate high-quality, engaging content based on the given prompt. Return only the content without any additional commentary.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 2000,
  });
  return response.choices[0]?.message?.content || "";
}

export async function generateSEO(content: string): Promise<string> {
  const client = getAIClient();
  const response = await client.chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: "system",
        content:
          "You are an SEO expert. Generate a compelling meta description (max 160 characters) for the given content. Return only the meta description.",
      },
      { role: "user", content: `Generate SEO meta description for: ${content}` },
    ],
    max_tokens: 200,
  });
  return response.choices[0]?.message?.content || "";
}

export async function summarizeText(content: string): Promise<string> {
  const client = getAIClient();
  const response = await client.chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: "system",
        content:
          "You are a skilled editor. Summarize the given text concisely while preserving key points. Return only the summary.",
      },
      { role: "user", content: `Summarize: ${content}` },
    ],
    max_tokens: 500,
  });
  return response.choices[0]?.message?.content || "";
}

export async function translateText(
  content: string,
  targetLanguage: string
): Promise<string> {
  const client = getAIClient();
  const response = await client.chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the given text to ${targetLanguage}. Return only the translated text.`,
      },
      { role: "user", content },
    ],
    max_tokens: 2000,
  });
  return response.choices[0]?.message?.content || "";
}
