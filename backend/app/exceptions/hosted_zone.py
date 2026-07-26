from app.exceptions.base import AppException


class HostedZoneAlreadyExistsError(AppException):
    status_code = 409
    detail = "Hosted zone already exists."


class HostedZoneNotFoundError(AppException):
    status_code = 404
    detail = "Hosted zone not found."
