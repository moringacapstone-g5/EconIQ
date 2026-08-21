from app.vector_store import (
    COLLECTION_NAME,
    create_collection,
    get_collection_info,
    get_qdrant_client,
)


def main():

    print()
    print("================================")
    print("TESTING QDRANT CONNECTION")
    print("================================")
    print()

    client = get_qdrant_client()

    print("✓ Connected to Qdrant")

    create_collection(client)

    info = get_collection_info(client)

    print()
    print("================================")
    print("QDRANT COLLECTION")
    print("================================")

    print(
        f"Collection: {COLLECTION_NAME}"
    )

    print(
        f"Vectors: {info.points_count}"
    )

    print(
        f"Status: {info.status}"
    )

    print("================================")


if __name__ == "__main__":
    main()