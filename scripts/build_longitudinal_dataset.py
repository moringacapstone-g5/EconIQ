from __future__ import annotations

import re
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]

PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
OUTPUT_DIR = PROCESSED_DIR / "longitudinal"
OUTPUT_FILE = OUTPUT_DIR / "econiq_world_bank_longitudinal.csv"


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


def clean_column_name(value: str) -> str:
    value = str(value).strip().lower()
    value = re.sub(r"[^a-z0-9]+", "_", value)
    value = re.sub(r"_+", "_", value)
    return value.strip("_")


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    cleaned = []
    seen: dict[str, int] = {}

    for column in df.columns:
        name = clean_column_name(column)

        if not name:
            name = "column"

        if name in seen:
            seen[name] += 1
            name = f"{name}_{seen[name]}"
        else:
            seen[name] = 0

        cleaned.append(name)

    df.columns = cleaned
    return df


def find_year_columns(df: pd.DataFrame) -> list[str]:
    years = []

    for column in df.columns:
        if re.fullmatch(r"(19|20)\d{2}", str(column)):
            year = int(column)

            if 1960 <= year <= 2100:
                years.append(column)

    return sorted(years, key=int)


def is_world_bank_dataset(df: pd.DataFrame) -> bool:
    required = {
        "country_name",
        "country_code",
        "indicator_name",
        "indicator_code",
    }

    return required.issubset(set(df.columns))


def process_file(path: Path) -> pd.DataFrame | None:
    print()
    print(f"FILE: {path.relative_to(PROCESSED_DIR)}")

    try:
        df = read_csv_safely(path)
    except Exception as exc:
        print(f"READ ERROR: {exc}")
        return None

    if df.empty:
        print("STATUS: EMPTY")
        return None

    df = normalize_columns(df)

    if not is_world_bank_dataset(df):
        print("STATUS: NOT WORLD BANK FORMAT - SKIPPED")
        return None

    year_columns = find_year_columns(df)

    if not year_columns:
        print("STATUS: NO YEAR COLUMNS - SKIPPED")
        return None

    print(f"YEAR RANGE: {year_columns[0]} - {year_columns[-1]}")
    print(f"YEAR COLUMNS: {len(year_columns)}")

    # Remove completely empty helper columns such as unnamed_70.
    df = df.drop(
        columns=[
            column
            for column in df.columns
            if column.startswith("unnamed")
        ],
        errors="ignore",
    )

    # Recalculate year columns after dropping helper columns.
    year_columns = find_year_columns(df)

    id_columns = [
        "country_code",
        "country_name",
        "indicator_code",
        "indicator_name",
    ]

    # Keep only the columns needed for the longitudinal dataset.
    working = df[id_columns + year_columns].copy()

    # Convert wide World Bank data to longitudinal format.
    long_df = working.melt(
        id_vars=id_columns,
        value_vars=year_columns,
        var_name="year",
        value_name="value",
    )

    long_df["year"] = pd.to_numeric(
        long_df["year"],
        errors="coerce",
    ).astype("Int64")

    long_df["value"] = pd.to_numeric(
        long_df["value"],
        errors="coerce",
    )

    # Remove rows where the indicator has no observation.
    long_df = long_df.dropna(
        subset=[
            "country_code",
            "indicator_code",
            "year",
            "value",
        ]
    )

    long_df["country_code"] = (
        long_df["country_code"]
        .astype(str)
        .str.strip()
        .str.upper()
    )

    long_df["country_name"] = (
        long_df["country_name"]
        .astype(str)
        .str.strip()
    )

    long_df["indicator_code"] = (
        long_df["indicator_code"]
        .astype(str)
        .str.strip()
    )

    long_df["indicator_name"] = (
        long_df["indicator_name"]
        .astype(str)
        .str.strip()
    )

    long_df["source"] = "World Bank"

    print(f"OBSERVATIONS CREATED: {len(long_df):,}")

    return long_df


def main() -> None:
    print("-" * 80)
    print("EconIQ - WORLD BANK LONGITUDINAL DATA BUILDER")
    print("-" * 80)

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    csv_files = sorted(
        PROCESSED_DIR.rglob("*.csv")
    )

    # Do not process the output we're creating.
    csv_files = [
        path
        for path in csv_files
        if path.resolve() != OUTPUT_FILE.resolve()
        and "longitudinal" not in path.parts
    ]

    print(f"CSV FILES SCANNED: {len(csv_files)}")

    datasets = []
    processed_files = 0

    for path in csv_files:
        result = process_file(path)

        if result is not None and not result.empty:
            datasets.append(result)
            processed_files += 1

    if not datasets:
        raise RuntimeError(
            "No World Bank-compatible datasets were found."
        )

    print()
    print("-" * 80)
    print("COMBINING DATASETS")
    print("-" * 80)

    longitudinal = pd.concat(
        datasets,
        ignore_index=True,
    )

    # Remove exact duplicate observations created by overlapping
    # World Bank exports.
    longitudinal = longitudinal.drop_duplicates(
        subset=[
            "country_code",
            "indicator_code",
            "year",
        ],
        keep="last",
    )

    longitudinal = longitudinal.sort_values(
        by=[
            "country_code",
            "indicator_code",
            "year",
        ]
    ).reset_index(drop=True)

    # Ensure stable column order.
    longitudinal = longitudinal[
        [
            "country_code",
            "country_name",
            "indicator_code",
            "indicator_name",
            "year",
            "value",
            "source",
        ]
    ]

    longitudinal.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    print()
    print("-" * 80)
    print("LONGITUDINAL DATASET CREATED")
    print("-" * 80)
    print(f"Files processed       : {processed_files}")
    print(f"Total observations    : {len(longitudinal):,}")
    print(f"Countries             : {longitudinal['country_code'].nunique():,}")
    print(f"Indicators            : {longitudinal['indicator_code'].nunique():,}")
    print(f"First year            : {longitudinal['year'].min()}")
    print(f"Last year             : {longitudinal['year'].max()}")
    print(f"Output                : {OUTPUT_FILE}")
    print("-" * 80)

    print()
    print("SAMPLE:")
    print(
        longitudinal.head(20).to_string(
            index=False
        )
    )


if __name__ == "__main__":
    main()
