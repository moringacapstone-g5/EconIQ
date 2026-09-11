from __future__ import annotations

import hashlib
import json
import re
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

from docx import Document
from pypdf import PdfReader


SUPPORTED_DOCUMENTS = {".pdf", ".docx"}


@dataclass
class DocumentRecord:
    filename: str
    path: str
    extension: str

    title: str
    country: str
    country_code: str
    source: str
    publisher: str
    category: str
    document_type: str
    period: str | None
    frequency: str | None
    source_url: str | None

    size_bytes: int
    sha256: str

    extracted_text_path: str | None
    page_count: int | None
    text_length: int

    status: str
    reason: str | None
    processed_at: str


# FILE HASHING

def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()

    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)

    return digest.hexdigest()


# ---------------------------------------------------------------------------
# TEXT CLEANING
# ---------------------------------------------------------------------------

def clean_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()



# TITLE

def clean_title(filename: str) -> str:
    title = Path(filename).stem

    title = re.sub(
        r"\s*[-–—]\s*(?:PANYAKO CLINTON|KAFIA HASSAN|FIONA WANJIKU|"
        r"IMMACULATE MOKEIRA|JOY SANG)\s*$",
        "",
        title,
        flags=re.IGNORECASE,
    )

    title = re.sub(r"\s*\(\d+\)\s*$", "", title)

    title = title.replace("_", " ")
    title = re.sub(r"\s+", " ", title)

    return title.strip()


# ---------------------------------------------------------------------------
# SOURCE INFERENCE
# ---------------------------------------------------------------------------

def infer_source(filename: str, text: str = "") -> str:
    """
    Source detection deliberately prioritizes strong filename/document
    indicators instead of classifying a document based on a casual mention
    of another institution.
    """

    name = Path(filename).stem.lower()
    header = text[:15000].lower()

    # ---------------------------------------------------------
    # WORLD BANK
    # ---------------------------------------------------------
    world_bank_filename_patterns = [
        "world_bank",
        "world-bank",
        "world development indicators",
        "world development indicator",
        "metadata_country",
        "metadata_indicator",
        "api_ken_",
        "wdi_",
        "wdi-",
    ]

    if any(pattern in name for pattern in world_bank_filename_patterns):
        return "world_bank"

    # Strong World Bank document markers.
    world_bank_markers = [
        "world development indicators",
        "world bank group",
        "the world bank",
        "world bank country",
        "world bank indicator",
    ]

    if any(marker in header for marker in world_bank_markers):
        return "world_bank"

    # ---------------------------------------------------------
    # KNBS
    # ---------------------------------------------------------
    knbs_filename_patterns = [
        "economic-survey",
        "economic survey",
        "facts-and-figures",
        "facts and figures",
        "consumer-price",
        "consumer price",
        "inflation-rates",
        "inflation rates",
        "construction-input-price",
        "construction input price",
        "producer-price",
        "producer price",
        "residential-property-price",
        "residential property price",
        "property-price-index",
        "property price index",
        "balance-of-payment",
        "balance of payment",
        "balance-of-payments",
        "balance of payments",
        "international-trade",
        "international trade",
        "trade-bop",
        "quarterly-balance",
        "leading-economic",
        "leading economic",
        "quarterly-gross-domestic",
        "quarterly gross domestic",
    ]

    if any(pattern in name for pattern in knbs_filename_patterns):
        return "knbs"

    # Strong KNBS markers.
    knbs_markers = [
        "kenya national bureau of statistics",
        "knbs",
        "kenya national bureau",
    ]

    if any(marker in header for marker in knbs_markers):
        return "knbs"

  
    # CENTRAL BANK OF KENYA
    
    cbk_filename_patterns = [
        "central-bank",
        "central bank",
        "cbk",
        "monetary-policy",
        "monetary policy",
        "exchange-rate",
        "exchange rate",
        "money-supply",
        "money supply",
        "interest-rate",
        "interest rate",
    ]

    if any(pattern in name for pattern in cbk_filename_patterns):
        return "cbk"

    cbk_markers = [
        "central bank of kenya",
        "central bank rates",
        "monetary policy committee",
        "central bank of kenya monetary policy",
    ]

    if any(marker in header for marker in cbk_markers):
        return "cbk"

    # ---------------------------------------------------------
    # NATIONAL TREASURY
    # ---------------------------------------------------------
    treasury_filename_patterns = [
        "national-treasury",
        "national treasury",
        "public-debt",
        "public debt",
        "debt-management",
        "debt management",
    ]

    if any(pattern in name for pattern in treasury_filename_patterns):
        return "national_treasury"

    treasury_markers = [
        "the national treasury and economic planning",
        "national treasury and economic planning",
        "public debt management office",
    ]

    if any(marker in header for marker in treasury_markers):
        return "national_treasury"

    # ---------------------------------------------------------
    # WFP
    # ---------------------------------------------------------
    wfp_filename_patterns = [
        "wfp",
        "food_prices",
        "food-prices",
        "food prices",
        "markets_ken",
        "markets-ken",
    ]

    if any(pattern in name for pattern in wfp_filename_patterns):
        return "wfp"

    wfp_markers = [
        "world food programme",
        "world food program",
        "wfp food price",
    ]

    if any(marker in header for marker in wfp_markers):
        return "wfp"

    # ---------------------------------------------------------
    # CLIMATE
    # ---------------------------------------------------------
    climate_filename_patterns = [
        "climate",
        "rainfall",
        "precipitation",
        "weather",
        "temperature",
    ]

    if any(pattern in name for pattern in climate_filename_patterns):
        return "climate"

    climate_markers = [
        "climate data",
        "rainfall data",
        "precipitation data",
        "meteorological data",
    ]

    if any(marker in header for marker in climate_markers):
        return "climate"

    return "unknown"


