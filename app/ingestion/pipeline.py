from app.db.session import SessionLocal

from app.ingestion.cleaning.validators import validate_observation
from app.ingestion.cleaning.world_bank import clean_gdp_growth
from app.ingestion.connectors.world_bank import fetch_gdp_growth
from app.ingestion.loader import load_observation

from pypdf import PdfReader

from app.ingestion.cleaning.knbs_cpi import (
    normalize_cpi_observations,
)

from app.ingestion.validation.knbs_cpi import (
    validate_knbs_observations,
)

from app.ingestion.extractors.knbs_cpi import (
    find_cpi_chart_page,
    extract_cpi_and_inflation,
)


def run_world_bank_gdp_pipeline():

    print("Starting World Bank GDP ingestion...")
    print()

    # Fetch
    raw_data = fetch_gdp_growth()

    print("✓ Data fetched")

    # Clean + normalize
    cleaned_data = clean_gdp_growth(raw_data)

    print(
        f"✓ {len(cleaned_data)} records cleaned"
    )

    inserted = 0
    updated = 0
    skipped = 0
    failed = 0

    db = SessionLocal()

    try:

        for observation in cleaned_data:

            # Validate
            errors = validate_observation(
                observation
            )

            if errors:

                skipped += 1

                print(
                    "⚠ Skipped invalid observation:",
                    errors,
                )

                continue

            try:

                result = load_observation(
                    db=db,
                    observation=observation,
                    source_name="World Bank",
                )

                if result.action == "inserted":
                    inserted += 1

                elif result.action == "updated":
                    updated += 1

                elif result.action == "skipped":
                    skipped += 1

            except Exception as error:

                failed += 1

                print(
                    f"✗ Failed to load "
                    f"{observation['observation_date']}: "
                    f"{error}"
                )

    finally:
        db.close()

    print()
    print("================================")
    print("INGESTION COMPLETE")
    print("================================")
    print(f"Fetched:  {len(cleaned_data)}")
    print(f"Inserted: {inserted}")
    print(f"Updated:  {updated}")
    print(f"Skipped:  {skipped}")
    print(f"Failed:   {failed}")
    print("================================")


# if __name__ == "__main__":
#     run_world_bank_gdp_pipeline()

def run_knbs_cpi_pipeline():

    print("Starting KNBS CPI ingestion...")
    print()

    pdf_path = (
        "data/raw/knbs/"
        "Kenya-Consumer-Price-Indices-and-Inflation-Rates-July-2026.pdf"
    )

    # --------------------------------
    # 1. Read PDF
    # --------------------------------

    pdf = PdfReader(pdf_path)

    print(f"✓ PDF loaded: {len(pdf.pages)} pages")

    # --------------------------------
    # 2. Find CPI chart page
    # --------------------------------

    text = find_cpi_chart_page(pdf)

    print("✓ CPI chart located")

    # --------------------------------
    # 3. Extract
    # --------------------------------

    extracted_data = extract_cpi_and_inflation(text)

    print(
        f"✓ {len(extracted_data)} records extracted"
    )

    # --------------------------------
    # 4. Normalize
    # --------------------------------

    normalized_data = normalize_cpi_observations(
        extracted_data
    )

    print(
        f"✓ {len(normalized_data)} observations normalized"
    )

    # --------------------------------
    # 5. Validate
    # --------------------------------

    errors = validate_knbs_observations(
        normalized_data
    )

    if errors:

        print("✗ Validation failed")

        for error in errors:
            print(f"  - {error}")

        return

    print("✓ Validation passed")

    # --------------------------------
    # 6. Load into PostgreSQL
    # --------------------------------

    inserted = 0
    updated = 0
    skipped = 0
    failed = 0

    db = SessionLocal()

    try:

        for observation in normalized_data:

            try:

                result = load_observation(
                    db=db,
                    observation=observation,
                    source_name="KNBS",
                )

                if result.action == "inserted":
                    inserted += 1

                elif result.action == "updated":
                    updated += 1

                elif result.action == "skipped":
                    skipped += 1

            except Exception as error:

                failed += 1

                print(
                    f"✗ Failed to load "
                    f"{observation['indicator_code']} "
                    f"{observation['observation_date']}: "
                    f"{error}"
                )

    finally:

        db.close()

    # --------------------------------
    # 7. Summary
    # --------------------------------

    print()
    print("================================")
    print("KNBS INGESTION COMPLETE")
    print("================================")
    print(f"Extracted:   {len(extracted_data)}")
    print(f"Normalized:  {len(normalized_data)}")
    print(f"Inserted:    {inserted}")
    print(f"Updated:     {updated}")
    print(f"Skipped:     {skipped}")
    print(f"Failed:      {failed}")
    print("================================")

if __name__ == "__main__":
    run_knbs_cpi_pipeline()