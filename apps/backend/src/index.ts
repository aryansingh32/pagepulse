import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env } from "./types";
import { analyzeRoute } from "./routes/analyze";

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());

app.use("*", async (c, next) => {
  const allowed = (c.env.ALLOWED_ORIGINS ?? "").split(",").map((o) => o.trim());
  return cors({
    origin: allowed.length > 0 ? allowed : "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })(c, next);
});

app.get("/", (c) => c.json({ name: "Page Pulse API", status: "ok" }));
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

app.route("/api", analyzeRoute);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
