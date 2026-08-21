from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.models.country import Country
from app.schemas.country import CountryCreate, CountryResponse


router = APIRouter(
    prefix="/countries",
    tags=["Countries"],
)


@router.get("/", response_model=list[CountryResponse])
def get_countries(
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(Country).order_by(Country.name)
    )

    return result.scalars().all()


@router.get("/{iso_code}", response_model=CountryResponse)
def get_country(
    iso_code: str,
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(Country).where(
            Country.iso_code == iso_code.upper()
        )
    )

    country = result.scalar_one_or_none()

    if country is None:
        raise HTTPException(
            status_code=404,
            detail="Country not found",
        )

    return country


@router.post(
    "/",
    response_model=CountryResponse,
    status_code=201,
)
def create_country(
    country_data: CountryCreate,
    db: Session = Depends(get_db),
):
    country = Country(
        **country_data.model_dump()
    )

    db.add(country)
    db.commit()
    db.refresh(country)

    return country