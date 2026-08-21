from fastapi import APIRouter

from app.api.v1 import countries
from app.api.v1 import indicators
from app.api.v1 import sources
from app.api.v1 import observations


api_router = APIRouter()

api_router.include_router(
    countries.router
)

api_router.include_router(
    indicators.router
)

api_router.include_router(
    sources.router
)

api_router.include_router(
    observations.router
)