from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.dns_record import DNSRecord
from app.utils.dns import normalize_dns_name


class DNSRecordRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        hosted_zone_id: int,
        type: str,
        name: str,
        value: str,
        ttl: int,
    ) -> DNSRecord:
        dns_record = DNSRecord(
            hosted_zone_id=hosted_zone_id,
            type=type,
            name=normalize_dns_name(name),
            value=value,
            ttl=ttl,
        )

        self.db.add(dns_record)
        self.db.flush()
        self.db.refresh(dns_record)

        return dns_record

    def count_by_hosted_zone(
        self,
        hosted_zone_id: int,
        q: str | None = None,
        record_type: str | None = None,
        ttl: int | None = None,
    ) -> int:
        query = self.db.query(func.count(DNSRecord.id)).filter(
            DNSRecord.hosted_zone_id == hosted_zone_id,
        )

        if q:
            query = query.filter(
                or_(
                    DNSRecord.name.ilike(f"%{q}%"),
                    DNSRecord.value.ilike(f"%{q}%"),
                )
            )

        if record_type:
            query = query.filter(DNSRecord.type == record_type)

        if ttl is not None:
            query = query.filter(DNSRecord.ttl == ttl)

        return int(query.scalar() or 0)

    def get_by_id(
        self,
        record_id: int,
    ) -> DNSRecord | None:
        return self.db.query(DNSRecord).filter(DNSRecord.id == record_id).first()

    def get_duplicate(
        self,
        hosted_zone_id: int,
        type: str,
        name: str,
        value: str,
    ) -> DNSRecord | None:
        return (
            self.db.query(DNSRecord)
            .filter(
                DNSRecord.hosted_zone_id == hosted_zone_id,
                DNSRecord.type == type,
                DNSRecord.name == normalize_dns_name(name),
                DNSRecord.value == value,
            )
            .first()
        )

    def list_by_hosted_zone(
        self,
        hosted_zone_id: int,
        skip: int = 0,
        limit: int = 100,
        q: str | None = None,
        record_type: str | None = None,
        ttl: int | None = None,
    ) -> list[DNSRecord]:
        query = self.db.query(DNSRecord).filter(
            DNSRecord.hosted_zone_id == hosted_zone_id,
        )

        if q:
            query = query.filter(
                or_(
                    DNSRecord.name.ilike(f"%{q}%"),
                    DNSRecord.value.ilike(f"%{q}%"),
                )
            )

        if record_type:
            query = query.filter(
                DNSRecord.type == record_type,
            )

        if ttl is not None:
            query = query.filter(
                DNSRecord.ttl == ttl,
            )

        return (
            query.order_by(
                DNSRecord.name,
                DNSRecord.type,
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update(
        self,
        dns_record: DNSRecord,
    ) -> DNSRecord:
        dns_record.name = normalize_dns_name(dns_record.name)

        self.db.flush()
        self.db.refresh(dns_record)

        return dns_record

    def delete(
        self,
        dns_record: DNSRecord,
    ) -> None:
        self.db.delete(dns_record)
        self.db.flush()

    def get_by_name(
        self,
        hosted_zone_id: int,
        name: str,
    ) -> list[DNSRecord]:
        return (
            self.db.query(DNSRecord)
            .filter(
                DNSRecord.hosted_zone_id == hosted_zone_id,
                DNSRecord.name == normalize_dns_name(name),
            )
            .all()
        )

    def get_soa(
        self,
        hosted_zone_id: int,
    ) -> DNSRecord | None:
        return (
            self.db.query(DNSRecord)
            .filter(
                DNSRecord.hosted_zone_id == hosted_zone_id,
                DNSRecord.type == "SOA",
            )
            .first()
        )
