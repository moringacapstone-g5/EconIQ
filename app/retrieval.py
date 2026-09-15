from __future__ import annotations

import re
from dataclasses import dataclass
from difflib import SequenceMatcher

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from qdrant_client.models import FieldCondition, Filter, MatchValue

from app.db.session import SessionLocal
from app.embeddings import get_embedding_model
from app.models.document_chunk import DocumentChunk
from app.models.source_document import SourceDocument
from app.vector_store import (
    COLLECTION_NAME,
    get_qdrant_client,
)


@dataclass
class RetrievedChunk:
    chunk_id: int
    document_id: int
    chunk_index: int
    page_number: int
    text: str
    score: float


MIN_SIMILARITY_SCORE = 0.30
EXACT_DOCUMENT_LIMIT = 3
EXACT_CHUNK_LIMIT = 3


COUNTRY_ALIASES = {
    "kenya": ("KE", "Kenya"),
    "uganda": ("UG", "Uganda"),
    "tanzania": ("TZ", "Tanzania"),
    "rwanda": ("RW", "Rwanda"),
    "burundi": ("BI", "Burundi"),
    "ethiopia": ("ET", "Ethiopia"),
    "somalia": ("SO", "Somalia"),
    "south sudan": ("SS", "South Sudan"),
    "sudan": ("SD", "Sudan"),
    "nigeria": ("NG", "Nigeria"),
    "ghana": ("GH", "Ghana"),
    "south africa": ("ZA", "South Africa"),
}


MONTHS = {
    "january": 1,
    "february": 2,
    "march": 3,
    "april": 4,
    "may": 5,
    "june": 6,
    "july": 7,
    "august": 8,
    "september": 9,
    "october": 10,
    "november": 11,
    "december": 12,
}


def detect_country(query: str) -> tuple[str | None, str | None]:
    query_lower = query.lower()

    matches = []

    for country, value in COUNTRY_ALIASES.items():
        if re.search(rf"\b{re.escape(country)}\b", query_lower):
            matches.append((len(country), value))

    if not matches:
        return None, None

    _, (country_code, country_name) = max(
        matches,
        key=lambda item: item[0],
    )

    return country_code, country_name


def extract_time_reference(
    query: str,
) -> tuple[str | None, int | None]:
    query_lower = query.lower()

    month = None
    month_number = None

    for month_name, number in MONTHS.items():
        if re.search(rf"\b{month_name}\b", query_lower):
            month = month_name
            month_number = number
            break

    year_match = re.search(r"\b(20\d{2})\b", query_lower)

    if year_match:
        year = int(year_match.group(1))
    else:
        year = None

    if month is None or year is None:
        return None, year

    return month, year


def is_inflation_query(query: str) -> bool:
    query_lower = query.lower()

    terms = [
        "inflation",
        "cpi",
        "consumer price",
        "consumer prices",
        "price index",
    ]

    return any(term in query_lower for term in terms)


def search_qdrant(
    query: str,
    limit: int = 15,
    country_code: str | None = None,
):
    if not query or not query.strip():
        raise ValueError("Query cannot be empty.")

    client = get_qdrant_client()
    model = get_embedding_model()

    query_vector = model.embed_text(query)

    query_filter = None

    if country_code:
        query_filter = Filter(
            must=[
                FieldCondition(
                    key="country_code",
                    match=MatchValue(value=country_code),
                )
            ]
        )

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        query_filter=query_filter,
        limit=limit,
        with_payload=True,
    )

    return results.points


def get_chunks_from_postgres(
    db: Session,
    chunk_ids: list[int],
) -> dict[int, DocumentChunk]:
    if not chunk_ids:
        return {}

    result = db.execute(
        select(DocumentChunk).where(
            DocumentChunk.id.in_(chunk_ids)
        )
    )

    chunks = result.scalars().all()

    return {
        chunk.id: chunk
        for chunk in chunks
    }


def is_useful_chunk(
    chunk: DocumentChunk,
) -> bool:
    text = (chunk.text or "").strip()

    if len(text) < 250:
        return False

    text_lower = text.lower()

    excluded_patterns = [
        "table of contents",
        "contact person:",
        "director general",
        "released on:",
        "list of tables",
        "list of figures",
    ]

    return not any(
        pattern in text_lower
        for pattern in excluded_patterns
    )


