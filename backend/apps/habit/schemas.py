from typing import Literal, List, Optional
from pydantic import BaseModel, field_validator
from datetime import datetime

from .models import HabitType

_HabitType = Literal["default", "timer", "counter"]

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
    author_id: Optional[int] = None
    habit_type: _HabitType
    target_value: Optional[int] = None
    active_days: List[int] = []

    @field_validator("habit_type", mode="before")
    def normalize_habit_type(cls, v):
        if isinstance(v, HabitType):
            return v.value
        return v

    @field_validator("active_days", mode="before")
    def split_days(cls, v):
        if isinstance(v, str):
            return [int(day.strip()) for day in v.split(",") if day.strip()]
        return v


class HabitCreateRequest(HabitBase):
    folder_ids: List[int] = []
    
class HabitUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    habit_type: Optional[_HabitType] = None
    target_value: Optional[int] = None
    folders: Optional[List[int]] = None

class HabitRead(HabitBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RepresentativeHabit(HabitRead):
    id: int

    record: Optional[HabitRecordRead] = None

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
