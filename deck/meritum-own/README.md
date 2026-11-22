# Nasza wersja decku

Ta sama historia co w `../meritum-deck.pptx`, złożona w HTML: 12 slajdów w motywie Atrament. Kolory pochodzą z `design-system/tokens/meritum.css` (białe tło, czarny tekst, chłodne szarości, kolor tylko w plakietkach werdyktów), krój to Schibsted Grotesk, a Azeret Mono służy do identyfikatorów i domen. Logotyp zostaje w Archivo. Slajdy nie mają kart ani linii między sekcjami. Jedyne ramki to okno zrzutu z prototypu, granica serwera na diagramach architektury i przerywany obrys kontenera planowanego w dodatku. Powtarza się znak z produktu: polski cudzysłów otwierający przy cytowanym twierdzeniu.

| Plik | Co to jest |
|---|---|
| `index.html` | źródło slajdów, z notatkami prowadzącego w `<aside>` |
| `meritum-own.pdf` | wersja dla jury |
| `meritum-own.pptx` | te same slajdy jako obrazy, z notatkami prowadzącego (do pokazu w PowerPoincie albo Google Slides) |
| `slides/` | każdy slajd jako PNG 1920 × 1080; `dodatek-NN.png` to strony dodatku |
| `dodatek.html`, `dodatek.pdf` | dodatek poza 12 slajdami dla jury: pełny diagram kontenerów (D1), siedem przebiegów benchmarku (D2), prognoza kosztu na 24 miesiące (D3) |
| `assets/ui-home.png`, `ui-form-mobile.png` | zrzuty scalonej strony głównej i strony „Sprawdź informację” z meritum-dev.gburek.app (gałąź `develop`), tryb jasny, okno 1440 × 900 i 390 × 844, skala 2 |
| `assets/ui-false.png`, `ui-abstain.png` | zrzuty z prototypu interfejsu (`meritum-frontend`, `lab/`), te same ustawienia; strona wyniku nie jest jeszcze scalona. `ui-progress.png` (pasek postępu) został w katalogu, ale slajd z nim wypadł |
| `assets/brands/` | logotypy technologii z Simple Icons (CC0; znaki należą do właścicieli) |
| `photos/` | zdjęcia z Unsplash, autorzy w `photos/CREDITS.md` |

Zmiany robimy w `index.html`, potem z katalogu głównego repo:

```
uv run --with playwright --with python-pptx python deck/meritum-own/build.py
```

Skrypt otwiera Chrome bez okna, zapisuje PNG, PDF i PPTX, potem dodatek, i przerywa, gdy slajdów jest więcej niż 12. Kroje ładują się z Google Fonts, więc potrzebny jest internet. Po zmianie diagramu albo zrzutu uruchom też `deck/build_team_deck.py`, bo deck zespołu bierze obrazy stąd.

## Diagramy

- Slajd 4: kroki sprawdzenia z trzema wyszukiwaniami naraz (`meritum-docs`, `jak-dziala/sprawdzenie.md`).
- Slajd 8: uproszczony diagram kontenerów. Każdy węzeł ma logotyp z Simple Icons albo ikonę Lucide.
- Dodatek D1: pełny diagram kontenerów według diagramu właściciela, przerysowany na białym tle. Każdy element sprawdziliśmy w kodzie 22.11.2026 (worker 4cf906d, backend 5a01214, core b95f1ca, infra d2c4317). Różnice wobec pierwowzoru: wyszukiwarką jest Vertex AI Search, Firecrawla w kodzie nie ma; Vertex AI daje dziś embeddingi (`gemini-embedding-001`), a modelem jest Claude Haiku 5.5 przez OpenRouter; makieta Discorda jest jedną z sześciu platform w makietach; worker ma 18 workflowów, diagram wymienia 11. Crawl4AI ma adapter w `meritum-core`, ale nie jest wdrożony, więc stoi jako planowany. DBOS, TanStack (znak TanStack Query), sms-gate.app, Crawl4AI, Microsoft i magazyn plików nie mają własnego znaku w Simple Icons, więc stoi przy nich sama nazwa.

Ikony to Lucide (licencja ISC), w kolorze tekstu i zawsze obok tekstu.

## Liczby

Wyniki, koszty i skalowanie (slajdy 9 do 11, dodatek D2 i D3) pochodzą z `docs/meritum-koszty-i-wyniki.xlsx`; arkusz „Liczby na slajdach” podaje komórkę każdej liczby, a `tests/test_deck_numbers.py` pilnuje zgodności. Wykres udziałów na slajdzie 10 używa trzech szarości z palety Atrament zamiast barw: walidator palety ze skilla `dataviz` zalicza odstęp między nimi, a przy najjaśniejszej wymaga podpisów, więc udziały są wypisane pod paskami.

## Co jest przykładem

Zrzuty na slajdach 1 i 3 to scalone strony z wersji dev; wynik na slajdzie 1 strona sama podpisuje jako przykładowy. Zrzuty na slajdzie 5 pochodzą z prototypu bez połączenia z API i pokazują wynik przykładowy. Dopisek na każdym slajdzie mówi, skąd jest zrzut. Cytaty na zrzutach są prawdziwe: art. 127 ust. 2 Konstytucji RP. Plotka na slajdzie 2 to przypadek `A-fc-od-stycznia-gotowka` z benchmarku, a tekst z poleceniem na slajdzie 6 to przykład do pokazu.
