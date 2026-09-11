from __future__ import annotations

import re
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine, text

from app.core.config import settings


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"


def clean_identifier(value: str, max_length: int = 55) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "_", value)
    value = re.sub(r"_+", "_", value)
    value = value.strip("_")

    if not value:
        value = "dataset"

    return value[:max_length].rstrip("_")


def make_table_name(csv_path: Path) -> str:
    relative = csv_path.relative_to(PROCESSED_DIR)

    category = relative.parent.name
    filename = csv_path.stem

    category_clean = clean_identifier(category, 20)
    filename_clean = clean_identifier(filename, 40)

    return f"dataset_{category_clean}_{filename_clean}"[:63].rstrip("_")


def find_csv_files() -> list[Path]:
    return sorted(PROCESSED_DIR.rglob("*.csv"))


def read_csv_safely(path: Path) -> pd.DataFrame:
    encodings = ["utf-8-sig", "utf-8", "cp1252", "latin1"]

    for encoding in encodings:
        try:
            return pd.read_csv(
                path,
                encoding=encoding,
                low_memory=False,
            )
        except UnicodeDecodeError:
            continue

    raise RuntimeError(f"Could not decode CSV: {path}")


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    columns = []

    for column in df.columns:
        cleaned = clean_identifier(str(column), 50)
        columns.append(cleaned or "column")

    # Make duplicate column names unique.
    seen = {}
    unique_columns = []

    for column in columns:
        if column not in seen:
            seen[column] = 0
            unique_columns.append(column)
        else:
            seen[column] += 1
            unique_columns.append(
                f"{column}_{seen[column]}"
            )

    df.columns = unique_columns

    return df


def create_catalog_table(engine) -> None:
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS econiq_dataset_catalog (
                    id SERIAL PRIMARY KEY,
                    table_name VARCHAR(63) UNIQUE NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    source_file TEXT NOT NULL,
                    row_count BIGINT NOT NULL,
                    column_count INTEGER NOT NULL,
                    loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )


def update_catalog(
    engine,
    table_name: str,
    category: str,
    source_file: str,
    row_count: int,
    column_count: int,
) -> None:
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                INSERT INTO econiq_dataset_catalog
                (
                    table_name,
                    category,
                    source_file,
                    row_count,
                    column_count
                )
                VALUES
                (
                    :table_name,
                    :category,
                    :source_file,
                    :row_count,
                    :column_count
                )
                ON CONFLICT (table_name)
                DO UPDATE SET
                    category = EXCLUDED.category,
                    source_file = EXCLUDED.source_file,
                    row_count = EXCLUDED.row_count,
                    column_count = EXCLUDED.column_count,
                    loaded_at = CURRENT_TIMESTAMP
                """
            ),
            {
                "table_name": table_name,
                "category": category,
                "source_file": source_file,
                "row_count": row_count,
                "column_count": column_count,
            },
        )


def load_dataset(engine, csv_path: Path) -> bool:
    relative = csv_path.relative_to(PROCESSED_DIR)

    # Skip metadata CSVs for now.
    # Metadata will be handled separately so it remains structured
    # and linked properly to World Bank indicators.
    if relative.parts and relative.parts[0] == "metadata":
        print(f"[SKIP METADATA] {relative}")
        return False

    category = relative.parts[0] if len(relative.parts) > 1 else "uncategorized"
    table_name = make_table_name(csv_path)

    print()
    print("-" * 80)
    print(f"FILE:    {relative}")
    print(f"TABLE:   {table_name}")

    df = read_csv_safely(csv_path)

    if df.empty:
        print("STATUS:  EMPTY - SKIPPED")
        return False

    df = normalize_columns(df)

    print(f"ROWS:    {len(df):,}")
    print(f"COLUMNS: {len(df.columns):,}")

    df.to_sql(
        table_name,
        engine,
        if_exists="replace",
        index=False,
        chunksize=500,
    )

    update_catalog(
        engine=engine,
        table_name=table_name,
        category=category,
        source_file=str(relative),
        row_count=len(df),
        column_count=len(df.columns),
    )

    print("STATUS:  LOADED")

    return True


def main() -> None:
    print("=" * 80)
    print("EconIQ - PROCESSED DATASET LOADER")
    print("=" * 80)

    print(f"Processed directory:")
    print(PROCESSED_DIR)

    if not PROCESSED_DIR.exists():
        raise RuntimeError(
            f"Directory does not exist: {PROCESSED_DIR}"
        )

    # Use EconIQ's existing configuration.
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
    )

    print()
    print("Testing PostgreSQL connection...")

    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    print("DATABASE: CONNECTED")

    create_catalog_table(engine)

    csv_files = find_csv_files()

    print()
    print(f"CSV FILES FOUND: {len(csv_files)}")

    loaded = 0
    skipped = 0
    failed = 0

    for csv_path in csv_files:
        try:
            result = load_dataset(engine, csv_path)

            if result:
                loaded += 1
            else:
                skipped += 1

        except Exception as exc:
            failed += 1

            print()
            print("ERROR")
            print(f"FILE: {csv_path}")
            print(f"ERROR: {exc}")

    print()
    print("=" * 80)
    print("FINAL SUMMARY")
    print("=" * 80)
    print(f"CSV files discovered : {len(csv_files)}")
    print(f"Datasets loaded      : {loaded}")
    print(f"Datasets skipped     : {skipped}")
    print(f"Datasets failed      : {failed}")
    print("=" * 80)

    print()
    print("Run this SQL to see everything loaded:")
    print()
    print(
        "SELECT category, table_name, row_count, column_count "
        "FROM econiq_dataset_catalog "
        "ORDER BY category, table_name;"
    )


if __name__ == "__main__":
    main()




