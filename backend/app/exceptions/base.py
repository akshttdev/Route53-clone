class AppException(Exception):
    """
    Base exception for all business logic errors.
    """

    status_code = 400
    detail = "Application error"

    def __init__(self, detail: str | None = None):
        self.detail = detail or self.detail
