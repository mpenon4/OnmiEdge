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

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/mpenon4/v0-onmiedge" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
