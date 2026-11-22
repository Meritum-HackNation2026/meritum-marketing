# Nasza wersja decku

Ta sama historia co w `../meritum-deck.pptx`, złożona w HTML: 12 slajdów w motywie Atrament. Kolory pochodzą z `design-system/tokens/meritum.css` (białe tło, czarny tekst, chłodne szarości, kolor tylko w plakietkach werdyktów), krój to Schibsted Grotesk, a Azeret Mono służy do identyfikatorów i domen. Logotyp zostaje w Archivo. Slajdy nie mają kart ani linii między sekcjami. Jedyne ramki to okno zrzutu z prototypu i granica serwera na diagramie architektury. Powtarza się znak z produktu: polski cudzysłów otwierający przy cytowanym twierdzeniu.

| Plik | Co to jest |
|---|---|
| `index.html` | źródło slajdów, z notatkami prowadzącego w `<aside>` |
| `meritum-own.pdf` | wersja dla jury |
| `meritum-own.pptx` | te same slajdy jako obrazy, z notatkami prowadzącego (do pokazu w PowerPoincie albo Google Slides) |
| `slides/` | każdy slajd jako PNG 1920 × 1080 |
| `assets/ui-*.png` | zrzuty z prototypu interfejsu (`meritum-frontend`, `lab/`), tryb jasny, okno 1440 × 900 i 390 × 844, skala 2 |
| `assets/brands/` | logotypy technologii z Simple Icons (CC0; znaki należą do właścicieli) |
| `photos/` | zdjęcia z Unsplash, autorzy w `photos/CREDITS.md` |

Zmiany robimy w `index.html`, potem z katalogu głównego repo:

```
uv run --with playwright --with python-pptx python deck/meritum-own/build.py
```

Skrypt otwiera Chrome bez okna, zapisuje PNG, PDF i PPTX i przerywa, gdy slajdów jest więcej niż 12. Kroje ładują się z Google Fonts, więc potrzebny jest internet. Po zmianie diagramu albo zrzutu uruchom też `deck/build_team_deck.py`, bo deck zespołu bierze obrazy stąd.

## Diagramy

- Slajd 4: każdy kanał wysyła `CheckRequest` do jednego API i dostaje `CheckResult` (`meritum-docs`, `kanaly.md`).
- Slajd 5: kroki sprawdzenia z trzema wyszukiwaniami naraz (`meritum-docs`, `jak-dziala/sprawdzenie.md`).
- Slajd 10: kontenery i usługi zewnętrzne (`meritum-docs`, `architektura/index.md`). Cloudflare, gateway, DBOS i Hono nie mają logotypu w `design-system/presentation/icons/brands/`, więc stoją przy nich ikony Lucide albo sama nazwa.

Ikony to Lucide (licencja ISC), w kolorze tekstu i zawsze obok tekstu.

## Co jest przykładem

Slajd 11 nie ma liczb: kolumna wyników czeka na pierwszy przebieg skryptu ewaluacji (meritum-worker#40). Zrzuty na slajdach 1, 3, 6 i 7 pochodzą z prototypu bez połączenia z API i pokazują wynik przykładowy, co mówi dopisek na każdym z nich. Cytaty na tych zrzutach są prawdziwe: art. 127 ust. 2 Konstytucji RP. Plotka na slajdzie 2 i tekst z poleceniem na slajdzie 8 to przykłady do pokazu.
