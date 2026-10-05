import { ChromaVectorStore } from "@llamaindex/chroma";
import { HuggingFaceEmbedding } from "@llamaindex/huggingface";
import { MetadataMode, Settings, VectorStoreIndex } from "llamaindex";

export async function retrievePdf(question: string) {
    const embeddingModel = new HuggingFaceEmbedding({
        modelType: "BAAI/bge-small-en-v1.5",
    });

    Settings.embedModel = embeddingModel;

    const vectorStore = new ChromaVectorStore({
        collectionName: "pdf-knowledge",
        chromaClientParams: {
            path: "http://localhost:8000"
        }
    });

    const index = await VectorStoreIndex.fromVectorStore(vectorStore);

    const retriever = index.asRetriever({
        similarityTopK: 2
    });

    const result = await retriever.retrieve(question);

    console.log(
        result[0].node.getContent(MetadataMode.NONE)
    );

    console.log(result[0].score);
    console.log(result[0].node.metadata);

    const relevantNodes = result.map((item) => {
        return {
            text: item.node.getContent(MetadataMode.NONE),
            score: item.score,
            metadata: item.node.metadata
        };
    });

    return relevantNodes;
}