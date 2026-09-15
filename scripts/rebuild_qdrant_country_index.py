from __future__ import annotations

from pathlib import Path

from qdrant_client.models import PointStruct
from sqlalchemy import select

from app.db.session import SessionLocal
from app.embeddings import get_embedding_model
from app.ingestion.pipeline import detect_country
from app.models.data_source import DataSource
from app.models.document_chunk import DocumentChunk
from app.models.source_document import SourceDocument
from app.vector_store import (
    COLLECTION_NAME,
    create_collection,
    get_qdrant_client,
)


BATCH_SIZE = 64


def main():
    print("ECONIQ QDRANT COUNTRY-AWARE REBUILD")

    client = get_qdrant_client()

    # ---------------------------------------------------------
    # 1. Delete the existing Qdrant collection
    # ---------------------------------------------------------
    collections = client.get_collections()
    existing_names = {
        collection.name
        for collection in collections.collections
    }

    if COLLECTION_NAME in existing_names:
        print(f"\nDeleting existing collection: {COLLECTION_NAME}")
        client.delete_collection(
            collection_name=COLLECTION_NAME
        )
        print("Existing collection deleted.")

    # ---------------------------------------------------------
    # 2. Create a clean collection
    # ---------------------------------------------------------
    create_collection(client)

    # ---------------------------------------------------------
    # 3. Load database records
    # ---------------------------------------------------------
    db = SessionLocal()

    try:
        chunks = db.execute(
            select(
                DocumentChunk,
                SourceDocument,
                DataSource,
            )
            .join(
                SourceDocument,
                DocumentChunk.document_id == SourceDocument.id,
            )
            .join(
                DataSource,
                SourceDocument.source_id == DataSource.id,
            )
            .order_by(DocumentChunk.id)
        ).all()

        print(f"\nDocument chunks found: {len(chunks)}")

        if not chunks:
            print("No document chunks found. Nothing to index.")
            return

        # -----------------------------------------------------
        # 4. Load embedding model
        # -----------------------------------------------------
        print("\nLoading embedding model...")
        model = get_embedding_model()
        print("Embedding model loaded.")

        total_indexed = 0
        total_unknown = 0
        total_ambiguous = 0

        # -----------------------------------------------------
        # 5. Process in batches
        # -----------------------------------------------------
        for start in range(0, len(chunks), BATCH_SIZE):
            batch = chunks[start:start + BATCH_SIZE]

            texts = [
                chunk.text
                for chunk, document, source in batch
            ]

            vectors = model.embed_texts(texts)

            points = []

            for (chunk, document, source), vector in zip(
                batch,
                vectors,
            ):
                country_info = detect_country(
                    document,
                    source.name,
                )

                country_code = country_info["country_code"]
                country = country_info["country"]
                detection_status = country_info[
                    "country_detection_status"
                ]

                if detection_status == "unknown":
                    total_unknown += 1

                elif detection_status == "ambiguous":
                    total_ambiguous += 1

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
                            "country_detection_status": detection_status,

                            "source": source.name,
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

            total_indexed += len(points)

            print(
                f"Indexed {total_indexed}/{len(chunks)} chunks"
            )

        # -----------------------------------------------------
        # 6. Final collection information
        # -----------------------------------------------------
        info = client.get_collection(
            COLLECTION_NAME
        )

        print("REBUILD COMPLETE")

        print(f"Collection: {COLLECTION_NAME}")
        print(f"Points indexed: {total_indexed}")
        print(f"Unknown country chunks: {total_unknown}")
        print(f"Ambiguous country chunks: {total_ambiguous}")
        print(f"Qdrant points: {info.points_count}")
        print(
            f"Indexed vectors: {info.indexed_vectors_count}"
        )

    finally:
        db.close()


if __name__ == "__main__":
    main()
