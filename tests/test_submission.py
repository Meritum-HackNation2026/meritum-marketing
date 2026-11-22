"""Sprawdza submission.md: opis do 4000 znaków, wymagane sekcje, zakazane frazy."""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT = (ROOT / "submission.md").read_text(encoding="utf-8")
MAX_CHARS = 4000
FORBIDDEN = ["nask", "msz współpracuj", "współprac", "oraz scamu", "kampani", "botów"]
REQUIRED = [
    "architektur", "przepływ danych", "modele", "dostawc", "ograniczenia",
    "źródła", "licencj", "wyniki", "odtworz", "ryzyka", "docker compose",
]


def description() -> str:
    m = re.search(r"<!-- opis:start -->(.*?)<!-- opis:end -->", TEXT, re.S)
    assert m, "brak znaczników opis:start / opis:end"
    return m.group(1).strip()


class SubmissionTest(unittest.TestCase):
    def test_description_fits_limit(self):
        self.assertLessEqual(len(description()), MAX_CHARS)

    def test_description_has_required_topics(self):
        low = description().lower()
        missing = [w for w in REQUIRED if w not in low]
        self.assertEqual(missing, [])

    def test_no_forbidden_phrases(self):
        low = TEXT.lower()
        hits = [w for w in FORBIDDEN if w in low]
        self.assertEqual(hits, [])

    def test_simulated_data_label(self):
        self.assertIn("dane symulowane", TEXT.lower())


if __name__ == "__main__":
    unittest.main()
