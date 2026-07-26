from sqlalchemy.orm import Session

from app.exceptions.dns_record import (
    DNSRecordAlreadyExistsError,
    DNSRecordNotFoundError,
)
from app.exceptions.dns_rules import DNSRuleViolationError
from app.exceptions.hosted_zone import HostedZoneNotFoundError
from app.models.dns_record import DNSRecord
from app.models.user import User
from app.repositories.dns_record_repository import DNSRecordRepository
from app.repositories.hosted_zone_repository import HostedZoneRepository
from app.schemas.dns_record import (
    DNSRecordCreate,
    DNSRecordResponse,
    DNSRecordUpdate,
)
from app.schemas.pagination import PaginatedResponse
from app.utils.dns import (
    normalize_dns_name,
    to_fqdn,
)
from app.validators.dns_validator import DNSValidator


class DNSRecordService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = DNSRecordRepository(db)
        self.hosted_zone_repository = HostedZoneRepository(db)

    def get_hosted_zone_for_user(
        self,
        hosted_zone_id: int,
        current_user: User,
    ):
        hosted_zone = self.hosted_zone_repository.get_by_id(hosted_zone_id)

        if hosted_zone is None:
            raise HostedZoneNotFoundError()

        if hosted_zone.owner_id != current_user.id:
            raise HostedZoneNotFoundError()

        return hosted_zone

    def _validate_dns_rules(
        self,
        hosted_zone_id: int,
        record_type: str,
        name: str,
        exclude_record_id: int | None = None,
    ) -> None:
        existing_records = self.repository.get_by_name(
            hosted_zone_id=hosted_zone_id,
            name=name,
        )

        if exclude_record_id is not None:
            existing_records = [
                record for record in existing_records if record.id != exclude_record_id
            ]

        if record_type == "SOA":
            soa = self.repository.get_soa(hosted_zone_id)

            if soa and soa.id != exclude_record_id:
                raise DNSRuleViolationError(
                    "A hosted zone can only contain one SOA record."
                )

        if record_type == "CNAME":
            if existing_records:
                raise DNSRuleViolationError(
                    "A CNAME record cannot coexist with any other record."
                )

        else:
            for record in existing_records:
                if record.type == "CNAME":
                    raise DNSRuleViolationError(
                        "Cannot create this record because a CNAME already exists."
                    )

    def _validate_apex_rules(
        self,
        hosted_zone_id: int,
        record_type: str,
        name: str,
    ) -> None:
        hosted_zone = self.hosted_zone_repository.get_by_id(hosted_zone_id)

        zone_name = normalize_dns_name(hosted_zone.name)
        record_name = normalize_dns_name(name)

        is_apex = record_name == "@" or record_name == zone_name

        if record_type == "SOA" and not is_apex:
            raise DNSRuleViolationError("SOA records must be created at the zone apex.")

        if record_type == "NS" and not is_apex:
            raise DNSRuleViolationError("NS records must be created at the zone apex.")

        if record_type == "CNAME" and is_apex:
            raise DNSRuleViolationError(
                "CNAME records are not allowed at the zone apex."
            )

    def _validate_wildcard(
        self,
        name: str,
    ) -> None:
        if "*" not in name:
            return

        if not name.startswith("*."):
            raise DNSRuleViolationError("Wildcard records must begin with '*.'.")

        if name.count("*") > 1:
            raise DNSRuleViolationError("Only one wildcard is allowed.")

        if "*" in name[2:]:
            raise DNSRuleViolationError(
                "Wildcard may only appear as the left-most label."
            )

    def create(
        self,
        hosted_zone_id: int,
        dns_record: DNSRecordCreate,
        current_user: User,
    ) -> DNSRecord:

        try:
            hosted_zone = self.get_hosted_zone_for_user(
                hosted_zone_id,
                current_user,
            )

            dns_record.name = to_fqdn(
                dns_record.name,
                hosted_zone.name,
            )

            DNSValidator.validate(dns_record)

            self._validate_apex_rules(
                hosted_zone_id,
                dns_record.type.value,
                dns_record.name,
            )

            self._validate_wildcard(
                dns_record.name,
            )

            self._validate_dns_rules(
                hosted_zone_id,
                dns_record.type.value,
                dns_record.name,
            )

            duplicate = self.repository.get_duplicate(
                hosted_zone_id=hosted_zone_id,
                type=dns_record.type.value,
                name=dns_record.name,
                value=dns_record.value,
            )

            if duplicate:
                raise DNSRecordAlreadyExistsError()

            record = self.repository.create(
                hosted_zone_id=hosted_zone_id,
                type=dns_record.type.value,
                name=dns_record.name,
                value=dns_record.value,
                ttl=dns_record.ttl,
            )

            self.db.commit()

            return record

        except Exception:
            self.db.rollback()
            raise

    def list_by_hosted_zone(
        self,
        hosted_zone_id: int,
        current_user: User,
        page: int = 1,
        page_size: int = 100,
        q: str | None = None,
        record_type: str | None = None,
        ttl: int | None = None,
    ) -> PaginatedResponse[DNSRecordResponse]:
        self.get_hosted_zone_for_user(
            hosted_zone_id,
            current_user,
        )

        skip = (page - 1) * page_size
        total = self.repository.count_by_hosted_zone(
            hosted_zone_id=hosted_zone_id,
            q=q,
            record_type=record_type,
            ttl=ttl,
        )
        items = self.repository.list_by_hosted_zone(
            hosted_zone_id=hosted_zone_id,
            skip=skip,
            limit=page_size,
            q=q,
            record_type=record_type,
            ttl=ttl,
        )

        return PaginatedResponse(
            items=[DNSRecordResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    def get_by_id_for_user(
        self,
        hosted_zone_id: int,
        record_id: int,
        current_user: User,
    ) -> DNSRecord:
        dns_record = self.repository.get_by_id(record_id)

        if dns_record is None:
            raise DNSRecordNotFoundError()

        if dns_record.hosted_zone_id != hosted_zone_id:
            raise DNSRecordNotFoundError()

        self.get_hosted_zone_for_user(
            hosted_zone_id,
            current_user,
        )

        return dns_record

    def update(
        self,
        hosted_zone_id: int,
        record_id: int,
        dns_record_update: DNSRecordUpdate,
        current_user: User,
    ) -> DNSRecord:

        try:
            hosted_zone = self.get_hosted_zone_for_user(
                hosted_zone_id,
                current_user,
            )

            dns_record_update.name = to_fqdn(
                dns_record_update.name,
                hosted_zone.name,
            )

            DNSValidator.validate(dns_record_update)

            self._validate_apex_rules(
                hosted_zone_id,
                dns_record_update.type.value,
                dns_record_update.name,
            )

            self._validate_wildcard(
                dns_record_update.name,
            )

            dns_record = self.get_by_id_for_user(
                hosted_zone_id,
                record_id,
                current_user,
            )

            self._validate_dns_rules(
                hosted_zone_id=hosted_zone_id,
                record_type=dns_record_update.type.value,
                name=dns_record_update.name,
                exclude_record_id=dns_record.id,
            )

            duplicate = self.repository.get_duplicate(
                hosted_zone_id=hosted_zone_id,
                type=dns_record_update.type.value,
                name=dns_record_update.name,
                value=dns_record_update.value,
            )

            if duplicate and duplicate.id != dns_record.id:
                raise DNSRecordAlreadyExistsError()

            dns_record.type = dns_record_update.type.value
            dns_record.name = dns_record_update.name
            dns_record.value = dns_record_update.value
            dns_record.ttl = dns_record_update.ttl

            record = self.repository.update(dns_record)

            self.db.commit()

            return record

        except Exception:
            self.db.rollback()
            raise

    def delete(
        self,
        hosted_zone_id: int,
        record_id: int,
        current_user: User,
    ) -> None:

        try:
            dns_record = self.get_by_id_for_user(
                hosted_zone_id,
                record_id,
                current_user,
            )

            self.repository.delete(dns_record)

            self.db.commit()

        except Exception:
            self.db.rollback()
            raise
