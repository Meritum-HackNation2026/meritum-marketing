"""Build docs/meritum-koszty-i-wyniki.xlsx: assumptions, costs, scaling, forecast, results.

    uv run --with openpyxl python docs/build_workbook.py            # from docs/wyniki-ewaluacji.json
    uv run --with openpyxl python docs/build_workbook.py --refresh ../worker   # re-read the reports first

Every number is either an input on the sheet "Założenia" (with source and date) or a
formula. Evaluation results come from meritum-worker `evals/reports/` and are never typed
by hand: `--refresh` reads them with `git show` from origin/develop of the given checkout.
openpyxl writes no cached values, so open the file in Excel once and save it (README).
"""

import argparse
import json
import subprocess
from datetime import UTC, datetime
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

HERE = Path(__file__).parent
RESULTS = HERE / "wyniki-ewaluacji.json"
OUT = HERE / "meritum-koszty-i-wyniki.xlsx"
CHECKED = "2026-11-22"

# What the report JSON does not carry: label, code under test, technical failures, model cost of 100 checks
# (API mode leaves cost at 0) and strict macro-F1 (in the report schema only since worker#247).
# Runs 0-2 from evals/reports/fact-checks.md, runs 3-7b from evals/reports/research.md. None = not reported there.
RUN_NOTES = {
    "fact-checks-2026-11-22-0-bazowy.json": ("0 (bazowy)", "brak w raporcie", 10, 0.43, None),
    "fact-checks-2026-11-22-1.json": ("1", "brak w raporcie", 11, 0.54, None),
    "fact-checks-2026-11-22-2.json": ("2", "b491a9d (API 8468570)", 5, 0.60, None),
    "fact-checks-2026-11-22-3.json": ("3", "develop z migawką korpusu", 0, None, None),
    "fact-checks-2026-11-22-5.json": ("5", "+ worker#219, #224", 0, None, 0.62),
    "fact-checks-2026-11-22-7.json": ("7", "+ worker#228, #234", 0, None, 0.64),
    "fact-checks-2026-11-22-7b.json": ("7b", "jak 7, powtórzenie (+ core z #245)", 0, None, 0.65),
}
METRICS = ["cases", "macro_f1", "macro_f1_strict", "accuracy", "citation_coverage", "citation_precision",
           "citation_correctness", "abstention", "robustness", "median_seconds", "p95_seconds"]


def refresh(worker: Path) -> None:
    """Copy the metrics of every fact-check report on origin/develop into RESULTS."""
    git = lambda *a: subprocess.check_output(["git", "-C", str(worker), *a], text=True)  # noqa: E731
    commit = git("rev-parse", "--short", "origin/develop").strip()
    runs = []
    for name in RUN_NOTES:
        report = json.loads(git("show", f"origin/develop:evals/reports/{name}"))
        # check ids are UUIDv7, so the earliest one dates the start of the run
        first = min(int(o["check_id"].replace("-", "")[:12], 16) for o in report["outcomes"] if o.get("check_id"))
        started = datetime.fromtimestamp(first / 1000, UTC).strftime("%Y-%m-%d %H:%M")
        runs.append({"report": name, "started_utc": started, **{k: report.get(k) for k in METRICS}})
    RESULTS.write_text(json.dumps({"source": f"meritum-worker@{commit}:evals/reports", "runs": runs},
                                  indent=1, ensure_ascii=False) + "\n")


ARIAL = Font(name="Arial", size=10)
BOLD = Font(name="Arial", size=10, bold=True)
TITLE = Font(name="Arial", size=14, bold=True)
INPUT = Font(name="Arial", size=10, color="0000FF")
LINK = Font(name="Arial", size=10, color="008000")
ASSUME = PatternFill("solid", fgColor="FFFF00")
HEAD = PatternFill("solid", fgColor="E8EAED")
USD, USD4, PLN, INT, PCT, NUM2 = '#,##0.00 "USD"', '0.0000 "USD"', '#,##0 "zł"', "#,##0", "0.0%", "0.00"


def put(ws, ref, value, fmt=None, font=ARIAL, fill=None):
    cell = ws[ref]
    cell.value, cell.font = value, font
    cell.alignment = Alignment(vertical="top", wrap_text=isinstance(value, str) and not value.startswith("="))
    if fmt:
        cell.number_format = fmt
    if fill:
        cell.fill = fill
    return cell


def header(ws, row, labels, start=1):
    for i, label in enumerate(labels):
        put(ws, f"{get_column_letter(start + i)}{row}", label, font=BOLD, fill=HEAD)


def widths(ws, *sizes):
    for i, size in enumerate(sizes, 1):
        ws.column_dimensions[get_column_letter(i)].width = size


OR_URL = "https://openrouter.ai/api/v1/models (anthropic/claude-haiku-5.5)"
SEARCH_URL = "https://cloud.google.com/generative-ai-app-builder/pricing"
VM_URL = "https://cloud.google.com/products/compute/pricing/general-purpose (Warsaw, europe-central2)"
DISK_URL = "https://cloud.google.com/compute/disks-image-pricing (Warsaw, europe-central2)"
RUN_URL = "https://cloud.google.com/run/pricing"
COST_DOC = "docs/koszty-i-skalowanie.md §2: scripts/measure_costs.py na 49 CheckRecord z dev, 2026-11-22"
A = "ZAŁOŻENIE"

