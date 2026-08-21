from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.source_document import SourceDocument

from app.ingestion.document_processing import (
    process_pdf_document,
)

from app.ingestion.chunk_loader import (
    load_document_chunks,
    get_document_chunks,
)


def main():

    db = SessionLocal()

    try:

        document_id = 1

        print()
        print("================================")
        print("TESTING DOCUMENT PROCESSING")
        print("================================")
        print()

        document = db.execute(
            select(SourceDocument).where(
                SourceDocument.id == document_id
            )
        ).scalar_one_or_none()

        if document is None:
            raise ValueError(
                f"Document ID {document_id} does not exist."
            )

        print(
            f"Document ID: {document.id}"
        )

        print(
            f"Title: {document.title}"
        )

        print()

        # --------------------------------------------
        # Extract and chunk
        # --------------------------------------------

        print("Processing PDF...")

        chunks = process_pdf_document(
            document_id=document.id,
            local_path=document.local_path,
        )

        print(
            f"✓ Generated {len(chunks)} chunks"
        )

        # --------------------------------------------
        # Load chunks
        # --------------------------------------------

        print()
        print("Loading chunks into PostgreSQL...")

        inserted, skipped = load_document_chunks(
            db=db,
            chunks=chunks,
        )

        print(
            f"✓ Inserted: {inserted}"
        )

        print(
            f"✓ Skipped: {skipped}"
        )

        # --------------------------------------------
        # Verify
        # --------------------------------------------

        stored_chunks = get_document_chunks(
            db=db,
            document_id=document_id,
        )

        print()
        print("================================")
        print("CHUNK STORAGE COMPLETE")
        print("================================")

        print(
            f"Chunks in PostgreSQL: "
            f"{len(stored_chunks)}"
        )

        print(
            f"Document ID: "
            f"{document_id}"
        )

        print("================================")

    finally:

        db.close()


if __name__ == "__main__":
    main()