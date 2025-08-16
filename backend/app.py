from fastapi import FastAPI
from contextlib import asynccontextmanager

from apps import auth, user

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

def create_app() -> FastAPI:
    app = FastAPI(lifespan=lifespan)

    app.include_router(auth.router.router)
    app.include_router(user.router.router)

    return app

app = create_app()