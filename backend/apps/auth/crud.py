from typing import Literal

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from db import AsyncSession
from .models import BlacklistedToken

class AuthCrud:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def blacklist_jti_token(self, jti: str, token_type: Literal['access', 'refresh']) -> BlacklistedToken:
        """
        Insert a new blacklisted token row. If jti already exists, ignore.
        Returns the BlacklistedToken instance (new or existing).
        """
        instance = BlacklistedToken(jti=jti, token_type=token_type)
        
        self.db.add(instance)
        
        try:
            await self.db.commit()
            await self.db.refresh(instance)
            
            return instance
        except IntegrityError:
            await self.db.rollback()
            existing = await self.get_by_jti(jti)
            
            return existing

    async def is_jti_blacklisted(self, jti: str) -> bool:
        """Check if jti is blacklisted"""
        q = select(BlacklistedToken.jti).filter_by(jti=jti)
        result = await self.db.execute(q)
        
        return result.scalars().first() is not None
