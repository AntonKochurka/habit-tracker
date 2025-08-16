from fastapi import Depends, Cookie
from pydantic import BaseModel

class ObtainPairRequest(BaseModel): 
    identifier: str
    password: str

class RefreshPairRequest(BaseModel): 
    refresh: str | None = Cookie(None)

class BlacklistTokenRequest(BaseModel): 
    refresh: str | None = Cookie(None)
    access: str

class TokensPair(BaseModel): 
    refresh: str
    access: str

    class Config:
        from_attributes = True
