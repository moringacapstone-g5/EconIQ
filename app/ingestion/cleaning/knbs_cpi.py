from datetime import date


def normalize_cpi_observations(observations):
    """
    Convert extracted KNBS CPI records into
    normalized database observations.
    """

    normalized = []

    for observation in observations:
        normalized.append(
            {
                "country_code": observation["country_code"],
                "indicator_code": "CPI",
                "observation_date": observation["observation_date"],
                "value": observation["cpi"],
            }
        )

        normalized.append(
            {
                "country_code": observation["country_code"],
                "indicator_code": "INFLATION",
                "observation_date": observation["observation_date"],
                "value": observation["inflation"],
            }
        )

    return normalized