from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.models.economic_indicator import EconomicIndicator
from app.schemas.economic_indicator import (
    EconomicIndicatorCreate,
    EconomicIndicatorResponse,
)


router = APIRouter(
    prefix="/indicators",
    tags=["Economic Indicators"],
)


@router.get(
    "/",
    response_model=list[EconomicIndicatorResponse],
)
def get_indicators(
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(EconomicIndicator).order_by(
            EconomicIndicator.name
        )
    )

    return result.scalars().all()


@router.get(
    "/{code}",
    response_model=EconomicIndicatorResponse,
)
def get_indicator(
    code: str,
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(EconomicIndicator).where(
            EconomicIndicator.code == code.upper()
        )
    )

    indicator = result.scalar_one_or_none()

    if indicator is None:
        raise HTTPException(
            status_code=404,
            detail="Economic indicator not found",
        )

    return indicator


@router.post(
    "/",
    response_model=EconomicIndicatorResponse,
    status_code=201,
)
def create_indicator(
    indicator_data: EconomicIndicatorCreate,
    db: Session = Depends(get_db),
):
    existing = db.execute(
        select(EconomicIndicator).where(
            EconomicIndicator.code
            == indicator_data.code.upper()
        )
    ).scalar_one_or_none()

    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="Economic indicator already exists",
        )

    indicator = EconomicIndicator(
        **indicator_data.model_dump(
            exclude_unset=True
        )
    )

    indicator.code = indicator.code.upper()

    db.add(indicator)
    db.commit()
    db.refresh(indicator)

    return indicator