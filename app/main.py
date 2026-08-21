from fastapi import FastAPI

from app.api.v1.router import api_router


app = FastAPI(
    title="ECONIQ API",
    description="Economic Intelligence for Africa",
    version="0.1.0",
)


app.include_router(
    api_router,
    prefix="/api/v1",
)


@app.get("/")
def root():
    return {
        "name": "ECONIQ",
        "description": "Economic Intelligence for Africa",
        "status": "operational",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }