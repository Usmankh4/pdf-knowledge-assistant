type AnswerDisplayProps = {
    answer: string
    sources: number[]
    questionError: string | null

}


function AnswerDisplay({answer, sources, questionError} : AnswerDisplayProps){

    return (
        <div>

            {answer}
           {sources.map( (source) => {
            return (
                <div key={source}> 
               Page: {source}
                </div>
            )

           })}
            {questionError!== null && <p>{questionError}</p>}
        </div>
    )

    
}

export default AnswerDisplay;