type QuestionFormProps = {
    question: string
    loading: boolean
    isUploading: boolean
    hasDocument: boolean
    setQuestion: (value: string) => void
    askQuestion: () => Promise<void>
   
}

function QuestionForm({question, loading, isUploading, hasDocument, setQuestion, askQuestion}: QuestionFormProps){

    return(
        <div>
            <input value={question} onChange={(e) => setQuestion(e.target.value)} 
             />

             <button disabled={loading || isUploading || !hasDocument} onClick={askQuestion}>{loading ? "Loading..." : "Ask a question"}</button>
        </div>
    )
    
}

export default QuestionForm