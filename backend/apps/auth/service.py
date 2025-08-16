from fastapi import HTTPException

from datetime import datetime, timedelta
from secrets import token_urlsafe

import jwt

from config import settings
from .crud import AuthCrud 

class AuthService:
    def __init__(self, crud: AuthCrud):
        self.crud = crud

    def encode_token(self, user_id: int, token_type: str) -> str:
        """Make a token using provide data"""
        now = datetime.utcnow()

        if token_type == "access":
            exp = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        elif token_type == "refresh":
            exp = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        else:
            raise ValueError("Invalid token type. Use 'access' or 'refresh'.")

        payload = {
            "sub": user_id,
            "type": token_type,
            "iat": now,
            "exp": exp,
            "jti": token_urlsafe(32)
        }

        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    async def decode_token(self, token: str) -> int:
        """
        Decode token, verify signature/exp, check blacklist.
        Raises jwt exceptions for invalid/expired tokens — caller should map to HTTP 401.
        Returns the user_id (sub) as int if valid and not blacklisted.
        """

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        except ExpiredSignatureError:
            raise HTTPException(401, detail="Token expired")
        except InvalidTokenError:
            raise InvalidTokenError(401, detail="Invalid token")

        jti = payload.get("jti")

        if not jti:
            raise InvalidTokenError("Missing jti in token")

        blacklisted = await self.crud.is_jti_blacklisted(jti)
        if blacklisted:
            raise InvalidTokenError("Token is blacklisted")

        return int(payload["sub"])