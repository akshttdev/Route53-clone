from datetime import UTC, datetime

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get(
    "",
    summary="Health Check",
)
def health():
    return {
        "status": "healthy",
        "service": settings.API_NAME,
        "version": settings.API_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(UTC).isoformat(),
    }