# ---------------------------------------------------------------------------
# PUBLISHER
# ---------------------------------------------------------------------------

def infer_publisher(source: str) -> str:
    publishers = {
        "knbs": "Kenya National Bureau of Statistics",
        "cbk": "Central Bank of Kenya",
        "world_bank": "World Bank",
        "national_treasury": "The National Treasury and Economic Planning",
        "wfp": "World Food Programme",
        "climate": "Climate Data Source",
    }

    return publishers.get(source, "Unknown")


# ---------------------------------------------------------------------------
# COUNTRY
# ---------------------------------------------------------------------------

def infer_country(filename: str, text: str = "") -> tuple[str, str]:
    combined = f"{filename} {text[:10000]}".lower()

    kenya_patterns = [
        "kenya",
        "ken_",
        "ken.",
        "republic of kenya",
        "kenyan",
    ]

    if any(pattern in combined for pattern in kenya_patterns):
        return "Kenya", "KE"

    # World Bank Kenya datasets may use KE explicitly.
    if "country code: ke" in combined:
        return "Kenya", "KE"

    return "Unknown", "UN"


# ---------------------------------------------------------------------------
# DOCUMENT TYPE
# ---------------------------------------------------------------------------

def infer_document_type(filename: str, text: str = "") -> str:
    """
    Document type is determined primarily from the filename.

    This prevents a large Economic Survey containing inflation, trade,
    employment, etc. from being classified as an inflation document.
    """

    name = Path(filename).stem.lower()
    header = text[:15000].lower()

    # ---------------------------------------------------------
    # HIGH-CONFIDENCE FILENAME RULES
    # ---------------------------------------------------------

    if "economic-survey-popular" in name or "economic survey popular" in name:
        return "economic_survey_popular"

    if "economic-survey" in name or "economic survey" in name:
        return "economic_survey"

    if "facts-and-figures" in name or "facts and figures" in name:
        return "facts_and_figures"

    if "public-debt" in name or "public debt" in name:
        return "public_debt_report"

    if (
        "construction-input-price" in name
        or "construction input price" in name
    ):
        return "construction_price_index"

    if (
        "producer-price-indices" in name
        or "producer price indices" in name
        or "producer-price-index" in name
    ):
        return "producer_price_index"

    if (
        "residential-property-price" in name
        or "residential property price" in name
        or "property-price-index" in name
        or "property price index" in name
    ):
        return "property_price_index"

    if (
        "balance-of-payments" in name
        or "balance-of-payment" in name
        or "balance of payments" in name
        or "quarterly-balance" in name
    ):
        return "balance_of_payments_report"

    if (
        "international-trade" in name
        or "international trade" in name
        or "trade-bop" in name
    ):
        return "international_trade_report"

    if (
        "inflation-rates" in name
        or "inflation rates" in name
        or "consumer-price-indices" in name
        or "consumer price indices" in name
    ):
        return "inflation_report"

    if (
        "leading-economic-indicators" in name
        or "leading economic indicators" in name
    ):
        return "leading_economic_indicators"

    if (
        "gross-domestic-product" in name
        or "gross domestic product" in name
        or "quarterly-gdp" in name
        or "quarterly gdp" in name
    ):
        return "gdp_report"

    if "exchange-rate" in name or "exchange rate" in name:
        return "exchange_rate_document"

    if "money-supply" in name or "money supply" in name:
        return "money_supply_document"

    if "interest-rate" in name or "interest rate" in name:
        return "interest_rate_document"

    if "unemployment" in name:
        return "unemployment_document"

    # ---------------------------------------------------------
    # CONTENT RULES
    # ---------------------------------------------------------

    if "economic survey" in header:
        return "economic_survey"

    if "balance of payments" in header:
        return "balance_of_payments_report"

    if "producer price index" in header:
        return "producer_price_index"

    if "construction input price index" in header:
        return "construction_price_index"

    if "residential property price index" in header:
        return "property_price_index"

    if "leading economic indicators" in header:
        return "leading_economic_indicators"

    if "consumer price index" in header:
        return "inflation_report"

    if "inflation rate" in header:
        return "inflation_report"

    if "gross domestic product" in header:
        return "gdp_report"

    if "money supply" in header:
        return "money_supply_document"

    if "unemployment" in header:
        return "unemployment_document"

    return "general_economic_document"


