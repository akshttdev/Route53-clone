from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.limiter import limiter
from app.core.logging import setup_logging
from app.core.security.password import hash_password
from app.db.session import SessionLocal
from app.handlers.exception_handlers import (
    rate_limit_exceeded_handler,
    register_exception_handlers,
)
from app.middleware.logging import LoggingMiddleware
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.repositories.user_repository import UserRepository

setup_logging()


def seed_demo_user() -> None:
    db = SessionLocal()
    try:
        repo = UserRepository(db)
        email = "demo@example.com"
        if repo.get_by_email(email) is None:
            repo.create(
                email=email,
                hashed_password=hash_password("password123"),
            )
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    seed_demo_user()
    yield


app = FastAPI(
    title="Route53 Clone API",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------
# Rate Limiter
# ---------------------------------------------------------------------

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    rate_limit_exceeded_handler,
)

# ---------------------------------------------------------------------
# Middlewares
# ---------------------------------------------------------------------

app.add_middleware(RequestIDMiddleware)

app.add_middleware(LoggingMiddleware)

app.add_middleware(SlowAPIMiddleware)

app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    GZipMiddleware,
    minimum_size=1024,
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS or ["*"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------
# Exception Handlers
# ---------------------------------------------------------------------

register_exception_handlers(app)

# ---------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------

app.include_router(
    api_router,
    prefix="/api/v1",
)
