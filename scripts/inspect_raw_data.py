from pathlib import Path
import json
import re
from datetime import datetime

import pandas as pd


RAW_DIR = Path("data/raw")
OUTPUT_DIR = Path("data/inspection")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

SUPPORTED = {".csv", ".xlsx", ".xls"}


def clean_value(value):
    if pd.isna(value):
        return None
    return str(value)


def detect_source(filename: str) -> str:
    name = filename.lower()

    if "world" in name or name.startswith("api_") or "metadata_" in name:
        return "World Bank"

    if "central bank" in name or "commercial banks" in name:
        return "Central Bank of Kenya"

    if "exchange rate" in name or "exchange-rate" in name:
        return "Central Bank of Kenya"

    if "inflation" in name or "annual gdp" in name:
        return "KNBS"

    if "international-trade" in name or "balance-of-payments" in name:
        return "KNBS"

    if "climate" in name or "rainfall" in name:
        return "Climate"

    if "wfp" in name:
        return "World Food Programme"

    return "Unknown"


def detect_domain(filename: str, columns: list[str]) -> str:
    text = f"{filename} {' '.join(columns)}".lower()

    if any(x in text for x in ["gdp", "gross domestic product"]):
        return "GDP / National Accounts"

    if any(x in text for x in ["inflation", "consumer price", "cpi"]):
        return "Inflation / Prices"

    if any(x in text for x in [
        "repo",
        "reverse repo",
        "central bank rate",
        "tbill",
        "t-bill",
        "cash reserve",
        "interbank rate",
        "interest rate",
        "lending",
        "deposit",
        "savings",
        "overdraft",
    ]):
        return "Monetary / Interest Rates"

    if any(x in text for x in [
        "exchange rate",
        "exchange-rate",
        "shilling",
        "currency",
        "dollar",
        "sterling",
        "euro",
    ]):
        return "Exchange Rates"

    if any(x in text for x in [
        "rainfall",
        "precipitation",
        "prectot",
        "temperature",
        "t2m",
        "humidity",
        "rh2m",
        "wind",
        "ws10m",
        "climate",
    ]):
        return "Climate / Weather"

    if any(x in text for x in [
        "food",
        "commodity",
        "market",
        "maize",
        "beans",
        "priceflag",
        "pricetype",
        "usdprice",
    ]):
        return "Food Prices / Markets"

    if any(x in text for x in [
        "export",
        "import",
        "trade",
        "balance of payments",
    ]):
        return "International Trade"

    if any(x in text for x in [
        "unemployment",
        "labor force",
        "employment",
    ]):
        return "Labour Market"

    if any(x in text for x in [
        "agriculture",
        "forestry",
        "fishing",
        "crop",
    ]):
        return "Agriculture"

    if any(x in text for x in [
        "debt",
        "government debt",
        "public debt",
    ]):
        return "Government Debt"

    if "metadata" in text:
        return "Metadata"

    return "Other / Needs Review"


def find_year_range(df: pd.DataFrame):
    years = []

    for column in df.columns:
        series = df[column].dropna()

        for value in series.head(500):
            match = re.search(r"\b(19|20)\d{2}\b", str(value))

            if match:
                years.append(int(match.group(0)))

    if not years:
        return None, None

    return min(years), max(years)


def inspect_csv(path: Path):
    result = {
        "file": str(path),
        "filename": path.name,
        "extension": path.suffix.lower(),
        "size_mb": round(path.stat().st_size / (1024 * 1024), 3),
        "source": detect_source(path.name),
        "status": "success",
    }

    try:
        # First attempt: normal CSV
        df = pd.read_csv(path)

    except Exception as first_error:
        result["initial_error"] = str(first_error)

        try:
            # World Bank exports often contain irregular metadata rows.
            df = pd.read_csv(
                path,
                skiprows=4,
                low_memory=False,
            )
            result["read_method"] = "skiprows=4"

        except Exception as second_error:
            result["status"] = "error"
            result["error"] = str(second_error)
            return result

    columns = [str(c) for c in df.columns]

    result["rows"] = len(df)
    result["columns_count"] = len(df.columns)
    result["columns"] = columns
    result["domain"] = detect_domain(path.name, columns)

    start_year, end_year = find_year_range(df)
    result["year_min"] = start_year
    result["year_max"] = end_year

    result["missing_values"] = {
        str(column): int(df[column].isna().sum())
        for column in df.columns
    }

    result["sample"] = (
        df.head(5)
        .where(pd.notna(df.head(5)), None)
        .to_dict(orient="records")
    )

    return result


