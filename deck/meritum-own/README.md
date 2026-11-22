# Nasza wersja decku

Ta sama historia co w `../meritum-deck.pptx`, złożona na design systemie Meritum: 12 slajdów, kolory z `tokens/meritum.css`, Archivo i Azeret Mono, logo z `brand/`, zrzuty z makiet z `presentation/screenshots/`. Motyw, który się powtarza: zaznaczony fragment cytatu, czyli to, co Meritum sprawdza słowo w słowo, zanim pokaże werdykt.

| Plik | Co to jest |
|---|---|
| `index.html` | źródło slajdów, z notatkami prowadzącego w `<aside>` |
| `meritum-own.pdf` | wersja dla jury |
| `meritum-own.pptx` | te same slajdy jako obrazy, z notatkami prowadzącego (do pokazu w PowerPoincie albo Google Slides) |
| `slides/` | każdy slajd jako PNG 1920 × 1080 |
| `assets/` | logo i zrzuty z design systemu |
| `photos/` | zdjęcia z Unsplash, autorzy w `photos/CREDITS.md` |

Zmiany robimy w `index.html`, potem z katalogu głównego repo:

```
uv run --with playwright --with python-pptx python deck/meritum-own/build.py
```

Skrypt otwiera Chrome bez okna, zapisuje PNG, PDF i PPTX i przerywa, gdy slajdów jest więcej niż 12. Kroje pisma ładują się z Google Fonts, więc potrzebny jest internet.

Slajd 11 nie ma jeszcze liczb: kolumna wyników czeka na pierwszy przebieg skryptu ewaluacji (meritum-worker#40). Wszystko inne, co pochodzi z makiet, ma dopisek „przykład do pokazu” albo „dane symulowane”. Cytat na slajdzie 1 to prawdziwy art. 127 ust. 2 Konstytucji RP.
