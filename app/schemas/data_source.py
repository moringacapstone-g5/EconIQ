from pydantic import BaseModel, ConfigDict


class DataSourceBase(BaseModel):
    name: str
    organization: str | None = None
    url: str | None = None
    description: str | None = None


class DataSourceCreate(DataSourceBase):
    pass


class DataSourceResponse(DataSourceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)