from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router


app = FastAPI(
    title="ECONIQ API",
    description="Economic Intelligence for Africa",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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