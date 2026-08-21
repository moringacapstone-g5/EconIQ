from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader


@dataclass
class DocumentChunk:
    document_id: int
    chunk_index: int
    page_number: int
    text: str


def clean_text(text: str) -> str:
    """Clean extracted PDF text."""

    if not text:
        return ""

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    lines = []

    for line in text.split("\n"):
        line = " ".join(line.split())

        if line:
            lines.append(line)

    return "\n".join(lines)


def extract_pdf_pages(
    document_id: int,
    local_path: str,
) -> list[dict]:
    """
    Extract PDF text page-by-page.

    Each page keeps:
    - document_id
    - page_number
    - text
    """

    path = Path(local_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Document not found: {path}"
        )

    reader = PdfReader(str(path))

    pages = []

    for page_number, page in enumerate(
        reader.pages,
        start=1,
    ):
        text = page.extract_text() or ""

        text = clean_text(text)

        pages.append(
            {
                "document_id": document_id,
                "page_number": page_number,
                "text": text,
            }
        )

    return pages


def chunk_document_pages(
    pages: list[dict],
    document_id: int,
    chunk_size: int = 1200,
    chunk_overlap: int = 200,
) -> list[DocumentChunk]:
    """
    Split document pages into overlapping chunks.

    Page and document provenance are preserved.
    """

    if chunk_size <= 0:
        raise ValueError(
            "chunk_size must be greater than zero."
        )

    if chunk_overlap < 0:
        raise ValueError(
            "chunk_overlap cannot be negative."
        )

    if chunk_overlap >= chunk_size:
        raise ValueError(
            "chunk_overlap must be smaller than chunk_size."
        )

    chunks = []

    chunk_index = 0

    for page in pages:

        page_number = page["page_number"]
        text = page["text"]

        if not text:
            continue

        start = 0

        while start < len(text):

            end = start + chunk_size

            chunk_text = text[start:end].strip()

            if chunk_text:

                chunks.append(
                    DocumentChunk(
                        document_id=document_id,
                        chunk_index=chunk_index,
                        page_number=page_number,
                        text=chunk_text,
                    )
                )

                chunk_index += 1

            if end >= len(text):
                break

            start = end - chunk_overlap

    return chunks


def process_pdf_document(
    document_id: int,
    local_path: str,
    chunk_size: int = 1200,
    chunk_overlap: int = 200,
) -> list[DocumentChunk]:
    """
    Complete PDF processing workflow.

    PDF
      ↓
    Extract pages
      ↓
    Clean text
      ↓
    Chunk text
      ↓
    Preserve provenance
    """

    pages = extract_pdf_pages(
        document_id=document_id,
        local_path=local_path,
    )

    chunks = chunk_document_pages(
        pages=pages,
        document_id=document_id,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )

    return chunks