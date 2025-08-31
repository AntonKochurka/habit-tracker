from fastapi import HTTPException, status

from db import AsyncSession
from sqlalchemy.exc import IntegrityError

from .models import Habit
from .schemas import HabitBase, HabitRead, HabitCreateRequest

from utils.paginator import Paginator

class HabitCrud:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_habit(self, data: HabitCreateRequest):
        instance = Habit(
            title=data.title,
            description=data.description,
            author_id=data.author_id,
            target_value=data.target_value,
            habit_type=data.habit_type,
            active_days=",".join([str(day) for day in data.active_days])
        )

        self.db.add(instance)
        
        try:
            await self.db.commit()
            await self.db.refresh(instance)
            
            return instance.to_dict()
        except IntegrityError:
            await self.db.rollback()

            raise HTTPException(
                detail="Folder arleady exists", 
                status_code=status.HTTP_409_CONFLICT
            )

    # async def get_habits(self, page, filters):
    #     """
    #     Get habit list with pagination utils.
    #     """
        
    #     pg = Paginator(
    #         Folder, item_model=HabitRead, session=self.db
    #     )
        
    #     pg.filtrate_by_dict(filters)

    #     return await pg.paginate(page=page)