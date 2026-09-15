from __future__ import annotations

import re
from pathlib import Path

from qdrant_client.models import PointStruct
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.embeddings import get_embedding_model
from app.ingestion.document_processing import process_pdf_document
from app.models.data_source import DataSource
from app.models.document_chunk import DocumentChunk
from app.models.source_document import SourceDocument
from app.vector_store import (
    COLLECTION_NAME,
    create_collection,
    get_qdrant_client,
)


COUNTRY_METADATA = {
    "KE": {
        "country": "Kenya",
        "aliases": [
            "kenya",
            "kenyan",
            "knbs",
            "central bank of kenya",
            "cbk",
        ],
    },
    "UG": {
        "country": "Uganda",
        "aliases": [
            "uganda",
            "ugandan",
            "bank of uganda",
            "uganda bureau of statistics",
            "ubos",
            "bou",
        ],
    },
    "TZ": {
        "country": "Tanzania",
        "aliases": [
            "tanzania",
            "tanzanian",
            "united republic of tanzania",
            "bank of tanzania",
            "national bureau of statistics tanzania",
        ],
    },
    "RW": {
        "country": "Rwanda",
        "aliases": [
            "rwanda",
            "rwandan",
            "national institute of statistics of rwanda",
            "statistics rwanda",
            "bank of rwanda",
        ],
    },
    "ET": {
        "country": "Ethiopia",
        "aliases": [
            "ethiopia",
            "ethiopian",
            "national bank of ethiopia",
            "central statistical service",
        ],
    },
    "NG": {
        "country": "Nigeria",
        "aliases": [
            "nigeria",
            "nigerian",
            "central bank of nigeria",
            "national bureau of statistics nigeria",
        ],
    },
    "GH": {
        "country": "Ghana",
        "aliases": [
            "ghana",
            "ghanaian",
            "bank of ghana",
            "ghana statistical service",
        ],
    },
    "ZA": {
        "country": "South Africa",
        "aliases": [
            "south africa",
            "south african",
            "south african reserve bank",
            "statistics south africa",
            "stats sa",
        ],
    },
}


def detect_country(document: SourceDocument, source_name: str) -> dict:
    """
    Detect the country represented by a document.

    Country detection is performed from document metadata rather than
    individual chunk text so that all chunks from the same document
    receive consistent country metadata.
    """

    searchable_text = " ".join(
        value
        for value in [
            document.title,
            document.local_path,
            document.document_url,
            source_name,
        ]
        if value
    ).lower()

    matches = []

    for country_code, metadata in COUNTRY_METADATA.items():
        for alias in metadata["aliases"]:
            if re.search(
                rf"(?<![a-z]){re.escape(alias.lower())}(?![a-z])",
                searchable_text,
            ):
                matches.append(
                    (
                        country_code,
                        metadata["country"],
                        alias,
                    )
                )

    if not matches:
        return {
            "country": None,
            "country_code": None,
            "country_detection_status": "unknown",
        }

    unique_countries = {
        (country_code, country)
        for country_code, country, _ in matches
    }

    if len(unique_countries) > 1:
        detected = ", ".join(
            sorted(country for _, country in unique_countries)
        )

        print(
            "WARNING: Multiple countries detected "
            f"for document {document.id}: {detected}"
        )

        return {
            "country": None,
            "country_code": None,
            "country_detection_status": "ambiguous",
        }

    country_code, country = next(iter(unique_countries))

    return {
        "country": country,
        "country_code": country_code,
        "country_detection_status": "detected",
    }


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
    *,
    country: str | None,
    country_code: str | None,
    country_detection_status: str,
    source_name: str,
    document: SourceDocument,
) -> int:
    """
    Generate embeddings and store document chunks in Qdrant
    with country-aware metadata.
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
                    "country": country,
                    "country_code": country_code,
                    "country_detection_status": country_detection_status,
                    "source": source_name,
                    "document_title": document.title,
                    "document_type": document.document_type,
                    "publication_date": (
                        document.publication_date.isoformat()
                        if document.publication_date
                        else None
                    ),
                    "file_name": (
                        Path(document.local_path).name
                        if document.local_path
                        else None
                    ),
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

    source = db.execute(
        select(DataSource).where(
            DataSource.id == document.source_id
        )
    ).scalar_one_or_none()

    source_name = (
        source.name
        if source is not None
        else "Unknown"
    )

    country_metadata = detect_country(
        document=document,
        source_name=source_name,
    )

    print()
    print("ECONIQ DOCUMENT INGESTION")
    print(f"Document ID: {document.id}")
    print(f"Title: {document.title}")
    print(f"File: {path}")
    print(f"Source: {source_name}")
    print(
        "Country: "
        f"{country_metadata['country'] or 'Unknown'} "
        f"({country_metadata['country_code'] or 'N/A'})"
    )
    print(
        "Country detection: "
        f"{country_metadata['country_detection_status']}"
    )

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
        country=country_metadata["country"],
        country_code=country_metadata["country_code"],
        country_detection_status=country_metadata[
            "country_detection_status"
        ],
        source_name=source_name,
        document=document,
    )

    print(
        f"Indexed {indexed_count} chunks in Qdrant"
    )

    print()
    print("DOCUMENT INGESTION COMPLETE")

    return {
        "document_id": document.id,
        "title": document.title,
        "country": country_metadata["country"],
        "country_code": country_metadata["country_code"],
        "country_detection_status": country_metadata[
            "country_detection_status"
        ],
        "source": source_name,
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
