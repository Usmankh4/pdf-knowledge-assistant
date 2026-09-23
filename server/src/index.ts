import express from "express";
import cors from 'cors'
const app = express();
const PORT = 4000;
import multer from "multer";

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

app.post('/upload', upload.single("pdf"), (request, response) => {

  console.log(request.file);
  response.json({
    message: "PDF uploaded",
  })
})




app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


