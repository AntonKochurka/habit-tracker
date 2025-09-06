from fastapi import HTTPException, status
from datetime import datetime

from db import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, and_, func

from .models import Habit, HabitType, HabitRecord
from .schemas import HabitBase, HabitRead, HabitCreateRequest, RepresentativeHabit, HabitRecordRead

from apps.folder.models import folder_habit_relationships
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
            habit_type=HabitType(data.habit_type),
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
                detail="Habit arleady exists", 
                status_code=status.HTTP_409_CONFLICT
            )

    async def get_habits(
        self, 
        page, 
        filters, 
        user, 
        is_representative,
        current_day: str,
        folder_id: int | None = None
    ):
        """
        Get habit list with pagination utils.
        """
        current_day = datetime.fromisoformat(current_day).date()
        weekday = datetime.isoweekday(current_day)

        filters["author_id"] = user.id
        # filters["active_days__in"] = weekday
        # filters["created_at__le"] = current_day

        pg = Paginator(Habit, session=self.db)

        if folder_id:
            stmt = select(Habit).join(folder_habit_relationships).where(
                folder_habit_relationships.c.folder_id == folder_id
            )
            pg.with_base_query(stmt)
            
        pg.filtrate_by_dict(filters)

        if not is_representative:
            return await pg.paginate(page=page, ItemModel=HabitRead)

        habits = await pg.paginate(page=page, ItemModel=RepresentativeHabit)
        habit_ids = [habit.id for habit in habits["items"]]

        records_result = await self.db.execute(
            select(HabitRecord)
            .where(
                and_(
                    HabitRecord.habit_id.in_(habit_ids),
                    func.date(HabitRecord.completed_at) == current_day
                )
            )
        )
        records = records_result.scalars().all()
        records_by_habit = {rec.habit_id: rec for rec in records}

        for habit in habits["items"]:
            rec = records_by_habit.get(habit.id)
            habit.record = rec and HabitRecordRead.model_validate(rec)
            
        habits["ids"] = habit_ids
        return habits