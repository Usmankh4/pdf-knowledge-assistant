import { PDFReader } from "@llamaindex/readers/pdf";
import { SentenceSplitter } from "llamaindex";

export async function ingestPdf(filePath: string) {

    const splitter = new SentenceSplitter({
        chunkSize: 512,
        chunkOverlap: 50
    })

    
    
    const reader = new PDFReader();
    const documents = await reader.loadData(filePath)
    console.log(documents.length);
    const nodes = splitter(documents)
    console.log(nodes.length)

    
    return nodes;
}