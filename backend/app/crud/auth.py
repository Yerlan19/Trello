from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, Depends
from sqlalchemy.future import select
import jwt
from jwt import PyJWTError, ExpiredSignatureError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core import settings
from app.core.db import db_helper
from app.domain import Customer
from app.security.utils import verify_password

bearer_scheme = HTTPBearer(auto_error=False)

async def get_user_by_username(username: str, session: AsyncSession):
    result = await session.execute(select(Customer).filter(Customer.username == username))
    user = result.scalars().first()
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(db_helper.session_getter),
) -> Customer:
    """
    Достаём пользователя из JWT.
    """
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # ① заголовок отсутствует
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise cred_exc

    # ② извлекаем сам токен
    token = credentials.credentials

    # ③ декодируем JWT
    try:
        payload = jwt.decode(
            token,
            settings.jwt.secret_key,
            algorithms=[settings.jwt.algorithm],
        )
    except (ExpiredSignatureError, PyJWTError):
        raise cred_exc

    username: str | None = payload.get("sub")
    if username is None:
        raise cred_exc

    # ④ ищем пользователя в БД
    user = await get_user_by_username(username, session)
    if user is None:
        raise cred_exc

    return user

async def login_user(username: str, password: str, session: AsyncSession):
    user = await get_user_by_username(username, session)
    if user is None or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user