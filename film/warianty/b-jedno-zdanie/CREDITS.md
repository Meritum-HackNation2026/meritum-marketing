# Źródła i licencje, wariant B

## Dźwięk

Cała ścieżka (`public/audio/sciezka.m4a`, 40 s) jest zsyntezowana kodem w `scripts/make-audio.mjs`. Nie ma w niej żadnej próbki, nagrania, gotowego utworu ani lektora, więc nie ma też cudzych praw. Autorem jest zespół Meritum, a plik jest na tej samej licencji co repozytorium.

| Warstwa | Co to jest | Jak powstało |
| --- | --- | --- |
| puls | dwa niskie uderzenia co sekundę, jak tętno | sinus z opadającą częstotliwością, lekko przesterowany |
| tło | trzymane akordy: d-moll przy sprawdzaniu, D-dur po „Potwierdzone” i w puencie | sinusoidy z lekkim rozstrojeniem |
| podanie dalej | krótkie tyknięcie | szum i ton 2,6 kHz |
| krok sprawdzania | miękki ton | sinus z drugą harmoniczną |
| czytanie cytatu, cięcie | szum o zmiennej barwie | szum przez filtr pasmowy |
| werdykty | „Fałszywe”: dwa niskie tony w dół po pół sekundy ciszy; „Potwierdzone”: trzy tony w górę; „Brak wystarczających dowodów”: kwinta bez rozwiązania | tony z długim wybrzmieniem |
| pogłos | wspólny dla wszystkich warstw | cztery filtry grzebieniowe i dwa wszechprzepustowe, liczone w skrypcie |

Skrypt normalizuje ścieżkę dwuprzebiegowym `loudnorm` z ffmpeg. Gotowy film ma −13,9 LUFS i szczyt −1,4 dBTP (pomiar `pnpm loudness`, czyli ffmpeg `ebur128=peak=true`).

## Kroje

| Krój | Gdzie | Licencja | Źródło |
| --- | --- | --- | --- |
| Schibsted Grotesk | napisy i interfejs | SIL Open Font License 1.1 | Google Fonts, przez `@remotion/google-fonts` |
| Azeret Mono | podpisy i liczniki | SIL Open Font License 1.1 | Google Fonts, przez `@remotion/google-fonts` |
| Archivo | słowo „meritum” i podtytuł | SIL Open Font License 1.1 | `public/fonts/archivo-latin-wdth-normal.woff2` z pakietu `@fontsource-variable/archivo` 5.3.0 |

## Obraz

- Znak i logotyp: `meritum-design-system`, `brand/`.
- Teksty interfejsu i dane przykładowe: `copy/pl.json` i `contracts/examples.json` z design systemu.
- W filmie nie ma zdjęć, nagrań, ikon z bibliotek ani materiałów stron trzecich, ani logo innych organizacji.

## Narzędzia

Remotion (licencja opisana w `README.md`), React, ffmpeg.
