"""Liczby na slajdach muszą być w arkuszu, a decki mieścić się w 12 slajdach.

    uv run --with openpyxl python -m unittest discover tests

Czyta wartości policzone przez Excela (arkusz trzeba raz otworzyć i zapisać, README w deck/).
"""
import re
import unittest
import zipfile
from pathlib import Path

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parent.parent
OWN = ROOT / "deck" / "meritum-own"
HTML = (OWN / "index.html").read_text(encoding="utf-8")
BOOK = load_workbook(ROOT / "docs" / "meritum-koszty-i-wyniki.xlsx", data_only=True)
MAX_SLIDES = 12


def pl(value: float, digits: int = 0) -> str:
    """1063.77 -> '1 064', 0.8205 -> '0,82' (thin grouping by space, decimal comma)."""
    return f"{value:,.{digits}f}".replace(",", " ").replace(".", ",")


def last_run() -> int:
    ws = BOOK["Wyniki"]
    return max(r for r in range(6, 40) if str(ws[f"C{r}"].value or "").startswith("fact-checks-"))


class DeckNumbersTest(unittest.TestCase):
    def test_every_mapped_number_has_a_value(self):
        ws = BOOK["Liczby na slajdach"]
        empty = [row[1] for row in ws.iter_rows(min_row=5, values_only=True) if row[1] and row[2] in (None, "")]
        self.assertEqual(empty, [], "arkusz bez policzonych wartości: otwórz go w Excelu i zapisz")

    def test_costs_on_the_slide_match_the_workbook(self):
        ws = BOOK["Koszty"]
        for col in "BCDEF":
            self.assertIn(f">{pl(ws[f'{col}14'].value)} USD<", HTML, f"koszt miesięczny Koszty!{col}14")
            gr = ws[f"{col}17"].value
            self.assertIn(f">{pl(gr, 0 if gr >= 10 else 1)} gr<", HTML, f"koszt sprawdzenia Koszty!{col}17")

    def test_scaling_on_the_slide_matches_the_workbook(self):
        ws = BOOK["Skalowanie"]
        for col in "CDEF":
            self.assertIn(f">{pl(ws[f'{col}22'].value)} USD<", HTML, f"serwery Skalowanie!{col}22")
            self.assertIn(f'<td class="num">{pl(max(1, ws[f"{col}8"].value))}</td>', HTML, f"naraz w szczycie Skalowanie!{col}8")
        for col in "DEF":
            self.assertRegex(HTML, rf"\b{ws[f'{col}9'].value} replik", f"repliki workera Skalowanie!{col}9")

    def test_results_on_the_slide_are_the_last_run(self):
        ws, r = BOOK["Wyniki"], last_run()
        slide = HTML[HTML.index('<section class="slide res">'):]
        slide = slide[:slide.index("</section>")]
        self.assertIn(f"Przebieg {ws[f'A{r}'].value}", slide)
        shown = [pl(ws[f"G{r}"].value, 2), pl(ws[f"H{r}"].value, 2), f"{pl(ws[f'J{r}'].value * 100)}%",
                 f"{pl(ws[f'K{r}'].value * 100)}%", f"{pl(ws[f'M{r}'].value * 100)}%", f"{pl(ws[f'O{r}'].value)} s"]
        self.assertEqual([v for v in shown if v not in slide], [])
        self.assertIn("nie zmierzono", slide)  # injection resistance is not measured, the slide must say so

    def test_decks_fit_the_contest_limit(self):
        self.assertLessEqual(len(re.findall(r'<section class="slide [a-z]', HTML)), MAX_SLIDES)
        with zipfile.ZipFile(ROOT / "deck" / "meritum-deck.pptx") as z:
            slides = [n for n in z.namelist() if re.fullmatch(r"ppt/slides/slide\d+\.xml", n)]
        self.assertLessEqual(len(slides), MAX_SLIDES)

    def test_no_invented_source_in_our_decks(self):
        team = (ROOT / "deck" / "build_team_deck.py").read_text(encoding="utf-8")
        for text in (HTML, team):
            self.assertNotIn("rzetelnyprzeglad", text.lower())
            self.assertNotIn("firecrawl", text.lower())


if __name__ == "__main__":
    unittest.main()
