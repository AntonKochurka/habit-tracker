from pydantic import BaseModel

class ObtainPairRequest(BaseModel): 
    identifier: str
    password: str

class RefreshPairRequest(BaseModel): 
    refresh: str

class BlacklistTokenRequest(BaseModel): 
    refresh: str
    access: str

class TokensPair(BaseModel): 
    access: str
    refresh: str

    class Config:
        from_attributes = True
