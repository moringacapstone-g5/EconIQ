from __future__ import annotations

from dataclasses import dataclass

from openai import OpenAI

from app.core.config import settings
from app.retrieval import RetrievedChunk


@dataclass
class RAGAnswer:
    """
    Final answer generated from retrieved evidence.
    """

    answer: str
    sources: list[RetrievedChunk]


SYSTEM_PROMPT = """
You are ECONIQ, an economic intelligence assistant focused on
Kenya and Africa.

Your job is to answer questions using ONLY the evidence provided
in the retrieved document context.

STRICT EVIDENCE RULES

1. Never use outside knowledge.

2. Never invent facts, numbers, dates, percentages,
   explanations, rankings, or causal relationships.

3. Never change a number from the source.

4. Every important factual claim must be supported by
   retrieved evidence.

5. If the evidence does not establish something, explicitly
   say that it is not established by the retrieved evidence.

6. Never treat a semantic similarity score as evidence.

7. Prefer explicit analytical statements, contribution tables,
   key-driver sections, and statistical tables over generic
   narrative text.

ECONOMIC MEASUREMENT TYPES

You MUST distinguish between the following concepts.

A. MONTHLY PRICE CHANGE

A change between two consecutive months.

Example:

June 2026 → July 2026

If electricity increased by 3.5%, that is a monthly
price change for that item.

Do NOT call this a contribution to inflation.



B. YEAR-ON-YEAR INFLATION

The percentage change in prices over twelve months.

Example:

Transport division inflation = 15.6%

This means Transport experienced 15.6% year-on-year inflation.

It does NOT mean Transport contributed 15.6 percentage points
to overall inflation.

------------------------------------------------------------

C. DIVISION-LEVEL INFLATION

Inflation measured for an entire CPI division.

Examples:

Food and Non-Alcoholic Beverages = 9.0%

Transport = 15.6%

Health = 2.8%

These are division inflation rates.

They are NOT automatically contribution values.

------------------------------------------------------------

D. COMMODITY PRICE CHANGE

A price movement for an individual commodity.

Examples:

Tomatoes = -3.7%

Mangoes = +3.2%

Electricity-50 kWh = +3.5%

These are commodity-level price changes.

They are NOT automatically contributions to overall inflation.

------------------------------------------------------------

E. CONTRIBUTION TO OVERALL INFLATION

A contribution figure explicitly reported by the source.

Example:

Food and Non-Alcoholic Beverages contributed 2.6 points
to overall inflation.

This is fundamentally different from saying:

Food and Non-Alcoholic Beverages had 9.0% inflation.

If the source says:

Division inflation = 9.0%
Contribution = 2.6 points

report them as separate measurements.

------------------------------------------------------------

F. CORE INFLATION

Core inflation is a separate inflation measure.

If the source states:

Core inflation = 3.2%

do not automatically interpret 3.2% as a contribution.

If the source separately states:

Core inflation contributed 3.8 points

then 3.8 points is the contribution.

------------------------------------------------------------

G. NON-CORE INFLATION

Non-core inflation is another separate inflation measure.

If the source states:

Non-core inflation = 15.0%

that is the non-core inflation rate.

If the source states:

Non-core inflation contributed 2.7 points

then 2.7 points is the contribution.


DRIVER QUESTIONS

When the user asks:

"What were the main drivers?"

"What drove inflation?"

"What contributed to inflation?"

"What were the biggest contributors?"

you MUST prioritize evidence in this order:

1. Explicit contribution figures.

2. Explicit statements identifying key drivers.

3. Contribution tables.

4. Division-level inflation rates.

5. Individual commodity price movements.

6. General CPI information.

IMPORTANT:

A high division inflation rate does NOT automatically prove
that the division was the largest contributor.

For example:

Transport inflation = 15.6%

does NOT allow you to say:

"Transport contributed 15.6 percentage points."

That statement would be incorrect unless the source explicitly
reports such a contribution.

============================================================
ANSWER CONSTRUCTION
============================================================

For driver questions:

1. Identify explicit contribution evidence first.

2. Identify explicit key-driver statements.

3. Separate contribution figures from inflation rates.

4. Use division-level inflation only as supporting context.

5. Use commodity movements only when they help explain the
   retrieved evidence.

6. Never manufacture a ranking of contributors.

7. If the source provides only some contribution values,
   report those values and explicitly state that the evidence
   does not establish the complete ranking.

============================================================
SOURCE CITATIONS
============================================================

Every important factual claim must include a page citation.

Use:

(Page 9)

or:

(Pages 9, 13)

Do not cite pages that do not support the claim.

============================================================
NUMERICAL PRECISION
============================================================

Preserve the exact numerical meaning from the source.

Do not convert:

15.6%

into:

15.6 percentage points.

Do not convert:

2.6 points

into:

2.6%.

When the source says "points", preserve "points".

When the source says "%", preserve "%".

============================================================
UNCERTAINTY
============================================================

If the evidence is incomplete, say so.

Use language such as:

"The retrieved evidence establishes..."

"The retrieved evidence does not establish..."

"The report explicitly states..."

"The available evidence identifies..."

Do not fill missing information using outside knowledge.

============================================================
FINAL QUALITY RULE
============================================================

Before producing the final answer, internally verify:

1. What does every important number represent?
2. Is it an inflation rate?
3. Is it a contribution?
4. Is it a commodity price change?
5. Is it monthly or yearly?
6. Does the cited page actually support the claim?
7. Am I claiming a ranking that the source does not establish?

Only then produce the answer.

Keep the final response concise, analytical, and easy to understand.
"""


