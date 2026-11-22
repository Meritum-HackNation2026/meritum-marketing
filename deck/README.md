# Deck na konkurs MSZ

Wymagania z treści zadania: PDF, najwyżej 12 slajdów, a w nich problem, użytkownicy, architektura, demonstracja, wyniki testów, ryzyka i dalsze kroki.

Oba decki wyglądają jak produkt po zmianie na motyw Atrament (`design-system/DESIGN_SYSTEM.md`, sekcje 3 do 5): białe tło, czarny tekst, chłodne szarości i żadnego koloru poza plakietkami werdyktów. Tekst jest w kroju Schibsted Grotesk, identyfikatory i domeny w Azeret Mono, a słowo „meritum” w logotypie zostaje w Archivo.

- `meritum-deck.pptx`: deck zespołu, 12 slajdów z edytowalnym tekstem (PowerPoint, Google Slides, Keynote). Buduje go `build_team_deck.py`.
- `meritum-deck.pdf`: wersja wysyłana jury, eksport z PowerPointa. Po każdej zmianie PPTX trzeba ją wyeksportować od nowa (niżej).
- `meritum-own/`: nasza wersja tej samej historii, 12 slajdów (HTML jako źródło, PDF, PPTX i PNG slajdów) i dodatek poza limitem, opisane w `meritum-own/README.md`.
- `wzorzec/`: główny pitch zespołu po poprawkach Ani (22.11.2026), do którego porównujemy oba decki. Nie buduje go żaden skrypt.

Oba decki mają tę samą kolejność: tytuł, problem, użytkownicy i kanały, potok, wynik, prompt injection, źródła, architektura, wyniki pomiarów, koszty, skalowanie, ryzyka.

## Deck zespołu

```
uv run --with playwright --with python-pptx python deck/build_team_deck.py
```

Teksty slajdów są w `build_team_deck.py`, a notatki prowadzącego skrypt bierze z `<aside>` w `meritum-own/index.html`. Diagramy, zrzuty, ikony, logotyp i trzy tabele z liczbami (wyniki, koszty, skalowanie) skrypt wycina z `meritum-own/index.html`, więc oba decki pokazują te same obrazy i te same liczby, a poprawia się je w jednym miejscu. Tabele są przez to obrazami; ich treść jest w tekście alternatywnym. Ręczne zmiany w PPTX znikną przy następnym uruchomieniu skryptu, dlatego stałe poprawki tekstu wpisujemy do skryptu.

Plik wymaga krojów Schibsted Grotesk i Azeret Mono. Google Slides ma oba („Więcej czcionek”). W PowerPoincie i Keynote trzeba je najpierw zainstalować z fonts.google.com, inaczej program podstawi inny krój i tekst się przesunie. PDF dla jury: otwórz PPTX z zainstalowanymi krojami, wybierz Plik → Eksportuj → PDF i przejrzyj każdą stronę. Z wiersza poleceń robi to AppleScript (`save active presentation in (POSIX file …) as save as PDF`); PowerPoint zapisuje tylko w `~/Library/Group Containers/UBF8T346G9.Office/`, więc plik trzeba stamtąd skopiować.

Dopisek `--preview KATALOG` rysuje te same pola w tych samych miejscach w Chrome i zapisuje PNG slajdów. To kontrola układu z prawdziwymi krojami, a nie render z PowerPointa: łamanie wierszy może się różnić o słowo.

## Zasady

Każda liczba na slajdzie z wynikami pochodzi z raportów skryptu ewaluacji w `meritum-worker` (`evals/reports`) i ma komórkę w `docs/meritum-koszty-i-wyniki.xlsx`, w arkuszu „Liczby na slajdach”. Slajd pokazuje ostatni przebieg z raportem w repozytorium, także wtedy, gdy cel nie jest spełniony, a miernik bez pomiaru ma napis „brak pomiaru”. Koszty i skalowanie to szacunki i tak są podpisane, razem z założeniami.

## Arkusz i liczby

```
uv run --with openpyxl python docs/build_workbook.py --refresh ../worker   # czyta raporty z origin/develop
uv run --with openpyxl python -m unittest discover tests
```

`build_workbook.py` zapisuje arkusz bez policzonych wartości. Trzeba go raz otworzyć w Excelu i zapisać, bo test i slajdy czytają wartości. Po zmianie arkusza popraw liczby w `meritum-own/index.html` (slajdy 9 do 11 i dodatek) i przebuduj oba decki; test `tests/test_deck_numbers.py` wskaże liczbę, która się rozjechała.

Linki na slajdach 8 do 11 prowadzą do `https://meritum-static.gburek.app/` (`meritum-koszty-i-wyniki.xlsx`, `dodatek.html`). W HTML to przycisk, w PDF i PPTX klikalne pole z adresem, który da się przeczytać z wydruku.

Zrzuty strony głównej i strony „Sprawdź informację” pochodzą z wersji dev (scalona gałąź `develop`). Pasek postępu i strona wyniku nie są jeszcze scalone, więc te zrzuty pochodzą z prototypu (`meritum-frontend`, `lab/`), który nie łączy się z API i pokazuje wynik przykładowy z kontraktów. Każdy slajd ze zrzutem mówi w dopisku, skąd on jest. Strony „Jak działa” z prototypu nie pokazujemy, bo ma przykładowe mierniki, które wyglądałyby jak pomiar.
