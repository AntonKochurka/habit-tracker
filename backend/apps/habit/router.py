from fastapi import APIRouter, Depends

from db import AsyncSession, get_async_session

# from .crud import HabitCrud
# from .service import HabitService

# async def get_service(db: AsyncSession = Depends(get_async_session)):
#     return FolderService(FolderCrud(db))


router = APIRouter(prefix="/habits")

