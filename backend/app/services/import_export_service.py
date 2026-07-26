from sqlalchemy.orm import Session

from app.exceptions.dns_record import DNSRecordAlreadyExistsError
from app.models.dns_record import DNSRecord
from app.models.user import User
from app.repositories.dns_record_repository import DNSRecordRepository
from app.services.dns_record_service import DNSRecordService
from app.schemas.dns_record import DNSRecordCreate, DNSRecordType
from app.utils.bind import export_zone_bind, export_zone_json, parse_bind_zone


class ImportExportService:
    def __init__(self, db: Session):
        self.db = db
        self.dns_service = DNSRecordService(db)
        self.dns_repository = DNSRecordRepository(db)

    def export_zone(
        self,
        hosted_zone_id: int,
        current_user: User,
        format: str = "json",
    ) -> tuple[str, str, str]:
        zone = self.dns_service.get_hosted_zone_for_user(
            hosted_zone_id,
            current_user,
        )
        records = self.dns_repository.list_by_hosted_zone(
            hosted_zone_id=hosted_zone_id,
            skip=0,
            limit=5000,
        )

        if format == "bind":
            content = export_zone_bind(zone, records)
            return content, "text/plain; charset=utf-8", f"{zone.name}.zone"

        content = export_zone_json(zone, records)
        return content, "application/json", f"{zone.name}.json"

    def import_bind(
        self,
        hosted_zone_id: int,
        current_user: User,
        content: str,
        replace_existing: bool = False,
    ) -> tuple[int, int, list[DNSRecord]]:
        zone = self.dns_service.get_hosted_zone_for_user(
            hosted_zone_id,
            current_user,
        )

        parsed = parse_bind_zone(content, zone.name)

        if replace_existing:
            existing = self.dns_repository.list_by_hosted_zone(
                hosted_zone_id=hosted_zone_id,
                skip=0,
                limit=5000,
            )
            for record in existing:
                if record.type in {"SOA", "NS"}:
                    continue
                self.dns_repository.delete(record)
            self.db.commit()

        imported = 0
        skipped = 0
        created: list[DNSRecord] = []

        for item in parsed:
            if item.type in {"SOA"}:
                # Keep the zone's existing SOA; skip imported SOA by default
                skipped += 1
                continue

            try:
                record_type = DNSRecordType(item.type)
            except ValueError:
                skipped += 1
                continue

            try:
                record = self.dns_service.create(
                    hosted_zone_id=hosted_zone_id,
                    dns_record=DNSRecordCreate(
                        type=record_type,
                        name=item.name,
                        value=item.value,
                        ttl=item.ttl,
                    ),
                    current_user=current_user,
                )
                created.append(record)
                imported += 1
            except DNSRecordAlreadyExistsError:
                skipped += 1
            except Exception:
                skipped += 1

        return imported, skipped, created

    def bulk_delete_records(
        self,
        hosted_zone_id: int,
        current_user: User,
        record_ids: list[int],
    ) -> int:
        self.dns_service.get_hosted_zone_for_user(
            hosted_zone_id,
            current_user,
        )

        deleted = 0
        try:
            for record_id in record_ids:
                record = self.dns_repository.get_by_id(record_id)
                if record is None or record.hosted_zone_id != hosted_zone_id:
                    continue
                # Protect apex SOA from bulk delete
                if record.type == "SOA":
                    continue
                self.dns_repository.delete(record)
                deleted += 1
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

        return deleted
