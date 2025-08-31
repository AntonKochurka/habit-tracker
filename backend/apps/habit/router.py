from fastapi import APIRouter, Depends

from db import AsyncSession, get_async_session

from .crud import HabitCrud
from .service import HabitService
from .schemas import HabitCreateRequest

from apps.user.crud import UserCrud
from apps.auth.dependencies import get_current_user, User

async def get_service(db: AsyncSession = Depends(get_async_session)):
    return HabitService(
        habit_crud=HabitCrud(db),
        user_crud=UserCrud(db)
    )


router = APIRouter(prefix="/habits")


@router.post("/", status_code=201)
async def create_habit(
    data: HabitCreateRequest,
    service: HabitService = Depends(get_service),
    user: User = Depends(get_current_user),
):
    return await service.create_habit(data)