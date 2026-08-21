from dataclasses import dataclass
from datetime import date
from pathlib import Path

from sqlalchemy.orm import Session

from app.ingestion.documents import (
    DocumentInfo,
    download_document,
    register_document,
)


KNBS_SOURCE_NAME = "KNBS"

KNBS_DOCUMENT_URL = (
    "https://www.knbs.or.ke/wp-content/uploads/2026/07/"
    "Kenya-Consumer-Price-Indices-and-Inflation-Rates-July-2026.pdf"
)

KNBS_DOCUMENT_TITLE = (
    "The Kenya Consumer Price Index and Inflation Report - July 2026"
)

KNBS_PUBLICATION_DATE = date(2026, 7, 31)

KNBS_LOCAL_PATH = Path(
    "data/raw/knbs/"
    "Kenya-Consumer-Price-Indices-and-Inflation-Rates-July-2026.pdf"
)


@dataclass
class KNBSDocument:
    id: int
    title: str
    document_url: str
    local_path: str
    publication_date: date


def ingest_knbs_document(
    db: Session,
) -> KNBSDocument:
    """
    Prepare the KNBS document for ingestion.

    Steps:
    1. Build KNBS document metadata.
    2. Download the PDF if it does not exist locally.
    3. Register the document in source_documents if necessary.
    4. Return the registered document metadata.

    Extraction, normalization, validation and loading
    are handled by knbs_pipeline.py.
    """

    print()
    print("Preparing KNBS document...")
    print()

    document_info = DocumentInfo(
        source_name=KNBS_SOURCE_NAME,
        title=KNBS_DOCUMENT_TITLE,
        url=KNBS_DOCUMENT_URL,
        local_path=str(KNBS_LOCAL_PATH),
        publication_date=KNBS_PUBLICATION_DATE,
        document_type="pdf",
    )

    # Download only if the file does not already exist.
    local_path = Path(document_info.local_path)

    if local_path.exists():

        print(
            f"✓ KNBS PDF already exists: "
            f"{local_path}"
        )

    else:

        download_document(
            url=document_info.url,
            local_path=document_info.local_path,
        )

        print(
            f"✓ KNBS PDF downloaded: "
            f"{local_path}"
        )

    # Register the document or retrieve the existing record.
    source_document = register_document(
        db=db,
        document=document_info,
    )

    print(
        f"✓ KNBS document registered: "
        f"ID {source_document.id}"
    )

    return KNBSDocument(
        id=source_document.id,
        title=source_document.title,
        document_url=source_document.document_url,
        local_path=source_document.local_path,
        publication_date=source_document.publication_date,
    )