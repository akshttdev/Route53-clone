import json
from functools import lru_cache
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


def _parse_str_list(value: object) -> object:
    """Parse env list values: plain URL, comma-separated, or JSON array string."""
    if not isinstance(value, str):
        return value

    text = value.strip()
    if not text:
        return []

    if text.startswith("["):
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            parsed = None
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]

    return [part.strip() for part in text.split(",") if part.strip()]


class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int

    ENVIRONMENT: str = "development"

    DEBUG: bool = False

    # NoDecode: pydantic-settings otherwise JSON-decodes list[str] env values
    # before validators, crashing on plain URLs / comma-separated strings.
    BACKEND_CORS_ORIGINS: Annotated[list[str], NoDecode] = []

    ALLOWED_HOSTS: Annotated[list[str], NoDecode] = [
        "localhost",
        "127.0.0.1",
        "*.localhost",
    ]

    API_NAME: str = "Route53 Clone API"

    API_VERSION: str = "1.0.0"

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, value):
        return _parse_str_list(value)

    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def parse_hosts(cls, value):
        return _parse_str_list(value)

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()
