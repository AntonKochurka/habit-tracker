from fastapi import APIRouter, Depends, HTTPException, status, Query

from typing import Dict, Any
from db import AsyncSession, get_async_session

from .models import Folder
from .schemas import BaseFolder
from .crud import FolderCrud
from .service import FolderService

from apps.auth.dependencies import User, UserCrud, get_current_user, get_optional_user

from utils.dependencies import create_filter_dependency

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

@router.get("")
async def get_folders(
    service: FolderService = Depends(get_service),
    filters: Dict[str, Any] = Depends(create_filter_dependency(Folder)),
    page: int = Query(1),
    user: User | None = Depends(get_current_user)
):
    filters["author_id"] = user.id
    
    return await service.folder_crud.get_folders(page, filters)