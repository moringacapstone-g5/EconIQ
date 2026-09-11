from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    id: int
    source_id: int
    source_name: str | None = None
    title: str
    document_url: str | None = None
    local_path: str | None = None
    publication_date: date | None = None
    document_type: str
    ingested_at: datetime

    model_config = ConfigDict(from_attributes=True)