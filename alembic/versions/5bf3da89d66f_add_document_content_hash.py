"""add document content hash

Revision ID: 5bf3da89d66f
Revises: 1323a06e3919
Create Date: 2026-09-14
"""

from pathlib import Path
import hashlib

from alembic import op
import sqlalchemy as sa


revision = "5bf3da89d66f"
down_revision = "1323a06e3919"
branch_labels = None
depends_on = None


def calculate_sha256(path: Path) -> str:
    sha256 = hashlib.sha256()

    with path.open("rb") as file:
        for block in iter(lambda: file.read(1024 * 1024), b""):
            sha256.update(block)

    return sha256.hexdigest()


def upgrade() -> None:
    op.add_column(
        "source_documents",
        sa.Column(
            "content_hash",
            sa.String(length=64),
            nullable=True,
        ),
    )

    bind = op.get_bind()

    rows = bind.execute(
        sa.text(
            """
            SELECT id, local_path
            FROM source_documents
            ORDER BY id
            """
        )
    ).fetchall()

    project_root = Path(__file__).resolve().parents[2]

    for row in rows:
        if not row.local_path:
            raise RuntimeError(
                f"Document {row.id} has no local_path."
            )

        path = project_root / row.local_path

        if not path.exists():
            raise RuntimeError(
                f"Document {row.id} file not found: {path}"
            )

        content_hash = calculate_sha256(path)

        bind.execute(
            sa.text(
                """
                UPDATE source_documents
                SET content_hash = :content_hash
                WHERE id = :document_id
                """
            ),
            {
                "content_hash": content_hash,
                "document_id": row.id,
            },
        )

    op.alter_column(
        "source_documents",
        "content_hash",
        existing_type=sa.String(length=64),
        nullable=False,
    )

    op.create_unique_constraint(
        "uq_source_documents_content_hash",
        "source_documents",
        ["content_hash"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_source_documents_content_hash",
        "source_documents",
        type_="unique",
    )

    op.drop_column(
        "source_documents",
        "content_hash",
    )
