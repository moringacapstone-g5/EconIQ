from dataclasses import dataclass
from datetime import date
from pathlib import Path

import requests
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.data_source import DataSource
from app.models.source_document import SourceDocument


@dataclass
class DocumentInfo:
    source_name: str
    title: str
    url: str
    local_path: str
    publication_date: date
    document_type: str = "pdf"


def download_document(
    url: str,
    local_path: str,
) -> str:
    """
    Download a document from a URL and save it locally.
    """

    path = Path(local_path)

    # Create parent directories if they don't exist.
    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    response = requests.get(
        url,
        timeout=60,
    )

    response.raise_for_status()

    path.write_bytes(
        response.content
    )

    return str(path)


def register_document(
    db: Session,
    document: DocumentInfo,
) -> SourceDocument:
    """
    Register a document in the source_documents table.

    If the document already exists, return the existing record.
    """

    # Find the data source.
    source = db.execute(
        select(DataSource).where(
            DataSource.name == document.source_name
        )
    ).scalar_one_or_none()

    if source is None:
        raise ValueError(
            f"Source not found: {document.source_name}"
        )

    # Check whether this document is already registered.
    existing = db.execute(
        select(SourceDocument).where(
            SourceDocument.source_id == source.id,
            SourceDocument.document_url == document.url,
        )
    ).scalar_one_or_none()

    if existing is not None:
        return existing

    # Create a new document record.
    source_document = SourceDocument(
        source_id=source.id,
        title=document.title,
        document_url=document.url,
        local_path=document.local_path,
        publication_date=document.publication_date,
        document_type=document.document_type,
    )

    db.add(source_document)

    db.commit()

    db.refresh(source_document)

    return source_document