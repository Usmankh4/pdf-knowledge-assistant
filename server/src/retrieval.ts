import { ChromaVectorStore } from "@llamaindex/chroma";
import { HuggingFaceEmbedding } from "@llamaindex/huggingface";
import {MetadataMode,Settings, VectorStoreIndex,type MetadataFilters} from "llamaindex";

export async function retrievePdf(question: string, documentId: string) {


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

    // index is for WHAT is being searched. In this case its our vectorStore that we created: new ChromaVectorStore({...})

    const index = await VectorStoreIndex.fromVectorStore(vectorStore);

    

    const filters: MetadataFilters = {
        filters: [
            {
                key: "documentId",
                value: documentId,
                operator: "==",
            },
        ],
    };

    // retriver is for HOW / by what object it gets searched

    const retriever = index.asRetriever({
        similarityTopK: 2, 
        filters
    });


    // result and keyword retrieve actually runs the search
    const result = await retriever.retrieve(question);

    console.log(
        result[0].node.getContent(MetadataMode.NONE)
    );

    console.log(result[0].score);
    console.log(result[0].node.metadata);

    

    const relevantNodes = result.map((item) => {
        return {
            text: item.node.getContent(MetadataMode.NONE),
            page: item.node.metadata.page_number,
            score: item.score,
            metadata: item.node.metadata
        };
    });

    return relevantNodes;
}