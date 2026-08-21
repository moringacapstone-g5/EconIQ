from pydantic import BaseModel, ConfigDict


class CountryBase(BaseModel):
    iso_code: str
    name: str
    region: str | None = None
    currency: str | None = None


class CountryCreate(CountryBase):
    pass


class CountryResponse(CountryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)