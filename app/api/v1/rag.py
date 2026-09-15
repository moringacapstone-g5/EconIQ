from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.rag_answer import answer_question


router = APIRouter(
    prefix="/rag",
    tags=["RAG"],
)


class RAGQuestion(BaseModel):
    question: str = Field(
        ...,
        min_length=3,
        description="Question to ask ECONIQ",
    )

    limit: int = Field(
        default=7,
        ge=1,
        le=15,
        description="Number of evidence chunks to retrieve",
    )


class RAGSource(BaseModel):
    document_id: int
    chunk_id: int
    chunk_index: int
    page_number: int


class RAGResponse(BaseModel):
    question: str
    answer: str
    sources: list[RAGSource]


@router.post(
    "/ask",
    response_model=RAGResponse,
)
def ask_rag(
    request: RAGQuestion,
    db: Session = Depends(get_db),
):
    """
    Ask ECONIQ a question using
    evidence-grounded RAG.
    """

    try:
        from app.retrieval import retrieve_documents

        chunks = retrieve_documents(
            db=db,
            query=request.question,
            limit=request.limit,
            candidate_limit=max(
                request.limit * 2,
                10,
            ),
        )

        if not chunks:
            raise HTTPException(
                status_code=404,
                detail=(
                    "No relevant evidence was found "
                    "in the ECONIQ document collection."
                ),
            )

        result = answer_question(
            question=request.question,
            chunks=chunks,
        )

        return RAGResponse(
            question=request.question,
            answer=result.answer,
            sources=[
                RAGSource(
                    document_id=source.document_id,
                    chunk_id=source.chunk_id,
                    chunk_index=source.chunk_index,
                    page_number=source.page_number,
                )
                for source in result.sources
            ],
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"RAG processing failed: {str(exc)}",
        )