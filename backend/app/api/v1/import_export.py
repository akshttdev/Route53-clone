from fastapi import APIRouter, Depends, Query, Response, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.dns_record import DNSRecordResponse
from app.services.import_export_service import ImportExportService

router = APIRouter(
    prefix="/hosted-zones/{hosted_zone_id}",
    tags=["Import / Export"],
)


class ImportBindRequest(BaseModel):
    content: str = Field(min_length=1)
    replace_existing: bool = False


class ImportBindResponse(BaseModel):
    imported: int
    skipped: int
    records: list[DNSRecordResponse]


class BulkDeleteRequest(BaseModel):
    record_ids: list[int] = Field(min_length=1)


class BulkDeleteResponse(BaseModel):
    deleted: int


@router.get("/export")
def export_hosted_zone(
    hosted_zone_id: int,
    format: str = Query(default="json", pattern="^(json|bind)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ImportExportService(db)
    content, media_type, filename = service.export_zone(
        hosted_zone_id=hosted_zone_id,
        current_user=current_user,
        format=format,
    )

    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )


@router.post(
    "/import",
    response_model=ImportBindResponse,
    status_code=status.HTTP_201_CREATED,
)
def import_bind_zone(
    hosted_zone_id: int,
    payload: ImportBindRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ImportExportService(db)
    imported, skipped, records = service.import_bind(
        hosted_zone_id=hosted_zone_id,
        current_user=current_user,
        content=payload.content,
        replace_existing=payload.replace_existing,
    )

    return ImportBindResponse(
        imported=imported,
        skipped=skipped,
        records=[DNSRecordResponse.model_validate(r) for r in records],
    )


@router.post(
    "/records/bulk-delete",
    response_model=BulkDeleteResponse,
)
def bulk_delete_records(
    hosted_zone_id: int,
    payload: BulkDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ImportExportService(db)
    deleted = service.bulk_delete_records(
        hosted_zone_id=hosted_zone_id,
        current_user=current_user,
        record_ids=payload.record_ids,
    )
    return BulkDeleteResponse(deleted=deleted)
