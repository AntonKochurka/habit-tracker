from .crud import UserCrud
from .schemas import UserCreateRequest

from utils.security import get_password_hash

class UserService:
    def __init__(self, user_crud: UserCrud):
        self.user_crud = user_crud

    async def create_user(self, data: UserCreateRequest):
        """Create user via UserCrud, but override password from form to hash"""
        data.password = get_password_hash(data.password)

        return await self.user_crud.create_user(data)