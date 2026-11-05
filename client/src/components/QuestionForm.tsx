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
        <section>
            <h2>Question</h2>
            <div className="row">
            <input
              type="text"
              value={question}
              placeholder="Ask about the document"
              onChange={(e) => setQuestion(e.target.value)}
             />

             <button disabled={loading || isUploading || !hasDocument} onClick={askQuestion}>{loading ? "Loading..." : "Ask"}</button>
            </div>
        </section>
    )
    
}

export default QuestionForm