import pytest

from apps.user.router import router 
from apps.user.models import User
from utils.paginator import Paginator

@pytest.fixture
async def client(session):
    app = FastAPI()
    app.include_router(user, prefix="/users")

    app.dependency_overrides[get_async_session] = lambda: session

    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c

@pytest.mark.asyncio
async def test_create_user(session):
    user = User(username="anton", email="a@test.com", password="123456")
    session.add(user)
    
    await session.commit()
    await session.refresh(user)

    assert user.id is not None
    assert user.username == "anton"

@pytest.mark.asyncio
async def test_paginator_filter(session):
    session.add_all([
        User(username="alice", email="alice@test.com", password="pw1"),
        User(username="bob", email="bob@test.com", password="pw2"),
        User(username="anna", email="anna@test.com", password="pw3"),
    ])
    await session.commit()

    pg = Paginator(User, session).filtrate("username__startswith", "a")
    users = await pg.apply()
    names = [u.username for u in users]

    assert "alice" in names
    assert "anna" in names
    assert "bob" not in names

@pytest.mark.asyncio
async def test_paginator_pagination(session):
    session.add_all([User(username=str(i), email=f"{i}@test.com", password=f"pw{i}")
    for i in range(16)]) # four were created 
    await session.commit()

    pg = Paginator(User, session)
    paginate_res = await pg.paginate(per_page=5)

    assert paginate_res.get("total") == 20
    assert paginate_res.get("pages") == 4