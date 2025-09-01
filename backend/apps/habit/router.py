from typing import Dict, Any
from fastapi import APIRouter, Depends, Query
from datetime import datetime

from db import AsyncSession, get_async_session

from .crud import HabitCrud
from .models import Habit
from .service import HabitService
from .schemas import HabitCreateRequest

from apps.user.crud import UserCrud
from apps.auth.dependencies import get_current_user, User
from apps.folder.crud import FolderCrud

from utils.dependencies import create_filter_dependency

async def get_service(db: AsyncSession = Depends(get_async_session)):
    return HabitService(
        habit_crud=HabitCrud(db),
        user_crud=UserCrud(db),
        folder_crud=FolderCrud(db)
    )


router = APIRouter(prefix="/habits")


@router.get("")
async def get_habits_list(
    filters: Dict[str, Any] = Depends(create_filter_dependency(Habit)),
    page: int = Query(1, ge=1),
    current_day: str = Query(datetime.utcnow()),
    is_representative: bool = Query(False),
    service: HabitService = Depends(get_service),
):
    return await service.habit_crud.get_habits(page, filters, is_representative, current_day)


@router.post("/", status_code=201)
async def create_habit(
    data: HabitCreateRequest,
    service: HabitService = Depends(get_service),
    user: User = Depends(get_current_user),
):
    return await service.create_habit(data, user)