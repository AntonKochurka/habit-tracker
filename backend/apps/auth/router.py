from fastapi import APIRouter, Depends
from db import AsyncSession, get_async_session

from .schemas import TokensPair, BlacklistTokenRequest, ObtainPairRequest
from .crud import AuthCrud
from .service import AuthService

async def get_service(db: AsyncSession = Depends(get_async_session)):
    return AuthService(AuthCrud(db))

router = APIRouter(prefix="/auth")

@router.post("/obtain")
async def obtain_pair(
    data: ObtainPairRequest, 
    service: AuthService = Depends(get_service)
):
    # HERE SHOULD BE SIGN IN

    user_id = 1

    access = service.encode_token(user_id, token_type="access")
    refresh = service.encode_token(user_id, token_type="refresh")

    return TokensPair(access=access, refresh=refresh)

@router.post("/refresh")
async def refresh_pair():
    return {}

@router.delete("/blacklist")
async def blacklist_pair():
    return {}