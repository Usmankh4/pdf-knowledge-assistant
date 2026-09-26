import { HuggingFaceEmbedding } from "@llamaindex/huggingface";
import { PDFReader } from "@llamaindex/readers/pdf";
import { SentenceSplitter } from "llamaindex";
import { Settings } from "llamaindex";
require('dotenv').config()
export async function ingestPdf(filePath: string) {

    
    const splitter = new SentenceSplitter({
        chunkSize: 528,
        chunkOverlap: 120
    })

    const reader = new PDFReader();

    const documents = await reader.loadData(filePath)

    const nodes = splitter.getNodesFromDocuments(documents);

    const embeddingModel = new HuggingFaceEmbedding({
        modelType: "BAAI/bge-small-en-v1.5",
    }) 

    Settings.embedModel = embeddingModel;

   const embedding = await embeddingModel.getTextEmbedding(nodes[0].text)
   console.log(embedding.length)
   console.log(embedding.slice(0,5));

    
    return nodes;
}