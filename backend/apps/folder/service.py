import re

from fastapi import HTTPException, status

from .crud import FolderCrud
from .schemas import BaseFolder
from apps.user.crud import UserCrud

class FolderService:
    def __init__(self, folder_crud: FolderCrud, user_crud: UserCrud):
        self.user_crud = user_crud
        self.folder_crud = folder_crud
    
    def _check_color(self, color: str):
        """
        Checks if is it right color format. 
        If it is, returns the color, othervise throw an error
        """
        if not color:
            return "#ffffff"
        
        color = color.strip().lower()
        hex_pattern = r'^#([a-f0-9]{3}|[a-f0-9]{6})$'
        
        if not re.fullmatch(hex_pattern, color):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid color format. Use 3-digit (#fff) or 6-digit HEX (#ffffff)"
            )
        
        if len(color) == 4:
            return f"#{color[1]*2}{color[2]*2}{color[3]*2}"
        
        return color
    
    async def create_folder(self, data: BaseFolder):
        """Create a folder instance"""
        data.color = self._check_color(data.color)
        
        if not self.user_crud.get_user_by("id", data.author_id):
            raise HTTPException(
                detail="User doesn't exist", 
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return self.folder_crud.create_folder(data)