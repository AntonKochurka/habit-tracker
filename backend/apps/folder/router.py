from fastapi import APIRouter, Depends

from db import AsyncSession, get_async_session

from .schemas import BaseFolder
from .crud import FolderCrud
from .service import FolderService

async def get_service(db: AsyncSession):
    return FolderService(FolderCrud(db))


router = APIRouter("/folders")


@router.post("/")
async def create_new_folder(
    data: BaseFolder,
    service: FolderService = Depends(get_service)
):
    return service.create_folder(data)