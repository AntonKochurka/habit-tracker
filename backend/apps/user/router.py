from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query

from db import AsyncSession, get_async_session
from utils.dependencies import create_filter_dependency

from .models import User
from .schemas import UserRead, UserCreateRequest
from .crud import UserCrud
from .service import UserService

async def get_service(db: AsyncSession = Depends(get_async_session)):
    return UserService(UserCrud(db))

router = APIRouter(prefix="/users")

@router.get("")
async def get_users_list(
    filters: Dict[str, Any] = Depends(create_filter_dependency(User)),
    page: int = Query(1, ge=1),
    service: UserService = Depends(get_service),
):
    return await service.user_crud.get_users(page, filters)

@router.post("/", status_code=201)
async def create_user(
    data: UserCreateRequest,
    service: UserService = Depends(get_service)
):
    return UserRead(**await service.create_user(data))