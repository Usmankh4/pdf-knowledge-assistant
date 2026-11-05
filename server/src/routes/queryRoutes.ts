import  { Router } from "express";
import { retrievePdf } from "../retrieval";
import { generateAnswer } from "../generation";
const queryRouter = Router();


queryRouter.post("/", async (request, response) => {



    
  // get the question and documentId sent from React
  const question = request.body.question;
  const documentId = request.body.documentId;

  if (!question || !documentId) {
    return response.status(400).json({
      message: "Question and documentId are required"
    });
  }

  try {

    

    const retrieval = await retrievePdf(question, documentId);

    
    if (retrieval.length === 0) {
      return response.json({
        answer: "Nothing relevant was found",
        sources: []
      });
    }

    const context = retrieval
      .map((item) => item.text)
      .join("\n\n");

    const sources = [
      ...new Set(retrieval.map((item) => item.page))
    ];



    const answer = await generateAnswer(question, context);
    

    return response.json({
      answer,
      sources
    });

  } catch (error) {

    console.error(error);

    
    return response.status(500).json({
      answer: "Something went wrong while answering your question", 
      sources: []
    });
  }

});

export default queryRouter;

