# AWS Route 53 Clone

A pixel-accurate clone of the AWS Route 53 console built with Cloudscape Design System. Features persistent storage, full DNS record management, and an authentic AWS console experience.

## Live demo

| Service | URL |
|---------|-----|
| Frontend (Vercel) | [https://route53-clone-sepia.vercel.app](https://route53-clone-sepia.vercel.app) |
| Backend (Render) | [https://route53-clone-3h48.onrender.com](https://route53-clone-3h48.onrender.com) |
| API health | [https://route53-clone-3h48.onrender.com/api/v1/health](https://route53-clone-3h48.onrender.com/api/v1/health) |
| API docs | [https://route53-clone-3h48.onrender.com/docs](https://route53-clone-3h48.onrender.com/docs) |

**Login:** `demo@example.com` / `password123`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (TypeScript), React Query, Cloudscape Design System |
| Backend | FastAPI, SQLAlchemy, Alembic, JWT auth |
| Database | SQLite |

## Features

### Authentication
- User registration and login with AWS-style UI
- JWT-based authentication with httpOnly cookies
- Protected routes with automatic redirection
- **Demo credentials**: `demo@example.com` / `password123`

### Hosted Zones
- Full CRUD operations
- Multi-select with bulk delete
- Search and filter
- Pagination with Cloudscape Table
- Type selection (Public/Private)
- Auto-created SOA + NS records

### DNS Records
- Full CRUD for all record types: A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA, SOA
- Multi-select with bulk delete
- Search and type filtering
- Import zone files (BIND format)
- Export zones (JSON or BIND format)
- Inline editing

### Console Features
- Cloudscape TopNavigation with dark mode toggle
- SideNavigation matching AWS Route 53
- Keyboard shortcuts (`?` for help)
- Tabs for Records and Details views
- BreadcrumbGroup navigation
- Cloudscape Modals, Tables, and Forms
- Toast notifications (sonner)

### Keyboard Shortcuts
- `?` - Show keyboard shortcuts help
- `g` + `h` - Go to Hosted zones
- `g` + `d` - Go to Dashboard
- `c` - Create hosted zone (on list page)
- `/` - Focus search/filter input
- `Escape` - Close modals

### Placeholder Pages
Dashboard, Health Checks, Traffic Policies, Resolver, Profiles (with Cloudscape Alert components)

## Project Structure

```
route53-clone/
├── backend/          # FastAPI API
│   ├── app/
│   │   ├── api/v1/   # Auth, hosted zones, DNS records
│   │   ├── models/   # SQLAlchemy ORM
│   │   ├── schemas/  # Pydantic DTOs
│   │   ├── services/ # Business logic
│   │   └── repositories/
│   └── alembic/      # Migrations
└── frontend/         # Next.js app
    ├── app/          # App Router pages
    ├── components/   # UI (layout, zones, records)
    ├── hooks/        # React Query hooks
    └── services/     # API clients
```

## Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- npm

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env if needed (SECRET_KEY, CORS origins)

alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend

```bash
cd frontend
npm install
# Optional: create .env.local with NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
# (defaults to that if unset; do not point this at a dead Render URL locally)
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

### Quick Start with Demo Account

1. Navigate to [http://localhost:3000/register](http://localhost:3000/register)
2. Create an account or use demo credentials at [http://localhost:3000/login](http://localhost:3000/login):
   - Email: `demo@example.com`
   - Password: `password123`

**Or register via API:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

3. Sign in and explore the Cloudscape-powered console

## Architecture Overview

```
Browser (Next.js)
  ├─ /api/auth/login  → proxies to FastAPI, sets httpOnly cookie
  ├─ Client axios     → Bearer JWT from localStorage → FastAPI
  └─ Middleware       → redirects unauthenticated users to /login

FastAPI
  ├─ JWT auth (OAuth2 password flow)
  ├─ HostedZoneService / DNSRecordService
  ├─ SQLAlchemy repositories
  └─ SQLite (Alembic migrations)
```

- Frontend owns the console UX and session cookie for route protection.
- Backend owns validation, ownership checks, DNS record rules, and persistence.

## Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| email | VARCHAR(255) | unique |
| hashed_password | VARCHAR(255) | bcrypt |
| created_at / updated_at | DATETIME | |

### `hosted_zones`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | VARCHAR(255) | unique FQDN |
| description | VARCHAR(500) | nullable |
| owner_id | INTEGER FK → users.id | CASCADE |
| created_at / updated_at | DATETIME | |

### `dns_records`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| hosted_zone_id | INTEGER FK → hosted_zones.id | CASCADE |
| type | VARCHAR(10) | A, AAAA, … |
| name | VARCHAR(255) | normalized |
| value | VARCHAR(1000) | |
| ttl | INTEGER | default 300 |
| created_at / updated_at | DATETIME | |

## API Overview

Base URL: `/api/v1`

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create user |
| POST | `/auth/login` | OAuth2 form → JWT |
| GET | `/auth/me` | Current user |

### Hosted Zones
| Method | Path | Description |
|--------|------|-------------|
| GET | `/hosted-zones` | List (`page`, `page_size`, `search`) |
| POST | `/hosted-zones` | Create (+ seed SOA/NS) |
| GET | `/hosted-zones/{id}` | Get |
| PATCH | `/hosted-zones/{id}` | Update name/description |
| DELETE | `/hosted-zones/{id}` | Delete zone + records |
| GET | `/hosted-zones/{id}/export` | Export zone (format: json/bind) |
| POST | `/hosted-zones/{id}/import` | Import zone file (BIND) |

### DNS Records
| Method | Path | Description |
|--------|------|-------------|
| GET | `/hosted-zones/{id}/records` | List (`page`, `page_size`, `search`, `type`) |
| POST | `/hosted-zones/{id}/records` | Create |
| GET | `/hosted-zones/{id}/records/{rid}` | Get |
| PATCH | `/hosted-zones/{id}/records/{rid}` | Update |
| DELETE | `/hosted-zones/{id}/records/{rid}` | Delete |
| POST | `/hosted-zones/{id}/records/bulk-delete` | Bulk delete (`record_ids`) |

List endpoints return:

```json
{ "items": [], "total": 0, "page": 1, "page_size": 20 }
```

### Health
| Method | Path |
|--------|------|
| GET | `/api/v1/health` |

## Demo credentials (for graders)

| Field | Value |
|-------|-------|
| Email | `demo@example.com` |
| Password | `password123` |

You can also create a new account via **Register**.

| Link | URL |
|------|-----|
| Frontend | [https://route53-clone-sepia.vercel.app](https://route53-clone-sepia.vercel.app) |
| Backend | [https://route53-clone-3h48.onrender.com](https://route53-clone-3h48.onrender.com) |
| Health | [https://route53-clone-3h48.onrender.com/api/v1/health](https://route53-clone-3h48.onrender.com/api/v1/health) |

## Deploy (free, stay awake for grading)

Free PaaS backends (Render free) **sleep after ~15 minutes** of no traffic. Graders then hit a cold start and may think the app is down. Fix this with a free uptime ping.

### Recommended stack (all free)

1. **Frontend → Vercel** (does not sleep) — do **not** deploy the frontend on Render
2. **Backend → Render** Web Service (**Python 3**, Root Directory `backend`) — see `RENDER_SETTINGS.md`
3. **Keep awake → UptimeRobot** (or cron-job.org) ping every 5 minutes

### 1) Deploy backend on Render

1. Push this repo to GitHub (already done once you push `main`).
2. Go to [https://render.com](https://render.com) → **New → Web Service** → connect `Route53-clone`.
3. Settings (copy exactly — **Root Directory must be `backend`** or `pip` cannot find `requirements.txt`):
   - **Runtime:** Python 3
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance:** Free
   - Python is pinned to 3.12.8 via `backend/runtime.txt` (avoids Render’s default 3.14)
4. Environment variables:

```text
DATABASE_URL=sqlite:///./route53.db
SECRET_KEY=<generate-a-long-random-string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENVIRONMENT=production
DEBUG=false
BACKEND_CORS_ORIGINS=https://YOUR-FRONTEND.vercel.app
ALLOWED_HOSTS=*
```

5. Deploy. Copy the URL, e.g. `https://route53-clone-api.onrender.com`.
6. Smoke test: open `https://YOUR-BACKEND.onrender.com/api/v1/health` — should return `healthy`.
7. Demo user is auto-seeded on boot: `demo@example.com` / `password123`.

> SQLite on free Render is ephemeral (resets on redeploy). Fine for assignment demos. For persistence, use free Neon Postgres and set `DATABASE_URL` to the Neon connection string.

### 2) Deploy frontend on Vercel

1. Go to [https://vercel.com](https://vercel.com) → **Add New Project** → import this repo.
2. **Root Directory:** `frontend`
3. Environment variable (required for production login — without it, Vercel cannot reach Render and login shows `fetch failed`):

```text
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.onrender.com/api/v1
```

   Set this under **Project → Settings → Environment Variables** for Production (and Preview if needed), then **redeploy**. Use your real Render URL (must include `/api/v1`, no trailing slash).

4. Deploy. Copy the URL, e.g. `https://route53-clone.vercel.app`.
5. Go back to Render and update `BACKEND_CORS_ORIGINS` to that Vercel URL, then redeploy backend once.

### 3) Stop free-tier sleep (important)

1. Create a free account at [https://uptimerobot.com](https://uptimerobot.com).
2. **Add New Monitor**:
   - Type: HTTP(s)
   - URL: `https://YOUR-BACKEND.onrender.com/api/v1/health`
   - Interval: every **5 minutes**
3. Optionally also monitor the Vercel frontend URL.

This keeps Render warm during the grading window without paying.

### 4) What to submit

Put this in your submission form / README / email:

```text
Demo URL: https://route53-clone-sepia.vercel.app
API URL:  https://route53-clone-3h48.onrender.com/api/v1
Login:    demo@example.com
Password: password123
GitHub:   https://github.com/akshttdev/Route53-clone
```

No separate “deployment key” is needed for graders — they use the public URL + demo login above. Do **not** share Render/Vercel account passwords.

## License

MIT
