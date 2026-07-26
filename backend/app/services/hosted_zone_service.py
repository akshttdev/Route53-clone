from sqlalchemy.orm import Session

from app.exceptions.hosted_zone import (
    HostedZoneAlreadyExistsError,
    HostedZoneNotFoundError,
)
from app.models.hosted_zone import HostedZone
from app.models.user import User
from app.repositories.dns_record_repository import DNSRecordRepository
from app.repositories.hosted_zone_repository import HostedZoneRepository
from app.schemas.hosted_zone import (
    HostedZoneCreate,
    HostedZoneResponse,
    HostedZoneUpdate,
)
from app.schemas.pagination import PaginatedResponse
from app.utils.dns import normalize_dns_name

DEFAULT_NS = [
    "ns-1536.awsdns-00.co.uk",
    "ns-0.awsdns-00.com",
    "ns-1024.awsdns-00.org",
    "ns-512.awsdns-00.net",
]


class HostedZoneService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = HostedZoneRepository(db)
        self.dns_repository = DNSRecordRepository(db)

    def _to_response(self, hosted_zone: HostedZone) -> HostedZoneResponse:
        return HostedZoneResponse(
            id=hosted_zone.id,
            name=hosted_zone.name,
            description=hosted_zone.description,
            type=hosted_zone.zone_type or "Public",
            vpc_id=hosted_zone.vpc_id,
            vpc_region=hosted_zone.vpc_region,
            owner_id=hosted_zone.owner_id,
            record_count=self.repository.record_count(hosted_zone.id),
            created_at=hosted_zone.created_at,
            updated_at=hosted_zone.updated_at,
        )

    def _seed_default_records(self, hosted_zone: HostedZone) -> None:
        zone_name = normalize_dns_name(hosted_zone.name)
        primary_ns = DEFAULT_NS[0]

        soa_value = (
            f"{primary_ns}. awsdns-hostmaster.amazon.com. "
            "1 7200 900 1209600 86400"
        )

        self.dns_repository.create(
            hosted_zone_id=hosted_zone.id,
            type="SOA",
            name=zone_name,
            value=soa_value,
            ttl=900,
        )

        for nameserver in DEFAULT_NS:
            self.dns_repository.create(
                hosted_zone_id=hosted_zone.id,
                type="NS",
                name=zone_name,
                value=f"{nameserver}.",
                ttl=172800,
            )

    def create(
        self,
        hosted_zone: HostedZoneCreate,
        current_user: User,
    ) -> HostedZoneResponse:
        existing_zone = self.repository.get_by_name(hosted_zone.name)

        if existing_zone:
            raise HostedZoneAlreadyExistsError()

        try:
            zone = self.repository.create(
                name=hosted_zone.name,
                owner_id=current_user.id,
                description=hosted_zone.description,
                zone_type=hosted_zone.type,
                vpc_id=hosted_zone.vpc_id if hosted_zone.type == "Private" else None,
                vpc_region=hosted_zone.vpc_region if hosted_zone.type == "Private" else None,
            )

            self._seed_default_records(zone)
            self.db.commit()
            self.db.refresh(zone)

            return self._to_response(zone)

        except Exception:
            self.db.rollback()
            raise

    def list_by_owner(
        self,
        current_user: User,
        page: int = 1,
        page_size: int = 20,
        q: str | None = None,
    ) -> PaginatedResponse[HostedZoneResponse]:
        skip = (page - 1) * page_size
        total = self.repository.count_by_owner(
            owner_id=current_user.id,
            q=q,
        )
        zones = self.repository.list_by_owner(
            owner_id=current_user.id,
            skip=skip,
            limit=page_size,
            q=q,
        )

        return PaginatedResponse(
            items=[self._to_response(zone) for zone in zones],
            total=total,
            page=page,
            page_size=page_size,
        )

    def get_by_id_for_user(
        self,
        zone_id: int,
        current_user: User,
    ) -> HostedZoneResponse:
        hosted_zone = self.repository.get_by_id(zone_id)

        if hosted_zone is None:
            raise HostedZoneNotFoundError()

        if hosted_zone.owner_id != current_user.id:
            raise HostedZoneNotFoundError()

        return self._to_response(hosted_zone)

    def get_model_for_user(
        self,
        zone_id: int,
        current_user: User,
    ) -> HostedZone:
        hosted_zone = self.repository.get_by_id(zone_id)

        if hosted_zone is None:
            raise HostedZoneNotFoundError()

        if hosted_zone.owner_id != current_user.id:
            raise HostedZoneNotFoundError()

        return hosted_zone

    def update(
        self,
        zone_id: int,
        hosted_zone_update: HostedZoneUpdate,
        current_user: User,
    ) -> HostedZoneResponse:
        hosted_zone = self.get_model_for_user(
            zone_id,
            current_user,
        )

        if hosted_zone_update.name is not None:
            existing_zone = self.repository.get_by_name(hosted_zone_update.name)

            if existing_zone and existing_zone.id != hosted_zone.id:
                raise HostedZoneAlreadyExistsError()

            hosted_zone.name = hosted_zone_update.name

        if hosted_zone_update.description is not None:
            hosted_zone.description = hosted_zone_update.description

        try:
            hosted_zone = self.repository.update(hosted_zone)
            self.db.commit()
            return self._to_response(hosted_zone)

        except Exception:
            self.db.rollback()
            raise

    def delete(
        self,
        zone_id: int,
        current_user: User,
    ) -> None:
        hosted_zone = self.get_model_for_user(
            zone_id,
            current_user,
        )

        try:
            self.repository.delete(hosted_zone)
            self.db.commit()

        except Exception:
            self.db.rollback()
            raise
