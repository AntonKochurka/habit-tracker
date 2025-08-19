from typing import Dict

from pydantic import BaseModel
from datetime import datetime


class BaseFolder(BaseModel):
    title: str
    color: str
    author_id: int

class FolderRead(BaseFolder):
    id: int
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True
