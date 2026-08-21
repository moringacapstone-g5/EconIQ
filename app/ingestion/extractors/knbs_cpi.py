# import re
# from datetime import date


# MONTHS = {
#     "Jan": 1,
#     "Feb": 2,
#     "Mar": 3,
#     "Apr": 4,
#     "May": 5,
#     "Jun": 6,
#     "Jul": 7,
#     "Aug": 8,
#     "Sep": 9,
#     "Oct": 10,
#     "Nov": 11,
#     "Dec": 12,
# }

# def find_cpi_chart_page(pdf) -> str:
#     """
#     Find the page containing the KNBS CPI and
#     inflation charts.
#     """

#     for page_number, page in enumerate(pdf.pages):
#         text = page.extract_text() or ""

#         if (
#             "Figure 2: Inflation Trends" in text
#             and "Figure 1: Overall CPI" in text
#             and "Inflation" in text
#         ):
#             return text

#     raise ValueError(
#         "Could not find the KNBS CPI chart page."
#     )

# def extract_cpi_and_inflation(text: str) -> list[dict]:
#     """
#     Extract monthly CPI and year-on-year inflation
#     from the KNBS CPI chart page.
#     """

#     # --------------------------------------------------
#     # 1. CPI VALUES
#     # --------------------------------------------------

#     # The CPI values are the 13 numbers immediately
#     # before the CPI axis beginning at 140.00.

#     axis_match = re.search(
#         r"\n140\.00\s+142\.00\s+144\.00\s+146\.00",
#         text,
#     )

#     if not axis_match:
#         raise ValueError(
#             "Could not locate CPI axis."
#         )

#     before_axis = text[:axis_match.start()]

#     # Take the last 13 decimal numbers before the axis.
#     numbers = re.findall(
#         r"\d+\.\d+",
#         before_axis,
#     )

#     if len(numbers) < 13:
#         raise ValueError(
#             "Could not find 13 CPI values."
#         )

#     cpi_values = [
#         float(x)
#         for x in numbers[-13:]
#     ]

#     if len(cpi_values) != 13:
#         raise ValueError(
#             f"Expected 13 CPI values, "
#             f"got {len(cpi_values)}."
#         )

#     # --------------------------------------------------
#     # 2. CPI MONTHS
#     # --------------------------------------------------

#     after_axis = text[axis_match.end():]

#     month_matches = re.findall(
#         r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
#         r"-\s*(\d{2})",
#         after_axis,
#     )

#     if len(month_matches) < 13:
#         raise ValueError(
#             f"Expected 13 CPI months, "
#             f"got {len(month_matches)}."
#         )

#     cpi_months = month_matches[:13]

#     dates = [
#         date(
#             2000 + int(year),
#             MONTHS[month],
#             1,
#         )
#         for month, year in cpi_months
#     ]

#     # --------------------------------------------------
#     # 3. INFLATION VALUES
#     # --------------------------------------------------

#     inflation_marker = text.find(
#         "\n4.1\n"
#     )

#     if inflation_marker == -1:

#         # pypdf may put the first value immediately
#         # after another newline.
#         inflation_marker = text.find("4.1")

#     if inflation_marker == -1:
#         raise ValueError(
#             "Could not find first inflation value."
#         )

#     inflation_section = text[
#         inflation_marker:
#     ]

#     # Stop before the inflation axis.
#     axis_start = inflation_section.find(
#         "0.0"
#     )

#     if axis_start == -1:
#         raise ValueError(
#             "Could not locate inflation axis."
#         )

#     inflation_values_text = (
#         inflation_section[:axis_start]
#     )

#     inflation_values = re.findall(
#         r"\d+\.\d+",
#         inflation_values_text,
#     )

#     inflation_values = [
#         float(x)
#         for x in inflation_values[:13]
#     ]

#     if len(inflation_values) != 13:
#         raise ValueError(
#             f"Expected 13 inflation values, "
#             f"got {len(inflation_values)}."
#         )

#     # --------------------------------------------------
#     # 4. VALIDATE STRUCTURE
#     # --------------------------------------------------

#     if len(cpi_values) != len(dates):
#         raise ValueError(
#             "CPI values and dates have different lengths."
#         )

#     if len(inflation_values) != len(dates):
#         raise ValueError(
#             "Inflation values and dates have different lengths."
#         )

#     if len(dates) != 13:
#         raise ValueError(
#             f"Expected 13 months of data, got {len(dates)}."
#         )

#     # CPI should be a positive index.
#     if any(value <= 0 for value in cpi_values):
#         raise ValueError(
#             "CPI contains a non-positive value."
#         )

#     # Inflation percentage should be within a
#     # reasonable range.
#     if any(
#         value < -100 or value > 100
#         for value in inflation_values
#     ):
#         raise ValueError(
#             "Inflation contains an unrealistic value."
#         )

#     # Dates should be chronological.
#     if dates != sorted(dates):
#         raise ValueError(
#             "Observation dates are not chronological."
#         )

#     # No duplicate dates.
#     if len(set(dates)) != len(dates):
#         raise ValueError(
#             "Duplicate observation dates detected."
#         )
    
#     # --------------------------------------------------
#     # 5. BUILD OBSERVATIONS
#     # --------------------------------------------------

#     return [
#         {
#             "country_code": "KE",
#             "observation_date": observation_date,
#             "cpi": cpi,
#             "inflation": inflation,
#         }
#         for observation_date, cpi, inflation
#         in zip(
#             dates,
#             cpi_values,
#             inflation_values,
#         )
#     ]

import re
from datetime import date

def find_cpi_chart_page(pdf):
    """
    Find the actual page containing the KNBS CPI
    and inflation charts.
    """

    for page_number, page in enumerate(pdf.pages):
        text = page.extract_text() or ""

        # Don't accidentally select the Table of Contents
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
            print(
                f"Found CPI chart on PDF page {page_number + 1}"
            )
            return text

    raise ValueError(
        "Could not find the KNBS CPI and inflation chart page."
    )

def extract_cpi_and_inflation(text):
    """
    Extract the 13 monthly CPI and year-on-year inflation
    observations from a KNBS CPI report chart page.
    """

    # --------------------------------------------------
    # 1. Normalize PDF text
    # --------------------------------------------------

    text = text.replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text).strip()

    # --------------------------------------------------
    # 2. Find the CPI chart section
    # --------------------------------------------------

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

    # --------------------------------------------------
    # 3. Extract the CPI values
    # --------------------------------------------------

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

    # First 13 numbers are the actual CPI observations.
    cpi_values = cpi_values[:13]

    # --------------------------------------------------
    # 4. Extract inflation values
    # --------------------------------------------------

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

    # The first 13 are the actual inflation observations.
    inflation_values = inflation_values[:13]

    # --------------------------------------------------
    # 5. Dates
    # --------------------------------------------------

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

    # --------------------------------------------------
    # 6. Validate
    # --------------------------------------------------

    if len(cpi_values) != 13:
        raise ValueError(
            f"Expected 13 CPI values, got {len(cpi_values)}."
        )

    if len(inflation_values) != 13:
        raise ValueError(
            f"Expected 13 inflation values, got "
            f"{len(inflation_values)}."
        )

    # --------------------------------------------------
    # 7. Build normalized observations
    # --------------------------------------------------

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