from qdrant_client.models import PointStruct
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.embeddings import EmbeddingModel
from app.models.document_chunk import DocumentChunk
from app.vector_store import (
    COLLECTION_NAME,
    get_qdrant_client,
    create_collection,
)


def create_point_id(
    document_id: int,
    chunk_index: int,
) -> str:
    """
    Create a deterministic ID for a document chunk.

    The same document/chunk combination will always
    produce the same Qdrant point ID.
    """

    return (
        f"document-{document_id}-"
        f"chunk-{chunk_index}"
    )


def get_document_chunks(
    db: Session,
    document_id: int,
) -> list[DocumentChunk]:
    """
    Retrieve all chunks for a document.
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

    return list(
        result.scalars().all()
    )


def index_document(
    db: Session,
    document_id: int,
) -> int:
    """
    Generate embeddings for all chunks belonging
    to a document and store them in Qdrant.

    Returns the number of indexed chunks.
    """

    chunks = get_document_chunks(
        db=db,
        document_id=document_id,
    )

    if not chunks:
        raise ValueError(
            f"No chunks found for document "
            f"{document_id}."
        )

    print(
        f"✓ Found {len(chunks)} chunks "
        f"for document {document_id}"
    )

    print()
    print("Loading embedding model...")

    model = EmbeddingModel()

    print(
        f"✓ Model loaded: "
        f"{model.model_name}"
    )

    texts = [
        chunk.text
        for chunk in chunks
    ]

    print()
    print(
        f"Generating embeddings for "
        f"{len(texts)} chunks..."
    )

    embeddings = model.embed_texts(
        texts
    )

    print(
        f"✓ Generated {len(embeddings)} embeddings"
    )

    client = get_qdrant_client()

    create_collection(client)

    points = []

    for chunk, vector in zip(
        chunks,
        embeddings,
    ):

        point_id = create_point_id(
            document_id=chunk.document_id,
            chunk_index=chunk.chunk_index,
        )

        points.append(
            PointStruct(
                id=point_id,
                vector=vector,
                payload={
                    "document_id": chunk.document_id,
                    "chunk_id": chunk.id,
                    "chunk_index": chunk.chunk_index,
                    "page_number": chunk.page_number,
                },
            )
        )

    print()
    print(
        f"Uploading {len(points)} vectors "
        f"to Qdrant..."
    )

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
    )

    print(
        f"✓ Uploaded {len(points)} vectors"
    )

    return len(points)


def main():

    document_id = 1

    print()
    print("================================")
    print("INDEXING DOCUMENT INTO QDRANT")
    print("================================")
    print()

    db = SessionLocal()

    try:

        client = get_qdrant_client()

        print(
            "✓ Connected to Qdrant"
        )

        indexed = index_document(
            db=db,
            document_id=document_id,
        )

        info = client.get_collection(
            COLLECTION_NAME
        )

        print()
        print("================================")
        print("QDRANT INDEXING COMPLETE")
        print("================================")

        print(
            f"Document ID: {document_id}"
        )

        print(
            f"Vectors indexed: {indexed}"
        )

        print(
            f"Vectors in collection: "
            f"{info.points_count}"
        )

        print(
            f"Collection status: "
            f"{info.status}"
        )

        print("================================")

    finally:

        db.close()


if __name__ == "__main__":
    main()