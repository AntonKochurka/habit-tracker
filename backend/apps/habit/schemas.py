from typing import Literal, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


HabitType = Literal["default", "timer", "counter"]

class HabitRecordBase(BaseModel):
    current_value: int
    completed_at: Optional[datetime] = None

class HabitBase(BaseModel):
    title: str
    description: Optional[str] = None
    author_id: int
    habit_type: HabitType
    target_value: Optional[int] = None


class HabitCreateRequest(HabitBase):
    folders: List[int] = []


class HabitUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    habit_type: Optional[HabitType] = None
    target_value: Optional[int] = None
    folders: Optional[List[int]] = None

class HabitRead(HabitBase):
    id: int
    record: Optional[HabitType] = None

    class Config:
        from_attributes = True
