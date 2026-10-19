import { generateAnswer } from "./generation.js";
import { ingestPdf } from "./ingestion.js";
import { retrievePdf } from "./retrieval.js";

export async function ingest(filePath: string, documentId: string) {
  return ingestPdf(filePath, documentId);
}

export async function retrieve(question: string, documentId: string) {
  const chunks = await retrievePdf(question, documentId);
  return chunks.map((chunk) => ({
    text: chunk.text,
    page: Number(chunk.page) || 0,
    score: chunk.score ?? 0,
  }));
}

export async function generate(question: string, context: string) {
  const answer = await generateAnswer(question, context);
  return typeof answer === "string" ? answer : JSON.stringify(answer);
}
