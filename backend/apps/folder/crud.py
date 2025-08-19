from fastapi import HTTPException, status

from db import AsyncSession

from .schemas import BaseFolder
from .models import Folder

class FolderCrud:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_folder(self, data: BaseFolder):
        folder = Folder(
            title=data.title,
            color=data.color,
            author_id=data.author_id
        )

        await self.db.add(folder)
        
        try:
            await self.db.commit()
            await self.db.refresh(instance)
            
            return instance.to_dict(include_relationships=["author"])
        except IntegrityError:
            await self.db.rollback()

            raise HTTPException(
                detail="Folder arleady exists", 
                status_code=status.HTTP_409_CONFLICT
            )
