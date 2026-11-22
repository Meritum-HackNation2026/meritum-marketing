# Film demonstracyjny

Wymaganie konkursu: film pod linkiem, najwyżej 3 minuty.

- `meritum-film.mp4`: gotowy film, 1920×1080, 30 kl./s, 85 s, z dźwiękiem (Git LFS),
- `scenariusz.md`: ujęcia, czasy i wszystkie napisy,
- `kadry/`: po jednym kadrze z każdej sceny,
- `CREDITS.md`: skąd są dźwięki, kroje i ikony,
- `link.txt`: link do opublikowanej wersji, który trafia do zgłoszenia. Pliku jeszcze nie ma, bo film nie został nigdzie wgrany. O publikacji decyduje właściciel repo.

Pliki wideo (`.mp4`, `.mov`, `.webm`) idą przez Git LFS (`.gitattributes`). Przed pierwszym commitem wideo uruchom `git lfs install`.

## Jak powstaje film

Film jest projektem [Remotion](https://www.remotion.dev): każda klatka to strona w React, wyrenderowana przez Chrome. Interfejs w filmie nie jest nagraniem ekranu. To te same znaczniki i klasy co w zatwierdzonym prototypie nowego interfejsu (`meritum-frontend`, katalog `lab/`), z tokenami motywu „Atrament”, tekstami z `copy/pl.json` i wynikami z `contracts/examples.json`. Kopie tych plików leżą w `src/tokens/` i `src/data/`; `src/tokens/SOURCE` podaje commit design systemu, z którego pochodzą.

Wyniki w filmie to dane przykładowe z kontraktów, a nie odpowiedzi działającego systemu. Każde ujęcie z wynikiem ma w rogu podpis „przykład do pokazu · dane przykładowe, nie wynik na żywo”.

| Plik | Co w nim jest |
| --- | --- |
| `src/Film.tsx` | kolejność scen i ścieżki dźwięku z numerami klatek |
| `src/scenes.tsx` | dziewięć scen: co się pojawia, gdzie patrzy kamera, dokąd idzie kursor |
| `src/ui.tsx` | interfejs Meritum: belka, strona główna, formularz, kroki, wynik |
| `src/motion.tsx` | ruch: wejścia, kamera, kursor, napisy, ziarno |
| `src/timeline.ts` | wspólny zegar obrazu i muzyki (30 kl./s, 90 uderzeń na minutę, takt to 80 klatek) |
| `scripts/make-audio.mjs` | synteza muzyki i dźwięków interfejsu |
| `scripts/make-stills.mjs` | kadry do `kadry/` |

## Podgląd

Potrzebne są Node 22 albo nowszy, pnpm i ffmpeg.

```bash
cd film
pnpm install
pnpm studio
```

Remotion Studio otwiera się w przeglądarce. Sceny i dźwięki są na osi czasu pod podglądem.

## Render

```bash
pnpm audio    # tylko po zmianie scripts/make-audio.mjs; pliki z public/audio są w repo
pnpm render   # zapisuje meritum-film.mp4
pnpm stills   # odświeża kadry/
```

Render trwa kilka minut. Przy pierwszym uruchomieniu Remotion pobiera własną kopię Chrome, a kroje Schibsted Grotesk i Azeret Mono przychodzą z Google Fonts, więc potrzebna jest sieć.

## Zmiany w filmie

- Napisy i czasy zmienia się w `src/scenes.tsx`. Po zmianie momentu kliknięcia albo werdyktu trzeba przesunąć odpowiadający mu dźwięk w `src/Film.tsx`, bo dźwięki mają tam wpisane numery klatek.
- Sceny zaczynają się na granicach taktów muzyki. Jeśli zmienia się długość sceny, trzeba poprawić układ taktów w `scripts/make-audio.mjs` (tablice `BARS_CHORDS` i `LAYERS`) i uruchomić `pnpm audio`.
- Po zmianie tekstów albo tokenów w design systemie skopiuj pliki jeszcze raz i popraw `src/tokens/SOURCE`.

## Licencja Remotion

Remotion jest darmowy dla osób prywatnych, organizacji non profit i zespołów do 3 osób, także w zastosowaniach komercyjnych. Zespół od 4 osób potrzebuje licencji firmowej (Remotion for Creators, 25 USD miesięcznie za każdą osobę, która robi filmy). Warunki: https://www.remotion.dev/docs/license. Przed publikacją filmu trzeba policzyć, ile osób liczy zespół Meritum, i w razie potrzeby kupić licencję.

## Plan demo dla jury

Ten film jest promocyjny i pokazuje nowy interfejs na danych przykładowych. Plan demo z `design-system/PRODUCT.md` zostaje do nagrania na działającym systemie: to samo pytanie w formularzu WWW i pod postem na makiecie X przez wtyczkę, werdykt ze źródłami, uczciwe wstrzymanie się ze sprawą dla moderatora, zignorowana próba wstrzyknięcia poleceń i wyniki ewaluacji na naszym zestawie testowym (zestaw referencyjny MSZ jest dla nas ukryty). Makiety do nagrań: https://meritum-x.gburek.app (i pozostałe platformy).
