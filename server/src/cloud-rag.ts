import { get, put } from "@vercel/blob";
import { cosineSimilarity, embed, embedMany } from "ai";
import { PDFReader } from "@llamaindex/readers/pdf";
import { MetadataMode, SentenceSplitter } from "llamaindex";

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? "openai/text-embedding-3-small";
const MIN_SCORE = 0.2;

type StoredChunk = {
  text: string;
  page: number;
  embedding: number[];
};

type StoredDocument = {
  documentId: string;
  chunks: StoredChunk[];
};

function documentPath(documentId: string) {
  return `documents/${documentId}.json`;
}

async function embedTexts(values: string[]) {
  const embeddings: number[][] = [];

  for (let index = 0; index < values.length; index += 64) {
    const batch = values.slice(index, index + 64);
    const result = await embedMany({
      model: EMBEDDING_MODEL,
      values: batch,
    });
    embeddings.push(...result.embeddings);
  }

  return embeddings;
}

export async function ingestPdfCloud(filePath: string, documentId: string) {
  const reader = new PDFReader();
  const documents = await reader.loadData(filePath);

  for (const document of documents) {
    document.metadata = {
      ...document.metadata,
      documentId,
    };
  }

  const splitter = new SentenceSplitter({
    chunkSize: 512,
    chunkOverlap: 120,
  });
  const nodes = splitter.getNodesFromDocuments(documents);
  const chunks = nodes
    .map((node) => ({
      text: node.getContent(MetadataMode.NONE),
      page: Number(node.metadata.page_number) || 0,
    }))
    .filter((chunk) => chunk.text.trim().length > 0);

  const embeddings = chunks.length > 0
    ? await embedTexts(chunks.map((chunk) => chunk.text))
    : [];

  const stored: StoredDocument = {
    documentId,
    chunks: chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index],
    })),
  };

  await put(documentPath(documentId), JSON.stringify(stored), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return nodes;
}

export async function retrieveCloud(question: string, documentId: string) {
  const file = await get(documentPath(documentId), {
    access: "private",
    useCache: false,
  });

  if (!file || file.statusCode !== 200 || !file.stream) {
    return [];
  }

  const stored = JSON.parse(await new Response(file.stream).text()) as StoredDocument;

  if (!stored.chunks?.length) {
    return [];
  }

  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: question,
  });

  const ranked = stored.chunks
    .map((chunk) => ({
      text: chunk.text,
      page: chunk.page,
      score: cosineSimilarity(embedding, chunk.embedding),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 2);

  if (ranked.length === 0 || ranked[0].score < MIN_SCORE) {
    return [];
  }

  return ranked;
}
