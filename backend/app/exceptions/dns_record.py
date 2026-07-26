from app.exceptions.base import AppException


class DNSRecordNotFoundError(AppException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="DNS record not found.",
        )


class DNSRecordAlreadyExistsError(AppException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="DNS record already exists.",
        )
