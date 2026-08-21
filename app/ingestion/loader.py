from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.country import Country
from app.models.data_source import DataSource
from app.models.economic_indicator import EconomicIndicator
from app.models.indicator_observation import IndicatorObservation


@dataclass
class LoadResult:
    observation: IndicatorObservation
    action: str


def load_observation(
    db: Session,
    observation: dict,
    source_name: str,
    document_id: int | None = None,
) -> LoadResult:

    # ---------------------------------------------------------
    # Find country
    # ---------------------------------------------------------

    country = db.execute(
        select(Country).where(
            Country.iso_code == observation["country_code"]
        )
    ).scalar_one_or_none()

    if country is None:
        raise ValueError(
            f"Country not found: "
            f"{observation['country_code']}"
        )

    # ---------------------------------------------------------
    # Find indicator
    # ---------------------------------------------------------

    indicator = db.execute(
        select(EconomicIndicator).where(
            EconomicIndicator.code
            == observation["indicator_code"]
        )
    ).scalar_one_or_none()

    if indicator is None:
        raise ValueError(
            f"Indicator not found: "
            f"{observation['indicator_code']}"
        )

    # ---------------------------------------------------------
    # Find source
    # ---------------------------------------------------------

    source = db.execute(
        select(DataSource).where(
            DataSource.name == source_name
        )
    ).scalar_one_or_none()

    if source is None:
        raise ValueError(
            f"Source not found: "
            f"{source_name}"
        )

    # ---------------------------------------------------------
    # Find existing observation
    # ---------------------------------------------------------

    existing = db.execute(
        select(IndicatorObservation).where(
            IndicatorObservation.country_id
            == country.id,
            IndicatorObservation.indicator_id
            == indicator.id,
            IndicatorObservation.source_id
            == source.id,
            IndicatorObservation.observation_date
            == observation["observation_date"],
        )
    ).scalar_one_or_none()

    # ---------------------------------------------------------
    # Existing observation
    # ---------------------------------------------------------

    if existing is not None:

        changed = False

        if existing.value != observation["value"]:
            existing.value = observation["value"]
            changed = True

        if document_id is not None:
            if existing.document_id != document_id:
                existing.document_id = document_id
                changed = True

        if changed:

            db.commit()
            db.refresh(existing)

            return LoadResult(
                observation=existing,
                action="updated",
            )

        return LoadResult(
            observation=existing,
            action="skipped",
        )

    # ---------------------------------------------------------
    # Create new observation
    # ---------------------------------------------------------

    db_observation = IndicatorObservation(
        country_id=country.id,
        indicator_id=indicator.id,
        source_id=source.id,
        observation_date=observation[
            "observation_date"
        ],
        value=observation["value"],
        document_id=document_id,
    )

    db.add(db_observation)

    db.commit()

    db.refresh(db_observation)

    return LoadResult(
        observation=db_observation,
        action="inserted",
    )