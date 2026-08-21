from datetime import date

from pydantic import BaseModel


class ObservationCreate(BaseModel):
    country_id: int
    indicator_id: int
    source_id: int
    observation_date: date
    value: float


class ObservationResponse(BaseModel):
    id: int
    country_id: int
    indicator_id: int
    source_id: int
    observation_date: date
    value: float

    model_config = {
        "from_attributes": True
    }


class ObservationPublicResponse(BaseModel):
    id: int
    country: str
    country_code: str
    indicator: str
    indicator_code: str
    source: str
    observation_date: date
    value: float