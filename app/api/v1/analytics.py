from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.models.country import Country
from app.models.economic_indicator import EconomicIndicator
from app.models.indicator_observation import IndicatorObservation


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/latest")
def get_latest_indicator(
    country: str = Query(...),
    indicator: str = Query(...),
    db: Session = Depends(get_db),
):
    statement = (
        select(IndicatorObservation)
        .join(Country)
        .join(EconomicIndicator)
        .where(
            Country.iso_code == country.upper(),
            EconomicIndicator.code == indicator.upper(),
        )
        .order_by(IndicatorObservation.observation_date.desc())
        .limit(1)
    )

    observation = db.execute(statement).scalar_one_or_none()

    if observation is None:
        raise HTTPException(
            status_code=404,
            detail="No observation found",
        )

    return {
        "country": observation.country.name,
        "country_code": observation.country.iso_code,
        "indicator": observation.indicator.name,
        "indicator_code": observation.indicator.code,
        "value": observation.value,
        "observation_date": observation.observation_date,
    }


@router.get("/history")
def get_indicator_history(
    country: str = Query(...),
    indicator: str = Query(...),
    db: Session = Depends(get_db),
):
    statement = (
        select(IndicatorObservation)
        .join(Country)
        .join(EconomicIndicator)
        .where(
            Country.iso_code == country.upper(),
            EconomicIndicator.code == indicator.upper(),
        )
        .order_by(IndicatorObservation.observation_date.asc())
    )

    observations = db.execute(statement).scalars().all()

    if not observations:
        raise HTTPException(
            status_code=404,
            detail="No observations found",
        )

    return {
        "country": observations[0].country.name,
        "country_code": observations[0].country.iso_code,
        "indicator": observations[0].indicator.name,
        "indicator_code": observations[0].indicator.code,
        "observations": [
            {
                "date": observation.observation_date,
                "value": observation.value,
            }
            for observation in observations
        ],
    }