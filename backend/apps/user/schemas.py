from pydantic import BaseModel, EmailStr, constr
from datetime import datetime

class UserBase(BaseModel):
    username: constr(min_length=3, max_length=50)
    email: EmailStr

    is_active: bool = True
    is_superuser: bool = False
    is_deleted: bool = False

class UserCreateRequest(UserBase):
    password: constr(min_length=6)

class UserUpdateRequest(BaseModel):
    username: constr(min_length=3, max_length=50) | None = None
    email: EmailStr | None = None

    is_active: bool | None = None
    is_superuser: bool | None = None
    is_deleted: bool | None = None

class UserUpdatePasswordRequest(BaseModel):
    old_password: constr(min_length=6)
    new_password: constr(min_length=6)

class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
