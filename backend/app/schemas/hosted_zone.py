import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

DOMAIN_REGEX = re.compile(r"^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$")

ZoneType = Literal["Public", "Private"]


class HostedZoneBase(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip().lower().rstrip(".")

        if len(value) > 253:
            raise ValueError("Domain name is too long.")

        if not DOMAIN_REGEX.fullmatch(value):
            raise ValueError("Invalid domain name.")

        return value


class HostedZoneCreate(HostedZoneBase):
    description: str | None = Field(default=None, max_length=500)
    type: ZoneType = "Public"
    vpc_id: str | None = Field(default=None, max_length=64)
    vpc_region: str | None = Field(default=None, max_length=64)

    @field_validator("vpc_id")
    @classmethod
    def validate_private_vpc(cls, value: str | None, info) -> str | None:
        return value


class HostedZoneUpdate(BaseModel):
    name: str | None = None
    description: str | None = Field(default=None, max_length=500)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return value

        value = value.strip().lower().rstrip(".")

        if len(value) > 253:
            raise ValueError("Domain name is too long.")

        if not DOMAIN_REGEX.fullmatch(value):
            raise ValueError("Invalid domain name.")

        return value


class HostedZoneResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    type: str = "Public"
    vpc_id: str | None = None
    vpc_region: str | None = None
    owner_id: int
    record_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
