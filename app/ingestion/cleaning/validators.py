from datetime import date


def validate_observation(observation: dict) -> list[str]:
    """
    Validate a normalized ECONIQ observation.

    Returns a list of validation errors.
    An empty list means the observation is valid.
    """

    errors = []

    # Required fields
    required_fields = [
        "country_code",
        "indicator_code",
        "observation_date",
        "value",
    ]

    for field in required_fields:
        if observation.get(field) is None:
            errors.append(
                f"Missing required field: {field}"
            )

    # Stop here if required fields are missing
    if errors:
        return errors

    # Validate country code
    if not isinstance(
        observation["country_code"],
        str,
    ):
        errors.append(
            "country_code must be a string"
        )

    # Validate indicator code
    if not isinstance(
        observation["indicator_code"],
        str,
    ):
        errors.append(
            "indicator_code must be a string"
        )

    # Validate date
    if not isinstance(
        observation["observation_date"],
        date,
    ):
        errors.append(
            "observation_date must be a date"
        )

    # Validate value
    if not isinstance(
        observation["value"],
        (int, float),
    ):
        errors.append(
            "value must be numeric"
        )

    return errors