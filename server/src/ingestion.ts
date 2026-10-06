import { HuggingFaceEmbedding } from "@llamaindex/huggingface";
import { PDFReader } from "@llamaindex/readers/pdf";
import { ChromaVectorStore } from "@llamaindex/chroma";

import {SentenceSplitter, Settings, storageContextFromDefaults, VectorStoreIndex} from "llamaindex";

require("dotenv").config();


export async function ingestPdf(filePath: string, documentId: string) {

    // create a PDFReader object
    // PURPOSE: gives us a tool that knows how to read a PDF file
    const reader = new PDFReader();




    // use the reader to read the PDF from the filePath
    // filePath comes from request.file.path inside index.ts

    // INPUT:
    // filePath
    // ↓
    // "uploads/abc123..."

    // OUTPUT:
    // documents -> Document[]

    // Example:
    // [
    //   Document { text: "Page 1 text..." },
    //   Document { text: "Page 2 text..." }
    // ]

    const documents = await reader.loadData(filePath);

    for(const document of documents){
        document.metadata = {
            ...document.metadata,
            documentId: documentId
        }
    }
    // configure a SentenceSplitter

    // PURPOSE:
    // Documents can contain a lot of text,
    // so we split them into smaller chunks called Nodes

    // IMPORTANT:
    // creating the splitter does NOT split anything yet

    // chunkSize:
    // approximately how much text can be inside one chunk

    // ┌─────────────┐
    // │   Chunk 1   │ ~512 tokens
    // └─────────────┘

    // ┌─────────────┐
    // │   Chunk 2   │ ~512 tokens
    // └─────────────┘


    // chunkOverlap:
    // repeats some text from the previous chunk
    // so context is not lost between chunks

    // Chunk 1:
    // A B C D

    // Chunk 2:
    //     C D E F
    //     ↑ ↑
    //     overlap

    const splitter = new SentenceSplitter({
        chunkSize: 512,
        chunkOverlap: 120
    });



    // now actually USE the splitter

    // INPUT:
    // documents -> Document[]

    // OUTPUT:
    // nodes -> TextNode[]

    // Example:
    //
    // Document:
    // "Project title... requirements... features..."
    //
    // ↓ splitter
    //
    // Node 1:
    // "Project title..."
    //
    // Node 2:
    // "Requirements..."
    //
    // Node 3:
    // "Features..."

    const nodes = splitter.getNodesFromDocuments(documents);



    // configure the embedding model

    // PURPOSE:
    // turns Node text into numerical vectors

    // Example:
    //
    // "FAISS or Chroma can be used"
    //
    // ↓ embedding model
    //
    // [
    //   -0.088,
    //   -0.019,
    //   -0.044,
    //   ...
    // ]

    // BAAI/bge-small-en-v1.5 gives us 384 numbers per embedding

    // IMPORTANT:
    // creating embeddingModel does NOT embed anything yet

    const embeddingModel = new HuggingFaceEmbedding({
        modelType: "BAAI/bge-small-en-v1.5"
    });



    // set our embedding model globally inside LlamaIndex

    // PURPOSE:
    // whenever LlamaIndex needs to create an embedding,
    // use this HuggingFace model

    // this still does NOT create an embedding yet

    Settings.embedModel = embeddingModel;



    // create a ChromaVectorStore object

    // PURPOSE:
    // gives LlamaIndex a way to talk to our Chroma database

    // Chroma database:
    // http://localhost:8000

    // ChromaVectorStore:
    // JavaScript object that knows how to connect to Chroma

    // collectionName:
    // tells Chroma which collection we want to use

    // Chroma
    // └── pdf-knowledge
    //      ├── Node 1 -> text + metadata + vector
    //      ├── Node 2 -> text + metadata + vector
    //      └── Node 3 -> text + metadata + vector

    // IMPORTANT:
    // nothing has been inserted into Chroma yet

    const vectorStore = new ChromaVectorStore({
        collectionName: "pdf-knowledge",
        chromaClientParams: {
            path: "http://localhost:8000"
        }
    });



    // create a StorageContext using our vectorStore

    // PURPOSE:
    // tells LlamaIndex what storage setup to use

    // vectorStore already knows:
    //
    // Chroma
    // ↓
    // localhost:8000
    // ↓
    // "pdf-knowledge"

    // INPUT:
    // vectorStore

    // OUTPUT:
    // storageContext

    // IMPORTANT:
    // this does NOT store anything yet

    const storageContext = await storageContextFromDefaults({
        vectorStore
    });



    // build the VectorStoreIndex

    // PURPOSE:
    // this is where everything gets connected together

    // INPUT:
    // nodes
    // +
    // storageContext

    // LlamaIndex also knows:
    // Settings.embedModel = embeddingModel


    // DATA FLOW:

    // nodes[0].text
    //
    // ↓
    //
    // HuggingFaceEmbedding
    //
    // ↓
    //
    // 384-number vector
    //
    // ↓
    //
    // storageContext
    //
    // ↓
    //
    // ChromaVectorStore
    //
    // ↓
    //
    // Chroma "pdf-knowledge"


    // this happens for every Node

    // IMPORTANT:
    // BEFORE this line:
    // nodes exist, but are not indexed yet

    // AFTER this finishes:
    // nodes have been embedded
    // and their vectors are stored in Chroma

    await VectorStoreIndex.init({
        nodes,
        storageContext
    });


    console.log("Index created successfully");



    // return the nodes back to index.ts

    // index.ts:
    // const nodes = await ingestPdf(requestPath)

    return nodes;
}