def classify_question(
    query: str,
) -> str:
    query_lower = query.lower()

    if any(
        term in query_lower
        for term in [
            "driver",
            "drivers",
            "drove",
            "cause",
            "causes",
            "why",
        ]
    ):
        return "drivers"

    if any(
        term in query_lower
        for term in [
            "contribution",
            "contributed",
            "contributor",
            "contributors",
            "accounted for",
        ]
    ):
        return "contribution"

    if any(
        term in query_lower
        for term in [
            "monthly",
            "month-on-month",
            "month on month",
            "monthly change",
            "june to july",
            "between june and july",
        ]
    ):
        return "monthly"

    if any(
        term in query_lower
        for term in [
            "annual",
            "yearly",
            "year-on-year",
            "year on year",
            "12 months",
            "twelve months",
        ]
    ):
        return "yearly"

    if any(
        term in query_lower
        for term in [
            "commodity",
            "commodities",
            "commodity price",
            "commodity prices",
            "price movement",
        ]
    ):
        return "commodity"

    if (
        "core inflation" in query_lower
        or "non-core inflation" in query_lower
        or (
            "core" in query_lower
            and "non-core" in query_lower
        )
    ):
        return "core_non_core"

    return "general"


def build_retrieval_query(
    query: str,
) -> str:
    question_type = classify_question(query)

    expansions = {
        "drivers": (
            "key drivers primary drivers primarily driven "
            "causes factors inflation drivers divisions "
            "price increases contribution"
        ),
        "contribution": (
            "contribution contributed percentage points "
            "points overall inflation contribution "
            "division contribution"
        ),
        "monthly": (
            "monthly change month-on-month June July "
            "percentage change monthly price movement CPI"
        ),
        "yearly": (
            "annual inflation yearly inflation year-on-year "
            "twelve months July 2025 July 2026 CPI"
        ),
        "commodity": (
            "commodity prices retail prices selected "
            "commodities price movements"
        ),
        "core_non_core": (
            "core inflation non-core inflation core "
            "contribution non-core contribution"
        ),
        "general": (
            "economic indicators inflation consumer "
            "prices CPI"
        ),
    }

    return (
        query.strip()
        + " "
        + expansions[question_type]
    )


def calculate_evidence_boost(
    chunk: DocumentChunk,
    query: str,
) -> float:
    text = (chunk.text or "").lower()
    question_type = classify_question(query)

    boost = 0.0

    general_terms = [
        "inflation",
        "consumer price index",
        "contribution",
        "contributed",
        "annual",
        "monthly",
        "year-on-year",
        "month-on-month",
    ]

    for term in general_terms:
        if term in text:
            boost += 0.01

    if question_type == "drivers":
        if "primarily driven" in text:
            boost += 0.20

        if "key drivers" in text:
            boost += 0.15

        if "main drivers" in text:
            boost += 0.10

        if "contribution" in text:
            boost += 0.05

        if "contributed" in text:
            boost += 0.05

    elif question_type == "contribution":
        if "contribution" in text:
            boost += 0.15

        if "contributed" in text:
            boost += 0.10

        if "percentage points" in text:
            boost += 0.10

        if "points" in text:
            boost += 0.05

    elif question_type == "monthly":
        if "monthly inflation" in text:
            boost += 0.15

        if "month-on-month" in text:
            boost += 0.10

        if "between june and july" in text:
            boost += 0.10

        if "june 2026 to july 2026" in text:
            boost += 0.10

    elif question_type == "yearly":
        if "year-on-year" in text:
            boost += 0.15

        if "annual inflation" in text:
            boost += 0.12

        if "over the twelve months" in text:
            boost += 0.10

    elif question_type == "commodity":
        if "commodity" in text:
            boost += 0.12

        if "retail prices" in text:
            boost += 0.10

        if "price movement" in text:
            boost += 0.08

    elif question_type == "core_non_core":
        if "core inflation" in text:
            boost += 0.12

        if "non-core inflation" in text:
            boost += 0.12

        if "contribution of core" in text:
            boost += 0.15

        if "contribution of core and non-core" in text:
            boost += 0.20

    return boost


def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^a-z0-9%.\s]", "", text)
    return text.strip()


def is_near_duplicate(
    text: str,
    existing_texts: list[str],
) -> bool:
    normalized = normalize_text(text)

    if not normalized:
        return True

    for existing in existing_texts:
        existing_normalized = normalize_text(existing)

        if normalized == existing_normalized:
            return True

        if (
            normalized[:250]
            == existing_normalized[:250]
        ):
            return True

        similarity = SequenceMatcher(
            None,
            normalized[:1200],
            existing_normalized[:1200],
        ).ratio()

        if similarity >= 0.82:
            return True

    return False


