from app.exceptions.base import AppException


class UserAlreadyExistsError(AppException):
    status_code = 409
    detail = "Email already registered"


class InvalidCredentialsError(AppException):
    status_code = 401
    detail = "Invalid email or password"


class InvalidTokenError(AppException):
    status_code = 401
    detail = "Invalid or expired token"
