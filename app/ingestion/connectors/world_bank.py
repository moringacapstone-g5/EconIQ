import httpx


def fetch_gdp_growth():
    url = (
        "https://api.worldbank.org/v2/country/KE/"
        "indicator/NY.GDP.MKTP.KD.ZG"
    )

    params = {
        "format": "json",
        "per_page": 100,
    }

    response = httpx.get(
        url,
        params=params,
        timeout=30.0,
    )

    response.raise_for_status()

    return response.json()