# key, label, value, unit, status, source. Status: cennik, pomiar, kod, ZAŁOŻENIE, wzór.
ASSUMPTIONS = [
    ("#", "Model językowy: Claude Haiku 5.5 przez OpenRouter (reasoning high), dev i prd"),
    ("price_in", "Cena tokenów wejścia", 0.10, "USD / mln tokenów", "cennik", OR_URL),
    ("price_out", "Cena tokenów wyjścia", 0.50, "USD / mln tokenów", "cennik", OR_URL),
    ("tok_in", "Tokeny wejścia na sprawdzenie", 4600, "tokeny", "pomiar", COST_DOC),
    ("tok_out", "Tokeny wyjścia na sprawdzenie", 1700, "tokeny", "pomiar", COST_DOC),
    ("calls", "Wywołania modelu na sprawdzenie", 3, "wywołania", "pomiar", COST_DOC + " (od 1 do 6)"),
    ("model_tok", "Koszt modelu z tokenów i cennika", "=({tok_in}*{price_in}+{tok_out}*{price_out})/1000000",
     "USD / sprawdzenie", "wzór", "kontrola: pomiar na 44 rekordach z prawdziwym modelem dał ok. 0,0013 USD"),
    ("model_sample", "Koszt modelu w ruchu zespołu (49 rekordów, w tym 5 na stubie)", 0.00118,
     "USD / sprawdzenie", "pomiar", COST_DOC + "; surowego eksportu nie ma w repozytorium"),
    ("model_bench", "Koszt modelu w ostatnim przebiegu benchmarku", "={last_cost100}/100",
     "USD / sprawdzenie", "pomiar", "arkusz Wyniki, przebieg 2: ostatni, dla którego koszt odczytano z CheckRecord na dev"),
    ("model", "Koszt modelu przyjęty do planowania (wyższy z pomiarów)", "=MAX({model_tok},{model_bench})",
     "USD / sprawdzenie", "wzór", "benchmark to pełny potok z wyszukiwarką; ruch zespołu jest lżejszy"),
    ("#", "Wyszukiwarka i bramki"),
    ("search_q", "Zapytania do wyszukiwarki na sprawdzenie", 0.9, "zapytania", "pomiar", COST_DOC),
    ("search_price", "Vertex AI Search, Enterprise Edition (wyszukiwanie w stronach WWW)", 4.00,
     "USD / 1000 zapytań", "cennik", SEARCH_URL + "; edycja z infra gcp/search/main.tf (SEARCH_TIER_ENTERPRISE)"),
    ("search_free", "Zapytania bez opłaty w miesiącu", 10000, "zapytania", "cennik", SEARCH_URL + " (Free Trial)"),
    ("factcheck", "Google Fact Check Tools API", 0, "USD / sprawdzenie", A,
     "API bez cennika; do potwierdzenia w konsoli GCP"),
    ("gates", "Bramki przed modelem: DLP, klasyfikator wstrzyknięć, embedding zapytania", 0.001,
     "USD / sprawdzenie", A, "niezmierzone (CheckRecord ich nie liczy); docs/koszty-i-skalowanie.md podaje „poniżej 0,005”"),
    ("cache", "Odsetek sprawdzeń z pamięci wyników", 0.20, "udział", A,
     "pomiar na dev: 0% (49 rekordów); pamięć API trzyma wynik 2 h (RESULT_CACHE_TTL, meritum-backend)"),
    ("#", "Obciążenie i przepustowość"),
    ("t_check", "Czas jednego sprawdzenia (mediana)", "={last_median}", "s", "pomiar",
     "arkusz Wyniki, ostatni przebieg (4 sprawdzenia naraz przez API dev)"),
    ("peak", "Szczyt ruchu względem średniej", 5, "razy", A, "brak danych o ruchu; do zmierzenia w pilotażu"),
    ("conc", "Sprawdzenia naraz na jednej replice workera", 4, "sprawdzenia", "pomiar",
     "tyle obsłużył jeden worker dev w benchmarku (--max-concurrency 4); górnej granicy nie mierzyliśmy"),
    ("api_conc", "Otwarte żądania na instancji API", 80, "żądania", A, "domyślna współbieżność Cloud Run"),
    ("days", "Dni w miesiącu", 30, "dni", A, "uproszczenie"),
    ("pending", "Limit oczekujących sprawdzeń w kolejce", 100, "sprawdzenia", "kod",
     "MAX_PENDING_CHECKS, meritum-backend limits/constants.py"),
    ("#", "Hosting: GCP europe-central2 (Terraform w meritum-infra gcp/app)"),
    ("hours", "Godziny w miesiącu", 730, "h", A, "konwencja cenników GCP"),
    ("vm_medium", "e2-medium (2 vCPU, 4 GiB): worker i baza w Terraformie", 0.04054188, "USD / h", "cennik", VM_URL),
    ("vm_std2", "e2-standard-2 (2 vCPU, 8 GiB)", 0.08108376, "USD / h", "cennik", VM_URL),
    ("vm_std4", "e2-standard-4 (4 vCPU, 16 GiB)", 0.16216752, "USD / h", "cennik", VM_URL),
    ("vm_std8", "e2-standard-8 (8 vCPU, 32 GiB)", 0.32433504, "USD / h", "cennik", VM_URL),
    ("disk", "Dysk pd-balanced", 0.000178082, "USD / GiB / h", "cennik", DISK_URL),
    ("snap", "Snapshoty dysku bazy", 0.000089041, "USD / GiB / h", A,
     DISK_URL + "; cena z cennika, ale regionu tej pozycji nie potwierdziłem"),
    ("boot", "Dysk systemowy workera", 10, "GiB", A, "do potwierdzenia w gcp/app/worker.tf"),
    ("run_cpu", "Cloud Run: vCPU (tier 1)", 0.000024, "USD / vCPU-s", "cennik", RUN_URL),
    ("run_mem", "Cloud Run: pamięć (tier 1)", 0.0000025, "USD / GiB-s", "cennik", RUN_URL),
    ("run_tier2", "Dopłata Cloud Run w regionie tier 2 (Warszawa jest w tier 2)", 1.4, "mnożnik", A,
     RUN_URL + ": tier Warszawy potwierdzony, stawek tier 2 nie odczytałem"),
    ("run_free", "Cloud Run: bezpłatne vCPU-sekundy w miesiącu", 180000, "vCPU-s", "cennik", RUN_URL),
    ("run_gib", "Pamięć instancji API", 0.5, "GiB", "kod", "meritum-infra gcp/app/api.tf (1 vCPU, 512 Mi)"),
    ("other", "NAT, Secret Manager, Artifact Registry, logi", 20, "USD / mies.", A,
     "docs/koszty-i-skalowanie.md §3 (wartości z pamięci autora)"),
    ("cf_pro", "Cloudflare Pro (od 100 tys. sprawdzeń)", 25, "USD / mies.", A, "cennik Cloudflare, niepotwierdzony dziś"),
    ("budget", "Budżet miesięczny w Terraformie", 100, "USD", "kod", "meritum-infra gcp/app/budget.tf"),
    ("#", "Dane"),
    ("kb_check", "Miejsce w bazie na jedno sprawdzenie (CheckRecord, stan DBOS)", 50, "kB", A, "niezmierzone"),
    ("retention", "Jak długo trzymamy CheckRecord", 1, "miesiące", "kod",
     "RECORD_RETENTION = 30 dni, meritum-worker checks/constants.py (ADR-13)"),
    ("corpus_gb", "Korpus z pgvector i indeksami", 5, "GiB", A, "niezmierzone"),
    ("#", "Waluta"),
    ("usdpln", "Kurs średni USD/PLN", 4.0613, "zł", "cennik",
     "NBP, tabela A nr 226/A/NBP/2026 z 2026-11-20, https://api.nbp.pl/api/exchangerates/rates/a/usd/"),
    ("#", "Prognoza: trzy scenariusze przyjęcia (wszystkie wartości to założenia)"),
    ("start", "Sprawdzenia w pierwszym miesiącu", 1000, "sprawdzenia", A, "pilotaż w jednej instytucji"),
    ("g_low", "Wzrost miesiąc do miesiąca: ostrożny", 0.15, "udział", A, ""),
    ("g_base", "Wzrost miesiąc do miesiąca: bazowy", 0.30, "udział", A, ""),
    ("g_high", "Wzrost miesiąc do miesiąca: szybki", 0.50, "udział", A, ""),
    ("cap", "Sufit ruchu", 10000000, "sprawdzenia / mies.", A, "najwyższy poziom z arkusza Skalowanie"),
]
LEVELS = [1000, 10000, 100000, 1000000, 10000000]
LEVEL_WHY = ["demo i testy zespołu", "pilotaż w jednej instytucji", "narzędzie polecane przez urząd albo redakcję",
             "usługa ogólnopolska", "szczyt przed wyborami albo w kryzysie"]

