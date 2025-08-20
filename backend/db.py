from typing import AsyncGenerator

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from config import settings
from utils.mixins import BaseMixin

engine = create_async_engine(
    settings.DB_URL,
    echo=False,  
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def init_all() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)