from typing import Optional
from fastapi import HTTPException, Depends
from fastapi.security import (
    HTTPBearer, 
    APIKeyCookie, 
    HTTPAuthorizationCredentials
)

from db import AsyncSession, get_async_session

from apps.user.models import User
from apps.user.crud import UserCrud

from .crud import AuthCrud
from .service import AuthService

access_token = HTTPBearer(scheme_name="access_token", auto_error=False)
refresh_token = APIKeyCookie(name="refresh", scheme_name="refresh_token")


async def get_service(db: AsyncSession = Depends(get_async_session)):
    return AuthService(AuthCrud(db), UserCrud(db))


async def get_optional_user(
    access: Optional[HTTPAuthorizationCredentials] = Depends(access_token),
    service: AuthService = Depends(get_service),
) -> Optional[User]:
    if not access or not access.credentials:
        return None
    try:
        return await service.get_current_user(access.credentials)
    except HTTPException as e:
        if e.status_code in (401, 403):
            return None
        raise

async def get_current_user(user: Optional[User] = Depends(get_optional_user)) -> User:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user