# OmniEdge Studio

Unified Robotics IDE — monorepo.

[Continue working on v0 →](https://v0.app/chat/projects/prj_HUwNXzAEAj5k3XqhfIDW43D3F6T4)

## Workspace layout

```
.
├── frontend/       Next.js 16 + Tailwind 4 + shadcn/ui (UI only — no API routes)
├── backend/        Hono + AI SDK 6 — Oracle agent + validateConfiguration tool
└── package.json    Workspace root (pnpm + concurrently)
```

## Architecture

The frontend has **no `app/api/` route handlers**. Instead, `frontend/next.config.mjs`
declares a server-side rewrite that proxies `/api/*` → `${BACKEND_URL}/*`. The
browser always fetches same-origin (no CORS), but the actual request handling
happens in the Hono backend, which is fully decoupled and independently
deployable.

```
Browser ──► /api/chat (same-origin)
            │
            ▼
       Next.js rewrite (server-side)
            │
            ▼
       BACKEND_URL/chat (Hono)
            │
            ▼
       AI SDK 6 streamText + validateConfiguration tool
```

## Local development

```bash
pnpm install
pnpm dev
```

This runs **both** services concurrently:

- `backend` → http://localhost:3001 (Hono)
- `frontend` → http://localhost:3000 (Next.js, proxies `/api/*` to backend)

Open http://localhost:3000 — the Oracle chat in the bottom-right panel will
work out of the box.

To run them independently:

```bash
pnpm dev:backend
pnpm dev:frontend
```

## Production deployment

Deploy each workspace as its own Vercel project:

1. **Backend**: deploy `/backend` as a Node.js project. Note its public URL
   (e.g. `https://omniedge-backend.vercel.app`).
2. **Frontend**: deploy `/frontend` and set `BACKEND_URL=https://omniedge-backend.vercel.app`
   in Vercel project env. The rewrite picks it up at build time.

## Adding a new tool to the Oracle agent

1. Define the tool in `backend/src/oracle.ts` (or a new file imported there).
2. The frontend automatically renders any `tool-<toolName>` part of the
   streamed message — see `frontend/components/omni/oracle-chat.tsx`.

## Notes

- The frontend bundle no longer ships `streamText` / `convertToModelMessages` /
  `tool` — those are server-only and live in the backend.
- The frontend keeps `ai` for `DefaultChatTransport` and `UIMessage` types,
  and `@ai-sdk/react` for the `useChat` hook.
