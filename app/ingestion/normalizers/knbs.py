from datetime import date


def normalize_cpi_and_inflation(
    extracted_data: list[dict],
) -> list[dict]:
    """
    Normalize extracted KNBS CPI and inflation data.

    Input:
        [
            {
                "observation_date": date(...),
                "cpi": 155.20,
                "inflation": 6.5,
            }
        ]

    Output:
        [
            {
                "country_code": "KE",
                "indicator_code": "CPI",
                "observation_date": date(...),
                "value": 155.20,
            },
            {
                "country_code": "KE",
                "indicator_code": "INFLATION",
                "observation_date": date(...),
                "value": 6.5,
            }
        ]
    """

    normalized = []

    for record in extracted_data:

        observation_date = record.get(
            "observation_date"
        )

        if not isinstance(
            observation_date,
            date,
        ):
            raise ValueError(
                "Invalid observation_date: "
                f"{observation_date}"
            )

        # --------------------------------------------------
        # CPI
        # --------------------------------------------------

        cpi = record.get("cpi")

        if cpi is not None:

            normalized.append(
                {
                    "country_code": "KE",
                    "indicator_code": "CPI",
                    "observation_date": observation_date,
                    "value": float(cpi),
                }
            )

        # --------------------------------------------------
        # Inflation
        # --------------------------------------------------

        inflation = record.get("inflation")

        if inflation is not None:

            normalized.append(
                {
                    "country_code": "KE",
                    "indicator_code": "INFLATION",
                    "observation_date": observation_date,
                    "value": float(inflation),
                }
            )

    return normalized