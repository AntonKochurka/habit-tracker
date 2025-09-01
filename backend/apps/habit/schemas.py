from typing import Literal, List, Optional
from pydantic import BaseModel
from datetime import datetime


HabitType = Literal["default", "timer", "counter"]

class HabitRecordBase(BaseModel):
    current_value: int
    completed_at: Optional[datetime] = None

class HabitRecordRead(HabitRecordBase):
    id: int

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class HabitBase(BaseModel):
    title: str
    description: Optional[str] = None
    author_id: int
    habit_type: HabitType
    target_value: Optional[int] = None
    active_days: List[int] = []

class HabitCreateRequest(HabitBase):
    folder_ids: List[int] = []
    
class HabitUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    habit_type: Optional[HabitType] = None
    target_value: Optional[int] = None
    folders: Optional[List[int]] = None

class HabitRead(HabitBase):
    id: int

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RepresentativeHabit(HabitRead):
    id: int

    record: Optional[HabitRecordBase] = None

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
