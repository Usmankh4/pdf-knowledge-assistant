import express from "express";
import cors from "cors";
import multer, { MulterError } from "multer";
import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import os from "node:os";

type IngestedNode = {
  metadata?: {
    total_pages?: number;
  };
};

type RetrievedChunk = {
  text: string;
  page: number;
  score: number;
};

type AppHandlers = {
  ingest: (filePath: string, documentId: string) => Promise<IngestedNode[]>;
  retrieve: (question: string, documentId: string) => Promise<RetrievedChunk[]>;
  generate: (question: string, context: string) => Promise<string>;
};

const upload = multer({
  dest: process.env.VERCEL ? os.tmpdir() : "uploads/",
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
});

export function createApp(handlers: AppHandlers) {
  const app = express();

  app.use(cors({
    origin: process.env.CLIENT_ORIGIN ?? (process.env.VERCEL ? true : "http://localhost:5173"),
  }));
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({
      status: "ok",
    });
  });

  app.post("/query", async (request, response) => {
    const question = request.body.question;
    const documentId = request.body.documentId;

    if (!question || !documentId) {
      return response.status(400).json({
        message: "Question and documentId are required",
      });
    }

    try {
      const retrieval = await handlers.retrieve(question, documentId);

      if (retrieval.length === 0) {
        return response.json({
          answer: "Nothing relevant was found",
          sources: [],
        });
      }

      if (retrieval[0].score < 0) {
        return response.json({
          answer: "Could not find relevant information",
          sources: [],
        });
      }

      const context = retrieval
        .map((item) => item.text)
        .join("\n\n");

      const sources = [
        ...new Set(retrieval.map((item) => item.page)),
      ];

      const answer = await handlers.generate(question, context);

      return response.json({
        answer,
        sources,
      });
    } catch (error) {
      console.error(error);

      return response.status(500).json({
        answer: "Something went wrong while answering your question",
        sources: [],
      });
    }
  });

  app.post("/upload", upload.single("pdf"), async (request, response) => {
    if (!request.file?.path) {
      return response.status(400).json({ message: "No PDF uploaded" });
    }

    const requestPath = request.file.path;
    const documentId = randomUUID();

    try {
      const nodes = await handlers.ingest(requestPath, documentId);
      const pageCount = nodes[0]?.metadata?.total_pages ?? 0;

      return response.json({
        message: "PDF uploaded and read",
        nodeCount: nodes.length,
        documentId,
        pageCount,
      });
    } finally {
      await unlink(requestPath).catch(() => undefined);
    }
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
    if (error instanceof MulterError && error.code === "LIMIT_FILE_SIZE") {
      response.status(413).json({
        message: "PDF must be 4 MB or smaller.",
      });
      return;
    }

    console.error(error);

    if (response.headersSent) {
      next(error);
      return;
    }

    response.status(500).json({
      message: "Something went wrong while handling that request.",
    });
  });

  return app;
}
