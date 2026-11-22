# Źródła i licencje

## Dźwięk

Cała ścieżka dźwiękowa jest zsyntezowana kodem w `scripts/make-audio.mjs`. Nie ma w niej żadnej próbki, nagrania ani gotowego utworu, więc nie ma też cudzych praw. Autorem jest zespół Meritum, a pliki są na tej samej licencji co repozytorium.

| Plik w `public/audio/` | Co to jest | Jak powstało |
| --- | --- | --- |
| `music.m4a` | muzyka, 85 s, D-dur, 90 uderzeń na minutę | sinusoidy z lekką modulacją częstotliwości (pad, arpeggio, bas, miękki puls), pogłos i echo liczone w skrypcie; do AAC pakuje ffmpeg |
| `click.wav` | kliknięcie | krótki szum i dwa gasnące tony |
| `typing.wav` | pisanie w polu | 86 uderzeń w rytmie liter w scenie formularza |
| `words.wav` | słowa wiadomości na otwarciu | 13 krótkich tonów |
| `whoosh.wav`, `theme.wav` | przejście, zmiana motywu | filtrowany szum, w `theme.wav` z rosnącym tonem |
| `step.wav`, `done.wav`, `tick.wav`, `pop.wav` | krok sprawdzania, koniec sprawdzania, kreska siły, dymek | pojedyncze tony w tonacji muzyki |
| `verdict-false.wav`, `verdict-confirmed.wav`, `verdict-open.wav` | werdykty | dwa niskie tony; trzy tony w górę; jeden ton bez rozwiązania |

Miks: muzyka ma głośność 0,8, a dźwięki interfejsu szczyt od −12 do −18 dBFS, czyli leżą pod muzyką. Cały film ma −17,0 LUFS i szczyt −5,8 dBFS (pomiar ffmpeg `ebur128`).

## Kroje

| Krój | Gdzie | Licencja | Źródło |
| --- | --- | --- | --- |
| Schibsted Grotesk | cały interfejs i napisy | SIL Open Font License 1.1 | Google Fonts, przez `@remotion/google-fonts` |
| Azeret Mono | podpisy i identyfikatory | SIL Open Font License 1.1 | Google Fonts, przez `@remotion/google-fonts` |
| Archivo | słowo „meritum” i podtytuł | SIL Open Font License 1.1 | `public/fonts/archivo-latin-wdth-normal.woff2` z pakietu `@fontsource-variable/archivo` 5.3.0 |

## Obraz

- Interfejs, teksty i dane przykładowe: design system Meritum (`meritum-design-system`) i prototyp w `meritum-frontend`.
- Ikony: Lucide (`lucide-react`), licencja ISC.
- Ziarno (`public/grain.png`): szum wygenerowany przez ffmpeg.
- W filmie nie ma zdjęć, nagrań ani materiałów stron trzecich.

## Narzędzia

Remotion (licencja opisana w `README.md`), React, Tailwind CSS, ffmpeg.
