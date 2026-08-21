from datetime import date


def clean_gdp_growth(raw_data: list) -> list[dict]:
    """
    Clean World Bank GDP growth observations.

    Converts raw World Bank records into the
    format expected by ECONIQ.
    """

    cleaned = []

    # World Bank response structure:
    # [metadata, observations]
    observations = raw_data[1]

    for record in observations:

        # Skip records without a value
        if record.get("value") is None:
            continue

        # Extract required fields
        country_code = record.get("countryiso3code")

        country_code_map = {
            "KEN": "KE",
        }

        country_code = country_code_map.get(
            country_code,
            country_code,
        )
        year = record.get("date")
        value = record.get("value")

        # Basic validation
        if not country_code:
            continue

        if not year:
            continue

        if value is None:
            continue

        # Convert types
        year = int(year)
        value = float(value)

        # ECONIQ currently stores observations
        # using a date, so annual data uses Jan 1.
        observation_date = date(year, 1, 1)

        cleaned.append(
            {
                "country_code": country_code,
                "indicator_code": "GDP_GROWTH",
                "observation_date": observation_date,
                "value": value,
            }
        )

    return cleaned