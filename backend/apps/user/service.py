from .crud import UserCrud
from .schemas import UserCreateRequest

from fastapi import status, HTTPException

from utils.security import get_password_hash, verify_password

class UserService:
    def __init__(self, user_crud: UserCrud):
        self.user_crud = user_crud

    async def create_user(self, data: UserCreateRequest):
        """Create user via UserCrud, but override password from form to hash"""
        data.password = get_password_hash(data.password)

        return await self.user_crud.create_user(data)
    
    async def verify_user(self, username, password) -> bool:
        """Returns True if password is correct"""
        user = await self.user_crud.get_user_by("username", username)

        if user is None:
            raise HTTPException(detail="User with this username does'nt exist", status_code=status.HTTP_404_NOT_FOUND)
        
        return verify_password(password, user.to_dict().get("password", None))