from pathlib import Path
import hashlib

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.data_source import DataSource
from app.models.source_document import SourceDocument


PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = PROJECT_ROOT / "data" / "raw"


def calculate_sha256(pdf_path: Path) -> str:
    sha256 = hashlib.sha256()

    with pdf_path.open("rb") as file:
        for block in iter(
            lambda: file.read(1024 * 1024),
            b"",
        ):
            sha256.update(block)

    return sha256.hexdigest()


def get_source(db, source_name):
    return db.execute(
        select(DataSource).where(
            DataSource.name == source_name
        )
    ).scalar_one_or_none()


def register_pdf(db, pdf_path, source):
    relative_path = str(
        pdf_path.relative_to(PROJECT_ROOT)
    )

    content_hash = calculate_sha256(pdf_path)

    existing = db.execute(
        select(SourceDocument).where(
            SourceDocument.content_hash == content_hash
        )
    ).scalar_one_or_none()

    if existing:
        return "duplicate"

    existing_path = db.execute(
        select(SourceDocument).where(
            SourceDocument.local_path == relative_path
        )
    ).scalar_one_or_none()

    if existing_path:
        return "existing_path"

    document = SourceDocument(
        source_id=source.id,
        title=pdf_path.stem,
        document_url=None,
        local_path=relative_path,
        publication_date=None,
        document_type="pdf",
        content_hash=content_hash,
    )

    db.add(document)

    return "registered"


def main():
    db = SessionLocal()

    try:
        source = get_source(db, "KNBS")

        if source is None:
            raise RuntimeError(
                "KNBS data source does not exist in the database."
            )

        pdf_files = sorted(
            RAW_DIR.glob("*.pdf")
        )

        print()
        print("ECONIQ PDF REGISTRATION")
        print()
        print(f"PDF files found: {len(pdf_files)}")
        print()

        registered = 0
        duplicates = 0
        existing_paths = 0

        for pdf_path in pdf_files:
            status = register_pdf(
                db=db,
                pdf_path=pdf_path,
                source=source,
            )

            if status == "registered":
                registered += 1
                print(
                    f"Registered: {pdf_path.name}"
                )

            elif status == "duplicate":
                duplicates += 1
                print(
                    f"Duplicate skipped: {pdf_path.name}"
                )

            elif status == "existing_path":
                existing_paths += 1

        db.commit()

        total_registered = db.execute(
            select(SourceDocument)
        ).scalars().all()

        print()
        print("PDF REGISTRATION COMPLETE")
        print()
        print(f"Newly registered: {registered}")
        print(f"Duplicates skipped: {duplicates}")
        print(f"Already registered paths: {existing_paths}")
        print(f"Total PDFs found: {len(pdf_files)}")
        print(
            f"Total registered documents: "
            f"{len(total_registered)}"
        )

    finally:
        db.close()


if __name__ == "__main__":
    main()
