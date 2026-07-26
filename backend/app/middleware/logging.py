import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("route53")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start = time.perf_counter()

        request_id = getattr(request.state, "request_id", "unknown")

        client_ip = request.client.host if request.client else "unknown"

        logger.info(
            "[%s] START method=%s path=%s ip=%s",
            request_id,
            request.method,
            request.url.path,
            client_ip,
        )

        response = await call_next(request)

        duration_ms = round(
            (time.perf_counter() - start) * 1000,
            2,
        )

        logger.info(
            "[%s] END method=%s path=%s status=%s ip=%s duration=%sms",
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            client_ip,
            duration_ms,
        )

        response.headers["X-Response-Time"] = f"{duration_ms}ms"

        return response
