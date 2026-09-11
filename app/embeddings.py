from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"


class EmbeddingModel:
    """
    Reusable wrapper around the sentence-transformers
    embedding model.

    The model is loaded once and reused for subsequent
    embedding requests.
    """

    def __init__(
        self,
        model_name: str = MODEL_NAME,
    ) -> None:
        self.model_name = model_name

        print(
            f"Loading embedding model: {model_name}"
        )

        self.model = SentenceTransformer(
            model_name
        )

        print(
            f"Embedding model loaded: {model_name}"
        )

    def embed_text(
        self,
        text: str,
    ) -> list[float]:
        """
        Generate an embedding for one piece of text.
        """

        if not text or not text.strip():
            raise ValueError(
                "Cannot embed empty text."
            )

        vector = self.model.encode(
            text,
            normalize_embeddings=True,
        )

        return vector.tolist()

    def embed_texts(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        """
        Generate embeddings for multiple pieces of text.
        """

        if not texts:
            return []

        if any(
            not text or not text.strip()
            for text in texts
        ):
            raise ValueError(
                "Cannot embed empty text."
            )

        vectors = self.model.encode(
            texts,
            normalize_embeddings=True,
        )

        return vectors.tolist()


# SINGLE SHARED EMBEDDING MODEL

_embedding_model: EmbeddingModel | None = None


def get_embedding_model() -> EmbeddingModel:
    """
    Return the shared embedding model.

    The model is initialized only once for the lifetime
    of the application process.
    """

    global _embedding_model

    if _embedding_model is None:
        _embedding_model = EmbeddingModel()

    return _embedding_model