const API_URL = import.meta.env.VITE_API_URL;


type QueryResponse = {
    answer: string,
    sources: number[]
}
type UploadResponse = {
    message: string,
    nodeCount: number,
    documentId: string,
    pageCount: number,

}
export async function askPDFQuestion(question: string, documentId: string):Promise<QueryResponse>{
    const response = await fetch(`${API_URL}/query`, {
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question, documentId
        })
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error("Request failed");
    }
    return data;
}

export async function uploadDocument(selectedFile: File):Promise<UploadResponse>{

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    const response = await fetch(`${API_URL}/upload`,{
        method: "POST",
        body: formData
    })

    const data = await response.json();
    if(!response.ok){
        throw new Error("Request failed");
    }
    return data;
}