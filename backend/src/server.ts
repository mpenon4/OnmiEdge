// OmniEdge backend: Hono server exposing the Oracle agent on POST /chat.
//
// In dev: `pnpm dev` starts on PORT (default 3001) and the Next.js frontend
// proxies /api/* to here via a server-side rewrite (no CORS).
//
// In prod: deploy this to a Vercel project (or any Node host) and set
// BACKEND_URL on the frontend to its public URL.

import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { serve } from "@hono/node-server"
import { streamOracleResponse, type OracleRequest } from "./oracle.js"

const app = new Hono()

app.use("*", logger())

// CORS — only relevant if the frontend talks directly to this backend
// (i.e. not via the Next.js rewrite). Permissive for dev; tighten in prod.
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    credentials: false,
  }),
)

app.get("/", (c) =>
  c.json({
    service: "omniedge-backend",
    version: "0.1.0",
    endpoints: ["POST /chat"],
  }),
)

app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() }),
)

app.post("/chat", async (c) => {
  const body = (await c.req.json()) as OracleRequest
  const response = await streamOracleResponse(body)
  // streamText().toUIMessageStreamResponse() returns a standard Response with
  // the AI SDK 6 SSE stream format. Hono lets us return it directly.
  return response
})

const PORT = Number(process.env.PORT ?? 3001)

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`[omniedge-backend] listening on http://localhost:${info.port}`)
  console.log(`[omniedge-backend] POST /chat ready`)
})

export default app
