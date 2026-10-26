import { useState, type FormEvent } from 'react'
import { askPDFQuestion, uploadDocument } from './services/api';

import './App.css'

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedMessage, setUploadedMessage] = useState('');
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [documentId, setDocumentId] = useState<string| null>(null);
  const [sources, setSources] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  


  


  async function askQuestion(){
  try{
  
    setError(null);
    setAnswer("");
    setSources([]);

    if(!question.trim()){
      setError("Enter a question before submitting.")
      return;
    }

    if(!documentId){
      setError('Upload a PDF before asking a question');
      return;
    }

    setLoading(true);

    const data = await askPDFQuestion(question, documentId)
   
    setAnswer(data.answer)
    setSources(data.sources);
    setQuestion("");
    

  }catch(error){
    setError('Unable to connect to the server. Please try again.')
    console.error(error)

  } finally{
    setLoading(false);

  }
}

async function uploadPdf(event: FormEvent){



  try{
  event.preventDefault();
  
  if(!selectedFile){
    return;
  }
  setDocumentId(null);
  setUploadedMessage("");
  setAnswer('');
  setPageCount(null);
  setSources([])
  setError(null);
  setIsUploading(true);

  const data = await uploadDocument(selectedFile);
  setUploadedMessage(data.message);
  setPageCount(data.pageCount); 
  setDocumentId(data.documentId);
  setSelectedFile(null);
  setQuestion("");
 

  }catch(error){
    console.error(error)
    setError('Unable to connect to the server. Please try again.');

  } finally{
    setIsUploading(false);
    
    
  }
  
}



  return (
    
    <div>
    

      <input type='text' 
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      />

      <button disabled={loading || isUploading || !documentId} onClick={askQuestion}>{loading ? 'Loading' : 'Ask a question'}</button>
      

      <form onSubmit={uploadPdf}>
      <input
      disabled={isUploading}
      type='file'
      accept='application/pdf'
      onChange={(event) => {
        const file = event.target.files?.[0] ?? null;
        setSelectedFile(file)
      }} 
      />
      <button disabled={isUploading || !selectedFile} type='submit'>{isUploading ? "Loading" : "Upload PDF"}</button>
      </form>


      {error}

      

     
     
      <div>
  <p>Sources:</p>
  {sources.map((page) => (
    <div key={page}>Page {page}</div>
  ))}
</div>


      <p>{selectedFile?.name}</p>
      <p>{uploadedMessage}</p>
      <p>{answer}</p>
      <p>{pageCount}</p>
      

  


    </div>
  )
}

export default App
