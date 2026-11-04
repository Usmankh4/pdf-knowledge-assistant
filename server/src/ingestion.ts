import { PDFReader } from "@llamaindex/readers/pdf";
import { vectorStore } from "./ragInfrastructure";
import {
    SentenceSplitter,
    storageContextFromDefaults,
    VectorStoreIndex
} from "llamaindex";


export async function ingestPdf(filePath: string, documentId: string) {

    // create a PDFReader object
    // PURPOSE: gives us a tool that knows how to read a PDF file

    const reader = new PDFReader();

    // read the PDF from the filePath
    // filePath comes from request.file.path inside index.ts

    // INPUT:
    // filePath
    // ↓
    // "uploads/abc123..."

    // OUTPUT:
    // documents -> Document[]

    // Example:
    //
    // [
    //   Document { text: "Page 1 text..." },
    //   Document { text: "Page 2 text..." }
    // ]

    const documents = await reader.loadData(filePath);

    documents.forEach((document,index) => {
        console.log(`\n========== DOCUMENT ${index + 1} ==========`);
        console.log(document.getContent());
    })


    // attach the documentId to every document
    //
    // this lets us later filter retrieval results
    // so we only search chunks belonging to the current PDF

    for (const document of documents) {
        document.metadata = {
            ...document.metadata,
            documentId: documentId
        };
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


    // now actually use the splitter

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

    nodes.forEach((item, index) => {
        console.log(`Chunked ${index + 1}`)
        console.log(item.getContent())
    })


    // create a StorageContext using the shared vectorStore
    //
    // vectorStore comes from ragInfrastructure.ts
    //
    // PURPOSE:
    // tells LlamaIndex where the vectors should be stored

    // INPUT:
    // vectorStore

    // OUTPUT:
    // storageContext

    // IMPORTANT:
    // creating storageContext does NOT store anything yet

    const storageContext = await storageContextFromDefaults({
        vectorStore
    });


    // build the VectorStoreIndex
    //
    // this is the step where the nodes actually get indexed

    // INPUT:
    //
    // nodes
    // +
    // storageContext


    // DATA FLOW:
    //
    // nodes
    // ↓
    // embedding model configured in ragInfrastructure.ts
    // ↓
    // vectors
    // ↓
    // storageContext
    // ↓
    // shared vectorStore
    // ↓
    // Chroma


    // BEFORE this line:
    //
    // nodes exist in memory
    // but they have not been indexed yet


    // AFTER this finishes:
    //
    // node text has been embedded
    // and the vectors are stored in Chroma

    await VectorStoreIndex.init({
        nodes,
        storageContext
    });


    console.log("Index created successfully");


    // return the nodes back to index.ts
    //
    // index.ts:
    // const nodes = await ingestPdf(requestPath, documentId)

    return nodes;
}