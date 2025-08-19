from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship
from db import Base, BaseMixin

class Folder(Base, BaseMixin):
    __tablename__ = "folders"

    title = Column(String(50), unique=True, index=True, nullable=False)
    color = Column(String(20), nullable=False, default="#ffffff")
    
    author_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    author = relationship("User", back_populates="folders")
    
    habits = relationship(
        "Habit",
        secondary="folder_habit_relationships",
        back_populates="folders"
    )

folder_habit_relationships = Table(
    'folder_habit_relationships',
    Base.metadata,
    Column('folder_id', Integer, ForeignKey('folders.id'), primary_key=True),
    Column('habit_id', Integer, ForeignKey('habits.id'), primary_key=True),
    Column('created_at', DateTime(timezone=True), server_default=func.now())
)