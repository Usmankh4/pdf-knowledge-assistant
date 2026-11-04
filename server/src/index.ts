import express from "express";
import cors from 'cors'
import queryRouter from "./routes/queryRoutes";
import uploadPDFRouter from "./routes/uploadRoute";
import uploadErrorHandler from "./middleware/uploadErrorHandler";
import "dotenv/config"
const app = express();
const PORT = Number(process.env.PORT) || 4000;


app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));
app.use(express.json())

app.use("/query", queryRouter);
app.use("/upload" , uploadPDFRouter, uploadErrorHandler)

app.get('/health', (request, response) => {
  response.json({
    status: "ok"
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
