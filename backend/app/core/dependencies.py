from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security.jwt import decode_access_token
from app.db.session import get_db
from app.exceptions.auth import InvalidTokenError
from app.models.user import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_access_token(token)

    email = payload.get("sub")

    if email is None:
        raise InvalidTokenError()

    repository = UserRepository(db)

    user = repository.get_by_email(email)

    if user is None:
        raise InvalidTokenError()

    return user
