from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.document_chunk import DocumentChunk
from app.ingestion.document_processing import DocumentChunk as ProcessedChunk


def load_document_chunks(
    db: Session,
    chunks: list[ProcessedChunk],
) -> tuple[int, int]:
    """
    Load processed document chunks into PostgreSQL.

    Existing chunks for the same document are replaced so that
    re-running document processing does not create duplicates.

    Returns:
        inserted, skipped
    """

    if not chunks:
        return 0, 0

    document_id = chunks[0].document_id

    # Remove previously generated chunks for this document.
    db.execute(
        delete(DocumentChunk).where(
            DocumentChunk.document_id == document_id
        )
    )

    inserted = 0

    for chunk in chunks:

        db.add(
            DocumentChunk(
                document_id=chunk.document_id,
                chunk_index=chunk.chunk_index,
                page_number=chunk.page_number,
                text=chunk.text,
            )
        )

        inserted += 1

    db.commit()

    return inserted, 0


def get_document_chunks(
    db: Session,
    document_id: int,
) -> list[DocumentChunk]:
    """
    Retrieve all chunks belonging to a document.
    """

    result = db.execute(
        select(DocumentChunk)
        .where(
            DocumentChunk.document_id == document_id
        )
        .order_by(
            DocumentChunk.chunk_index
        )
    )

    return list(result.scalars().all())