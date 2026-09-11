from __future__ import annotations

from pathlib import Path
import hashlib
import json
import re
from datetime import datetime

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]

RAW_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

OUTPUT_DIRS = [
    PROCESSED_DIR / "economic",
    PROCESSED_DIR / "financial",
    PROCESSED_DIR / "climate",
    PROCESSED_DIR / "agriculture",
    PROCESSED_DIR / "food_prices",
    PROCESSED_DIR / "trade",
    PROCESSED_DIR / "metadata",
    PROCESSED_DIR / "validation",
]


def ensure_directories():
    for directory in OUTPUT_DIRS:
        directory.mkdir(parents=True, exist_ok=True)


def normalize_column_name(column):
    column = str(column).strip()
    column = re.sub(r"\\[^\]]+\\", "", column)
    column = re.sub(r"[^A-Za-z0-9]+", "_", column)
    column = column.strip("_").lower()

    if not column:
        column = "unnamed"

    return column


def normalize_columns(df):
    df = df.copy()
    df.columns = [normalize_column_name(c) for c in df.columns]
    return df


def clean_missing_values(df):
    df = df.copy()

    missing_values = [
        "",
        " ",
        "-",
        "--",
        "na",
        "n/a",
        "nan",
        "null",
        ".",
        "..",
    ]

    for value in missing_values:
        df = df.replace(value, pd.NA)

    return df


