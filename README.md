# PDF Knowledge Assistant

A RAG-based PDF assistant I'm building to learn how document retrieval systems work end to end.

The goal is to let a user upload a PDF, ask questions about it, retrieve the most relevant parts of the document, and eventually generate answers grounded in that context.

## Current Status

Right now, the ingestion and retrieval parts are working.

The app can:

- Upload a PDF from the React frontend
- Send it to an Express backend
- Parse the PDF with LlamaIndex
- Split the document into smaller chunks
- Generate embeddings with Hugging Face
- Store those embeddings in ChromaDB
- Search the stored chunks using semantic similarity
- Return the most relevant chunks for a question

I'm currently working on connecting retrieval to the `/query` route and then using the retrieved context to generate an answer.

## Current Flow

```text
PDF
↓
PDFReader
↓
Documents
↓
SentenceSplitter
↓
Text chunks
↓
Hugging Face embeddings
↓
ChromaDB
↓
Similarity search
↓
Relevant chunks
```

The next part will be:

```text
Relevant chunks + user question
↓
LLM
↓
Grounded answer
↓
Source citations
```

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite

**Backend**
- Node.js
- Express
- TypeScript
- Multer

**RAG**
- LlamaIndex
- ChromaDB
- Hugging Face embeddings

Embedding model:

```text
BAAI/bge-small-en-v1.5
```

## How It Works

### PDF Upload

The user selects a PDF in the frontend.

The file is sent to the backend using `multipart/form-data` and handled with Multer.

```text
React
↓
POST /upload
↓
Express
↓
Multer
```

### Ingestion

Once the backend receives the file, LlamaIndex reads the PDF and converts it into documents.

The documents are then split into smaller chunks using `SentenceSplitter`.

Current settings:

```ts
chunkSize: 528
chunkOverlap: 120
```

The chunks are converted into embeddings and stored in ChromaDB.

### Retrieval

For retrieval, the app reconnects to the existing ChromaDB collection.

The user's question is embedded using the same embedding model, and LlamaIndex performs similarity search against the stored document chunks.

Right now I'm retrieving the top 2 results:

```ts
similarityTopK: 2
```

## Project Structure

```text
pdf-knowledge-assistant/
│
├── client/
│   └── src/
│       ├── App.tsx
│       ├── App.css
│       └── main.tsx
│
├── server/
│   └── src/
│       ├── index.ts
│       ├── ingestion.ts
│       └── retrieval.ts
│
└── README.md
```

`index.ts` contains the Express routes.

`ingestion.ts` handles PDF parsing, chunking, embeddings, and storing vectors in ChromaDB.

`retrieval.ts` handles similarity search against the stored document chunks.

## API

### Health Check

```http
GET /health
```

### Upload PDF

```http
POST /upload
```

The uploaded file is sent using the field name:

```text
pdf
```

### Query

```http
POST /query
```

Request body:

```json
{
  "question": "What does the document say about..."
}
```

The query route is set up, but I'm still connecting it to the retrieval pipeline.

## Running Locally

Install dependencies:

```bash
npm --prefix server install
npm --prefix client install
```

Start ChromaDB on:

```text
http://localhost:8000
```

Start the backend:

```bash
npm --prefix server run dev
```

Backend:

```text
http://localhost:4000
```

Start the frontend:

```bash
npm --prefix client run dev
```

Frontend:

```text
http://localhost:5173
```

## Next Steps

- Connect retrieval to `/query`
- Pass retrieved context to an LLM
- Generate answers using the document context
- Add source citations
- Handle questions that cannot be answered from the document
- Test different chunk sizes and overlap values
- Test different top-K values
- Measure retrieval quality and latency
- Deploy the project

## Why I'm Building This

I wanted to understand RAG beyond just calling a library method and getting an answer back.

This project has helped me understand what actually happens between uploading a document and retrieving useful context from it, especially around chunking, embeddings, vector databases, and similarity search.

The next part I'm focusing on is answer generation and evaluating whether the retrieval pipeline is actually returning useful context.