def exact_chunk_score(
    chunk: DocumentChunk,
    query: str,
    month: str,
    year: int,
) -> float:
    text = normalize_text(chunk.text)

    score = 0.0

    month_short = month[:3]
    year_text = str(year)

    if month in text:
        score += 0.30

    if month_short in text:
        score += 0.15

    if year_text in text:
        score += 0.20

    exact_terms = [
        ("overall inflation", 0.30),
        ("inflation rate", 0.30),
        ("annual consumer price inflation", 0.25),
        ("overall cpi", 0.20),
        ("year-on-year", 0.15),
        ("year on year", 0.15),
        ("monthly inflation", 0.10),
        ("consumer price index", 0.10),
        ("cpi", 0.05),
    ]

    for term, boost in exact_terms:
        if term in text:
            score += boost

    query_type = classify_question(query)

    if query_type == "monthly":
        if "monthly inflation rate" in text:
            score += 0.20

        if "month-on-month" in text:
            score += 0.15

    elif query_type == "yearly":
        if "annual consumer price inflation" in text:
            score += 0.20

        if "year-on-year inflation" in text:
            score += 0.15

    elif query_type == "drivers":
        if "primarily driven" in text:
            score += 0.20

        if "key drivers" in text:
            score += 0.15

    return score


def find_exact_inflation_documents(
    db: Session,
    country_name: str,
    month: str,
    year: int,
) -> list[SourceDocument]:
    month_title = month.capitalize()
    year_text = str(year)

    country_pattern = f"%{country_name}%"
    year_pattern = f"%{year_text}%"
    month_pattern = f"%{month_title}%"

    result = db.execute(
        select(SourceDocument)
        .where(
            SourceDocument.title.ilike(country_pattern),
            SourceDocument.title.ilike(year_pattern),
            SourceDocument.title.ilike(month_pattern),
            or_(
                SourceDocument.title.ilike("%inflation%"),
                SourceDocument.title.ilike("%consumer price%"),
                SourceDocument.title.ilike("%CPI%"),
            ),
        )
        .order_by(
            SourceDocument.publication_date.desc().nullslast(),
            SourceDocument.id.desc(),
        )
        .limit(EXACT_DOCUMENT_LIMIT)
    )

    return list(result.scalars().all())


def get_exact_inflation_chunks(
    db: Session,
    documents: list[SourceDocument],
    query: str,
    month: str,
    year: int,
    country_code: str,
    country_name: str,
) -> list[RetrievedChunk]:
    if not documents:
        return []

    document_ids = [
        document.id
        for document in documents
    ]

    result = db.execute(
        select(DocumentChunk)
        .where(
            DocumentChunk.document_id.in_(document_ids)
        )
        .order_by(
            DocumentChunk.document_id.asc(),
            DocumentChunk.chunk_index.asc(),
        )
    )

    chunks = result.scalars().all()

    ranked: list[tuple[float, DocumentChunk]] = []

    for chunk in chunks:
        if not is_useful_chunk(chunk):
            continue

        score = exact_chunk_score(
            chunk=chunk,
            query=query,
            month=month,
            year=year,
        )

        ranked.append((score, chunk))

    ranked.sort(
        key=lambda item: item[0],
        reverse=True,
    )

    selected: list[RetrievedChunk] = []
    selected_texts: list[str] = []

    for exact_score, chunk in ranked:
        if len(selected) >= EXACT_CHUNK_LIMIT:
            break

        if is_near_duplicate(
            chunk.text,
            selected_texts,
        ):
            continue

        final_score = (
            0.55
            + exact_score
        )

        selected.append(
            RetrievedChunk(
                chunk_id=chunk.id,
                document_id=chunk.document_id,
                chunk_index=chunk.chunk_index,
                page_number=chunk.page_number,
                text=chunk.text,
                score=final_score,
            )
        )

        selected_texts.append(chunk.text)

    return selected


