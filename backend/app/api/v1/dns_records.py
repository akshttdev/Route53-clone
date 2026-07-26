from fastapi import (
    APIRouter,
    Depends,
    Query,
    Request,
    status,
)
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.limiter import limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.dns_record import (
    DNSRecordCreate,
    DNSRecordResponse,
    DNSRecordUpdate,
)
from app.schemas.pagination import PaginatedResponse
from app.services.dns_record_service import DNSRecordService

router = APIRouter(
    prefix="/hosted-zones/{hosted_zone_id}/records",
    tags=["DNS Records"],
)


@router.post(
    "",
    response_model=DNSRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("60/minute")
def create_dns_record(
    request: Request,
    hosted_zone_id: int,
    dns_record: DNSRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DNSRecordService(db)

    return service.create(
        hosted_zone_id=hosted_zone_id,
        dns_record=dns_record,
        current_user=current_user,
    )


@router.get(
    "",
    response_model=PaginatedResponse[DNSRecordResponse],
)
@limiter.limit("120/minute")
def list_dns_records(
    request: Request,
    hosted_zone_id: int,
    q: str | None = Query(
        default=None,
        description="Search DNS records by name or value",
        max_length=255,
    ),
    search: str | None = Query(
        default=None,
        description="Alias for q",
        max_length=255,
    ),
    record_type: str | None = Query(
        default=None,
        alias="type",
        description="Filter by record type",
        max_length=10,
    ),
    ttl: int | None = Query(
        default=None,
        ge=0,
        description="Filter by TTL",
    ),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=100, ge=1, le=500),
    skip: int | None = Query(default=None, ge=0),
    limit: int | None = Query(default=None, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DNSRecordService(db)

    query = q or search

    if skip is not None or limit is not None:
        page_size = limit or page_size
        page = (skip // page_size) + 1 if skip else page

    return service.list_by_hosted_zone(
        hosted_zone_id=hosted_zone_id,
        current_user=current_user,
        page=page,
        page_size=page_size,
        q=query,
        record_type=record_type,
        ttl=ttl,
    )


@router.get(
    "/{record_id}",
    response_model=DNSRecordResponse,
)
def get_dns_record(
    hosted_zone_id: int,
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DNSRecordService(db)

    return service.get_by_id_for_user(
        hosted_zone_id=hosted_zone_id,
        record_id=record_id,
        current_user=current_user,
    )


@router.patch(
    "/{record_id}",
    response_model=DNSRecordResponse,
)
def update_dns_record(
    hosted_zone_id: int,
    record_id: int,
    dns_record: DNSRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DNSRecordService(db)

    return service.update(
        hosted_zone_id=hosted_zone_id,
        record_id=record_id,
        dns_record_update=dns_record,
        current_user=current_user,
    )


@router.delete(
    "/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_dns_record(
    hosted_zone_id: int,
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DNSRecordService(db)

    service.delete(
        hosted_zone_id=hosted_zone_id,
        record_id=record_id,
        current_user=current_user,
    )
