from __future__ import annotations

from pathlib import Path

from qdrant_client.models import PointStruct
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.embeddings import get_embedding_model
from app.ingestion.document_processing import process_pdf_document
from app.models.document_chunk import DocumentChunk
from app.models.source_document import SourceDocument
from app.vector_store import (
    COLLECTION_NAME,
    create_collection,
    get_qdrant_client,
)


def save_chunks_to_postgres(
    db: Session,
    chunks,
) -> list[DocumentChunk]:
    """
    Save processed document chunks to PostgreSQL.
    """

    saved_chunks: list[DocumentChunk] = []

    for chunk in chunks:
        existing = db.execute(
            select(DocumentChunk).where(
                DocumentChunk.document_id == chunk.document_id,
                DocumentChunk.chunk_index == chunk.chunk_index,
            )
        ).scalar_one_or_none()

        if existing is not None:
            saved_chunks.append(existing)
            continue

        db_chunk = DocumentChunk(
            document_id=chunk.document_id,
            chunk_index=chunk.chunk_index,
            page_number=chunk.page_number,
            text=chunk.text,
        )

        db.add(db_chunk)
        saved_chunks.append(db_chunk)

    db.commit()

    for chunk in saved_chunks:
        db.refresh(chunk)

    return saved_chunks


def index_chunks_in_qdrant(
    chunks: list[DocumentChunk],
) -> int:
    """
    Generate embeddings and store document chunks
    inside Qdrant.
    """

    if not chunks:
        return 0

    client = get_qdrant_client()
    create_collection(client)

    model = get_embedding_model()

    texts = [
        chunk.text
        for chunk in chunks
    ]

    vectors = model.embed_texts(texts)

    points = []

    for chunk, vector in zip(chunks, vectors):
        points.append(
            PointStruct(
                id=chunk.id,
                vector=vector,
                payload={
                    "chunk_id": chunk.id,
                    "document_id": chunk.document_id,
                    "chunk_index": chunk.chunk_index,
                    "page_number": chunk.page_number,
                },
            )
        )

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
    )

    return len(points)


def process_document(
    db: Session,
    document: SourceDocument,
) -> dict:
    """
    Complete document ingestion pipeline.
    """

    if not document.local_path:
        raise ValueError(
            "Document does not have a local_path."
        )

    path = Path(document.local_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Document file not found: {path}"
        )

    print()
    print("ECONIQ DOCUMENT INGESTION")

    print(f"Document ID: {document.id}")
    print(f"Title: {document.title}")
    print(f"File: {path}")

    print()
    print("1. Extracting and chunking PDF...")

    chunks = process_pdf_document(
        document_id=document.id,
        local_path=str(path),
        chunk_size=1200,
        chunk_overlap=200,
    )

    print(
        f"Generated {len(chunks)} chunks"
    )

    if not chunks:
        raise ValueError(
            "No usable chunks were generated."
        )

    print()
    print("2. Saving chunks to PostgreSQL...")

    saved_chunks = save_chunks_to_postgres(
        db=db,
        chunks=chunks,
    )

    print(
        f"PostgreSQL chunks available: "
        f"{len(saved_chunks)}"
    )

    print()
    print("3. Generating embeddings and indexing Qdrant...")

    indexed_count = index_chunks_in_qdrant(
        chunks=saved_chunks,
    )

    print(
        f"Indexed {indexed_count} chunks in Qdrant"
    )

    print()
    print("DOCUMENT INGESTION COMPLETE")

    return {
        "document_id": document.id,
        "title": document.title,
        "chunks": len(saved_chunks),
        "qdrant_indexed": indexed_count,
    }


def ingest_document_by_id(
    document_id: int,
) -> dict:
    """
    Ingest a registered document using its database ID.
    """

    db = SessionLocal()

    try:
        document = db.execute(
            select(SourceDocument).where(
                SourceDocument.id == document_id
            )
        ).scalar_one_or_none()

        if document is None:
            raise ValueError(
                f"Document not found: {document_id}"
            )

        return process_document(
            db=db,
            document=document,
        )

    finally:
        db.close()


def main():
    """
    Command-line document ingestion.
    """

    document_id = int(
        input(
            "Enter ECONIQ document ID: "
        ).strip()
    )

    result = ingest_document_by_id(
        document_id
    )

    print()
    print(result)


if __name__ == "__main__":
    main()
