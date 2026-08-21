from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.models.data_source import DataSource
from app.schemas.data_source import (
    DataSourceCreate,
    DataSourceResponse,
)


router = APIRouter(
    prefix="/sources",
    tags=["Data Sources"],
)


@router.get(
    "/",
    response_model=list[DataSourceResponse],
)
def get_sources(
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(DataSource).order_by(DataSource.name)
    )

    return result.scalars().all()


@router.get(
    "/{source_id}",
    response_model=DataSourceResponse,
)
def get_source(
    source_id: int,
    db: Session = Depends(get_db),
):
    source = db.get(DataSource, source_id)

    if source is None:
        raise HTTPException(
            status_code=404,
            detail="Data source not found",
        )

    return source


@router.post(
    "/",
    response_model=DataSourceResponse,
    status_code=201,
)
def create_source(
    source_data: DataSourceCreate,
    db: Session = Depends(get_db),
):
    existing = db.execute(
        select(DataSource).where(
            DataSource.name == source_data.name
        )
    ).scalar_one_or_none()

    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="Data source already exists",
        )

    source = DataSource(
        **source_data.model_dump()
    )

    db.add(source)
    db.commit()
    db.refresh(source)

    return source