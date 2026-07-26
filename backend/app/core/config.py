from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int

    ENVIRONMENT: str = "development"

    DEBUG: bool = False

    BACKEND_CORS_ORIGINS: list[str] = []

    ALLOWED_HOSTS: list[str] = ["localhost", "127.0.0.1", "*.localhost"]

    API_NAME: str = "Route53 Clone API"

    API_VERSION: str = "1.0.0"

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]

        return value

    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def parse_hosts(cls, value):
        if isinstance(value, str):
            return [host.strip() for host in value.split(",") if host.strip()]

        return value

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()