def inspect_excel(path: Path):
    result = {
        "file": str(path),
        "filename": path.name,
        "extension": path.suffix.lower(),
        "size_mb": round(path.stat().st_size / (1024 * 1024), 3),
        "source": detect_source(path.name),
        "status": "success",
    }

    try:
        excel = pd.ExcelFile(path)

        result["sheets"] = excel.sheet_names
        result["sheet_details"] = []

        for sheet in excel.sheet_names:
            try:
                df = pd.read_excel(path, sheet_name=sheet)

                columns = [str(c) for c in df.columns]

                start_year, end_year = find_year_range(df)

                result["sheet_details"].append({
                    "sheet": sheet,
                    "rows": len(df),
                    "columns_count": len(df.columns),
                    "columns": columns,
                    "domain": detect_domain(path.name, columns),
                    "year_min": start_year,
                    "year_max": end_year,
                    "sample": (
                        df.head(3)
                        .where(pd.notna(df.head(3)), None)
                        .to_dict(orient="records")
                    ),
                })

            except Exception as sheet_error:
                result["sheet_details"].append({
                    "sheet": sheet,
                    "status": "error",
                    "error": str(sheet_error),
                })

    except Exception as error:
        result["status"] = "error"
        result["error"] = str(error)

    return result


def create_markdown_report(results):
    lines = []

    lines.append("# EconIQ Raw Data Inspection Report")
    lines.append("")
    lines.append(
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    )
    lines.append("")
    lines.append(f"Raw directory: `{RAW_DIR}`")
    lines.append("")
    lines.append("---")
    lines.append("")

    for result in results:
        lines.append(f"## {result['filename']}")
        lines.append("")

        lines.append(f"- **Path:** `{result['file']}`")
        lines.append(f"- **Type:** `{result['extension']}`")
        lines.append(f"- **Size:** {result['size_mb']} MB")
        lines.append(f"- **Detected source:** {result['source']}")
        lines.append(f"- **Status:** {result['status']}")

        if result["status"] == "error":
            lines.append(f"- **Error:** `{result.get('error')}`")
            lines.append("")
            continue

        if result["extension"] == ".csv":
            lines.append(f"- **Rows:** {result['rows']}")
            lines.append(f"- **Columns:** {result['columns_count']}")
            lines.append(f"- **Domain:** {result['domain']}")
            lines.append(
                f"- **Year range:** "
                f"{result.get('year_min')} → {result.get('year_max')}"
            )

            lines.append("")
            lines.append("### Columns")
            lines.append("")

            for column in result["columns"]:
                lines.append(f"- `{column}`")

            lines.append("")
            lines.append("### Sample")
            lines.append("")
            lines.append("```text")

            for row in result["sample"]:
                lines.append(str(row))

            lines.append("```")
            lines.append("")

        else:
            lines.append(
                f"- **Sheets:** {', '.join(result.get('sheets', []))}"
            )
            lines.append("")

            for sheet in result.get("sheet_details", []):
                lines.append(f"### Sheet: {sheet['sheet']}")
                lines.append("")

                if sheet.get("status") == "error":
                    lines.append(f"- **Error:** {sheet['error']}")
                    lines.append("")
                    continue

                lines.append(f"- **Rows:** {sheet['rows']}")
                lines.append(f"- **Columns:** {sheet['columns_count']}")
                lines.append(f"- **Domain:** {sheet['domain']}")
                lines.append(
                    f"- **Year range:** "
                    f"{sheet.get('year_min')} → {sheet.get('year_max')}"
                )

                lines.append("")
                lines.append("**Columns:**")

                for column in sheet["columns"]:
                    lines.append(f"- `{column}`")

                lines.append("")
                lines.append("**Sample:**")
                lines.append("")
                lines.append("```text")

                for row in sheet["sample"]:
                    lines.append(str(row))

                lines.append("```")
                lines.append("")

        lines.append("---")
        lines.append("")

    return "\n".join(lines)


def main():
    if not RAW_DIR.exists():
        print(f"ERROR: {RAW_DIR} does not exist.")
        return

    files = sorted(
        path for path in RAW_DIR.rglob("*")
        if path.is_file() and path.suffix.lower() in SUPPORTED
    )

    print(f"Found {len(files)} dataset files.")
    print("")

    results = []

    for index, path in enumerate(files, start=1):
        print(f"[{index}/{len(files)}] Inspecting: {path}")

        if path.suffix.lower() == ".csv":
            result = inspect_csv(path)
        else:
            result = inspect_excel(path)

        results.append(result)

    json_path = OUTPUT_DIR / "raw_data_inventory.json"
    markdown_path = OUTPUT_DIR / "raw_data_inventory.md"

    with open(json_path, "w", encoding="utf-8") as file:
        json.dump(results, file, indent=2, ensure_ascii=False, default=str)

    with open(markdown_path, "w", encoding="utf-8") as file:
        file.write(create_markdown_report(results))

    print("")
    print("=" * 80)
    print("INSPECTION COMPLETE")
    print("=" * 80)
    print(f"Files inspected: {len(files)}")
    print(f"JSON report: {json_path}")
    print(f"Markdown report: {markdown_path}")


if __name__ == "__main__":
    main()