# ---------------------------------------------------------------------------
# CATEGORY
# ---------------------------------------------------------------------------

def infer_category(
    filename: str,
    source: str,
    document_type: str,
    text: str = "",
) -> str:

    # Document type gets priority.
    category_by_type = {
        "economic_survey": "economic",
        "economic_survey_popular": "economic",
        "facts_and_figures": "economic",
        "gdp_report": "economic",
        "leading_economic_indicators": "economic",

        "inflation_report": "prices",
        "construction_price_index": "prices",
        "producer_price_index": "prices",
        "property_price_index": "prices",

        "balance_of_payments_report": "trade",
        "international_trade_report": "trade",

        "public_debt_report": "public_debt",

        "exchange_rate_document": "financial",
        "interest_rate_document": "financial",
        "money_supply_document": "financial",

        "unemployment_document": "labor",
    }

    if document_type in category_by_type:
        return category_by_type[document_type]

    # Source-level fallbacks.
    if source == "world_bank":
        return "economic"

    if source == "wfp":
        return "food_prices"

    if source == "climate":
        return "climate"

    # Generic content fallback.
    combined = f"{filename} {text[:10000]}".lower()

    if any(
        x in combined
        for x in [
            "agriculture",
            "agricultural",
            "crop",
            "livestock",
        ]
    ):
        return "agriculture"

    if any(
        x in combined
        for x in [
            "climate",
            "rainfall",
            "precipitation",
            "temperature",
        ]
    ):
        return "climate"

    return "unknown"


# ---------------------------------------------------------------------------
# FREQUENCY
# ---------------------------------------------------------------------------

