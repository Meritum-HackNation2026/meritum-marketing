# Źródła i licencje, wariant C

## Lektor

Lektor: ElevenLabs (elevenlabs.io). Głos gotowy „Liam”, model `eleven_multilingual_v2`, synteza z tekstu w `scenariusz.json`. Nagranie powstało na planie darmowym, który wymaga podania źródła i nie daje licencji komercyjnej. Podpis „Lektor: ElevenLabs (elevenlabs.io)” jest na planszy końcowej. Przed użyciem komercyjnym trzeba nagrać lektora jeszcze raz na płatnym planie albo z żywym głosem.

Pliki: `lektor/take-1.mp3` (surowe nagranie), `lektor/take-1.alignment.json` (czasy liter), `public/audio/lektor/linia-01.wav` do `linia-09.wav` (zdania po wyrównaniu głośności).

## Muzyka i dźwięki

`public/audio/music.m4a` jest zsyntezowany kodem w `scripts/make-audio.mjs`: sinusoidy z lekką modulacją częstotliwości, filtrowany szum, pogłos liczony w skrypcie. Nie ma w nim żadnej próbki ani gotowego utworu, więc nie ma cudzych praw. Głosy syntezatora i trzy dźwięki werdyktów pochodzą z pierwszej wersji filmu (`film/scripts/make-audio.mjs`); aranżacja jest nowa. Autorem jest zespół Meritum, plik jest na tej samej licencji co repozytorium.

Miks: muzyka gra z głośnością 0,7, pod głosem 0,14 (14 dB ciszej). Gotowy film ma −14,0 LUFS i szczyt −1,4 dBTP (pomiar ffmpeg `ebur128=peak=true`).

## Kroje

| Krój | Gdzie | Licencja | Źródło |
| --- | --- | --- | --- |
| Schibsted Grotesk | napisy i interfejs | SIL Open Font License 1.1 | Google Fonts, przez `@remotion/google-fonts` |
| Azeret Mono | domena źródła, podpis danych przykładowych | SIL Open Font License 1.1 | Google Fonts, przez `@remotion/google-fonts` |
| Archivo | słowo „meritum” i podtytuł | SIL Open Font License 1.1 | `public/fonts/archivo-latin-wdth-normal.woff2` z pakietu `@fontsource-variable/archivo` 5.3.0 |

## Obraz

- Logo, tokeny, teksty interfejsu i dane przykładowe: design system Meritum (`meritum-design-system`).
- W filmie nie ma zdjęć, nagrań, logo innych organizacji ani materiałów stron trzecich.

## Narzędzia

Remotion (licencja opisana w `README.md`), React, Tailwind CSS, ffmpeg.
