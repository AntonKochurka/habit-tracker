from fastapi import APIRouter, Depends

from db import AsyncSession, get_async_session

from .crud import HabitCrud
from .service import HabitService

from apps.user.crud import UserCrud

async def get_service(db: AsyncSession = Depends(get_async_session)):
    return HabitService(
        habit_crud=HabitCrud(db),
        user_crud=UserCrud(db)
    )


router = APIRouter(prefix="/habits")

