from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from db import AsyncSession, get_async_session

from .schemas import TokensPair, BlacklistTokenRequest, ObtainPairRequest, RefreshPairRequest
from .crud import AuthCrud
from .service import AuthService

async def get_service(db: AsyncSession = Depends(get_async_session)):
    return AuthService(AuthCrud(db))

router = APIRouter(prefix="/auth")


@router.post("/obtain", response_model=TokensPair)
async def obtain_pair(
    data: ObtainPairRequest,
    service: AuthService = Depends(get_service),
):
    # HERE SHOULD BE SIGN IN

    user_id = 1

    _, access = service.encode_token(user_id, token_type="access")
    expires, refresh = service.encode_token(user_id, token_type="refresh")

    body = TokensPair(access=access, refresh=refresh).model_dump()
    response = JSONResponse(content=body, status_code=status.HTTP_200_OK)
    
    service.set_refresh(response, refresh, expires)

    return response


@router.post("/refresh", response_model=TokensPair)
async def refresh_pair(
    data: RefreshPairRequest,
    service: AuthService = Depends(get_service),
):
    if not getattr(data, "refresh", None):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token was not provided")

    user_id = await service.decode_token(data.refresh)

    _, access = service.encode_token(user_id, token_type="access")
    expires, refresh = service.encode_token(user_id, token_type="refresh")

    body = TokensPair(access=access, refresh=refresh).model_dump()
    response = JSONResponse(content=body, status_code=status.HTTP_200_OK)
    
    service.set_refresh(response, refresh, expires)
    
    return response


@router.delete("/blacklist", status_code=status.HTTP_204_NO_CONTENT)
async def blacklist_pair(payload: BlacklistTokenRequest, service: AuthService = Depends(get_service)):
    jti = getattr(payload, "jti", None)
    token_type = getattr(payload, "token_type", None)

    if not jti or token_type not in ("access", "refresh"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="jti and valid token_type required")

    await service.crud.blacklist_jti_token(jti=jti, token_type=token_type)
    return JSONResponse(content=None, status_code=status.HTTP_204_NO_CONTENT)
