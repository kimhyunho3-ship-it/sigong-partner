import app from "./src/server/app";
import path from "path";
import { createServer as createViteServer } from "vite";

const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(expressStaticMiddleware(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[시공파트너] Server running on http://localhost:${PORT}`);
  });
}

// Helpers for cleaner static files serving without duplicate imports
function expressStaticMiddleware(distPath: string) {
  const express = require("express");
  return express.static(distPath);
}

startServer();