SCALING_TEXT = [
    ("Wąskie gardło", ["brak: jeden worker i jedna baza mają zapas",
                       "limity ruchu liczone w pamięci każdej instancji API (slowapi)",
                       "limity RPM/TPM dostawcy modelu; CPU workera nie pokazuje długości kolejki",
                       "PostgreSQL: kolejka DBOS, dane i korpus na jednej maszynie",
                       "jeden region i jeden dostawca modelu; tabele kolejki i rekordów rosną"]),
    ("Krok pionowy", ["bez zmian: e2-medium na workera i bazę",
                      "bez zmian",
                      "baza na e2-standard-2 i większy dysk",
                      "baza na e2-standard-4, pgBouncer przed bazą",
                      "baza na e2-standard-8"]),
    ("Krok poziomy", ["bez zmian",
                      "wspólny licznik limitów dla instancji API; autoskalowanie workerów po długości kolejki",
                      "kolejne repliki workera za kolejką DBOS; drugi dostawca modelu w zapasie",
                      "replika bazy do odczytu korpusu, osobna baza DBOS, workery w grupie autoskalowanej",
                      "dwie repliki do odczytu, partycjonowanie rekordów po miesiącu, drugi region w UE"]),
]
DB_VM = ["vm_medium", "vm_medium", "vm_std2", "vm_std4", "vm_std8"]
DB_NODES = [1, 1, 1, 2, 3]

OTHER = [  # label, value, source
    ("Wpisy w katalogu źródeł", 64, "meritum-core@b95f1ca src/meritum_core/corpus/catalog/catalog.yaml"),
    ("Źródła, z których korzystamy (bez 7 wpisów wyłączonych, np. przez robots.txt)", 57, "tamże, wpisy bez excluded: true"),
    ("w tym urzędowe, akty prawne i dane publiczne", 49, "tamże (kind: instytucja, dane_publiczne, akt_prawny)"),
    ("w tym serwisy fact-checkingowe", 8, "tamże (kind: fact_check)"),
    ("Wydawcy źródeł, z których korzystamy", 44, "tamże, różne publisher_id"),
    ("Kanały w kontrakcie (web, wtyczka, Discord, SMS, MCP)", 5, "meritum-core contracts/_types.py, Channel"),
    ("Golden set: przypadki, scenariusze A–J", 102, "meritum-worker@4cf906d evals/golden/cases.json"),
    ("w tym ataki prompt injection (scenariusz E)", 8, "tamże"),
    ("Benchmark sprawdzania faktów: przypadki", 64, "meritum-worker@4cf906d evals/golden/fact-checks.json"),
    ("Funkcje testowe: meritum-core", 513, "git grep 'def test_' w tests/, origin/main b95f1ca"),
    ("Funkcje testowe: meritum-worker", 610, "git grep 'def test_' w tests/, origin/develop 4cf906d"),
    ("Funkcje testowe: meritum-backend", 455, "git grep 'def test_' w tests/, origin/develop 5a01214"),
    ("Testy: meritum-frontend", 392, "git grep 'it(|test(' w *.test.ts(x), origin/develop 5629d03"),
    ("Testy: meritum-extension", 91, "jak wyżej, origin/main 04aafbc"),
    ("Testy: meritum-mocks", 37, "jak wyżej, origin/main ebc4dee"),
    ("DLP samymi wzorcami: wykryte dane osobowe", 0.5, "meritum-worker evals/reports/gates-2026-11-22-dlp-wzorce.json"),
    ("Pamięć wyników API: jak długo trzyma wynik [h]", 2, "RESULT_CACHE_TTL, meritum-backend@5a01214 checks/constants.py"),
    ("Limit sprawdzeń na minutę z jednego adresu IP", 10, "CHECKS_PER_IP_PER_MINUTE, meritum-backend@5a01214 limits/constants.py"),
    ("Długość odpowiedzi SMS [znaki]", 70, "UCS2_LIMIT, meritum-backend@5a01214 sms/constants.py"),
    ("Zapis sprawdzenia usuwamy po [dni]", 30, "RECORD_RETENTION, meritum-worker checks/constants.py (ADR-13)"),
    ("Odłożony zestaw twierdzeń (plan, jeszcze nie istnieje)", 18, "meritum-worker@4cf906d evals/reports/research.md"),
    ("Cytaty czekające na etykiety ludzi", 60, "tamże (labels-cit-60.csv)"),
]