# ============================================================
# CONTEXT BUILDING
# ============================================================

def build_context(
    chunks: list[RetrievedChunk],
) -> str:
    """
    Convert retrieved chunks into structured evidence
    for the language model.
    """

    if not chunks:
        return "NO RELEVANT EVIDENCE WAS RETRIEVED."

    context_parts = []

    for index, chunk in enumerate(
        chunks,
        start=1,
    ):
        context_parts.append(
            f"""
==================================================
EVIDENCE {index}
==================================================

Document ID: {chunk.document_id}
Chunk ID: {chunk.chunk_id}
Chunk Index: {chunk.chunk_index}
Page: {chunk.page_number}
Evidence Score: {chunk.score:.4f}

SOURCE TEXT:
{chunk.text}
"""
        )

    return "\n".join(context_parts)


# ============================================================
# QUESTION CLASSIFICATION
# ============================================================

def classify_question(
    question: str,
) -> str:
    """
    Identify the primary evidence type requested
    by the question.
    """

    question_lower = question.lower()

    if (
        "driver" in question_lower
        or "drivers" in question_lower
        or "drove" in question_lower
        or "main cause" in question_lower
        or "main causes" in question_lower
    ):
        return "drivers"

    if (
        "contribution" in question_lower
        or "contributed" in question_lower
        or "contributor" in question_lower
        or "contributors" in question_lower
    ):
        return "contribution"

    if (
        "monthly" in question_lower
        or "month-on-month" in question_lower
        or "month on month" in question_lower
        or "june to july" in question_lower
        or "between june and july" in question_lower
    ):
        return "monthly"

    if (
        "yearly" in question_lower
        or "annual" in question_lower
        or "year-on-year" in question_lower
        or "year on year" in question_lower
        or "12 months" in question_lower
        or "twelve months" in question_lower
    ):
        return "yearly"

    if (
        "commodity" in question_lower
        or "commodities" in question_lower
        or "prices" in question_lower
    ):
        return "commodity"

    if (
        "core inflation" in question_lower
        or "non-core inflation" in question_lower
    ):
        return "core_non_core"

    return "general"


# ============================================================
# GENERATION
# ============================================================

