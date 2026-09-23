import { useState, type FormEvent } from 'react'


import './App.css'

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedMessage, setUploadedMessage] = useState('');

  const API_URL = 'http://localhost:4000';


  async function askQuestion(){
  try{
    const response = await fetch(`${API_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question
      })
    })
    const data = await response.json();
    setAnswer(data.answer)
    
  }catch(error){
    console.error(error)

  }
}

async function uploadPdf(event: FormEvent){
  event.preventDefault();
  if(!selectedFile){
    return;
  }

  const formData = new FormData();
  formData.append('pdf', selectedFile);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData
    })
  const data = await response.json();
  setUploadedMessage(data.message);
 

}

console.log(selectedFile);


  return (
    <div>


      <input type='text' 
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      />
      <button onClick={askQuestion}>Ask Question</button>

      <form onSubmit={uploadPdf}>
      <input
      type='file'
      accept='application/pdf'
      onChange={(event) => {
        const file = event.target.files?.[0] ?? null;
        setSelectedFile(file)
      }} 
      />
      <button type='submit'>Upload PDF</button>
      </form>

      

     
     
      

      <p>{selectedFile?.name}</p>
      <p>{uploadedMessage}</p>
      <p>{answer}</p>


    </div>
  )
}

export default App
