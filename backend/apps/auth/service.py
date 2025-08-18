from fastapi import HTTPException, Response, status
from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe

import jwt

from config import settings
from .crud import AuthCrud

from apps.user.crud import UserCrud, User
from utils.security import verify_password

class AuthService:
    def __init__(self, auth_crud: AuthCrud, user_crud: UserCrud):
        self.auth_crud = auth_crud
        self.user_crud = user_crud

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
            "sub": str(user_id),
            "type": token_type,
            "iat": iat_ts,
            "exp": exp_ts,
            "jti": token_urlsafe(32),
        }

        token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return exp_ts, token

    async def decode_token(self, token: str) -> dict:
        """
        Decode token, verify signature/exp, check blacklist.
        Raises HTTPException(401) on invalid/expired/blacklisted.
        Returns payload.
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

        blacklisted = await self.auth_crud.is_jti_blacklisted(jti)
        if blacklisted:
            raise HTTPException(status_code=401, detail="Token is blacklisted")
        
        return payload

    async def decode_token_id(self, token) -> int:
        """Return just id"""
        
        payload = await self.decode_token(token) 
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

    async def verify_user(self, username, password) -> User | None:
        """
        Returns user id if password is correct
        If not, None
        """
        user = await self.user_crud.get_user_by("username", username)

        if user is None:
            raise HTTPException(detail="User with this username does'nt exist", status_code=status.HTTP_404_NOT_FOUND)
        
        return user.id if verify_password(password, user.password) else None

    async def get_current_user(self, token) -> User | None:
        """Returns user by token"""
        user_id = self.decode_token_id(token)
        
        return (await self.user_crud.get_user_by("id", user_id))