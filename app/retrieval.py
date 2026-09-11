from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.embeddings import get_embedding_model
from app.models.document_chunk import DocumentChunk
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


def search_qdrant(
    query: str,
    limit: int = 15,
):
    if not query or not query.strip():
        raise ValueError("Query cannot be empty.")

    client = get_qdrant_client()
    model = get_embedding_model()

    query_vector = model.embed_text(query)

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
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
            "prices",
            "price movement",
        ]
    ):
        return "commodity"

    if (
        "core inflation" in query_lower
        or "non-core inflation" in query_lower
        or "core" in query_lower
        and "non-core" in query_lower
    ):
        return "core_non_core"

    return "general"


def build_retrieval_query(
    query: str,
) -> str:

    question_type = classify_question(query)

    expansions = {
        "drivers": (
            "key drivers primary drivers "
            "primarily driven causes factors "
            "inflation drivers divisions "
            "price increases contribution"
        ),
        "contribution": (
            "contribution contributed "
            "percentage points points "
            "overall inflation contribution "
            "division contribution"
        ),
        "monthly": (
            "monthly change month-on-month "
            "June July percentage change "
            "monthly price movement CPI"
        ),
        "yearly": (
            "annual inflation yearly inflation "
            "year-on-year twelve months "
            "July 2025 July 2026 CPI"
        ),
        "commodity": (
            "commodity prices retail prices "
            "selected commodities price movements"
        ),
        "core_non_core": (
            "core inflation non-core inflation "
            "core contribution non-core contribution"
        ),
        "general": (
            "economic indicators inflation "
            "consumer prices CPI"
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


def retrieve_documents(
    db: Session,
    query: str,
    limit: int = 5,
    candidate_limit: int = 20,
) -> list[RetrievedChunk]:

    if not query or not query.strip():
        raise ValueError("Query cannot be empty.")

    retrieval_query = build_retrieval_query(query)

    print()
    print(
        f"Retrieval query: {retrieval_query}"
    )

    results = search_qdrant(
        query=retrieval_query,
        limit=candidate_limit,
    )

    chunk_ids = []

    for result in results:

        payload = result.payload or {}

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

    candidates: list[RetrievedChunk] = []

    seen_chunk_ids: set[int] = set()

    for result in results:

        payload = result.payload or {}

        chunk_id = payload.get("chunk_id")

        if chunk_id is None:
            continue

        chunk_id = int(chunk_id)

        if chunk_id in seen_chunk_ids:
            continue

        seen_chunk_ids.add(chunk_id)

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

        candidates.append(
            RetrievedChunk(
                chunk_id=chunk.id,
                document_id=chunk.document_id,
                chunk_index=chunk.chunk_index,
                page_number=chunk.page_number,
                text=chunk.text,
                score=final_score,
            )
        )

    candidates.sort(
        key=lambda chunk: chunk.score,
        reverse=True,
    )

    return candidates[:limit]


def main():

    query = input(
        "Ask ECONIQ retrieval: "
    ).strip()

    print()
    print("================================")
    print("ECONIQ DOCUMENT RETRIEVAL")
    print("================================")
    print()

    print(
        f"Query: {query}"
    )

    db = SessionLocal()

    try:

        results = retrieve_documents(
            db=db,
            query=query,
            limit=7,
            candidate_limit=20,
        )

        print()
        print(
            f"Retrieved {len(results)} "
            "reranked document chunks"
        )

        for index, result in enumerate(
            results,
            start=1,
        ):

            print()
            print("--------------------------------")
            print(
                f"Result {index}"
            )
            print("--------------------------------")

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
        print("================================")
        print("DOCUMENT RETRIEVAL COMPLETE")
        print("================================")

    finally:

        db.close()


if __name__ == "__main__":
    main()