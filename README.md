# PDF Knowledge Assistant

Ask questions about your PDFs and get answers grounded in the document —
a retrieval-augmented generation (RAG) app built with LangChain.

## How it works

1. Upload a PDF — it's chunked and embedded into a vector store.
2. Ask a question — the retriever pulls the most relevant chunks.
3. LangChain builds a grounded prompt and the LLM answers from your document.

## Tech stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Node.js + Express
- **AI:** LangChain

## Run locally

Copy `server/.env.example` to `server/.env` and add your LLM API key, then:

```
npm --prefix server install
npm --prefix client install
npm --prefix server run dev
npm --prefix client run dev
```

Open `http://localhost:5173` for the frontend.
