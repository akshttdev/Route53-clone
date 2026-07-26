from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.dns_record import DNSRecord
from app.models.hosted_zone import HostedZone


class HostedZoneRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        name: str,
        owner_id: int,
        description: str | None = None,
        zone_type: str = "Public",
        vpc_id: str | None = None,
        vpc_region: str | None = None,
    ) -> HostedZone:
        hosted_zone = HostedZone(
            name=name,
            owner_id=owner_id,
            description=description,
            zone_type=zone_type,
            vpc_id=vpc_id,
            vpc_region=vpc_region,
        )

        self.db.add(hosted_zone)
        self.db.flush()
        self.db.refresh(hosted_zone)

        return hosted_zone

    def get_by_name_and_owner(
        self,
        name: str,
        owner_id: int,
    ) -> HostedZone | None:
        return (
            self.db.query(HostedZone)
            .filter(
                HostedZone.name == name,
                HostedZone.owner_id == owner_id,
            )
            .first()
        )

    def get_by_name(self, name: str) -> HostedZone | None:
        return self.db.query(HostedZone).filter(HostedZone.name == name).first()

    def get_by_id(
        self,
        zone_id: int,
    ) -> HostedZone | None:
        return self.db.query(HostedZone).filter(HostedZone.id == zone_id).first()

    def list_by_owner(
        self,
        owner_id: int,
        skip: int = 0,
        limit: int = 20,
        q: str | None = None,
    ) -> list[HostedZone]:
        query = self.db.query(HostedZone).filter(HostedZone.owner_id == owner_id)

        if q:
            query = query.filter(
                or_(
                    HostedZone.name.ilike(f"%{q}%"),
                    HostedZone.description.ilike(f"%{q}%"),
                )
            )

        return query.order_by(HostedZone.name).offset(skip).limit(limit).all()

    def count_by_owner(
        self,
        owner_id: int,
        q: str | None = None,
    ) -> int:
        query = self.db.query(func.count(HostedZone.id)).filter(
            HostedZone.owner_id == owner_id
        )

        if q:
            query = query.filter(
                or_(
                    HostedZone.name.ilike(f"%{q}%"),
                    HostedZone.description.ilike(f"%{q}%"),
                )
            )

        return int(query.scalar() or 0)

    def record_count(self, zone_id: int) -> int:
        return int(
            self.db.query(func.count(DNSRecord.id))
            .filter(DNSRecord.hosted_zone_id == zone_id)
            .scalar()
            or 0
        )

    def update(
        self,
        hosted_zone: HostedZone,
    ) -> HostedZone:
        self.db.flush()
        self.db.refresh(hosted_zone)

        return hosted_zone

    def delete(
        self,
        hosted_zone: HostedZone,
    ) -> None:
        self.db.delete(hosted_zone)
        self.db.flush()
