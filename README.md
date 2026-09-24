# PDF Knowledge Assistant

An AI-powered chatbot that answers questions from your own PDF documents.
Upload a PDF, ask questions in the chat interface, and get answers grounded
in the document content.

Built with **LlamaIndex** for PDF ingestion and indexing, and **LangChain**
for prompt orchestration and answer generation.

## How it works

1. **Upload** — PDFs are uploaded to the Express backend.
2. **Index** — LlamaIndex parses the documents and builds a vector index
   (FAISS or Chroma).
3. **Ask** — you type a question in the chat interface.
4. **Answer** — a LangChain RetrievalQA chain retrieves the most relevant
   passages from the index, and the LLM generates an answer grounded in
   your documents.

## Tech stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Ingestion & indexing:** LlamaIndex
- **Prompt orchestration:** LangChain (RetrievalQA chain)
- **Vector store:** FAISS or Chroma
- **LLM:** OpenAI API (or compatible)
- **Uploads:** multer

## Features

- PDF upload to the backend
- Automatic vector indexing of uploaded documents
- Chat interface for asking questions about PDF content
- Retrieval-augmented answers grounded in the source documents
- Optional conversational memory via LangChain memory components

## Run locally

Copy `server/.env.example` to `server/.env` and add your LLM API key, then:

```
npm --prefix server install
npm --prefix client install
npm --prefix server run dev
npm --prefix client run dev
```

Open `http://localhost:5173` for the frontend.
