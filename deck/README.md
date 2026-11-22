# Deck na konkurs MSZ

Wymagania z treści zadania: PDF, najwyżej 12 slajdów, a w nich problem, użytkownicy, architektura, demonstracja, wyniki testów, ryzyka i dalsze kroki.

Oba decki wyglądają jak produkt po zmianie na motyw Atrament (`design-system/DESIGN_SYSTEM.md`, sekcje 3 do 5): białe tło, czarny tekst, chłodne szarości i żadnego koloru poza plakietkami werdyktów. Tekst jest w kroju Schibsted Grotesk, identyfikatory i domeny w Azeret Mono, a słowo „meritum” w logotypie zostaje w Archivo.

- `meritum-deck.pptx`: deck zespołu, 11 slajdów z edytowalnym tekstem (PowerPoint, Google Slides, Keynote). Buduje go `build_team_deck.py`.
- `meritum-deck.pdf`: wersja wysyłana jury. Jeszcze jej nie ma, trzeba ją wyeksportować z PPTX (niżej).
- `meritum-own/`: nasza wersja tej samej historii, 12 slajdów (HTML jako źródło, PDF, PPTX i PNG slajdów), opisana w `meritum-own/README.md`.

## Deck zespołu

```
uv run --with playwright --with python-pptx python deck/build_team_deck.py
```

Teksty slajdów i notatki prowadzącego są w `build_team_deck.py`. Diagramy, zrzuty z prototypu, ikony i logotyp skrypt wycina z `meritum-own/index.html`, więc oba decki pokazują te same obrazy i poprawia się je w jednym miejscu. Ręczne zmiany w PPTX znikną przy następnym uruchomieniu skryptu, dlatego stałe poprawki tekstu wpisujemy do skryptu.

Plik wymaga krojów Schibsted Grotesk i Azeret Mono. Google Slides ma oba („Więcej czcionek”). W PowerPoincie i Keynote trzeba je najpierw zainstalować z fonts.google.com, inaczej program podstawi inny krój i tekst się przesunie. PDF dla jury: otwórz PPTX z zainstalowanymi krojami, wybierz Plik → Eksportuj → PDF i przejrzyj każdą stronę.

Dopisek `--preview KATALOG` rysuje te same pola w tych samych miejscach w Chrome i zapisuje PNG slajdów. To kontrola układu z prawdziwymi krojami, a nie render z PowerPointa: łamanie wierszy może się różnić o słowo.

## Zasady

Każda liczba na slajdzie z wynikami musi pochodzić z naszego skryptu ewaluacji i dać się odtworzyć. Dopóki pierwszego przebiegu nie ma, kolumna wyników mówi „czeka na przebieg”.

Zrzuty interfejsu pochodzą z prototypu (`meritum-frontend`, `lab/`), który nie łączy się z API i pokazuje wynik przykładowy z kontraktów. Każdy slajd ze zrzutem mówi to w dopisku. Strony „Jak działa” z prototypu nie pokazujemy, bo ma przykładowe mierniki, które wyglądałyby jak pomiar.
