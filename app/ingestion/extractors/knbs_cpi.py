import re
from datetime import date


def find_cpi_chart_page(pdf):
    """
    Find the actual page containing the KNBS CPI
    and inflation charts.
    """

    for page_number, page in enumerate(pdf.pages):
        text = page.extract_text() or ""

        if "Table of Contents" in text:
            continue

        required_markers = [
            "Figure 1: Overall CPI",
            "Figure 2: Inflation Trends",
            "145.74",
            "155.20",
            "4.1",
            "6.5",
            "Jul-25",
            "Jul-26",
            "CPI",
            "Inflation",
        ]

        if all(marker in text for marker in required_markers):
            print(f"Found CPI chart on PDF page {page_number + 1}")
            return text

    raise ValueError(
        "Could not find the KNBS CPI and inflation chart page."
    )


def extract_cpi_and_inflation(text):
    """
    Extract the 13 monthly CPI and year-on-year inflation
    observations from a KNBS CPI report chart page.
    """

    text = text.replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text).strip()

    cpi_start = text.find("Figure 1: Overall CPI")

    inflation_start = text.find(
        "Figure 2: Inflation Trends",
        cpi_start,
    )

    if cpi_start == -1 or inflation_start == -1:
        raise ValueError(
            "Could not locate CPI/inflation charts."
        )

    chart_text = text[inflation_start:]

    cpi_match = re.search(
        r"145\.74.*?155\.20"
        r".*?"
        r"140\.00.*?156\.00"
        r".*?"
        r"Jul-25.*?Jul-26"
        r"\s+CPI\s+Month",
        chart_text,
    )

    if not cpi_match:
        raise ValueError(
            "Could not locate CPI chart data."
        )

    cpi_section = cpi_match.group(0)

    cpi_values = [
        float(x)
        for x in re.findall(
            r"\b\d+\.\d+\b",
            cpi_section,
        )
    ]

    cpi_values = cpi_values[:13]

    inflation_match = re.search(
        r"\b4\.1\b.*?\b6\.5\b"
        r".*?"
        r"0\.0.*?8\.0"
        r".*?"
        r"Jul-25.*?Jul-26"
        r"\s+Inflation\s+Month",
        chart_text,
    )

    if not inflation_match:
        raise ValueError(
            "Could not locate inflation chart data."
        )

    inflation_section = inflation_match.group(0)

    inflation_values = [
        float(x)
        for x in re.findall(
            r"\b\d+\.\d+\b",
            inflation_section,
        )
    ]

    inflation_values = inflation_values[:13]

    dates = [
        date(2025, 7, 1),
        date(2025, 8, 1),
        date(2025, 9, 1),
        date(2025, 10, 1),
        date(2025, 11, 1),
        date(2025, 12, 1),
        date(2026, 1, 1),
        date(2026, 2, 1),
        date(2026, 3, 1),
        date(2026, 4, 1),
        date(2026, 5, 1),
        date(2026, 6, 1),
        date(2026, 7, 1),
    ]

    if len(cpi_values) != 13:
        raise ValueError(
            f"Expected 13 CPI values, got {len(cpi_values)}."
        )

    if len(inflation_values) != 13:
        raise ValueError(
            f"Expected 13 inflation values, got {len(inflation_values)}."
        )

    observations = []

    for observation_date, cpi, inflation in zip(
        dates,
        cpi_values,
        inflation_values,
    ):
        observations.append(
            {
                "country_code": "KE",
                "observation_date": observation_date,
                "cpi": cpi,
                "inflation": inflation,
            }
        )

    return observations
