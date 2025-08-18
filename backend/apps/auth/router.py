from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from db import AsyncSession, get_async_session

from .schemas import TokensPair, BlacklistTokenRequest, ObtainPairRequest, RefreshPairRequest
from .crud import AuthCrud
from .service import AuthService
from .dependencies import refresh_token

from apps.user.crud import UserCrud

async def get_service(db: AsyncSession = Depends(get_async_session)):
    return AuthService(AuthCrud(db), UserCrud(db))

router = APIRouter(prefix="/auth")


@router.post("/obtain", response_model=TokensPair)
async def obtain_pair(
    data: ObtainPairRequest,
    service: AuthService = Depends(get_service),
):
    user_id = await service.verify_user(username=data.identifier, password=data.password)

    if user_id is None:
        raise HTTPException(detail="User doesn't exist", status_code=status.HTTP_404_NOT_FOUND)

    _, access = service.encode_token(user_id, token_type="access")
    expires, refresh = service.encode_token(user_id, token_type="refresh")

    body = TokensPair(access=access, refresh=refresh).model_dump()
    response = JSONResponse(content=body, status_code=status.HTTP_200_OK)
    
    service.set_refresh(response, refresh, expires)

    return response


@router.post("/refresh", response_model=TokensPair)
async def refresh_pair(
    data: RefreshPairRequest = Depends(),
    service: AuthService = Depends(get_service),
):
    if not data.refresh:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Refresh token was not provided"
        )

    user_id = await service.decode_token_id(data.refresh)

    _, access = service.encode_token(user_id, token_type="access")
    expires, refresh = service.encode_token(user_id, token_type="refresh")

    body = TokensPair(access=access, refresh=refresh).model_dump()
    response = JSONResponse(content=body, status_code=status.HTTP_200_OK)
    
    service.set_refresh(response, refresh, expires)
    
    return response

@router.delete("/blacklist")
async def blacklist_pair(
    body: BlacklistTokenRequest = Depends(),
    service: AuthService = Depends(get_service)
): 
    for token, token_type in zip((body.access.credentials, body.refresh,), ('access', 'refresh')):
        print(token, token_type)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail=f"{token_type.capitalize()} token was not provided"
            )
        
        payload = await service.decode_token(token)
        await service.auth_crud.blacklist_jti_token(jti=payload.get("jti"), token_type=token_type)
    
    response = JSONResponse(None, status_code=status.HTTP_204_NO_CONTENT)
    response.delete_cookie("refresh")

    return response