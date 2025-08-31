from fastapi import HTTPException, status

from db import AsyncSession
from sqlalchemy.exc import IntegrityError

from .models import Habit
from .schemas import HabitBase, HabitRead

from utils.paginator import Paginator

class HabitCrud:
    def __init__(self, db: AsyncSession):
        self.db = db

    # async def create_habit(self, data: BaseFolder):
    #     instance = Habit(
    #     )

    #     self.db.add(instance)
        
    #     try:
    #         await self.db.commit()
    #         await self.db.refresh(instance)
            
    #         return instance.to_dict()
    #     except IntegrityError:
    #         await self.db.rollback()

    #         raise HTTPException(
    #             detail="Folder arleady exists", 
    #             status_code=status.HTTP_409_CONFLICT
    #         )

    # async def get_habits(self, page, filters):
    #     """
    #     Get habit list with pagination utils.
    #     """
        
    #     pg = Paginator(
    #         Folder, item_model=HabitRead, session=self.db
    #     )
        
    #     pg.filtrate_by_dict(filters)

    #     return await pg.paginate(page=page)