def infer_frequency(
    filename: str,
    document_type: str,
    period: str | None,
    text: str = "",
) -> str | None:

    # Strong document-type rules first.
    annual_types = {
        "economic_survey",
        "economic_survey_popular",
        "facts_and_figures",
        "public_debt_report",
    }

    if document_type in annual_types:
        return "annual"

    quarterly_types = {
        "balance_of_payments_report",
        "international_trade_report",
        "construction_price_index",
        "producer_price_index",
        "property_price_index",
        "gdp_report",
        "leading_economic_indicators",
    }

    if document_type in quarterly_types:
        if period and "-Q" in period:
            return "quarterly"

        # Many reports are inherently quarterly.
        name = filename.lower()

        if any(
            x in name
            for x in [
                "quarter",
                "q1",
                "q2",
                "q3",
                "q4",
                "quarterly",
            ]
        ):
            return "quarterly"

    # Inflation reports are often monthly.
    if document_type == "inflation_report":
        return "monthly"

    if document_type in {
        "exchange_rate_document",
    }:
        return "daily"

    if document_type in {
        "interest_rate_document",
        "money_supply_document",
        "unemployment_document",
    }:
        return "monthly"

    return None


# ---------------------------------------------------------------------------
# PERIOD
# ---------------------------------------------------------------------------

def infer_period(filename: str, text: str = "") -> str | None:
    combined = f"{filename} {text[:15000]}"
    lower = combined.lower()

    # ---------------------------------------------------------
    # QUARTERS
    # ---------------------------------------------------------

    quarter_patterns = [
        (
            r"(?:first|1st)\s+quarter[\s\-]*(?:of\s+)?(20\d{2})",
            "Q1",
        ),
        (
            r"(?:second|2nd)\s+quarter[\s\-]*(?:of\s+)?(20\d{2})",
            "Q2",
        ),
        (
            r"(?:third|3rd)\s+quarter[\s\-]*(?:of\s+)?(20\d{2})",
            "Q3",
        ),
        (
            r"(?:fourth|4th)\s+quarter[\s\-]*(?:of\s+)?(20\d{2})",
            "Q4",
        ),
    ]

    for pattern, quarter in quarter_patterns:
        match = re.search(pattern, lower)

        if match:
            return f"{match.group(1)}-{quarter}"

    match = re.search(
        r"\b(q[1-4])[\s\-]*(20\d{2})\b",
        lower,
    )

    if match:
        return f"{match.group(2)}-{match.group(1).upper()}"

    # ---------------------------------------------------------
    # MONTH + YEAR
    # ---------------------------------------------------------

    months = {
        "january": "01",
        "february": "02",
        "march": "03",
        "april": "04",
        "may": "05",
        "june": "06",
        "july": "07",
        "august": "08",
        "september": "09",
        "october": "10",
        "november": "11",
        "december": "12",
    }

    month_pattern = (
        r"\b("
        + "|".join(months.keys())
        + r")"
        r"(?:[\s\-_]+)"
        r"(20\d{2})\b"
    )

    match = re.search(month_pattern, lower)

    if match:
        return f"{match.group(2)}-{months[match.group(1)]}"

    # ---------------------------------------------------------
    # YEAR
    # ---------------------------------------------------------

    match = re.search(r"\b(20\d{2})\b", combined)

    if match:
        return match.group(1)

    return None


# ---------------------------------------------------------------------------
# PDF EXTRACTION
# ---------------------------------------------------------------------------

def extract_pdf(path: Path) -> tuple[str, int]:
    reader = PdfReader(str(path))
    pages = []

    for page in reader.pages:
        try:
            pages.append(page.extract_text() or "")
        except Exception:
            pages.append("")

    return clean_text("\n\n".join(pages)), len(reader.pages)


# ---------------------------------------------------------------------------
# DOCX EXTRACTION
# ---------------------------------------------------------------------------

def extract_docx(path: Path) -> tuple[str, int]:
    document = Document(str(path))

    paragraphs = []

    for paragraph in document.paragraphs:
        text = paragraph.text.strip()

        if text:
            paragraphs.append(text)

    # Capture tables as well.
    for table in document.tables:
        for row in table.rows:
            values = [
                cell.text.strip()
                for cell in row.cells
            ]

            values = [
                value
                for value in values
                if value
            ]

            if values:
                paragraphs.append(" | ".join(values))

    return clean_text("\n".join(paragraphs)), 0


