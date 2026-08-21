from pydantic import BaseModel, ConfigDict


class EconomicIndicatorBase(BaseModel):
    code: str
    name: str
    description: str | None = None
    unit: str | None = None
    frequency: str | None = None


class EconomicIndicatorCreate(EconomicIndicatorBase):
    pass


class EconomicIndicatorResponse(EconomicIndicatorBase):
    id: int

    model_config = ConfigDict(from_attributes=True)