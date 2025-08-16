from db import AsyncSession
from utils.paginator import Paginator

from .schemas import UserRead
from .models import User

class UserCrud:
    def __init__(self, db: AsyncSession):
        self.db = db

    def get_users(self, page, filters):
        pg = Paginator(
            User, item_model=UserRead, session=self.db
        )
        
        pg.filtrate_by_dict(filters)

        return pg.paginate(page=page)