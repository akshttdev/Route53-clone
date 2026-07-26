# Render Web Service — copy these exactly

**Do not deploy the frontend on Render.** Frontend goes to **Vercel** (`Root Directory: frontend`).  
If you created one Render service for the whole repo, set **Root Directory** to `backend` only — that alone fixes `Could not open requirements file: requirements.txt`.

## Recommended: Python 3 (native, no Docker)

Set these in the Render dashboard:

| Setting | Value |
|---------|-------|
| **Language / Runtime** | **Python 3** |
| **Root Directory** | **`backend`** (critical — do not leave empty) |
| **Branch** | `main` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance type** | Free |

Python version is pinned via `backend/runtime.txt` (`python-3.12.8`) so Render does **not** pick 3.14. After you push that file, Render will use 3.12.8 automatically. Until then, Root Directory = `backend` still fixes the missing `requirements.txt` error.

### Why the build failed

`requirements.txt` lives in `backend/`, not the repo root. With Root Directory empty, Render runs `pip install -r requirements.txt` at the repo root and fails. You may also see a Node.js install step if Render mis-detects the monorepo — ignore that; this API service must be **Python 3** with Root Directory `backend`.

## Environment Variables

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `sqlite:///./route53.db` |
| `SECRET_KEY` | *(long random string, e.g. paste output of `openssl rand -hex 32`)* |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
| `ENVIRONMENT` | `production` |
| `DEBUG` | `false` |
| `BACKEND_CORS_ORIGINS` | `https://YOUR-FRONTEND.vercel.app` |
| `ALLOWED_HOSTS` | `*` |

**Exact Render format** (no spaces around `=`):

```
BACKEND_CORS_ORIGINS=https://YOUR-FRONTEND.vercel.app
ALLOWED_HOSTS=*
```

> Use your **exact** Vercel URL (no trailing slash). A single plain URL is enough — do **not** wrap it in JSON quotes/brackets unless you intentionally use a JSON array. Comma-separated origins also work: `https://a.vercel.app,http://localhost:3000`.

## After first deploy

1. Open `https://YOUR-SERVICE.onrender.com/api/v1/health` → should say healthy
2. Demo login auto-seeds: `demo@example.com` / `password123`
3. Set Vercel env `NEXT_PUBLIC_API_URL=https://YOUR-SERVICE.onrender.com/api/v1` and redeploy frontend
4. Add UptimeRobot monitor every 5 min on the `/api/v1/health` URL so free tier doesn’t sleep

## Optional: Docker (not required)

Only if you prefer Docker instead of native Python:

- **Root Directory:** *(leave empty)* and use repo-root `Dockerfile`, **or**
- **Root Directory:** `backend` with `backend/Dockerfile`

Native Python 3 (above) is the default path.

## Vercel frontend settings

- **Root Directory:** `frontend`
- **Framework:** Next.js
- **Env (required):** `NEXT_PUBLIC_API_URL` = `https://YOUR-SERVICE.onrender.com/api/v1`
  - Without this, production login fails with `Login failed: fetch failed`.
  - Must include `/api/v1`; no trailing slash; redeploy after changing.
- **Local:** use `http://127.0.0.1:8000/api/v1` in `frontend/.env.local` (or leave unset). Never point local env at a sleeping/dead Render URL.
