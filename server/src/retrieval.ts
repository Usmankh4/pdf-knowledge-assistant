import {MetadataMode, VectorStoreIndex,type MetadataFilters} from "llamaindex";
import {vectorStore} from "./ragInfrastructure";




export async function retrievePdf(question: string, documentId: string) {

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
        similarityTopK: 3, 
        filters
    });


    // result and keyword retrieve actually runs the search
    const result = await retriever.retrieve(question);

    if(result.length === 0){
        return [];
    }


    console.log(result[0].score);

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