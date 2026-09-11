from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pdfplumber


@dataclass
class DocumentChunk:
    document_id: int
    chunk_index: int
    page_number: int
    text: str


def clean_text(text: str) -> str:
    """
    Clean extracted PDF text while preserving
    meaningful line boundaries.
    """

    if not text:
        return ""

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    cleaned_lines: list[str] = []

    for line in text.split("\n"):
        line = line.strip()

        if not line:
            continue

        # Normalize repeated whitespace.
        line = " ".join(line.split())

        cleaned_lines.append(line)

    return "\n".join(cleaned_lines)


def extract_pdf_pages(
    document_id: int,
    local_path: str,
) -> list[dict]:
    """
    Extract a PDF page-by-page using pdfplumber.

    Text and tables are extracted separately so that
    structured information is less likely to be lost.
    """

    path = Path(local_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Document not found: {path}"
        )

    pages: list[dict] = []

    with pdfplumber.open(path) as pdf:

        for page_number, page in enumerate(
            pdf.pages,
            start=1,
        ):

            page_parts: list[str] = []

            # -----------------------------------------
            # TEXT
            # -----------------------------------------

            text = page.extract_text(
                x_tolerance=2,
                y_tolerance=3,
            )

            if text:
                cleaned = clean_text(text)

                if cleaned:
                    page_parts.append(cleaned)

            # -----------------------------------------
            # TABLES
            # -----------------------------------------

            tables = page.extract_tables()

            for table_index, table in enumerate(
                tables,
                start=1,
            ):

                if not table:
                    continue

                table_lines: list[str] = []

                table_lines.append(
                    f"TABLE {table_index}"
                )

                for row in table:

                    if not row:
                        continue

                    cells = []

                    for cell in row:

                        if cell is None:
                            cell = ""

                        cell = " ".join(
                            str(cell).split()
                        )

                        cells.append(cell)

                    if not any(cells):
                        continue

                    table_lines.append(
                        " | ".join(cells)
                    )

                if len(table_lines) > 1:
                    page_parts.append(
                        "\n".join(table_lines)
                    )

            combined_text = "\n\n".join(
                page_parts
            )

            combined_text = clean_text(
                combined_text
            )

            pages.append(
                {
                    "document_id": document_id,
                    "page_number": page_number,
                    "text": combined_text,
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

    Chunks never cross page boundaries.

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
            "chunk_overlap must be smaller than "
            "chunk_size."
        )

    chunks: list[DocumentChunk] = []

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
    Extract text
      ↓
    Extract tables
      ↓
    Clean content
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