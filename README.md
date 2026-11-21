# meritum-marketing

Materiały konkursowe i promocyjne Meritum, obywatelskiego radaru dezinformacji (HackNation 2026, konkurs MSZ „Prawdowid”). Repo jest dla osób, które robią deck, film i grafiki, a nie piszą kodu.

| Katalog | Co tu jest | Wymóg konkursu |
| --- | --- | --- |
| [`deck/`](deck/) | prezentacja: PPTX (źródło) i PDF (dla jury) | PDF, najwyżej 12 slajdów |
| [`film/`](film/) | scenariusz, link do filmu, pliki wideo w Git LFS | film pod linkiem, najwyżej 3 minuty |
| [`social/`](social/) | grafiki do mediów społecznościowych | brak |

Treść pitchu: `design-system/KEY_SELLING_POINTS.md`. Wygląd, kolory, kroje i logo: `design-system/DESIGN_SYSTEM.md` i `design-system/presentation/README.md` (instrukcja szablonu PPTX). Pełna treść zadania i regulamin są w folderze `konkursy/` u właściciela repo.

Zasady:

- Pokazujemy tylko liczby zmierzone naszym skryptem ewaluacji, z danymi do odtworzenia. Resztę podpisujemy jako przykład albo dane symulowane.
- Podtytuł to „obywatelski radar dezinformacji”. Materiały ze starszym podtytułem („…oraz scamu”) i z przepływem zgłoszeń, kampanii i ataku botów nie idą do jury.
- Wideo commitujemy przez Git LFS (`git lfs install` raz na komputer). Pliki PPTX i PDF zwykłym gitem.

Gałęzie: zmiany przez PR do `develop`, wydanie przez PR `develop` → `main`. Repo nie ma CI ani wdrożenia, bo nie ma kodu.
