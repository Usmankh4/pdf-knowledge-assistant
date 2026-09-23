import express from "express";
import cors from 'cors'
const app = express();
const PORT = 4000;


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


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


