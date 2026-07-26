from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.limiter import limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.hosted_zone import (
    HostedZoneCreate,
    HostedZoneResponse,
    HostedZoneUpdate,
)
from app.schemas.pagination import PaginatedResponse
from app.services.hosted_zone_service import HostedZoneService

router = APIRouter(
    prefix="/hosted-zones",
    tags=["Hosted Zones"],
)


@router.post(
    "",
    response_model=HostedZoneResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("30/minute")
def create_hosted_zone(
    request: Request,
    hosted_zone: HostedZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HostedZoneService(db)

    return service.create(
        hosted_zone=hosted_zone,
        current_user=current_user,
    )


@router.get(
    "",
    response_model=PaginatedResponse[HostedZoneResponse],
)
@limiter.limit("120/minute")
def list_hosted_zones(
    request: Request,
    q: str | None = Query(
        default=None,
        description="Search hosted zones by name or description",
        max_length=255,
    ),
    search: str | None = Query(
        default=None,
        description="Alias for q",
        max_length=255,
    ),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    skip: int | None = Query(default=None, ge=0),
    limit: int | None = Query(default=None, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HostedZoneService(db)

    query = q or search

    if skip is not None or limit is not None:
        page_size = limit or page_size
        page = (skip // page_size) + 1 if skip else page

    return service.list_by_owner(
        current_user=current_user,
        page=page,
        page_size=page_size,
        q=query,
    )


@router.get(
    "/{zone_id}",
    response_model=HostedZoneResponse,
)
@limiter.limit("120/minute")
def get_hosted_zone(
    request: Request,
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HostedZoneService(db)

    return service.get_by_id_for_user(
        zone_id,
        current_user,
    )


@router.patch(
    "/{zone_id}",
    response_model=HostedZoneResponse,
)
@limiter.limit("30/minute")
def update_hosted_zone(
    request: Request,
    zone_id: int,
    hosted_zone: HostedZoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HostedZoneService(db)

    return service.update(
        zone_id=zone_id,
        hosted_zone_update=hosted_zone,
        current_user=current_user,
    )


@router.delete(
    "/{zone_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
@limiter.limit("30/minute")
def delete_hosted_zone(
    request: Request,
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HostedZoneService(db)

    service.delete(
        zone_id,
        current_user,
    )
