from qdrant_client import QdrantClient

LOCAL_URL = "http://localhost:6333"
CLOUD_URL = input("Qdrant Cloud URL: ").strip()
CLOUD_API_KEY = input("Qdrant Cloud API key: ").strip()

COLLECTION = "econiq_documents"

local = QdrantClient(url=LOCAL_URL)
cloud = QdrantClient(url=CLOUD_URL, api_key=CLOUD_API_KEY)

info = local.get_collection(COLLECTION)

print(f"Local collection: {COLLECTION}")
print(f"Points to migrate: {info.points_count}")

if cloud.collection_exists(COLLECTION):
    print("Cloud collection already exists.")
else:
    print("Creating cloud collection...")
    cloud.create_collection(
        collection_name=COLLECTION,
        vectors_config=info.config.params.vectors,
    )

print("Migrating points...")

offset = None
total = 0

while True:
    points, next_offset = local.scroll(
        collection_name=COLLECTION,
        limit=100,
        offset=offset,
        with_payload=True,
        with_vectors=True,
    )

    if not points:
        break

    cloud.upload_points(
        collection_name=COLLECTION,
        points=points,
        wait=True,
    )

    total += len(points)
    print(f"Migrated: {total}/{info.points_count}")

    if next_offset is None:
        break

    offset = next_offset

print()
print("Migration complete.")

cloud_info = cloud.get_collection(COLLECTION)
print(f"Cloud points: {cloud_info.points_count}")
