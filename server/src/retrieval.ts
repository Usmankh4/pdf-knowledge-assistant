import { ChromaVectorStore } from "@llamaindex/chroma";
import { HuggingFaceEmbedding } from "@llamaindex/huggingface";
import { MetadataMode, Settings, VectorStoreIndex } from "llamaindex";

export async function retrivalPdf(){

    const embeddingModel = new HuggingFaceEmbedding({
        modelType: "BAAI/bge-small-en-v1.5",
    })

    Settings.embedModel = embeddingModel

    const vectorStore = new ChromaVectorStore({
        collectionName: "pdf-knowledge",
        chromaClientParams: {
            path: "http://localhost:8000"
        }
    })

    const index = await VectorStoreIndex.fromVectorStore(vectorStore);

    const retrieveRelevantNodes = index.asRetriever({
        similarityTopK: 2
    })
    const question = "What vector databases can be used in this project?";

    const result = await retrieveRelevantNodes.retrieve(question)

    console.log(result[0].node.getContent(MetadataMode.NONE));
    console.log(result[0].score);
    console.log(result[0].node.metadata);

    


    







}

