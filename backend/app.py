from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from apps import auth, user, folder, habit
from db import init_all

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_all()
    yield


def create_app() -> FastAPI:
    app = FastAPI(lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:4200"],  
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router.router)
    app.include_router(user.router.router)
    app.include_router(habit.router.router)
    app.include_router(folder.router.router)

    return app


app = create_app()
