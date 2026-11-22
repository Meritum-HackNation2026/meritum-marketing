# Film promocyjny, wariant B: „Jedno zdanie”

Jedna z trzech niezależnych wersji filmu promocyjnego. Właściciel wybiera jedną. Ta prowadzi jedno zdanie przez Meritum prawie w czasie rzeczywistym, bez lektora.

- `meritum-film-b.mp4`: gotowy film, 1920×1080, 30 kl./s, 40 s, z dźwiękiem (Git LFS),
- `scenariusz.md`: ujęcia, czasy i wszystkie napisy,
- `kadry/`: kadr z każdej sekundy filmu,
- `CREDITS.md`: skąd są dźwięki, kroje i dane.

## Jak powstaje film

Film jest projektem [Remotion](https://www.remotion.dev): każda klatka to strona w React wyrenderowana przez Chrome. Fragmenty interfejsu nie są nagraniem ekranu. Ich układ i teksty idą za scalonymi komponentami `meritum-frontend` (`claim-row.tsx`, `citation-item.tsx`, `verdict-badge.tsx`, `strength-meter.tsx`), kolory to motyw „Atrament”, teksty pochodzą z `copy/pl.json`, a wyniki z `contracts/examples.json`. `src/data/SOURCE` podaje commit design systemu.

Wyniki w filmie to dane przykładowe z kontraktów, a nie odpowiedzi działającego systemu. Każde ujęcie z wynikiem ma w rogu podpis „przykład do pokazu · dane przykładowe”. Licznik „podano dalej” jest inscenizacją: pokazuje, że zdanie krąży, i nie jest żadną liczbą z produktu.

| Plik | Co w nim jest |
| --- | --- |
| `src/timeline.json` | długości scen i klatki zdarzeń; czyta je i obraz, i skrypt dźwięku |
| `src/Film.tsx` | dziesięć scen w kolejności, same twarde cięcia |
| `src/ui.tsx` | fragmenty wyniku Meritum: kroki, cytat, źródło, werdykt, siła podstawy |
| `src/parts.tsx` | krzywa ruchu, logo, tło sceny, napisy |
| `scripts/make-audio.mjs` | synteza całej ścieżki dźwiękowej i normalizacja do −14 LUFS |

## Podgląd i render

Potrzebne są Node 22 albo nowszy, pnpm i ffmpeg.

```bash
cd film/warianty/b-jedno-zdanie
pnpm install
pnpm studio     # podgląd w przeglądarce
pnpm audio      # tylko po zmianie timeline.json albo make-audio.mjs; plik z public/audio jest w repo
pnpm render     # zapisuje meritum-film-b.mp4
pnpm stills     # odświeża kadry/
pnpm loudness   # głośność i szczyt gotowego pliku
pnpm lint
```

Przy pierwszym uruchomieniu Remotion pobiera własną kopię Chrome, a kroje Schibsted Grotesk i Azeret Mono przychodzą z Google Fonts, więc potrzebna jest sieć. Render nie woła żadnej płatnej usługi i nie potrzebuje kluczy.

## Zmiany w filmie

Sceny tną się na siatce 120 uderzeń na minutę: uderzenie to 15 klatek, takt to 60. Długość sceny albo moment zdarzenia zmienia się w `src/timeline.json`, a potem trzeba uruchomić `pnpm audio`, żeby dźwięk poszedł za obrazem. Napisy są w `src/Film.tsx`. Każdy napis ma być na ekranie co najmniej `liczba znaków / 17 + 0,5` sekundy.

## Licencja Remotion

Remotion jest darmowy dla osób prywatnych, organizacji non profit i firm do 3 osób, także w zastosowaniach komercyjnych. Większa firma potrzebuje licencji firmowej. Warunki: https://www.remotion.dev/docs/license. Przed publikacją filmu trzeba policzyć, ile osób liczy zespół Meritum, i w razie potrzeby kupić licencję. To decyzja właściciela.
