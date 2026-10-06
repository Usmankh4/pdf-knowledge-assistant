import express from "express";
import cors from 'cors'
import multer from "multer";
import { ingestPdf } from "./ingestion";
import { retrievePdf } from "./retrieval";
import { generateAnswer } from "./generation";
import { randomUUID } from "node:crypto";



const app = express();
const PORT = 4000;

const upload = multer({
  dest: "uploads/",
})

app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json())

app.get('/health', (request, response) => {
  response.json({
    status: "ok"
  })
})

app.post('/query', async (request, response) => {

  // get the question sent from React
  const question = request.body.question;

  const documentId = request.body.documentId;

  if(!question || !documentId){
    return response.status(400).json({
        message: "Question and documentId are required"
    })
}

  const retrieval = await retrievePdf(question, documentId);
  

  const context = retrieval.map((item) => item.text).join("\n\n");
  
  const sources = [... new Set (retrieval.map((item) => item.page))];
  


  const answer = await generateAnswer(question, context);


  // send the generated answer back to React

  response.json({
   answer,
   sources
  })

})

app.post('/upload', upload.single("pdf"), async (request, response) => {
  
  if(!request.file?.path){
    return response.status(400).json({message: "No PDF uploaded"})
  }

  const requestPath = request.file.path

  const documentId = randomUUID()

  const nodes = await ingestPdf(requestPath,documentId);

  const pageCount = nodes[0]?.metadata.total_pages ?? 0;

  response.json({
    message: "PDF uploaded and read",
    nodeCount: nodes.length,
    documentId: documentId,
    pageCount
  })
})


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


