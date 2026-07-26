# Render Web Service — copy these exactly

## Service settings
- **Name:** route53-clone-api (any name)
- **Language / Runtime:** Docker
- **Root Directory:** `backend`
- **Branch:** `main`
- **Instance type:** Free
- **Dockerfile Path:** `./Dockerfile` (relative to Root Directory = backend)
- **Docker Build Context Directory:** `.` (leave default / same as root)

## Environment Variables
| Key | Value |
|-----|-------|
| `DATABASE_URL` | `sqlite:///./route53.db` |
| `SECRET_KEY` | *(long random string, e.g. paste output of `openssl rand -hex 32`)* |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
| `ENVIRONMENT` | `production` |
| `DEBUG` | `false` |
| `BACKEND_CORS_ORIGINS` | `https://route53-clone-sepia.vercel.app` |
| `ALLOWED_HOSTS` | `*` |

> Replace `BACKEND_CORS_ORIGINS` with your **exact** Vercel URL (no trailing slash).  
> If your Vercel domain is different (e.g. `something-sepia.vercel.app`), use that.

## After first deploy
1. Open `https://YOUR-SERVICE.onrender.com/api/v1/health` → should say healthy
2. Demo login auto-seeds: `demo@example.com` / `password123`
3. Set Vercel env `NEXT_PUBLIC_API_URL=https://YOUR-SERVICE.onrender.com/api/v1` and redeploy frontend
4. Add UptimeRobot monitor every 5 min on the `/api/v1/health` URL so free tier doesn’t sleep

## Vercel frontend settings
- **Root Directory:** `frontend`
- **Framework:** Next.js
- **Env:** `NEXT_PUBLIC_API_URL` = `https://YOUR-SERVICE.onrender.com/api/v1`
- **Redeploy** after pushing the middleware fix
