from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from db import Base, BaseMixin

class User(Base, BaseMixin):
    __tablename__ = "users"

    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)

    folders = relationship("Folder", back_populates="author", cascade="all, delete-orphan")
    habits = relationship("Habit", back_populates="author", cascade="all, delete-orphan")

    __forbidden_list__ = ["password", "email"]