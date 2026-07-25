import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env } from "./types";
import { analyzeRoute } from "./routes/analyze";

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());

// Allow CORS from any origin so Page Pulse frontend (and preview deployments) can query the API seamlessly
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

app.get("/", (c) => c.json({ name: "Page Pulse API", status: "ok" }));
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

app.route("/api", analyzeRoute);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
