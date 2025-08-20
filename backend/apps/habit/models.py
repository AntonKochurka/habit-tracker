from sqlalchemy import Column, String, Boolean, Integer, Enum, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from db import Base, BaseMixin

class HabitType(PyEnum):
    DEFAULT = 'default'
    TIMER = 'timer'
    COUNTER = 'counter'

class Habit(Base, BaseMixin):
    """
    If type of habit default target_value, current_value are null.
    If it's timer, target_value - required quantity in seconds, current_value - how much you did it arleady.
    If it's counter, target - required times of repeats, current - how much you did it

    active_days stands for active days when habit have to be done
    for example active_days = "1,3,5" - habit is for Mon, Wed, Fri days

    GOALS (1 - Done, 0 - Not):
    [ 0 ] If current_value > required => is_completed = true
    """
    __tablename__ = "habits"

    title = Column(String(50), unique=True, index=True, nullable=False)
    
    author_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    author = relationship("User", back_populates="habits")

    habit_type = Column(Enum(HabitType), nullable=False, default=HabitType.DEFAULT)
    is_completed = Column(Boolean, default=False)
    
    target_value = Column(Integer, nullable=True)  
    
    folders = relationship(
        "Folder",
        secondary="folder_habit_relationships",
        back_populates="habits"
    )
    records = relationship("HabitRecord", back_populates="habit", cascade="all, delete-orphan")

    active_days = Column(String(15), nullable=True) 
    
class HabitRecord(Base, BaseMixin):
    __tablename__ = "habit_records"
    
    habit_id = Column(Integer, ForeignKey('habits.id'), nullable=False)
    
    current_value = Column(Integer, nullable=True, default=0)  
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    value_achieved = Column(Integer, nullable=True)  # TODO: percentage of success
        # for example target_value = 60(seconds or tries)
        # I've done 30, means current_value = 30
        # value_achieved = 50 (%) because i've done a half of required task

    habit = relationship("Habit", back_populates="records")
