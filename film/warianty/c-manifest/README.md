# Film promocyjny, wariant C „Manifest”

Jedna z trzech wersji filmu, z których właściciel wybiera jedną. Ta jest typograficzna: 30,5 s, dziewięć zdań lektora dużym krojem i cztery krótkie wstawki z interfejsem.

- `meritum-film-c.mp4`: gotowy film, 1920×1080, 30 kl./s, z dźwiękiem (Git LFS),
- `scenariusz.md`: ujęcia, czasy, tekst lektora i źródła zdań,
- `scenariusz.json`: tekst lektora w postaci, z której powstaje nagranie,
- `kadry/`: po jednym kadrze z każdego ujęcia,
- `CREDITS.md`: lektor, dźwięk, kroje, licencje.

## Jak to działa

Oś czasu wynika z nagrania. `scripts/make-voice.mjs` wysyła tekst do ElevenLabs i dostaje nagranie razem z czasem każdej litery. Skrypt tnie nagranie na zdania (`public/audio/lektor/`) i zapisuje czas każdego słowa w `src/data/voice.json`. `src/timeline.ts` układa z tego ujęcia: zdanie zaczyna się na uderzeniu muzyki, a następne ujęcie na pierwszym uderzeniu po końcu zdania. Napis (`src/type.tsx`) i muzyka (`scripts/make-audio.mjs`) czytają tę samą oś, więc po nowym nagraniu wszystko przesuwa się razem.

Interfejs w filmie to React z tokenami design systemu (motyw „Atrament”), a wyniki to dane przykładowe z kontraktów. Kopie tokenów, tekstów i przykładów leżą w `src/tokens/` i `src/data/`; `src/tokens/SOURCE` podaje commit, z którego pochodzą.

| Plik | Co w nim jest |
| --- | --- |
| `src/timeline.ts` | plan ujęć i funkcja, która z długości zdań liczy klatki |
| `src/shots.tsx` | dziesięć ujęć |
| `src/type.tsx` | napis, który ciemnieje słowo po słowie |
| `src/ui.tsx` | logo, etykieta werdyktu, wiadomość, podpis danych przykładowych |
| `src/Film.tsx` | ujęcia, zdania lektora i muzyka na osi czasu |
| `scripts/timeline.test.mjs` | sprawdza oś czasu: długość filmu, siatkę uderzeń, najdłuższe ujęcie, czas pierwszego werdyktu, czas na ekranie ostatniego słowa |

Ujęcia i zdania lektora widać w Remotion Studio jako osobne pozycje na osi czasu. Ich położenia nie da się tam przesuwać, bo liczy je `timeline.ts` z nagrania.

## Podgląd i render

Potrzebne są Node 22 albo nowszy, pnpm i ffmpeg.

```bash
cd film/warianty/c-manifest
pnpm install
pnpm studio
pnpm test     # oś czasu
pnpm render   # zapisuje meritum-film-c.mp4 i wypisuje głośność
pnpm stills   # odświeża kadry/
```

Render nie łączy się z ElevenLabs: nagranie i czasy słów są w repozytorium. `pnpm render` po renderze wyrównuje głośność do −14 LUFS ze szczytem najwyżej −1 dBTP (dwa przebiegi `loudnorm` w ffmpeg).

## Nowe nagranie lektora

Klucz ElevenLabs zostaje poza repozytorium, w pliku env podanym przy uruchomieniu:

```bash
node --env-file=/sciezka/do/elevenlabs.env scripts/make-voice.mjs --take take-2   # nowe nagranie ze scenariusz.json
node scripts/make-voice.mjs --recut take-1                                        # ponowne cięcie zapisanego nagrania, bez API
pnpm audio    # muzyka na nowej osi czasu
pnpm test
```

Surowe nagranie i czasy liter zostają w `lektor/`. Model `eleven_multilingual_v2` liczy jeden kredyt za znak; cały tekst ma 304 znaki.

## Licencja Remotion

Remotion jest darmowy dla osób prywatnych, organizacji non profit i zespołów do 3 osób, także w zastosowaniach komercyjnych; nie trzeba do tego konta ani klucza. Zespół od 4 osób potrzebuje licencji firmowej (Remotion for Creators, 25 USD miesięcznie za każdą osobę, która robi filmy w Remotion). Warunki: https://www.remotion.dev/docs/license. Przed publikacją filmu trzeba policzyć, ile osób liczy zespół Meritum.