# ---------------------------------------------------------------------------
# PROCESS ONE DOCUMENT
# ---------------------------------------------------------------------------

def process_document(
    path: Path,
    raw_root: Path,
    output_root: Path,
    seen_hashes: dict[str, str],
) -> DocumentRecord:

    extension = path.suffix.lower()
    relative_path = path.relative_to(raw_root)

    file_hash = sha256_file(path)
    processed_at = datetime.now(timezone.utc).isoformat()

 
    # EXTRACT
   

    text = ""
    page_count = None

    try:

        if extension == ".pdf":
            text, page_count = extract_pdf(path)

        elif extension == ".docx":
            text, page_count = extract_docx(path)

        else:
            return DocumentRecord(
                filename=path.name,
                path=str(relative_path),
                extension=extension,
                title=clean_title(path.name),
                country="Unknown",
                country_code="UN",
                source="unknown",
                publisher="Unknown",
                category="unknown",
                document_type="general_economic_document",
                period=None,
                frequency=None,
                source_url=None,
                size_bytes=path.stat().st_size,
                sha256=file_hash,
                extracted_text_path=None,
                page_count=None,
                text_length=0,
                status="skipped",
                reason="Not a document format handled by document processor",
                processed_at=processed_at,
            )

    except Exception as exc:

        return DocumentRecord(
            filename=path.name,
            path=str(relative_path),
            extension=extension,
            title=clean_title(path.name),
            country="Unknown",
            country_code="UN",
            source="unknown",
            publisher="Unknown",
            category="unknown",
            document_type="general_economic_document",
            period=None,
            frequency=None,
            source_url=None,
            size_bytes=path.stat().st_size,
            sha256=file_hash,
            extracted_text_path=None,
            page_count=None,
            text_length=0,
            status="error",
            reason=str(exc),
            processed_at=processed_at,
        )

    # ---------------------------------------------------------
    # METADATA
    # ---------------------------------------------------------

    source = infer_source(path.name, text)

    publisher = infer_publisher(source)

    country, country_code = infer_country(
        path.name,
        text,
    )

    document_type = infer_document_type(
        path.name,
        text,
    )

    period = infer_period(
        path.name,
        text,
    )

    frequency = infer_frequency(
        path.name,
        document_type,
        period,
        text,
    )

    category = infer_category(
        path.name,
        source,
        document_type,
        text,
    )

    title = clean_title(path.name)

    # ---------------------------------------------------------
    # DUPLICATE CHECK
    # ---------------------------------------------------------

    if file_hash in seen_hashes:

        return DocumentRecord(
            filename=path.name,
            path=str(relative_path),
            extension=extension,
            title=title,
            country=country,
            country_code=country_code,
            source=source,
            publisher=publisher,
            category=category,
            document_type=document_type,
            period=period,
            frequency=frequency,
            source_url=None,
            size_bytes=path.stat().st_size,
            sha256=file_hash,
            extracted_text_path=None,
            page_count=None,
            text_length=0,
            status="duplicate",
            reason=f"Duplicate of {seen_hashes[file_hash]}",
            processed_at=processed_at,
        )

    seen_hashes[file_hash] = str(relative_path)

    # ---------------------------------------------------------
    # SAVE EXTRACTED TEXT
    # ---------------------------------------------------------

    try:

        relative_output = relative_path.with_suffix(".txt")

        output_path = (
            output_root / relative_output
        )

        output_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        output_path.write_text(
            text,
            encoding="utf-8",
        )

        return DocumentRecord(
            filename=path.name,
            path=str(relative_path),
            extension=extension,
            title=title,
            country=country,
            country_code=country_code,
            source=source,
            publisher=publisher,
            category=category,
            document_type=document_type,
            period=period,
            frequency=frequency,
            source_url=None,
            size_bytes=path.stat().st_size,
            sha256=file_hash,
            extracted_text_path=str(output_path),
            page_count=page_count,
            text_length=len(text),
            status="processed",
            reason=None,
            processed_at=processed_at,
        )

    except Exception as exc:

        return DocumentRecord(
            filename=path.name,
            path=str(relative_path),
            extension=extension,
            title=title,
            country=country,
            country_code=country_code,
            source=source,
            publisher=publisher,
            category=category,
            document_type=document_type,
            period=period,
            frequency=frequency,
            source_url=None,
            size_bytes=path.stat().st_size,
            sha256=file_hash,
            extracted_text_path=None,
            page_count=page_count,
            text_length=0,
            status="error",
            reason=str(exc),
            processed_at=processed_at,
        )


