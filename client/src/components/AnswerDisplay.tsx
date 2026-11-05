type AnswerDisplayProps = {
    answer: string
    sources: number[]
    questionError: string | null

}


function AnswerDisplay({answer, sources, questionError} : AnswerDisplayProps){

    return (
        <section>
            <h2>Answer</h2>
            {questionError!== null && <p className="error">{questionError}</p>}
            {answer ? <p className="answer">{answer}</p> : questionError === null && <p className="note">No answer yet.</p>}
            {sources.length > 0 && (
              <ul className="sources">
                {sources.map((source) => (
                  <li key={source}>Page {source}</li>
                ))}
              </ul>
            )}
        </section>
    )

    
}

export default AnswerDisplay;