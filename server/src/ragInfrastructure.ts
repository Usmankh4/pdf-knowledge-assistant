import { ChromaVectorStore } from "@llamaindex/chroma";
import { HuggingFaceEmbedding } from "@llamaindex/huggingface";
import { Settings } from "llamaindex";
import "dotenv/config"

const embeddingModel = new HuggingFaceEmbedding({
    modelType: "BAAI/bge-small-en-v1.5"
});

Settings.embedModel = embeddingModel;


const vectorStore = new ChromaVectorStore({
    collectionName: "pdf-knowledge",
    chromaClientParams: {
        path: process.env.CHROMA_URL || "http://localhost:8000"
    }
});


export { vectorStore };

// NOTES

// embeddingModel
//
// The embedding model converts text into numbers/vectors so that
// similar pieces of text can be compared mathematically.
//
// Example:
//
// "FAISS or Chroma can be used"
//
// becomes something like:
//
// [-0.088, -0.019, -0.044, ...]
//
// BAAI/bge-small-en-v1.5 is the embedding model being used.
//
// Creating embeddingModel here does not actually embed any text yet.
// It just creates the model that LlamaIndex will use later.


// Settings.embedModel
//
// LlamaIndex uses Settings.embedModel to know which embedding model
// it should use.
//
// During ingestion:
//
// node text
// ↓
// embedding model
// ↓
// vector
// ↓
// stored in Chroma
//
// During retrieval:
//
// user question
// ↓
// embedding model
// ↓
// question vector
// ↓
// compared against vectors in Chroma
//
// Setting Settings.embedModel does not create an embedding by itself.
// It just tells LlamaIndex which model to use when it needs one.


// vectorStore
//
// vectorStore is the object LlamaIndex uses to communicate with Chroma.
//
// Chroma is running at:
//
// http://localhost:8000
//
// The collection being used is:
//
// pdf-knowledge
//
// The collection stores things like:
//
// Node 1 -> text + metadata + vector
// Node 2 -> text + metadata + vector
// Node 3 -> text + metadata + vector
//
// Creating the vectorStore does not insert anything into Chroma yet.
// It only creates the connection/configuration that will be used later.
//
// ingestion.ts uses vectorStore when storing the nodes.
//
// retrieval.ts uses the same vectorStore when searching the stored nodes.


// Why this file exists
//
// Before this refactor, ingestion.ts and retrieval.ts both created their own
// embedding model and ChromaVectorStore.
//
// That meant the same configuration existed in multiple places.
//
// Now this file is the single place that sets up:
//
// - the embedding model
// - Settings.embedModel
// - the Chroma vector store
//
// ingestion.ts and retrieval.ts can import vectorStore instead of
// creating their own copies.


// Why embeddingModel is not exported
//
// Other files do not need to use embeddingModel directly.
//
// Its job is already done here:
//
// Settings.embedModel = embeddingModel
//
// vectorStore is exported because ingestion.ts and retrieval.ts
// actually need to use that object directly.