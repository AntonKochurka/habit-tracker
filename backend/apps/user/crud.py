from db import AsyncSession

class UserCrud:
    def __init__(self, db: AsyncSession):
        self.db = db

    