from fastapi import Depends
from pydantic import BaseModel

from .dependencies import access_token, refresh_token, HTTPAuthorizationCredentials

class ObtainPairRequest(BaseModel): 
    identifier: str
    password: str

class RefreshPairRequest(BaseModel): 
    refresh: str | None = Depends(refresh_token)

class BlacklistTokenRequest(BaseModel): 
    access: HTTPAuthorizationCredentials | None = Depends(access_token)
    refresh: str | None = Depends(refresh_token)


class TokensPair(BaseModel): 
    refresh: str
    access: str

    class Config:
        from_attributes = True
