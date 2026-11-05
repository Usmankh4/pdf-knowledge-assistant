import { useState, type FormEvent } from 'react'
import { askPDFQuestion, uploadDocument } from './services/api';

import QuestionForm from './components/QuestionForm';
import UploadPDF from './components/UploadPDF';
import AnswerDisplay from './components/AnswerDisplay';

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedMessage, setUploadedMessage] = useState('');
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [documentId, setDocumentId] = useState<string| null>(null);
  const [sources, setSources] = useState<number[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  

  async function askQuestion(){
  try{
  
    setQuestionError(null);
    setAnswer("");
    setSources([]);

    if(!question.trim()){
      setQuestionError("Enter a question before submitting.")
      return;
    }

    if(!documentId){
      setQuestionError('Upload a PDF before asking a question');
      return;
    }

    setLoading(true);

    const data = await askPDFQuestion(question, documentId)
   
    setAnswer(data.answer)
    setSources(data.sources);
    setQuestion("");
    

  }catch(error){
    setQuestionError('Unable to connect to the server. Please try again.')
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
  setQuestionError(null);
  setAnswer('');
  setPageCount(null);
  setSources([])
  setUploadError(null);
  setIsUploading(true);

  const data = await uploadDocument(selectedFile);
  setUploadedMessage(data.message);
  setPageCount(data.pageCount); 
  setDocumentId(data.documentId);
  setSelectedFile(null);
  setQuestion("");

 

  }catch(error){
    console.error(error)
    setUploadError('Unable to connect to the server. Please try again.');

  } finally{
    setIsUploading(false);
    
    
  }
  
}



  return (
    
    <div className="app">
      <header className="header">
        <h1>PDF assistant</h1>
        <p>Upload a PDF, then ask a question about it.</p>
      </header>

      <UploadPDF 
      selectedFile={selectedFile} 
      isUploading={isUploading} 
      setSelectedFile={setSelectedFile} 
      uploadPdf={uploadPdf} uploadedMessage={uploadedMessage} pageCount={pageCount} uploadError={uploadError}/>

     <QuestionForm 
     question={question} 
     loading={loading} 
     isUploading={isUploading} 
     hasDocument={documentId !== null} 
     setQuestion={setQuestion} 
     askQuestion={askQuestion}
      />


      <AnswerDisplay 
      answer={answer} 
      sources={sources} 
      questionError={questionError} 
      />


      

  


    </div>
  )
}

export default App
