import { createApp } from "./create-app.js";

const PORT = Number(process.env.PORT) || 4000;

const handlers = process.env.VERCEL
  ? await import("./cloud-handlers.js")
  : await import("./local-handlers.js");

const app = createApp({
  ingest: handlers.ingest,
  retrieve: handlers.retrieve,
  generate: handlers.generate,
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
