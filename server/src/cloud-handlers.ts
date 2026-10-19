import { ingestPdfCloud, retrieveCloud } from "./cloud-rag.js";
import { generateWithGateway } from "./generate-gateway.js";

export const ingest = ingestPdfCloud;
export const retrieve = retrieveCloud;
export const generate = generateWithGateway;
