from fastapi import HTTPException, status

from db import AsyncSession
from sqlalchemy.exc import IntegrityError

from .models import Folder
from .schemas import BaseFolder, FolderRead

from utils.paginator import Paginator

class FolderCrud:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_folder(self, data: BaseFolder):
        instance = Folder(
            title=data.title,
            color=data.color,
            author_id=data.author_id
        )

        self.db.add(instance)
        
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

    async def get_folders(self, page, filters):
        """
        Get folder list with pagination utils.
        """
        
        pg = Paginator(
            Folder, item_model=FolderRead, session=self.db
        )
        
        pg.filtrate_by_dict(filters)

        return await pg.paginate(page=page)