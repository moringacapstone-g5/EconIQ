from fastapi import APIRouter

from app.api.v1 import (
    analytics,
    countries,
    documents,
    forecasts,
    indicators,
    observations,
    rag,
    sources,
)


api_router = APIRouter()


api_router.include_router(
    countries.router
)

api_router.include_router(
    indicators.router
)

api_router.include_router(
    observations.router
)

api_router.include_router(
    sources.router
)

api_router.include_router(
    rag.router
)

api_router.include_router(
    analytics.router
)

api_router.include_router(
    documents.router
)

api_router.include_router(
    forecasts.router
)
