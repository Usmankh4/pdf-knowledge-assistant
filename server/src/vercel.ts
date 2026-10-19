import { createApp } from "./app";
import { ingestPdfCloud, retrieveCloud } from "./cloud-rag";
import { generateWithGateway } from "./generate-gateway";

const app = createApp({
  ingest: ingestPdfCloud,
  retrieve: retrieveCloud,
  generate: generateWithGateway,
});

export default app;
