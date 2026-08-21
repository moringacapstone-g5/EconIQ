from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.models.country import Country
from app.models.economic_indicator import EconomicIndicator
from app.models.data_source import DataSource
from app.models.indicator_observation import IndicatorObservation
from app.schemas.observation import (
    ObservationCreate,
    ObservationResponse,
    ObservationPublicResponse,
)


router = APIRouter(
    prefix="/observations",
    tags=["Observations"],
)


@router.get(
    "/",
    response_model=list[ObservationPublicResponse],
)
def get_observations(
    country: str | None = Query(default=None),
    indicator: str | None = Query(default=None),
    source: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = (
        select(
            IndicatorObservation,
            Country.name.label("country"),
            Country.iso_code.label("country_code"),
            EconomicIndicator.name.label("indicator"),
            EconomicIndicator.code.label("indicator_code"),
            DataSource.name.label("source"),
        )
        .join(
            Country,
            IndicatorObservation.country_id == Country.id,
        )
        .join(
            EconomicIndicator,
            IndicatorObservation.indicator_id
            == EconomicIndicator.id,
        )
        .join(
            DataSource,
            IndicatorObservation.source_id
            == DataSource.id,
        )
    )

    if country:
        query = query.where(
            Country.iso_code == country.upper()
        )

    if indicator:
        query = query.where(
            EconomicIndicator.code == indicator.upper()
        )

    if source:
        query = query.where(
            DataSource.name == source
        )

    query = query.order_by(
        IndicatorObservation.observation_date
    )

    result = db.execute(query)

    observations = []

    for observation, country_name, country_code, indicator_name, indicator_code, source_name in result:
        observations.append(
            ObservationPublicResponse(
                id=observation.id,
                country=country_name,
                country_code=country_code,
                indicator=indicator_name,
                indicator_code=indicator_code,
                source=source_name,
                observation_date=observation.observation_date,
                value=observation.value,
            )
        )

    return observations


@router.post(
    "/",
    response_model=ObservationResponse,
    status_code=201,
)
def create_observation(
    observation_data: ObservationCreate,
    db: Session = Depends(get_db),
):
    country = db.get(
        Country,
        observation_data.country_id,
    )

    if country is None:
        raise HTTPException(
            status_code=404,
            detail="Country not found",
        )

    indicator = db.get(
        EconomicIndicator,
        observation_data.indicator_id,
    )

    if indicator is None:
        raise HTTPException(
            status_code=404,
            detail="Economic indicator not found",
        )

    source = db.get(
        DataSource,
        observation_data.source_id,
    )

    if source is None:
        raise HTTPException(
            status_code=404,
            detail="Data source not found",
        )

    existing = db.execute(
        select(IndicatorObservation).where(
            IndicatorObservation.country_id
            == observation_data.country_id,
            IndicatorObservation.indicator_id
            == observation_data.indicator_id,
            IndicatorObservation.source_id
            == observation_data.source_id,
            IndicatorObservation.observation_date
            == observation_data.observation_date,
        )
    ).scalar_one_or_none()

    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="Observation already exists",
        )

    observation = IndicatorObservation(
        **observation_data.model_dump()
    )

    db.add(observation)
    db.commit()
    db.refresh(observation)

    return observation