from pypdf import PdfReader

from app.db.session import SessionLocal

from app.ingestion.knbs_document import (
    KNBS_SOURCE_NAME,
    ingest_knbs_document,
)

from app.ingestion.knbs_document import (
    ingest_knbs_document,
)

from app.ingestion.extractors.knbs_cpi import (
    extract_cpi_and_inflation,
)

from app.ingestion.normalizers.knbs import (
    normalize_cpi_and_inflation,
)

from app.ingestion.cleaning.validators import (
    validate_observation,
)

from app.ingestion.validation.knbs_cpi import (
    validate_knbs_observations,
)

from app.ingestion.loader import (
    load_observation,
)


def find_cpi_chart_page(
    reader: PdfReader,
) -> str:
    """
    Locate the actual KNBS CPI chart page.

    The report's table of contents also contains references
    to Figure 1 and Figure 2, so we identify the actual chart
    using the CPI values and month labels instead.
    """

    for page_number, page in enumerate(
        reader.pages,
        start=1,
    ):

        text = page.extract_text() or ""

        if (
            "145.74" in text
            and "146.21" in text
            and "154.91" in text
            and "155.20" in text
            and "Jul-25" in text
            and "Jul-26" in text
            and "CPI" in text
            and "Inflation" in text
        ):

            print(
                f"Found CPI chart on PDF page "
                f"{page_number}"
            )

            return text

    raise ValueError(
        "Could not locate the actual KNBS CPI chart page."
    )


def run_knbs_pipeline():

    print()
    print("================================")
    print("STARTING KNBS CPI INGESTION")
    print("================================")
    print()

    db = SessionLocal()

    inserted = 0
    updated = 0
    skipped = 0
    failed = 0

    try:

        # ==================================================
        # 1. Prepare document
        # ==================================================

        document = ingest_knbs_document(
            db
        )

        document_id = document.id

        print(
            f"✓ Document ID: {document_id}"
        )

        # ==================================================
        # 2. Read PDF
        # ==================================================

        print()
        print("Reading KNBS PDF...")

        reader = PdfReader(
            document.local_path
        )

        print(
            f"✓ PDF loaded: "
            f"{len(reader.pages)} pages"
        )

        # ==================================================
        # 3. Locate CPI chart
        # ==================================================

        chart_text = find_cpi_chart_page(
            reader
        )

        print(
            "✓ CPI chart page located"
        )

        # ==================================================
        # 4. Extract
        # ==================================================

        extracted = extract_cpi_and_inflation(
            chart_text
        )

        print(
            f"✓ Extracted: "
            f"{len(extracted)} records"
        )

        # ==================================================
        # 5. Normalize
        # ==================================================

        normalized = normalize_cpi_and_inflation(
            extracted
        )

        print(
            f"✓ Normalized: "
            f"{len(normalized)} observations"
        )

        # ==================================================
        # 6. Generic validation
        # ==================================================

        generic_errors = []

        for observation in normalized:

            errors = validate_observation(
                observation
            )

            if errors:
                generic_errors.extend(
                    errors
                )

        if generic_errors:

            print()
            print(
                "⚠ Generic validation errors:"
            )

            for error in generic_errors:
                print(
                    f"  - {error}"
                )

            print()

        # ==================================================
        # 7. KNBS-specific validation
        # ==================================================

        knbs_errors = (
            validate_knbs_observations(
                normalized
            )
        )

        if knbs_errors:

            print()
            print(
                "⚠ KNBS validation errors:"
            )

            for error in knbs_errors:
                print(
                    f"  - {error}"
                )

            print()

        # ==================================================
        # 8. Validate and load
        # ==================================================

        for observation in normalized:

            # ----------------------------------------------
            # Generic validation
            # ----------------------------------------------

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

            # ----------------------------------------------
            # KNBS-specific validation
            # ----------------------------------------------

            knbs_validation_errors = (
                validate_knbs_observations(
                    [observation]
                )
            )

            if knbs_validation_errors:

                skipped += 1

                print(
                    "⚠ Skipped invalid KNBS observation:",
                    knbs_validation_errors,
                )

                continue

            # ----------------------------------------------
            # Load
            # ----------------------------------------------

            try:

                result = load_observation(
                    db=db,
                    observation=observation,
                    source_name=KNBS_SOURCE_NAME,
                    document_id=document_id,
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

        # ==================================================
        # 9. Summary
        # ==================================================

        print()
        print("================================")
        print("KNBS INGESTION COMPLETE")
        print("================================")

        print(
            f"Extracted: {len(extracted)}"
        )

        print(
            f"Normalized: {len(normalized)}"
        )

        print(
            f"Inserted:  {inserted}"
        )

        print(
            f"Updated:   {updated}"
        )

        print(
            f"Skipped:   {skipped}"
        )

        print(
            f"Failed:    {failed}"
        )

        print(
            f"Document:  {document_id}"
        )

        print("================================")

    finally:

        db.close()


if __name__ == "__main__":
    run_knbs_pipeline()