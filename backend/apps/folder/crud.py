from fastapi import HTTPException, status

from db import AsyncSession
from sqlalchemy import insert
from sqlalchemy.exc import IntegrityError

from .models import Folder, folder_habit_relationships
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
    
    async def create_folder_habit_relationship(self, folder_id: int, habit_id: int) -> bool:
        """
        Create relationship between folder and habit with comprehensive error handling
        """
        try:
            existing_relationship = await self.db.execute(
                select(folder_habit_relationships)
                .where(
                    folder_habit_relationships.c.folder_id == folder_id,
                    folder_habit_relationships.c.habit_id == habit_id
                )
            )
            
            if existing_relationship.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Relationship between folder and habit already exists"
                )

            query = insert(folder_habit_relationships).values(
                folder_id=folder_id,
                habit_id=habit_id
            )
            
            await self.db.execute(query)
            await self.db.commit()
            
            return True
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Integrity error occurred while creating relationship"
            )
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error occurred: {str(e)}"
            )
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected error occurred: {str(e)}"
            )