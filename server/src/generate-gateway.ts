import { generateText } from "ai";

const CHAT_MODEL = process.env.AI_GATEWAY_MODEL ?? "google/gemini-2.5-flash-lite";

export async function generateWithGateway(question: string, context: string) {
  const { text } = await generateText({
    model: CHAT_MODEL,
    instructions: "Answer using only the PDF context. If the answer is not in the content, say you cannot find it.",
    prompt: `CONTEXT:\n${context}\n\nQUESTION:\n${question}`,
  });

  return text;
}
