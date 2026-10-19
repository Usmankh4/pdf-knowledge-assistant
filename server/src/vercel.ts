import { createApp } from "./app.js";
import { ingestPdfCloud, retrieveCloud } from "./cloud-rag.js";
import { generateWithGateway } from "./generate-gateway.js";

const app = createApp({
  ingest: ingestPdfCloud,
  retrieve: retrieveCloud,
  generate: generateWithGateway,
});

export default app;
