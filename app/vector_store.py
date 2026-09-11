from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams


QDRANT_HOST = "localhost"
QDRANT_PORT = 6333

COLLECTION_NAME = "econiq_documents"

# We are starting with a 384-dimensional embedding model.
VECTOR_SIZE = 384


def get_qdrant_client() -> QdrantClient:
    """
    Create a Qdrant client connected to the local
    ECONIQ Qdrant container.
    """

    return QdrantClient(
        host=QDRANT_HOST,
        port=QDRANT_PORT,
    )


def create_collection(
    client: QdrantClient,
) -> None:
    """
    Create the ECONIQ document vector collection
    if it does not already exist.
    """

    collections = client.get_collections()

    existing_names = {
        collection.name
        for collection in collections.collections
    }

    if COLLECTION_NAME in existing_names:
        print(
            f" Qdrant collection already exists: "
            f"{COLLECTION_NAME}"
        )
        return

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=VECTOR_SIZE,
            distance=Distance.COSINE,
        ),
    )

    print(
        f"Qdrant collection created: "
        f"{COLLECTION_NAME}"
    )


def collection_exists(
    client: QdrantClient,
) -> bool:
    """
    Check whether the ECONIQ document collection exists.
    """

    collections = client.get_collections()

    return any(
        collection.name == COLLECTION_NAME
        for collection in collections.collections
    )


def get_collection_info(
    client: QdrantClient,
):
    """
    Return information about the document collection.
    """

    if not collection_exists(client):
        return None

    return client.get_collection(
        COLLECTION_NAME
    )