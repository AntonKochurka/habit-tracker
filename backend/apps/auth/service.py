from fastapi import HTTPException, Response
from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe

import jwt

from config import settings
from .crud import AuthCrud

class AuthService:
    def __init__(self, crud: AuthCrud):
        self.crud = crud

    def _now_ts(self) -> int:
        return int(datetime.now(tz=timezone.utc).timestamp())

    def encode_token(self, user_id: int, token_type: str) -> tuple[int, str]:
        """Make a token; return (exp_timestamp, token_str)."""
        now = datetime.now(tz=timezone.utc)

        if token_type == "access":
            exp = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        elif token_type == "refresh":
            exp = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        else:
            raise ValueError("Invalid token type. Use 'access' or 'refresh'.")

        iat_ts = int(now.timestamp())
        exp_ts = int(exp.timestamp())

        payload = {
            "sub": user_id,
            "type": token_type,
            "iat": iat_ts,
            "exp": exp_ts,
            "jti": token_urlsafe(32),
        }

        token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return exp_ts, token

    async def decode_token(self, token: str) -> int:
        """
        Decode token, verify signature/exp, check blacklist.
        Raises HTTPException(401) on invalid/expired/blacklisted.
        Returns user_id (int).
        """
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")

        jti = payload.get("jti")
        if not jti:
            raise HTTPException(status_code=401, detail="Missing jti in token")

        blacklisted = await self.crud.is_jti_blacklisted(jti)
        if blacklisted:
            raise HTTPException(status_code=401, detail="Token is blacklisted")

        return int(payload["sub"])

    def set_refresh(self, response: Response, refresh: str, expires: int):
        """Set refresh token as httponly cookie. `expires` is unix timestamp (seconds)."""
        max_age = max(0, int(expires) - self._now_ts())

        response.set_cookie(
            key="refresh",
            value=refresh,
            httponly=True,
            max_age=max_age,
            expires=expires,
            secure=True,
            samesite="lax",
            path="/",
        )
