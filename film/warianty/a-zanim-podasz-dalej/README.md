# Film promocyjny, wariant A „Zanim podasz dalej”

Jeden z trzech wariantów filmu do wyboru przez właściciela repo. Montaż wychodzi od problemu (wiadomość, którą ktoś chce podać dalej), prowadzi go polski lektor, całość trwa 40 s.

- `meritum-film-a.mp4`: gotowy film, 1920×1080, 30 kl./s, 40 s, z lektorem i muzyką (Git LFS),
- `scenariusz.md`: ujęcia, czasy, tekst lektora i napisy,
- `lektor.txt`: tekst lektora, jedna kwestia w wierszu,
- `kadry/`: po jednym kadrze z każdego ujęcia,
- `CREDITS.md`: głos, dźwięki, kroje, ikony.

Film nie jest nigdzie opublikowany.

## Jak powstaje film

To projekt [Remotion](https://www.remotion.dev): każda klatka jest stroną w React, wyrenderowaną przez Chrome. Interfejs w filmie nie jest nagraniem ekranu. `src/ui.tsx` powtarza znaczniki i klasy komponentów ze scalonej aplikacji (`meritum-frontend`, `src/components/meritum`), z tokenami motywu „Atrament”, tekstami z `copy/pl.json` i wynikami z `contracts/examples.json`. Kopie tych plików leżą w `src/tokens/` i `src/data/`, a `src/tokens/SOURCE` podaje commit design systemu.

Wyniki w filmie to dane przykładowe z kontraktów, a nie odpowiedzi działającego systemu. Każde ujęcie z wynikiem ma w rogu podpis „przykład do pokazu · dane przykładowe”.

| Plik | Co w nim jest |
| --- | --- |
| `src/timeline.ts` | wspólny zegar: 30 kl./s, 120 uderzeń na minutę (uderzenie to 15 klatek), długości scen, miejsca kwestii lektora i momenty wyliczone ze znaczników słów |
| `src/Film.tsx` | kolejność scen, logo w rogu, lektor, muzyka ściszana pod głosem, dźwięki interfejsu |
| `src/scenes.tsx` | jedenaście scen |
| `src/ui.tsx` | interfejs Meritum: pole formularza, kroki, wynik z cytatem i źródłem, logo |
| `src/motion.tsx` | wejścia elementów i podpis danych przykładowych |
| `src/data/lektor.json` | głos, model, kwestie i znaczniki czasu każdego słowa |
| `scripts/make-voice.mjs` | nagranie lektora w ElevenLabs i cięcie na kwestie |
| `scripts/make-audio.mjs` | synteza muzyki i dźwięków interfejsu |
| `scripts/render.mjs` | render i wyrównanie głośności |
| `scripts/make-stills.mjs` | kadry do `kadry/` |

## Podgląd

Potrzebne są Node 22 albo nowszy, pnpm i ffmpeg.

```bash
cd film/warianty/a-zanim-podasz-dalej
pnpm install
pnpm studio
```

## Render

```bash
pnpm render   # zapisuje meritum-film-a.mp4 i wypisuje pomiar głośności
pnpm stills   # odświeża kadry/
pnpm lint     # eslint i tsc
```

Render trwa około pół minuty. Zapisuje surowy plik w `out/` (poza repo), a potem ffmpeg w dwóch przebiegach `loudnorm` ustawia głośność na −14 LUFS i ogranicza szczyt do −1,5 dBTP. Obraz jest przy tym kopiowany bez zmian.

Render nie łączy się z ElevenLabs i nie potrzebuje klucza: nagranie i znaczniki słów są w repo. Potrzebna jest sieć na Google Fonts (Schibsted Grotesk, Azeret Mono), a przy pierwszym uruchomieniu także na pobranie Chrome przez Remotion.

## Dźwięk od nowa

Muzyka i dźwięki interfejsu:

```bash
pnpm audio    # po zmianie scripts/make-audio.mjs albo długości scen
```

Akordy w `make-audio.mjs` zmieniają się na cięciach scen z `src/timeline.ts`, więc po zmianie długości sceny trzeba poprawić tablicę `CHANGES` i zakresy warstw.

Lektor:

```bash
set -a; . /ścieżka/do/elevenlabs.env; set +a   # ustawia ELEVENLABS_API_KEY
pnpm voice -- --budget 500                     # czyta lektor.txt, nagrywa całość jednym podejściem
pnpm voice -- --reslice                        # tnie istniejące nagranie od nowa, bez wywołania API
```

Skrypt przed nagraniem sprawdza limit konta i przerywa, jeśli tekst jest dłuższy niż `--budget` znaków. Zapisuje `public/audio/lektor.mp3`, kwestie `lektor-1.wav` do `lektor-9.wav` i `src/data/lektor.json`. Klucz przychodzi tylko ze zmiennej środowiskowej; nie wpisuj go do żadnego pliku w repo. Każde nagranie wychodzi trochę inaczej, więc po nowym nagraniu sprawdź w `src/timeline.ts`, czy kwestie nadal mieszczą się w scenach. Jeśli któraś nachodzi na następną, build kończy się błędem z numerem kwestii.

## Licencja Remotion

Remotion jest darmowy dla osób prywatnych, organizacji non profit i zespołów do 3 osób, także w zastosowaniach komercyjnych. Zespół od 4 osób potrzebuje licencji firmowej. Warunki: https://www.remotion.dev/docs/license. Przed publikacją filmu właściciel repo powinien policzyć, ile osób liczy zespół Meritum, i w razie potrzeby kupić licencję.
