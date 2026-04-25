# OmniEdge Studio · Monorepo

Full-stack hardware configuration and debugging platform combining Next.js frontend with FastAPI backend.

## 📁 Project Structure

```
omniedge-studio/
├── /frontend          # Next.js UI
│   ├── /app
│   ├── /components
│   ├── /hooks
│   ├── package.json
│   └── Dockerfile
├── /backend           # FastAPI engine
│   ├── main.py
│   ├── hardware_manifest.yaml
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml # Run everything locally
└── .github/workflows  # CI/CD automation
```

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)
```bash
docker-compose up
```
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend (in new terminal):**
```bash
cd frontend
npm install
npm run dev
```

## 🌳 Git Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch  
- `feature/*` - Individual feature branches

## 👥 Team Collaboration Workflow

### For Each Team Member:

```bash
# 1. Get latest develop
git checkout develop
git pull origin develop

# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Work on your changes (isolated from teammates)

# 4. Commit frequently
git add .
git commit -m "feat: your changes"
git push origin feature/your-feature-name

# 5. Create Pull Request on GitHub for review
# -> Team reviews and approves
# -> Merge to develop
# -> Delete feature branch
```

### Suggested Role Division:

- **Frontend Developer:** Work in `/frontend`
  - UI Components
  - State Management
  - Styling

- **Backend Developer:** Work in `/backend`
  - API Endpoints
  - Hardware Integration
  - Telemetry Logic

### Learn More

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
