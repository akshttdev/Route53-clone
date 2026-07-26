from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.exceptions.auth import (
    InvalidCredentialsError,
    UserAlreadyExistsError,
)
from app.exceptions.dns_record import (
    DNSRecordAlreadyExistsError,
    DNSRecordNotFoundError,
)
from app.exceptions.dns_rules import DNSRuleViolationError
from app.exceptions.hosted_zone import (
    HostedZoneAlreadyExistsError,
    HostedZoneNotFoundError,
)


def register_exception_handlers(app: FastAPI):

    @app.exception_handler(UserAlreadyExistsError)
    async def user_already_exists_handler(
        request: Request,
        exc: UserAlreadyExistsError,
    ):
        return JSONResponse(
            status_code=400,
            content={"detail": exc.detail},
        )

    @app.exception_handler(InvalidCredentialsError)
    async def invalid_credentials_handler(
        request: Request,
        exc: InvalidCredentialsError,
    ):
        return JSONResponse(
            status_code=401,
            content={"detail": exc.detail},
        )

    @app.exception_handler(HostedZoneAlreadyExistsError)
    async def hosted_zone_already_exists_handler(
        request: Request,
        exc: HostedZoneAlreadyExistsError,
    ):
        return JSONResponse(
            status_code=400,
            content={"detail": exc.detail},
        )

    @app.exception_handler(HostedZoneNotFoundError)
    async def hosted_zone_not_found_handler(
        request: Request,
        exc: HostedZoneNotFoundError,
    ):
        return JSONResponse(
            status_code=404,
            content={"detail": exc.detail},
        )

    @app.exception_handler(DNSRecordAlreadyExistsError)
    async def dns_record_already_exists_handler(
        request: Request,
        exc: DNSRecordAlreadyExistsError,
    ):
        return JSONResponse(
            status_code=400,
            content={"detail": exc.detail},
        )

    @app.exception_handler(DNSRecordNotFoundError)
    async def dns_record_not_found_handler(
        request: Request,
        exc: DNSRecordNotFoundError,
    ):
        return JSONResponse(
            status_code=404,
            content={"detail": exc.detail},
        )

    @app.exception_handler(DNSRuleViolationError)
    async def dns_rule_violation_handler(
        request: Request,
        exc: DNSRuleViolationError,
    ):
        return JSONResponse(
            status_code=400,
            content={"detail": exc.detail},
        )
