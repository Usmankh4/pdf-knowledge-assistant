import express from "express";
import cors from 'cors'
const app = express();
const PORT = 4000;
import multer from "multer";
import { ingestPdf } from "./ingestion";

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

app.post('/query', (request, response) => {

  const question = request.body.question;

  response.json({
    answer: `You asked: ${question}`
  })

})

app.post('/upload', upload.single("pdf"), async (request, response) => {
  
  if(!request.file?.path){
    return response.status(400).json({message: "No PDF uploaded"})
  }

  const requestPath = request.file.path

  const documents = await ingestPdf(requestPath);

  response.json({message: "PDF uploaded and read",
    documentCount: documents.length

  })
})


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