def retrieve_documents(
    db: Session,
    query: str,
    limit: int = 5,
    candidate_limit: int = 20,
) -> list[RetrievedChunk]:
    if not query or not query.strip():
        raise ValueError("Query cannot be empty.")

    country_code, country_name = detect_country(query)
    month, year = extract_time_reference(query)

    retrieval_query = build_retrieval_query(query)

    print()
    print("ECONIQ DOCUMENT RETRIEVAL")
    print(f"Query: {query}")

    if country_name:
        print(
            f"Country detected: "
            f"{country_name} ({country_code})"
        )
    else:
        print("Country detected: None")

    if month and year:
        print(
            f"Time reference: "
            f"{month} {year}"
        )
    else:
        print("Time reference: None")

    print(
        f"Retrieval query: "
        f"{retrieval_query}"
    )

    results = search_qdrant(
        query=retrieval_query,
        limit=candidate_limit,
        country_code=country_code,
    )

    chunk_ids: list[int] = []

    for result in results:
        payload = result.payload or {}

        if (
            country_code
            and payload.get("country_code")
            and payload.get("country_code") != country_code
        ):
            continue

        chunk_id = payload.get("chunk_id")

        if chunk_id is None:
            continue

        chunk_id = int(chunk_id)

        if chunk_id not in chunk_ids:
            chunk_ids.append(chunk_id)

    chunks = get_chunks_from_postgres(
        db=db,
        chunk_ids=chunk_ids,
    )

    candidates: dict[int, RetrievedChunk] = {}

    for result in results:
        payload = result.payload or {}

        if (
            country_code
            and payload.get("country_code")
            and payload.get("country_code") != country_code
        ):
            continue

        chunk_id = payload.get("chunk_id")

        if chunk_id is None:
            continue

        chunk_id = int(chunk_id)

        chunk = chunks.get(chunk_id)

        if chunk is None:
            continue

        if not is_useful_chunk(chunk):
            continue

        base_score = float(result.score)

        if base_score < MIN_SIMILARITY_SCORE:
            continue

        evidence_boost = calculate_evidence_boost(
            chunk=chunk,
            query=query,
        )

        final_score = (
            base_score
            + evidence_boost
        )

        if (
            is_inflation_query(query)
            and month
            and year
        ):
            text_lower = chunk.text.lower()

            if "producer price index" in text_lower:
                final_score -= 0.50

            if "producer inflation" in text_lower:
                final_score -= 0.50

            if (
                "consumer price index" in text_lower
                or "overall cpi" in text_lower
            ):
                final_score += 0.10

        candidates[chunk.id] = RetrievedChunk(
            chunk_id=chunk.id,
            document_id=chunk.document_id,
            chunk_index=chunk.chunk_index,
            page_number=chunk.page_number,
            text=chunk.text,
            score=final_score,
        )

    exact_chunks: list[RetrievedChunk] = []

    if (
        country_code
        and country_name
        and month
        and year
        and is_inflation_query(query)
    ):
        exact_documents = find_exact_inflation_documents(
            db=db,
            country_name=country_name,
            month=month,
            year=year,
        )

        print(
            f"Exact inflation documents found: "
            f"{len(exact_documents)}"
        )

        for document in exact_documents:
            print(
                f"  - Document ID {document.id}: "
                f"{document.title}"
            )

        exact_chunks = get_exact_inflation_chunks(
            db=db,
            documents=exact_documents,
            query=query,
            month=month,
            year=year,
            country_code=country_code,
            country_name=country_name,
        )

        for exact_chunk in exact_chunks:
            existing = candidates.get(
                exact_chunk.chunk_id
            )

            if existing is None:
                candidates[exact_chunk.chunk_id] = (
                    exact_chunk
                )
            elif exact_chunk.score > existing.score:
                candidates[exact_chunk.chunk_id] = (
                    exact_chunk
                )

    ranked_candidates = list(candidates.values())

    ranked_candidates.sort(
        key=lambda chunk: chunk.score,
        reverse=True,
    )

    selected: list[RetrievedChunk] = []
    selected_texts: list[str] = []

    for candidate in ranked_candidates:
        if is_near_duplicate(
            candidate.text,
            selected_texts,
        ):
            continue

        selected.append(candidate)
        selected_texts.append(candidate.text)

        if len(selected) >= limit:
            break

    print()
    print(
        f"Retrieved {len(selected)} "
        "reranked document chunks"
    )

    return selected


def main():
    query = input(
        "Ask ECONIQ retrieval: "
    ).strip()

    db = SessionLocal()

    try:
        results = retrieve_documents(
            db=db,
            query=query,
            limit=7,
            candidate_limit=20,
        )

        for index, result in enumerate(
            results,
            start=1,
        ):
            print()
            print(f"Result {index}")
            print(
                f"Reranked Score: "
                f"{result.score:.4f}"
            )
            print(
                f"Document ID: "
                f"{result.document_id}"
            )
            print(
                f"Chunk ID: "
                f"{result.chunk_id}"
            )
            print(
                f"Chunk Index: "
                f"{result.chunk_index}"
            )
            print(
                f"Page: "
                f"{result.page_number}"
            )
            print()
            print("Text:")
            print(result.text)

        print()
        print("DOCUMENT RETRIEVAL COMPLETE")

    finally:
        db.close()


if __name__ == "__main__":
    main()
