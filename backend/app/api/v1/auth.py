from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.limiter import limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.get(
    "/me",
    response_model=UserResponse,
)
@limiter.limit("100/minute")
def me(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.post(
    "/register",
    response_model=UserResponse,
)
@limiter.limit("3/minute")
def register(
    request: Request,
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    return service.register(user_data)


@router.post(
    "/login",
    response_model=TokenResponse,
)
@limiter.limit("5/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    service = AuthService(db)

    user_data = UserLogin(
        email=form_data.username,
        password=form_data.password,
    )

    return service.login(user_data)
