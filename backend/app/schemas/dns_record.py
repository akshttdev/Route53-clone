from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, field_validator


class DNSRecordType(str, Enum):
    A = "A"
    AAAA = "AAAA"
    CNAME = "CNAME"
    MX = "MX"
    TXT = "TXT"
    NS = "NS"
    SOA = "SOA"
    SRV = "SRV"
    PTR = "PTR"
    CAA = "CAA"


class DNSRecordBase(BaseModel):
    type: DNSRecordType
    name: str
    value: str
    ttl: int = 300

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip().lower()

        if not value:
            raise ValueError("Record name cannot be empty.")

        return value

    @field_validator("value")
    @classmethod
    def validate_value(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Record value cannot be empty.")

        return value

    @field_validator("ttl")
    @classmethod
    def validate_ttl(cls, value: int) -> int:
        if value < 1:
            raise ValueError("TTL must be greater than 0.")

        if value > 86400:
            raise ValueError("TTL cannot exceed 86400 seconds.")

        return value


class DNSRecordCreate(DNSRecordBase):
    pass


class DNSRecordUpdate(DNSRecordBase):
    pass


class DNSRecordResponse(BaseModel):
    id: int
    hosted_zone_id: int
    type: DNSRecordType
    name: str
    value: str
    ttl: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
