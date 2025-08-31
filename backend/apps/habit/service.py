import re

from fastapi import HTTPException, status

from .crud import HabitCrud
from .schemas import HabitBase, HabitCreateRequest
from apps.user.crud import UserCrud, User
from apps.folder.crud import FolderCrud

class HabitService:
    def __init__(
        self, 
        habit_crud: HabitCrud, 
        user_crud: UserCrud,
        folder_crud: FolderCrud
    ):
        self.habit_crud = habit_crud
        self.user_crud = user_crud
        self.folder_crud = folder_crud

    async def create_habit(self, data: HabitCreateRequest, user: User):
        """Create a habit instance"""
        data.author_id = user.id

        if not self.user_crud.get_user_by("id", data.author_id):
            raise HTTPException(
                detail="User doesn't exist", 
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        habit = await self.habit_crud.create_habit(data)
        
        for folder_id in data.folder_ids:
            await self.folder_crud.create_folder_habit_relationship(folder_id, habit["id"])

        return habit