from datetime import date


VALID_INDICATORS = {"CPI", "INFLATION"}


def validate_knbs_observations(observations):
    errors = []

    for i, observation in enumerate(observations):
        indicator = observation.get("indicator_code")
        value = observation.get("value")
        country = observation.get("country_code")
        observation_date = observation.get("observation_date")

        if country != "KE":
            errors.append(
                f"Row {i}: unexpected country code: {country}"
            )

        if indicator not in VALID_INDICATORS:
            errors.append(
                f"Row {i}: invalid indicator: {indicator}"
            )

        if not isinstance(observation_date, date):
            errors.append(
                f"Row {i}: invalid observation date"
            )

        if value is None:
            errors.append(
                f"Row {i}: missing value"
            )
            continue

        if not isinstance(value, (int, float)):
            errors.append(
                f"Row {i}: value is not numeric: {value}"
            )

        if indicator == "CPI" and value <= 0:
            errors.append(
                f"Row {i}: CPI must be greater than zero: {value}"
            )

        if indicator == "INFLATION" and not -100 < value < 100:
            errors.append(
                f"Row {i}: inflation value looks invalid: {value}"
            )

    return errors