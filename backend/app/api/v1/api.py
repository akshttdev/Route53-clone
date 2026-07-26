from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.dns_records import router as dns_record_router
from app.api.v1.health import router as health_router
from app.api.v1.hosted_zones import router as hosted_zone_router
from app.api.v1.import_export import router as import_export_router

api_router = APIRouter()

api_router.include_router(health_router)

api_router.include_router(auth_router)

api_router.include_router(hosted_zone_router)

api_router.include_router(dns_record_router)

api_router.include_router(import_export_router)