def calculate_file_hash(path):
    sha256 = hashlib.sha256()

    with open(path, "rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            sha256.update(chunk)

    return sha256.hexdigest()


def detect_source(filename):
    name = filename.lower()

    if "world" in name or name.startswith("api_") or "metadata_" in name:
        return "world_bank"

    if "wfp" in name:
        return "wfp"

    if "climate" in name or "rainfall" in name:
        return "climate"

    if "central bank" in name or "commercial banks" in name:
        return "cbk"

    if "exchange" in name:
        return "cbk"

    if "gdp" in name or "inflation" in name or "international-trade" in name:
        return "knbs"

    if "kenya" in name:
        return "knbs"

    return "unknown"


def detect_category(filename, source):
    name = filename.lower()

    if source == "world_bank":
        if "metadata" in name:
            return "metadata"

        if "gdp" in name or "ny.gdp" in name:
            return "economic"

        if "inflation" in name:
            return "economic"

        if "sl.uem" in name:
            return "labor"

        if "pa.nus" in name:
            return "exchange_rates"

        if "gc.dod" in name:
            return "public_debt"

        if "ne.exp" in name:
            return "trade"

        if "nv.agr" in name:
            return "agriculture"

        return "economic"

    if source == "cbk":
        if "exchange" in name:
            return "financial"

        return "financial"

    if source == "knbs":
        if "gdp" in name:
            return "economic"

        if "inflation" in name:
            return "economic"

        if "trade" in name:
            return "trade"

        if "exchange" in name:
            return "financial"

        return "economic"

    if source == "climate":
        return "climate"

    if source == "wfp":
        if "market" in name:
            return "food_prices"

        return "food_prices"

    return "unknown"


def read_csv_safely(path):
    attempts = [
        {},
        {"skiprows": 4},
        {"engine": "python"},
        {"skiprows": 4, "engine": "python"},
    ]

    last_error = None

    for kwargs in attempts:
        try:
            df = pd.read_csv(path, **kwargs)

            if df.shape[1] >= 3:
                return df

        except Exception as exc:
            last_error = exc

    raise RuntimeError(f"Could not read CSV {path}: {last_error}")


def read_excel_safely(path):
    try:
        return pd.ExcelFile(path)
    except Exception as exc:
        raise RuntimeError(f"Could not open Excel file {path}: {exc}") from exc


def inspect_csv(path):
    df = read_csv_safely(path)

    df = normalize_columns(df)
    df = clean_missing_values(df)

    return df


def inspect_excel(path):
    excel = read_excel_safely(path)

    result = {}

    for sheet in excel.sheet_names:
        try:
            df = pd.read_excel(path, sheet_name=sheet)
            df = normalize_columns(df)
            df = clean_missing_values(df)

            result[sheet] = df
        except Exception as exc:
            result[sheet] = str(exc)

    return result


def save_dataframe(df, output_path):
    output_path.parent.mkdir(parents=True, exist_ok=True)

    df.to_csv(
        output_path,
        index=False,
        encoding="utf-8",
    )


def create_file_record(path, source, category):
    stat = path.stat()

    return {
        "filename": path.name,
        "path": str(path.relative_to(PROJECT_ROOT)),
        "extension": path.suffix.lower(),
        "source": source,
        "category": category,
        "size_bytes": stat.st_size,
        "sha256": calculate_file_hash(path),
        "modified_at": datetime.fromtimestamp(
            stat.st_mtime
        ).isoformat(),
    }


def process_csv(path):
    source = detect_source(path.name)
    category = detect_category(path.name, source)

    df = inspect_csv(path)

    output_name = (
        path.stem.lower()
        .replace(" ", "_")
        .replace("-", "_")
        + ".csv"
    )

    output_path = PROCESSED_DIR / category / output_name

    save_dataframe(df, output_path)

    return {
        "status": "processed",
        "source": source,
        "category": category,
        "rows": len(df),
        "columns": len(df.columns),
        "output": str(output_path.relative_to(PROJECT_ROOT)),
    }


def process_excel(path):
    source = detect_source(path.name)
    category = detect_category(path.name, source)

    workbook = inspect_excel(path)

    outputs = []

    for sheet_name, df in workbook.items():

        if isinstance(df, str):
            outputs.append(
                {
                    "sheet": sheet_name,
                    "status": "error",
                    "error": df,
                }
            )
            continue

        safe_sheet = re.sub(
            r"[^A-Za-z0-9]+",
            "_",
            str(sheet_name).lower(),
        ).strip("_")

        output_name = (
            path.stem.lower()
            .replace(" ", "_")
            .replace("-", "_")
            + "__"
            + safe_sheet
            + ".csv"
        )

        output_path = PROCESSED_DIR / category / output_name

        save_dataframe(df, output_path)

        outputs.append(
            {
                "sheet": sheet_name,
                "status": "processed",
                "rows": len(df),
                "columns": len(df.columns),
                "output": str(
                    output_path.relative_to(PROJECT_ROOT)
                ),
            }
        )

    return {
        "status": "processed",
        "source": source,
        "category": category,
        "sheets": outputs,
    }


def main():

    ensure_directories()

    if not RAW_DIR.exists():
        raise FileNotFoundError(
            f"Raw data directory does not exist: {RAW_DIR}"
        )

    files = [
        path
        for path in RAW_DIR.rglob("*")
        if path.is_file()
    ]

    manifest = []

    for path in files:

        source = detect_source(path.name)
        category = detect_category(path.name, source)

        record = create_file_record(
            path,
            source,
            category,
        )

        try:

            if path.suffix.lower() == ".csv":
                result = process_csv(path)

            elif path.suffix.lower() in [".xlsx", ".xls"]:
                result = process_excel(path)

            else:
                result = {
                    "status": "skipped",
                    "reason": "unsupported file type",
                }

            record["processing"] = result

        except Exception as exc:

            record["processing"] = {
                "status": "error",
                "error": str(exc),
            }

        manifest.append(record)

    manifest_path = (
        PROCESSED_DIR
        / "validation"
        / "raw_data_manifest.json"
    )

    with open(
        manifest_path,
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            manifest,
            file,
            indent=2,
            ensure_ascii=False,
            default=str,
        )

    print()
    print("=" * 70)
    print("EconIQ RAW DATA STANDARDIZATION")
    print("=" * 70)
    print(f"Files discovered: {len(files)}")
    print(f"Manifest: {manifest_path}")
    print("=" * 70)

    for item in manifest:

        processing = item.get("processing", {})

        print(
            f"{item['filename'][:55]:55} "
            f"{item['source']:12} "
            f"{item['category']:18} "
            f"{processing.get('status', 'unknown')}"
        )


if __name__ == "__main__":
    main()
