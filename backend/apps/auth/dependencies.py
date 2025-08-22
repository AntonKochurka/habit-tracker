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

access_token = HTTPBearer(scheme_name="access_token")
refresh_token = APIKeyCookie(name="refresh", scheme_name="refresh_token")


async def get_service(db: AsyncSession = Depends(get_async_session)):
    return AuthService(AuthCrud(db), UserCrud(db))

async def get_current_user(
    access: HTTPAuthorizationCredentials | None = Depends(access_token),
    service: AuthService = Depends(get_service)
) -> User | None:
    access_token = access.credentials
    if access is None or not access.credentials:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return await service.get_current_user(access_token)
