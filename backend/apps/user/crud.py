from db import AsyncSession
from utils.paginator import Paginator

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from .schemas import UserRead, UserCreateRequest
from .models import User

class UserCrud:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_user(self, data):
        instance = User(
            username=data.username,
            email=data.email,
            password=data.password,
            is_active=True,
            is_superuser=False
        )
        
        self.db.add(instance)
        
        try:
            await self.db.commit()
            await self.db.refresh(instance)
            
            return instance.to_dict()
        except IntegrityError:
            await self.db.rollback()

            raise HTTPException(detail="User arleady exists", status_code=status.HTTP_409_CONFLICT)

    async def get_users(self, page, filters):
        """
        Get users list with pagination utils.

        """
        
        pg = Paginator(
            User, item_model=UserRead, session=self.db
        )
        
        pg.filtrate_by_dict(filters)

        return await pg.paginate(page=page)
    
    async def get_user_by(self, field: str, value):
        """Get one single user or none"""

        return await (Paginator(User, session=self.db).filtrate(field, value).first())