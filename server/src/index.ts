import { createApp } from "./app.js";
import { generateAnswer } from "./generation.js";
import { ingestPdf } from "./ingestion.js";
import { retrievePdf } from "./retrieval.js";

const PORT = Number(process.env.PORT) || 4000;

const app = createApp({
  ingest: ingestPdf,
  retrieve: async (question, documentId) => {
    const chunks = await retrievePdf(question, documentId);
    return chunks.map((chunk) => ({
      text: chunk.text,
      page: Number(chunk.page) || 0,
      score: chunk.score ?? 0,
    }));
  },
  generate: async (question, context) => {
    const answer = await generateAnswer(question, context);
    return typeof answer === "string" ? answer : JSON.stringify(answer);
  },
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
