from fastapi import APIRouter, Depends, HTTPException, status

from db import AsyncSession, get_async_session

from .schemas import BaseFolder
from .crud import FolderCrud
from .service import FolderService

from apps.auth.dependencies import User, UserCrud, get_current_user

async def get_service(db: AsyncSession = Depends(get_async_session)):
    return FolderService(FolderCrud(db), UserCrud(db))


router = APIRouter(prefix="/folders")


@router.post("/", status_code=201)
async def create_new_folder(
    data: BaseFolder,
    service: FolderService = Depends(get_service),
    user: User = Depends(get_current_user)
):
    return await service.create_folder(data, user)