# Źródła i licencje

W filmie nie ma nic pobranego z sieci poza krojami: żadnej gotowej muzyki, próbek, zdjęć ani nagrań.

## Lektor

Głos syntetyczny z ElevenLabs (https://elevenlabs.io): gotowy głos „Alice” (`Xb7hH8MSUJpSbSDYk0k2`), model `eleven_multilingual_v2`, plan Free. Plan Free wymaga podania źródła, dlatego na planszy końcowej jest napis „Lektor: ElevenLabs (elevenlabs.io)”. Tekst napisał zespół Meritum (`lektor.txt`).

Pliki: `public/audio/lektor.mp3` (całe nagranie), `lektor-1.wav` do `lektor-9.wav` (kwestie wycięte przez ffmpeg), `src/data/lektor.json` (znaczniki czasu słów).

## Muzyka i dźwięki

Zsyntezowane kodem w `scripts/make-audio.mjs` z sinusoid i szumu, bez próbek. Autorem jest zespół Meritum, pliki są na tej samej licencji co repozytorium.

| Plik w `public/audio/` | Co to jest |
| --- | --- |
| `music.m4a` | muzyka, 40 s, 120 uderzeń na minutę; akordy zmieniają się na cięciach scen |
| `slam.wav` | wiadomość wpadająca w kadr |
| `hit.wav` | wejście nazwy |
| `tick.wav` | wklejenie tekstu, wiersz na liście kanałów |
| `click.wav` | naciśnięcie przycisku |
| `steps.wav` | dziewięć kroków sprawdzania |
| `verdict-false.wav`, `verdict-confirmed.wav`, `verdict-open.wav` | werdykty: fałszywe, potwierdzone, brak dowodów |

Miks: muzyka schodzi o około 12 dB, kiedy mówi lektor, i wraca w przerwach. Gotowy plik ma −14,3 LUFS i szczyt −1,5 dBTP (pomiar ffmpeg `ebur128=peak=true`).

## Kroje

| Krój | Gdzie | Licencja | Źródło |
| --- | --- | --- | --- |
| Schibsted Grotesk | interfejs i napisy | SIL Open Font License 1.1 | Google Fonts, przez `@remotion/google-fonts` |
| Azeret Mono | podpisy i identyfikatory | SIL Open Font License 1.1 | Google Fonts, przez `@remotion/google-fonts` |
| Archivo | słowo „meritum” i podtytuł pod logo | SIL Open Font License 1.1 | `public/fonts/archivo-latin-wdth-normal.woff2`, ten sam plik co w `film/public/fonts/` (pakiet `@fontsource-variable/archivo`) |

## Obraz

- Interfejs, teksty i dane przykładowe: design system Meritum (`meritum-design-system`) i aplikacja `meritum-frontend`.
- Ikony: Lucide (`lucide-react`), licencja ISC.

## Narzędzia

Remotion (licencja opisana w `README.md`), React, Tailwind CSS, ffmpeg.
