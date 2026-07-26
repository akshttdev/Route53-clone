from sqlalchemy.orm import Session

from app.core.security.jwt import create_access_token
from app.core.security.password import hash_password, verify_password
from app.exceptions.auth import (
    InvalidCredentialsError,
    UserAlreadyExistsError,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenResponse, UserLogin, UserRegister


class AuthService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)

    def register(self, user_data: UserRegister) -> User:
        existing_user = self.user_repository.get_by_email(user_data.email)

        if existing_user:
            raise UserAlreadyExistsError()

        hashed_password = hash_password(user_data.password)

        return self.user_repository.create(
            email=user_data.email,
            hashed_password=hashed_password,
        )

    def login(self, user_data: UserLogin) -> TokenResponse:
        user = self.user_repository.get_by_email(user_data.email)

        if user is None or not verify_password(
            user_data.password,
            user.hashed_password,
        ):
            raise InvalidCredentialsError()

        access_token = create_access_token({"sub": user.email})

        return TokenResponse(
            access_token=access_token,
        )