# ---------------------------------------------------------------------------
# PROCESS ALL DOCUMENTS
# ---------------------------------------------------------------------------

def process_documents(
    raw_root: str = "data/raw",
    output_root: str = "data/processed/documents",
    metadata_root: str = "data/processed/document_metadata",
) -> list[DocumentRecord]:

    raw_path = Path(raw_root)
    output_path = Path(output_root)
    metadata_path = Path(metadata_root)

    if not raw_path.exists():
        raise FileNotFoundError(
            f"Raw data directory does not exist: {raw_path.resolve()}"
        )

    output_path.mkdir(
        parents=True,
        exist_ok=True,
    )

    metadata_path.mkdir(
        parents=True,
        exist_ok=True,
    )

    files = sorted(
        path
        for path in raw_path.rglob("*")
        if path.is_file()
        and path.suffix.lower()
        in SUPPORTED_DOCUMENTS
    )

    print()
    print("=" * 80)
    print("ECONIQ DOCUMENT METADATA PROCESSOR")
    print("=" * 80)
    print(f"Raw directory       : {raw_path.resolve()}")
    print(f"Documents discovered: {len(files)}")
    print()

    seen_hashes: dict[str, str] = {}
    records: list[DocumentRecord] = []

    for path in files:

        record = process_document(
            path=path,
            raw_root=raw_path,
            output_root=output_path,
            seen_hashes=seen_hashes,
        )

        records.append(record)

        print(
            f"[{record.status.upper():9}] "
            f"{record.filename}"
        )

        print(
            f"             source={record.source} | "
            f"category={record.category} | "
            f"type={record.document_type} | "
            f"period={record.period or 'unknown'} | "
            f"frequency={record.frequency or 'unknown'}"
        )

    # ---------------------------------------------------------
    # MANIFEST
    # ---------------------------------------------------------

    manifest_path = (
        metadata_path / "document_manifest.json"
    )

    manifest_path.write_text(
        json.dumps(
            [
                asdict(record)
                for record in records
            ],
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    return records


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

if __name__ == "__main__":

    records = process_documents()

    processed = sum(
        r.status == "processed"
        for r in records
    )

    duplicates = sum(
        r.status == "duplicate"
        for r in records
    )

    errors = sum(
        r.status == "error"
        for r in records
    )

    skipped = sum(
        r.status == "skipped"
        for r in records
    )

    print()
    print("=" * 80)
    print("ECONIQ DOCUMENT INGESTION COMPLETE")
    print("=" * 80)

    print(
        f"Documents discovered : {len(records)}"
    )

    print(
        f"Processed             : {processed}"
    )

    print(
        f"Duplicates            : {duplicates}"
    )

    print(
        f"Errors                : {errors}"
    )

    print(
        f"Skipped               : {skipped}"
    )

    print()
    print("SOURCE SUMMARY")
    print("-" * 40)

    sources: dict[str, int] = {}

    for record in records:
        sources[record.source] = (
            sources.get(record.source, 0) + 1
        )

    for source, count in sorted(sources.items()):
        print(f"{source:25} : {count}")

    print()
    print("CATEGORY SUMMARY")
    print("-" * 40)

    categories: dict[str, int] = {}

    for record in records:
        categories[record.category] = (
            categories.get(record.category, 0) + 1
        )

    for category, count in sorted(categories.items()):
        print(f"{category:25} : {count}")

    print()
    print("MANIFEST")
    print("-" * 40)
    print(
        Path(
            "data/processed/document_metadata/document_manifest.json"
        ).resolve()
    )

    print("=" * 80)
