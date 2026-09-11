from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.models.source_document import SourceDocument
from app.models.data_source import DataSource
from app.schemas.document import DocumentResponse


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.get(
    "/",
    response_model=list[DocumentResponse],
)
def get_documents(
    db: Session = Depends(get_db),
    search: str | None = Query(
        default=None,
        description="Search documents by title, type, or source.",
    ),
    source: str | None = Query(
        default=None,
        description="Filter by source name.",
    ),
    document_type: str | None = Query(
        default=None,
        description="Filter by document type.",
    ),
    limit: int = Query(
        default=50,
        ge=1,
        le=100,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),
):
    statement = (
        select(
            SourceDocument,
            DataSource.name.label("source_name"),
        )
        .join(
            DataSource,
            SourceDocument.source_id == DataSource.id,
        )
        .order_by(
            SourceDocument.publication_date.desc().nullslast(),
            SourceDocument.id.desc(),
        )
        .offset(offset)
        .limit(limit)
    )

    if search:
        search_pattern = f"%{search.strip()}%"

        statement = statement.where(
            SourceDocument.title.ilike(search_pattern)
            | SourceDocument.document_type.ilike(search_pattern)
            | DataSource.name.ilike(search_pattern)
        )

    if source:
        statement = statement.where(
            DataSource.name.ilike(source.strip())
        )

    if document_type:
        statement = statement.where(
            SourceDocument.document_type.ilike(
                document_type.strip()
            )
        )

    results = db.execute(statement).all()

    return [
        DocumentResponse(
            id=document.id,
            source_id=document.source_id,
            source_name=source_name,
            title=document.title,
            document_url=document.document_url,
            local_path=document.local_path,
            publication_date=document.publication_date,
            document_type=document.document_type,
            ingested_at=document.ingested_at,
        )
        for document, source_name in results
    ]


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
):
    statement = (
        select(
            SourceDocument,
            DataSource.name.label("source_name"),
        )
        .join(
            DataSource,
            SourceDocument.source_id == DataSource.id,
        )
        .where(
            SourceDocument.id == document_id
        )
    )

    result = db.execute(statement).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    document, source_name = result

    return DocumentResponse(
        id=document.id,
        source_id=document.source_id,
        source_name=source_name,
        title=document.title,
        document_url=document.document_url,
        local_path=document.local_path,
        publication_date=document.publication_date,
        document_type=document.document_type,
        ingested_at=document.ingested_at,
    )