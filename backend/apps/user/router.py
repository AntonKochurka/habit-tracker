from typing import List
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from db import AsyncSession, get_async_session

from .models import User
from .schemas import UserRead, UserCreateRequest
from .crud import UserCrud
from .service import UserService

async def get_service(db: AsyncSession = Depends(get_async_session)):
    return UserService(UserCrud(db))

router = APIRouter(prefix="/user")

@router.get("/", response_model=List[UserRead])
async def get_users_list():
    ...