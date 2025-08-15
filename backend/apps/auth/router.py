from fastapi import APIRouter, Depends
from .schemas import TokensPair, BlacklistTokenRequest, ObtainPairRequest

router = APIRouter(prefix="/auth")


@router.post("/obtain")
async def obtain_pair(
):
    return TokensPair()

@router.post("/refresh")
async def refresh_pair():
    return {}

@router.delete("/blacklist")
async def blacklist_pair():
    return {}