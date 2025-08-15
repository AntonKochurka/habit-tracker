from typing import Protocol
from datetime import datetime, timedelta

from config import settings

import jwt  

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 30


class IAuthService(Protocol):
    def encode_token(self, user_id: int, token_type: str) -> str: ...
    def decode_token(self, token: str) -> int: ...


class AuthService:
    def __init__(self, crud):
        self.crud = crud

    def encode_token(self, user_id: int, token_type: str) -> str:
        now = datetime.utcnow()
        
        if token_type == "access":
            exp = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        elif token_type == "refresh":
            exp = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        else:
            raise ValueError("Invalid token type. Use 'access' or 'refresh'.")

        payload = {
            "sub": user_id,
            "type": token_type,
            "iat": now,
            "exp": exp
        }

        return jwt.encode(payload, settings.SECRET_KEY, algorithm=JWT_ALGORITHM)

    def decode_token(self, token: str) -> int:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[JWT_ALGORITHM])

        # TODO: check if token is blacklisted

        return payload["sub"]
