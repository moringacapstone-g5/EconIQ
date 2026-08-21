from app.embeddings import EmbeddingModel


def main():

    print()
    print("================================")
    print("TESTING EMBEDDING MODEL")
    print("================================")
    print()

    model = EmbeddingModel()

    print(
        f"✓ Model loaded: "
        f"{model.model_name}"
    )

    text = (
        "Annual consumer price inflation "
        "was 6.5 percent in July 2026."
    )

    vector = model.embed_text(text)

    print(
        f"✓ Embedding generated"
    )

    print(
        f"Vector dimensions: "
        f"{len(vector)}"
    )

    print(
        f"First 5 values: "
        f"{vector[:5]}"
    )

    print()
    print("================================")
    print("EMBEDDING TEST COMPLETE")
    print("================================")


if __name__ == "__main__":
    main()