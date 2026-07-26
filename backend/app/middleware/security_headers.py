from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)

        # MIME sniffing protection
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # Prevent referrer leakage
        response.headers["Referrer-Policy"] = "no-referrer"

        # Disable unnecessary browser features
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=()"
        )

        # Prevent Adobe Flash / Acrobat cross-domain policies
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"

        # Prevent cross-origin window attacks
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"

        # Allow browser clients on other origins (Next.js) to consume API responses
        response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"

        # Hide technology information
        if "server" in response.headers:
            del response.headers["server"]

        # Enable HSTS only in production
        if settings.ENVIRONMENT.lower() == "production":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )

        return response
