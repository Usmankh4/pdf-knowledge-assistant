import { useState } from 'react'


import './App.css'

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");


  async function askQuestion(){
  try{
    const response = await fetch('http://localhost:4000/query', {
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


  return (
    <div>

      <input
      type='text'
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      ></input>
      <button onClick={askQuestion}>Ask Question</button>



      <p>{answer}</p>


    </div>
  )
}

export default App
