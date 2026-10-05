import express from "express";
import cors from 'cors'
const app = express();
const PORT = 4000;
import multer from "multer";
import { ingestPdf } from "./ingestion";
import { retrievePdf } from "./retrieval";
import { generateAnswer } from "./generation";
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

  const retrieval = await retrievePdf(question);

  const context = retrieval.map((item) => item.text).join("\n\n");


  const answer = await generateAnswer(question, context);


  // send the generated answer back to React

  response.json({
   answer: answer
  })

})

app.post('/upload', upload.single("pdf"), async (request, response) => {
  
  if(!request.file?.path){
    return response.status(400).json({message: "No PDF uploaded"})
  }

  const requestPath = request.file.path

  const nodes = await ingestPdf(requestPath);

  response.json({message: "PDF uploaded and read",
    nodeCount: nodes.length

  })
})


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


