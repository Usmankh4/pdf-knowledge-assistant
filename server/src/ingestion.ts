import { HuggingFaceEmbedding } from "@llamaindex/huggingface";
import { PDFReader } from "@llamaindex/readers/pdf";
import { SentenceSplitter } from "llamaindex";
import { Settings } from "llamaindex";
import {ChromaVectorStore} from "@llamaindex/chroma"
import { storageContextFromDefaults } from "llamaindex";
import { VectorStoreIndex } from "llamaindex";

require('dotenv').config()
export async function ingestPdf(filePath: string) {

    
    const reader = new PDFReader();

    const documents = await reader.loadData(filePath)
   
   
    const splitter = new SentenceSplitter({
        chunkSize: 528,
        chunkOverlap: 120
    })


    const nodes = splitter.getNodesFromDocuments(documents);

    const embeddingModel = new HuggingFaceEmbedding({
        modelType: "BAAI/bge-small-en-v1.5",
    }) 

    Settings.embedModel = embeddingModel;

    const vectorStore = new ChromaVectorStore({
        collectionName: 'pdf-knowledge',
        chromaClientParams: {
            path: 'http://localhost:8000',
        }
    })

    const storageContext = await storageContextFromDefaults({
        vectorStore
    })

    await VectorStoreIndex.init({
        nodes,
        storageContext
    })
    console.log("Index created successfully")



    
    return nodes;
}
