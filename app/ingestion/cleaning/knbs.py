import re


def clean_knbs_text(text: str) -> str:
    """
    Basic normalization of extracted KNBS PDF text.
    """

    # Normalize whitespace
    text = re.sub(r"[ \t]+", " ", text)

    # Normalize excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()