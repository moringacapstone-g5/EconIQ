from sqlalchemy import select, func

from app.db.session import SessionLocal
from app.models.source_document import SourceDocument
from app.models.document_chunk import DocumentChunk
from app.ingestion.pipeline import process_document


def main():
    db = SessionLocal()

    try:
        documents = db.execute(
            select(SourceDocument)
            .order_by(SourceDocument.id)
        ).scalars().all()

        print()
        print("ECONIQ BULK DOCUMENT INGESTION")
        print()
        print(f"Registered documents: {len(documents)}")
        print()

        processed = 0
        skipped = 0
        failed = 0

        for document in documents:
            chunk_count = db.execute(
                select(func.count(DocumentChunk.id))
                .where(DocumentChunk.document_id == document.id)
            ).scalar_one()

            print(f"Document ID: {document.id}")
            print(f"Title: {document.title}")

            if chunk_count > 0:
                print(f"Status: SKIPPED - already has {chunk_count} chunks")
                skipped += 1
                print()
                continue

            if not document.local_path:
                print("Status: SKIPPED - no local file path")
                skipped += 1
                print()
                continue

            try:
                result = process_document(
                    db=db,
                    document=document,
                )

                print("Status: PROCESSED")
                print(f"Chunks: {result.get('chunks', 0)}")
                print(
                    f"Qdrant indexed: "
                    f"{result.get('qdrant_indexed', 0)}"
                )

                processed += 1

            except Exception as exc:
                print("Status: FAILED")
                print(f"Error: {exc}")
                db.rollback()
                failed += 1

            print()

        print("ECONIQ BULK INGESTION COMPLETE")
        print()
        print(f"Processed: {processed}")
        print(f"Skipped: {skipped}")
        print(f"Failed: {failed}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
