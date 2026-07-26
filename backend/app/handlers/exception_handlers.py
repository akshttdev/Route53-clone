from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.exceptions.base import AppException


async def rate_limit_exceeded_handler(
    request: Request,
    exc: RateLimitExceeded,
):
    request_id = getattr(request.state, "request_id", None)
    path = request.url.path

    if path.rstrip("/").endswith("/auth/login"):
        message = (
            "Too many login attempts. Please wait a minute and try again."
        )
    elif path.rstrip("/").endswith("/auth/register"):
        message = (
            "Too many registration attempts. Please wait a minute and try again."
        )
    else:
        message = "Too many requests. Please try again later."

    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "error": {
                "code": "RATE_LIMIT_EXCEEDED",
                "message": message,
            },
            "detail": message,
            "request_id": request_id,
        },
        headers={"Retry-After": "60"},
    )


def register_exception_handlers(app: FastAPI):

    @app.exception_handler(AppException)
    async def app_exception_handler(
        request: Request,
        exc: AppException,
    ):
        request_id = getattr(request.state, "request_id", None)

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.__class__.__name__.upper(),
                    "message": exc.detail,
                },
                "request_id": request_id,
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request,
        exc: Exception,
    ):
        request_id = getattr(request.state, "request_id", None)

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred.",
                },
                "request_id": request_id,
            },
        )
