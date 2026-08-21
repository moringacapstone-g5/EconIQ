from io import BytesIO

import requests
from pypdf import PdfReader


def download_knbs_pdf(url: str) -> bytes:
    response = requests.get(
        url,
        timeout=30,
        headers={
            "User-Agent": "ECONIQ/1.0"
        },
    )

    response.raise_for_status()

    content_type = response.headers.get(
        "content-type",
        ""
    ).lower()

    if "pdf" not in content_type:
        raise ValueError(
            f"Expected a PDF, got: {content_type}"
        )

    return response.content


def extract_knbs_text(pdf_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(pdf_bytes))

    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n".join(pages)


def fetch_knbs_report(url: str) -> str:
    pdf_bytes = download_knbs_pdf(url)

    return extract_knbs_text(pdf_bytes)