def build() -> None:
    data = json.loads(RESULTS.read_text())
    runs = data["runs"]
    wb = Workbook()

    # --- Wyniki -------------------------------------------------------------------------
    wy = wb.active
    wy.title = "Wyniki"
    put(wy, "A1", "Wyniki ewaluacji: benchmark sprawdzania faktów (meritum-eval --api --judge)", font=TITLE)
    put(wy, "A2", f"Źródło: {data['source']} i evals/reports/fact-checks.md. Przebieg przez API dev, Haiku 5.5 "
        "(OpenRouter, reasoning high), Vertex AI Search, Fact Check API; 4 sprawdzenia naraz. Jeden wiersz na przebieg.")
    cols = ["Przebieg", "Start (UTC)", "Raport", "Kod", "Zestaw", "Przypadki", "Macro-F1", "Macro-F1 ścisłe",
            "Trafność", "Pokrycie cytatami", "Poprawność cytatów (sędzia-model)", "Cytaty z hosta ze źródeł wzorcowych",
            "Wstrzymanie bez dowodów", "Odporność na wstrzyknięcia", "Mediana [s]", "p95 [s]",
            "Błędy techniczne", "Koszt 100 sprawdzeń [USD]", "Koszt przebiegu [USD]"]
    header(wy, 4, cols)
    put(wy, "A5", "Cel MVP", font=BOLD)
    for col, target in {"G": 0.75, "H": 0.75, "J": 0.95, "K": 0.85, "M": 0.80, "N": 0.90, "O": 30}.items():
        put(wy, f"{col}5", target, PCT if col in "JKMN" else NUM2, font=INPUT)
    put(wy, "B5", "macro-F1 co najmniej 0,75; czas: mediana do 30 s (treść zadania, meritum-docs slownik.md)")
    first = 6
    none = "brak w raporcie"
    for i, run in enumerate(runs):
        r = first + i
        label, code, failures, cost100, strict = RUN_NOTES[run["report"]]
        strict = run.get("macro_f1_strict") or strict
        row = [label, run["started_utc"], run["report"], code, "evals/golden/fact-checks.json", run["cases"],
               run["macro_f1"], strict if strict is not None else none, run["accuracy"], run["citation_coverage"],
               run["citation_precision"], run["citation_correctness"], run["abstention"],
               run["robustness"] if run["robustness"] is not None else "brak pomiaru",
               run["median_seconds"], run["p95_seconds"], failures, cost100 if cost100 is not None else none,
               f'=IF(ISNUMBER(R{r}),R{r}*F{r}/100,"{none}")']
        fmts = [None, None, None, None, None, INT, NUM2, NUM2, NUM2, PCT, PCT, PCT, PCT, PCT, "0.0", "0.0", INT, USD, USD]
        for c, (value, fmt) in enumerate(zip(row, fmts, strict=True), 1):
            put(wy, f"{get_column_letter(c)}{r}", value, fmt, font=ARIAL if c == 19 else INPUT)
    last = first + len(runs) - 1
    cost_row = max(first + i for i, run in enumerate(runs) if RUN_NOTES[run["report"]][3] is not None)
    lr = last + 2
    put(wy, f"A{lr}", "Ostatni przebieg względem celu", font=BOLD)
    header(wy, lr + 1, ["Miernik", "Wynik", "Cel", "Spełniony?", "Uwaga"])
    checks = [
        ("Trafność werdyktu (macro-F1 z raportu)", "G", ">=", NUM2,
         "raport zalicza dopuszczalną alternatywę werdyktu jako etykietę oczekiwaną, więc klasa „wprowadzające w błąd” "
         "dostaje F1 = 1,0, chociaż potok tak nie odpowiada (evals/reports/research.md)"),
        ("Trafność werdyktu (macro-F1 ścisłe)", "H", ">=", NUM2,
         "liczone z etykiet, które potok naprawdę zwrócił; wartości przebiegów 5, 7 i 7b z research.md, "
         "od worker#247 pole macro_f1_strict jest w raporcie"),
        ("Pokrycie cytatami", "J", ">=", PCT, "twierdzenia z werdyktem rozstrzygającym, które mają cytat"),
        ("Poprawność cytatów (sędzia-model)", "K", ">=", PCT,
         "wymowę cytatu ocenia Haiku 5.5, który do worker#247 nie widział tytułu ani daty źródła; nowy sędzia dał "
         "dla cytatów przebiegu 7 wynik 0,94 (research.md), ale pełnego przebiegu z nim jeszcze nie ma"),
        ("Wstrzymanie bez dowodów", "M", ">=", PCT, "przypadki, w których system miał nie rozstrzygać i nie rozstrzygnął"),
        ("Odporność na wstrzyknięcia", "N", ">=", PCT,
         "benchmark nie ma ataków; 8 ataków jest w golden secie, który nie ma jeszcze przebiegu na dev"),
        ("Czas odpowiedzi (mediana, s)", "O", "<=", "0.0", "zegar od wysłania do wyniku przy 4 sprawdzeniach naraz"),
    ]
    for i, (name, col, op, fmt, note) in enumerate(checks):
        r = lr + 2 + i
        put(wy, f"A{r}", name)
        put(wy, f"B{r}", f"={col}{last}", fmt)
        put(wy, f"C{r}", f"={col}5", fmt)
        put(wy, f"D{r}", f'=IF(ISNUMBER(B{r}),IF(B{r}{op}C{r},"tak","nie"),"brak pomiaru")')
        put(wy, f"E{r}", note)
    res = {col: lr + 2 + i for i, (_, col, *_rest) in enumerate(checks)}  # metric column -> row of the summary
    summary = lr + 2 + len(checks)
    put(wy, f"A{summary}", "Cele spełnione (sześć celów; trafność liczona ściśle)", font=BOLD)
    put(wy, f"B{summary}", f'=COUNTIF(D{lr + 3}:D{summary - 1},"tak")', INT)
    put(wy, f"C{summary}", f"=ROWS(D{lr + 3}:D{summary - 1})", INT)
    put(wy, f"A{summary + 2}", "Czego tu nie ma: przebiegi 4 i 6b mają wyniki tylko w tabeli research.md (bez pliku "
        "raportu), a przebieg 6 jest nieważny (wdrożenie API w trakcie). Koszt modelu znamy dla przebiegów 0–2, "
        "bo API dev go nie zwraca i trzeba go odczytać z CheckRecord. Poprawności cytatów sprzed i po worker#247 "
        "nie wolno porównywać. Odświeżenie: python docs/build_workbook.py --refresh ../worker.")
    widths(wy, 40, 17, 34, 30, 28, 10, 10, 10, 10, 12, 14, 14, 12, 14, 10, 8, 10, 12, 12)
    wy.row_dimensions[4].height = 44
    ref = {"last_cost100": f"Wyniki!$R${cost_row}", "last_median": f"Wyniki!$O${last}"}

    # --- Założenia ----------------------------------------------------------------------
    za = wb.create_sheet("Założenia", 0)
    put(za, "A1", "Założenia: każda liczba wejściowa w jednym miejscu", font=TITLE)
    put(za, "A2", f"Ceny sprawdzone {CHECKED}. Niebieska czcionka: wartość wpisana. Żółte tło: założenie, którego nie "
        "potwierdza pomiar ani cennik; zmień je, a pozostałe arkusze przeliczą się same.")
    header(za, 4, ["Parametr", "Wartość", "Jednostka", "Status", "Źródło", "Sprawdzone"])
    row = 5
    pending = []
    for item in ASSUMPTIONS:
        if item[0] == "#":
            row += 1
            put(za, f"A{row}", item[1], font=BOLD)
            row += 1
            continue
        key, label, value, unit, status, source = item
        ref[key] = f"Założenia!$B${row}"
        pending.append((row, label, value, unit, status, source))
        row += 1
    for r, label, value, unit, status, source in pending:
        formula = isinstance(value, str)
        fmt = PCT if unit == "udział" else ("0.000000" if isinstance(value, float) and value < 0.01 or "sprawdzenie" in unit
                                             else "#,##0.####")
        put(za, f"A{r}", label)
        put(za, f"B{r}", value.format(**ref) if formula else value, fmt,
            font=(LINK if "Wyniki" in value else ARIAL) if formula else INPUT, fill=ASSUME if status == A else None)
        put(za, f"C{r}", unit)
        put(za, f"D{r}", status, fill=ASSUME if status == A else None)
        put(za, f"E{r}", source)
        put(za, f"F{r}", "" if formula else CHECKED)
    row += 1
    put(za, f"A{row}", "Poziomy przyjęcia (sprawdzenia miesięcznie)", font=BOLD)
    header(za, row + 1, ["Poziom", "Sprawdzenia / mies.", "Co oznacza", "Status"])
    level_ref = []
    for i, (level, why) in enumerate(zip(LEVELS, LEVEL_WHY, strict=True)):
        r = row + 2 + i
        put(za, f"A{r}", i + 1)
        put(za, f"B{r}", level, INT, font=INPUT, fill=ASSUME)
        put(za, f"C{r}", why)
        put(za, f"D{r}", A, fill=ASSUME)
        level_ref.append(f"Założenia!$B${r}")
    widths(za, 62, 16, 20, 13, 90, 12)

    f = lambda s: s.format(**ref)  # noqa: E731
    lv = [get_column_letter(2 + i) for i in range(len(LEVELS))]  # B..F

    # --- Skalowanie ---------------------------------------------------------------------
    sk = wb.create_sheet("Skalowanie")
    put(sk, "A1", "Skalowanie: co się zmienia na każdym poziomie i ile kosztuje hosting", font=TITLE)
    put(sk, "A2", "Architektura: API (FastAPI, Cloud Run) → kolejka DBOS w PostgreSQL → repliki workera (kontenery). "
        "Worker czeka głównie na model i wyszukiwarkę, więc skaluje się liczbą replik, a baza rozmiarem maszyny i replikami.")
    header(sk, 4, ["", *[f"Poziom {i + 1}" for i in range(len(LEVELS))], "Skąd"])
    rows = {  # name -> (row, formula template with {c} = column letter, format, note)
        "checks": (5, None, INT, "arkusz Założenia"),
        "uncached": (6, "={c}5*(1-{cache})", INT, "sprawdzenia, które idą przez model"),
        "persec": (7, "={c}6/({days}*86400)", "0.0000", "średnio na sekundę"),
        "conc": (8, "={c}7*{peak}*{t_check}", "0.0", "sprawdzenia naraz w szczycie"),
        "workers": (9, "=MAX(1,ROUNDUP({c}8/{conc},0))", INT, "repliki workera (poziomo)"),
        "rpm": (10, "={c}7*{peak}*60*{calls}", "0.0", "wywołania modelu na minutę w szczycie: porównaj z limitem dostawcy"),
        "api": (11, "=MAX(1,ROUNDUP({c}5/({days}*86400)*{peak}*{t_check}/{api_conc},0))", INT,
                "instancje API (Terraform dziś: najwyżej 3)"),
        "dbgb": (12, "={c}5*{kb_check}/1000000*{retention}+{corpus_gb}", "0.0", "dane w bazie, GiB"),
        "disk": (13, "=MAX(20,ROUNDUP({c}12*2/10,0)*10)", INT, "dysk bazy, GiB: dwukrotny zapas, nie mniej niż 20 (Terraform)"),
    }
    labels = {"checks": "Sprawdzenia miesięcznie", "uncached": "Sprawdzenia poza pamięcią wyników",
              "persec": "Średnio sprawdzeń na sekundę", "conc": "Sprawdzenia naraz w szczycie",
              "workers": "Repliki workera", "rpm": "Wywołania modelu na minutę w szczycie", "api": "Instancje API",
              "dbgb": "Dane w bazie [GiB]", "disk": "Dysk bazy [GiB]"}
    for key, (r, template, fmt, note) in rows.items():
        put(sk, f"A{r}", labels[key], font=BOLD)
        for i, c in enumerate(lv):
            put(sk, f"{c}{r}", f"={level_ref[i]}" if template is None else f(template.replace("{c}", c)), fmt,
                font=LINK if template is None else ARIAL)
        put(sk, f"G{r}", note)
    put(sk, "A14", "Maszyna bazy", font=BOLD)
    put(sk, "A15", "Cena maszyny bazy [USD/h]", font=BOLD)
    put(sk, "A16", "Węzły bazy (główny i repliki do odczytu)", font=BOLD)
    names = {"vm_medium": "e2-medium", "vm_std2": "e2-standard-2", "vm_std4": "e2-standard-4", "vm_std8": "e2-standard-8"}
    for i, c in enumerate(lv):
        put(sk, f"{c}14", names[DB_VM[i]], fill=ASSUME)
        put(sk, f"{c}15", f"={ref[DB_VM[i]]}", "0.0000", font=LINK)
        put(sk, f"{c}16", DB_NODES[i], INT, font=INPUT, fill=ASSUME)
    put(sk, "G14", "decyzja projektowa (założenie), wg docs/koszty-i-skalowanie.md §5")
    put(sk, "G16", "decyzja projektowa (założenie)")
    cost_rows = [
        (18, "Workery [USD/mies.]", "={c}9*({vm_medium}*{hours}+{boot}*{disk}*{hours})", "repliki × (e2-medium + dysk)"),
        (19, "Baza [USD/mies.]", "={c}16*({c}15*{hours}+{c}13*{disk}*{hours})+{c}12*{snap}*{hours}",
         "węzły × (maszyna + dysk) + snapshoty"),
        (20, "API na Cloud Run [USD/mies.]",
         "=MAX(0,MIN({c}5*{t_check},{c}11*{hours}*3600)-{run_free})*({run_cpu}+{run_gib}*{run_mem})*{run_tier2}",
         "czas instancji = sprawdzenia × czas, nie więcej niż instancje × miesiąc, minus pula bezpłatna"),
        (21, "Sieć, sekrety, logi, Cloudflare [USD/mies.]", "={other}+IF({c}5>=100000,{cf_pro},0)", "stałe"),
        (22, "Hosting razem [USD/mies.]", "=SUM({c}18:{c}21)", ""),
    ]
    for r, label, template, note in cost_rows:
        put(sk, f"A{r}", label, font=BOLD)
        for c in lv:
            put(sk, f"{c}{r}", f(template.replace("{c}", c)), USD, font=BOLD if r == 22 else ARIAL)
        put(sk, f"G{r}", note)
    for j, (label, texts) in enumerate(SCALING_TEXT):
        put(sk, f"A{24 + j}", label, font=BOLD)
        for c, text in zip(lv, texts, strict=True):
            put(sk, f"{c}{24 + j}", text)
        sk.row_dimensions[24 + j].height = 80
    put(sk, "G24", "kolejność wąskich gardeł: docs/koszty-i-skalowanie.md §5 i ADR-18")
    put(sk, "A28", "Czego ten arkusz nie liczy: CI (5 maszyn e2-standard-4 w gcp/gh-actions), środowisko dev, "
        "wariant on-prem (serwer zespołu) i praca ludzi; opis w docs/koszty-i-skalowanie.md.")
    widths(sk, 42, 26, 26, 26, 26, 26, 70)

    # --- Koszty -------------------------------------------------------------------------
    ko = wb.create_sheet("Koszty")
    put(ko, "A1", "Koszty miesięczne według poziomu przyjęcia", font=TITLE)
    put(ko, "A2", "Szacunek: ceny z cenników, zużycie z pomiarów na dev, reszta to założenia z arkusza Założenia. "
        "Nie obejmuje CI, środowiska dev ani pracy ludzi.")
    header(ko, 4, ["", *[f"Poziom {i + 1}" for i in range(len(LEVELS))], "Jak liczone"])
    kr = [
        (5, "Sprawdzenia miesięcznie", "=Skalowanie!{c}5", INT, ""),
        (6, "Sprawdzenia poza pamięcią wyników", "=Skalowanie!{c}6", INT, "pamięć wyników: arkusz Założenia"),
        (7, "Model językowy", "={c}6*{model}", USD, "sprawdzenia poza pamięcią × koszt modelu"),
        (8, "Wyszukiwarka", "=MAX(0,{c}6*{search_q}-{search_free})*{search_price}/1000+{c}6*{factcheck}", USD,
         "zapytania ponad pulę bezpłatną × cena"),
        (9, "Bramki przed modelem", "={c}6*{gates}", USD, "założenie"),
        (10, "Workery", "=Skalowanie!{c}18", USD, ""),
        (11, "Baza i dane", "=Skalowanie!{c}19", USD, "maszyny, dyski, snapshoty"),
        (12, "API", "=Skalowanie!{c}20", USD, ""),
        (13, "Sieć, sekrety, logi, Cloudflare", "=Skalowanie!{c}21", USD, ""),
        (14, "Razem [USD/mies.]", "=SUM({c}7:{c}13)", USD, ""),
        (15, "Razem [zł/mies.]", "={c}14*{usdpln}", PLN, "kurs NBP"),
        (16, "Koszt jednego sprawdzenia [USD]", "={c}14/{c}5", USD4, "razem / wszystkie sprawdzenia"),
        (17, "Koszt jednego sprawdzenia [gr]", "={c}16*{usdpln}*100", "0.0", ""),
        (18, "Największa pozycja", "=INDEX($A$7:$A$13,MATCH(MAX({c}7:{c}13),{c}7:{c}13,0))", None, ""),
        (19, "Udział największej pozycji", "=MAX({c}7:{c}13)/{c}14", PCT, ""),
        (20, "Model i wyszukiwarka w kosztach", "=({c}7+{c}8)/{c}14", PCT, ""),
        (21, "Hosting w kosztach", "=SUM({c}10:{c}13)/{c}14", PCT, ""),
    ]
    for r, label, template, fmt, note in kr:
        put(ko, f"A{r}", label, font=BOLD if r in (14, 15, 16) else ARIAL)
        for c in lv:
            put(ko, f"{c}{r}", f(template.replace("{c}", c)), fmt,
                font=LINK if template.startswith("=Skalowanie") else (BOLD if r in (14, 15, 16) else ARIAL))
        put(ko, f"G{r}", note)
    put(ko, "A23", "Koszt zmienny 1000 sprawdzeń poza pamięcią wyników (bez puli bezpłatnej)", font=BOLD)
    put(ko, "B23", f("=1000*({model}+{search_q}*{search_price}/1000+{factcheck}+{gates})"), USD)
    put(ko, "A24", "w tym model", font=ARIAL)
    put(ko, "B24", f("=1000*{model}"), USD)
    put(ko, "A25", "Ten sam koszt modelu w ruchu zespołu (pomiar z 49 rekordów)")
    put(ko, "B25", f("=1000*{model_sample}"), USD)
    put(ko, "A27", "Wrażliwość na pamięć wyników: model, wyszukiwarka i bramki [USD/mies.]", font=BOLD)
    header(ko, 28, ["Odsetek z pamięci", *[f"Poziom {i + 1}" for i in range(len(LEVELS))]])
    for j, hit in enumerate([0, 0.2, 0.5]):
        r = 29 + j
        put(ko, f"A{r}", hit, PCT, font=INPUT, fill=ASSUME)
        for c in lv:
            put(ko, f"{c}{r}", f(f"={c}$5*(1-$A{r})*({{model}}+{{gates}}+{{factcheck}})"
                                 f"+MAX(0,{c}$5*(1-$A{r})*{{search_q}}-{{search_free}})*{{search_price}}/1000"), USD)
    put(ko, "A33", "Skąd różnica wobec decku zespołu (deck/wzorzec): tamte ~150 / ~700 / ~7 tys. USD pochodzą z "
        "docs/koszty-i-skalowanie.md §4, czyli ze stałych 5 USD za 1000 sprawdzeń na model z wyszukiwarką i z cen GCP "
        "podanych w przybliżeniu. Ten arkusz bierze ceny z cenników, koszt modelu z benchmarku, wyszukiwarkę ponad pulę "
        "bezpłatną, bramki i liczbę replik workera z pomiaru przepustowości, więc od 100 tys. sprawdzeń wychodzi więcej. "
        "Oba wyniki to szacunki tego samego rzędu; decki z tego repozytorium podają liczby z arkusza.")
    widths(ko, 58, 18, 18, 18, 18, 18, 52)

    # --- Prognoza -----------------------------------------------------------------------
    pr = wb.create_sheet("Prognoza")
    put(pr, "A1", "Prognoza na 24 miesiące: trzy scenariusze przyjęcia", font=TITLE)
    put(pr, "A2", "Sprawdzenia rosną o stały procent miesięcznie aż do sufitu. Koszt = model, wyszukiwarka i bramki "
        "dla sprawdzeń poza pamięcią wyników + hosting poziomu, w którym mieści się ruch (arkusz Skalowanie). "
        "Tempo wzrostu to założenie, nie pomiar.")
    put(pr, "B4", "Ostrożny", font=BOLD)
    put(pr, "E4", "Bazowy", font=BOLD)
    put(pr, "H4", "Szybki", font=BOLD)
    header(pr, 5, ["Miesiąc", *["Sprawdzenia", "Koszt [USD]", "Narastająco [USD]"] * 3])
    for m in range(1, 25):
        r = 5 + m
        put(pr, f"A{r}", m, INT)
        for col, growth in zip("BEH", ["g_low", "g_base", "g_high"], strict=True):
            c1, c2 = get_column_letter(ord(col) - 63), get_column_letter(ord(col) - 62)
            put(pr, f"{col}{r}", f(f"=MIN({{cap}},{{start}}*(1+{{{growth}}})^($A{r}-1))"), INT)
            u = f"{col}{r}*(1-{{cache}})"
            put(pr, f"{c1}{r}", f(f"={u}*({{model}}+{{gates}}+{{factcheck}})"
                                  f"+MAX(0,{u}*{{search_q}}-{{search_free}})*{{search_price}}/1000"
                                  f"+INDEX(Skalowanie!$B$22:$F$22,MIN(5,COUNTIF(Skalowanie!$B$5:$F$5,\"<\"&{col}{r})+1))"), USD)
            put(pr, f"{c2}{r}", f"=SUM({c1}$6:{c1}{r})", USD)
    put(pr, "A31", "Po 12 miesiącach", font=BOLD)
    put(pr, "A32", "Po 24 miesiącach", font=BOLD)
    for col in "BCDEFGHIJ":
        fmt = INT if col in "BEH" else USD
        put(pr, f"{col}31", f"={col}17", fmt, font=BOLD)
        put(pr, f"{col}32", f"={col}29", fmt, font=BOLD)
    widths(pr, 18, 14, 16, 18, 14, 16, 18, 14, 16, 18)

    # --- Inne mierniki ------------------------------------------------------------------
    im = wb.create_sheet("Inne mierniki")
    put(im, "A1", "Inne liczby o projekcie, z miejscem, z którego pochodzą", font=TITLE)
    put(im, "A2", f"Policzone {CHECKED} na podanych commitach. Liczba testów to definicje testów w kodzie "
        "(testy parametryzowane liczą się raz), nie wynik przebiegu CI.")
    header(im, 4, ["Miernik", "Wartość", "Źródło"])
    for i, (label, value, source) in enumerate(OTHER):
        put(im, f"A{5 + i}", label)
        put(im, f"B{5 + i}", value, PCT if isinstance(value, float) else INT, font=INPUT)
        put(im, f"C{5 + i}", source)
    end = 5 + len(OTHER)
    put(im, f"A{end}", "Testy we wszystkich repozytoriach razem", font=BOLD)
    tests = [5 + i for i, row in enumerate(OTHER) if row[0].startswith(("Funkcje testowe", "Testy:"))]
    put(im, f"B{end}", f"=SUM(B{tests[0]}:B{tests[-1]})", INT, font=BOLD)
    put(im, f"A{end + 1}", "Koszt modelu na 1000 sprawdzeń w ruchu zespołu [USD]", font=BOLD)
    put(im, f"B{end + 1}", f("=1000*{model_sample}"), USD, font=LINK)
    put(im, f"C{end + 1}", COST_DOC)
    put(im, f"A{end + 2}", "Koszt modelu na 1000 sprawdzeń w benchmarku [USD]", font=BOLD)
    put(im, f"B{end + 2}", f("=1000*{model_bench}"), USD, font=LINK)
    put(im, f"C{end + 2}", "arkusz Wyniki, przebieg 2 (ostatni ze znanym kosztem)")
    widths(im, 58, 14, 90)

    # --- Liczby na slajdach --------------------------------------------------------------
    ls = wb.create_sheet("Liczby na slajdach")
    put(ls, "A1", "Liczby na slajdach: gdzie w arkuszu jest każda liczba z decków", font=TITLE)
    put(ls, "A2", "Dotyczy deck/meritum-own (12 slajdów i dodatek) oraz deck/meritum-deck.pptx: oba mają te same liczby "
        "na tych samych slajdach. Kolumna C czyta wartość z komórki z kolumny D, więc po zmianie założeń widać, "
        "co trzeba poprawić na slajdzie.")
    header(ls, 4, ["Slajd", "Napis na slajdzie", "Wartość w arkuszu", "Komórka"])
    om = lambda label: f"'Inne mierniki'!B{5 + next(i for i, row in enumerate(OTHER) if row[0].startswith(label))}"  # noqa: E731
    W, K, S, P = "Wyniki!", "Koszty!", "Skalowanie!", "Prognoza!"
    numbers = [
        ("1, 7", "57 źródeł", om("Źródła, z których")), ("7", "49 źródeł urzędowych i danych publicznych", om("w tym urzędowe")),
        ("7", "8 serwisów fact-checkingowych", om("w tym serwisy")), ("7", "64 wpisy w katalogu", om("Wpisy w katalogu")),
        ("7", "44 wydawców", om("Wydawcy")),
        ("2, 9", "64 przypadki (twierdzenia) benchmarku", f"{W}F{last}"),
        ("2, 9", "53 werdykty trafne", f"ROUND({W}I{last}*{W}F{last},0)"),
        ("2, 9", "11 błędów (niepotrzebnych wstrzymań)", f"{W}F{last}-ROUND({W}I{last}*{W}F{last},0)"),
        ("3", "pięć kanałów", om("Kanały")), ("3", "wynik trzymamy 2 godziny", om("Pamięć wyników API")),
        ("3", "SMS: 70 znaków", om("Długość odpowiedzi SMS")),
        ("6, 9, 12", "8 ataków w golden secie", om("w tym ataki")), ("9", "golden set: 102 przypadki", om("Golden set")),
        ("8", "2098 testów w sześciu repozytoriach", f"'Inne mierniki'!B{5 + len(OTHER)}"),
        ("9", "przebieg 7b, 22.11.2026, 07:24 UTC", f"{W}B{last}"),
        ("9, 12", "trafność werdyktu 0,82 (macro-F1 z raportu)", f"{W}G{last}"),
        ("9, 12", "trafność liczona ściśle 0,65", f"{W}H{last}"),
        ("9, 12", "pokrycie cytatami 90%", f"{W}J{last}"), ("9", "poprawność cytatów 83%", f"{W}K{last}"),
        ("9", "wstrzymanie bez dowodów 100%", f"{W}M{last}"), ("9, 11, 12", "czas odpowiedzi 50 s (mediana)", f"{W}O{last}"),
        ("9", "0 błędów technicznych", f"{W}Q{last}"),
        ("9", "przebieg 0: 0,46", f"{W}G{first}"), ("9", "przebieg 0: pokrycie 100%", f"{W}J{first}"),
        ("9", "przebieg 0: poprawność 45%", f"{W}K{first}"), ("9", "przebieg 0: wstrzymanie 86%", f"{W}M{first}"),
        ("9", "przebieg 0: 39 s", f"{W}O{first}"),
        ("9", "cele: 0,75 / 95% / 85% / 80% / 90% / 30 s", f"{W}G5"),
        ("9", "zestaw 18 twierdzeń", om("Odłożony zestaw")), ("9", "60 cytatów ocenionych przez ludzi", om("Cytaty czekające")),
        *[("10", f"koszt miesięczny, poziom {i + 1}: {t} USD", f"{K}{c}14") for i, (c, t) in enumerate(zip(lv, ["89", "151", "1 064", "9 551", "93 106"], strict=True))],
        *[("10", f"jedno sprawdzenie, poziom {i + 1}: {t} gr", f"{K}{c}17") for i, (c, t) in enumerate(zip(lv, ["36", "6,1", "4,3", "3,9", "3,8"], strict=True))],
        *[("10", f"udział serwerów, poziom {i + 1}: {t}%", f"{K}{c}21") for i, (c, t) in enumerate(zip(lv, [94, 63, 24, 12, 9], strict=True))],
        *[("10", f"udział modelu i wyszukiwarki, poziom {i + 1}: {t}%", f"{K}{c}20") for i, (c, t) in enumerate(zip(lv, [5, 32, 68, 80, 82], strict=True))],
        ("10", "model: 6 USD za 1000 sprawdzeń w benchmarku", f"{K}B24"), ("10", "model: 1,2 USD w ruchu zespołu", f"{K}B25"),
        ("10", "kurs NBP 4,06 zł", ref["usdpln"]), ("10", "20% odpowiedzi z pamięci wyników", ref["cache"]),
        ("10, 11", "szczyt 5 razy ponad średnią", ref["peak"]), ("10", "bramki 1 USD za 1000", f"1000*{ref['gates']}"),
        *[("11", f"naraz w szczycie, poziom {i + 2}: {t}", f"{S}{c}8") for i, (c, t) in enumerate(zip(lv[1:], [1, 8, 77, 769], strict=True))],
        *[("11", f"repliki workera, poziom {i + 3}: {t}", f"{S}{c}9") for i, (c, t) in enumerate(zip(lv[2:], [2, 20, 193], strict=True))],
        *[("11", f"serwery miesięcznie, poziom {i + 2}: {t} USD", f"{S}{c}22") for i, (c, t) in enumerate(zip(lv[1:], ["95", "256", "1 111", "8 346"], strict=True))],
        ("11", "28 wywołań modelu na minutę w szczycie", f"{S}D10"), ("11", "4 sprawdzenia naraz na replice", ref["conc"]),
        ("11", "ponad 100 oczekujących sprawdzeń: 429", ref["pending"]),
        ("12", "zapis usuwamy po 30 dniach", om("Zapis sprawdzenia")), ("12", "10 sprawdzeń na minutę z jednego adresu", om("Limit sprawdzeń")),
        ("dodatek D3", "ostrożny: 4 652 sprawdzeń i 121 USD po 12 mies.", f"{P}C31"), ("dodatek D3", "ostrożny: 427 USD w 24. mies., razem 4 497 USD", f"{P}D32"),
        ("dodatek D3", "bazowy: 17 922 sprawdzeń i 368 USD po 12 mies.", f"{P}F31"), ("dodatek D3", "bazowy: 4 612 USD w 24. mies., razem 24 443 USD", f"{P}G32"),
        ("dodatek D3", "szybki: 86 498 sprawdzeń i 949 USD po 12 mies.", f"{P}I31"), ("dodatek D3", "szybki: 93 106 USD w 24. mies., razem 333 185 USD", f"{P}J32"),
    ]
    for i, (slide, shown, cell) in enumerate(numbers):
        r = 5 + i
        put(ls, f"A{r}", slide)
        put(ls, f"B{r}", shown)
        put(ls, f"C{r}", f"={cell}", "General", font=LINK)
        put(ls, f"D{r}", cell.replace("$", ""))
    widths(ls, 14, 62, 20, 44)

    for ws in wb:
        ws.sheet_view.showGridLines = False
        ws.freeze_panes = "B5" if ws.title in ("Skalowanie", "Koszty") else None
    wb.save(OUT)
    print(OUT)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh", type=Path, metavar="WORKER_CHECKOUT")
    args = parser.parse_args()
    if args.refresh:
        refresh(args.refresh)
    build()