def generate_answer(
    question: str,
    chunks: list[RetrievedChunk],
) -> str:
    """
    Generate an evidence-grounded answer.
    """

    if not question or not question.strip():
        raise ValueError(
            "Question cannot be empty."
        )

    if not chunks:
        return (
            "I could not find sufficient evidence "
            "in the ECONIQ document collection to "
            "answer this question."
        )

    if not settings.openai_api_key:
        raise ValueError(
            "OPENAI_API_KEY is not configured."
        )

    client = OpenAI(
        api_key=settings.openai_api_key
    )

    context = build_context(
        chunks
    )

    question_type = classify_question(
        question
    )

    user_prompt = f"""
QUESTION:

{question}


QUESTION TYPE:

{question_type}


RETRIEVED EVIDENCE:

{context}


============================================================
TASK
============================================================

Answer the question using ONLY the retrieved evidence.

For a driver or contribution question, follow this procedure:

STEP 1
Find explicit contribution figures.

STEP 2
Find explicit statements identifying key drivers.

STEP 3
Identify division-level inflation rates.

STEP 4
Identify useful commodity-level price movements.

STEP 5
Separate all of these measurements clearly.

Do NOT treat a division's inflation rate as its contribution.

Do NOT treat a commodity price change as its contribution.

Do NOT invent a ranking of contributors.

If the evidence establishes:

Food and Non-Alcoholic Beverages:
9.0% yearly inflation

and:

Food and Non-Alcoholic Beverages:
2.6 points contribution

report both, but explain that they represent different measures.

If the evidence establishes:

Transport:
15.6% yearly inflation

but does not provide a Transport contribution figure,
do NOT assign Transport a contribution number.

If the evidence establishes:

Core inflation:
3.2%

and:

Core contribution:
3.8 points

report these separately.

If the evidence establishes:

Non-core inflation:
15.0%

and:

Non-core contribution:
2.7 points

report these separately.

============================================================
IMPORTANT
============================================================

The user is asking about economic evidence.

Be precise about:

- percentage (%)
- percentage points
- points
- monthly change
- yearly inflation
- division inflation
- commodity price movement
- contribution to overall inflation

Never use these interchangeably.

If the retrieved evidence does not establish the complete
set of contributors, explicitly state that.

Use page citations for every important claim.

Example:

(Page 9)

or:

(Pages 9, 13)

Do not cite unsupported pages.

Keep the final answer concise but analytical.
"""

    response = client.responses.create(
        model=settings.openai_model,
        instructions=SYSTEM_PROMPT,
        input=user_prompt,
    )

    return response.output_text.strip()


# ============================================================
# COMPLETE RAG ANSWER
# ============================================================

def answer_question(
    question: str,
    chunks: list[RetrievedChunk],
) -> RAGAnswer:
    """
    Generate an answer and preserve the retrieved
    sources for downstream API responses.
    """

    answer = generate_answer(
        question=question,
        chunks=chunks,
    )

    return RAGAnswer(
        answer=answer,
        sources=chunks,
    )


# ============================================================
# CLI TEST
# ============================================================

def main():

    from app.db.session import SessionLocal
    from app.retrieval import retrieve_documents

   
    question = input("Ask ECONIQ: ").strip()
    
    print()
    print("================================")
    print("ECONIQ RAG ANSWER TEST")
    print("================================")
    print()

    print(
        f"Question: {question}"
    )

    db = SessionLocal()

    try:

        print()
        print(
            "Retrieving relevant evidence..."
        )

        chunks = retrieve_documents(
            db=db,
            query=question,
            limit=7,
            candidate_limit=15,
        )

        print(
            f"✓ Retrieved {len(chunks)} "
            "evidence chunks"
        )

        print()
        print(
            "Generating evidence-grounded answer..."
        )

        result = answer_question(
            question=question,
            chunks=chunks,
        )

        print()
        print("================================")
        print("ECONIQ ANSWER")
        print("================================")
        print()

        print(
            result.answer
        )

        print()
        print("================================")
        print("RETRIEVAL SOURCES")
        print("================================")

        for index, source in enumerate(
            result.sources,
            start=1,
        ):

            print()
            print(
                f"Source {index}: "
                f"Document {source.document_id}, "
                f"Page {source.page_number}, "
                f"Score {source.score:.4f}"
            )

    finally:

        db.close()


if __name__ == "__main__":
    main()
