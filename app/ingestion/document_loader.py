from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.data_source import DataSource
from app.models.source_document import SourceDocument


def load_source_document(
    db: Session,
    source_name: str,
    title: str,
    document_url: str,
    local_path: str,
    publication_date: date,
    document_type: str,
) -> SourceDocument:

    # Find the source
    source = db.execute(
        select(DataSource).where(
            DataSource.name == source_name
        )
    ).scalar_one_or_none()

    if source is None:
        raise ValueError(
            f"Source not found: {source_name}"
        )

    # Check whether this document already exists
    existing = db.execute(
        select(SourceDocument).where(
            SourceDocument.source_id == source.id,
            SourceDocument.document_url == document_url,
        )
    ).scalar_one_or_none()

    if existing is not None:
        return existing

    # Create document
    document = SourceDocument(
        source_id=source.id,
        title=title,
        document_url=document_url,
        local_path=local_path,
        publication_date=publication_date,
        document_type=document_type,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document