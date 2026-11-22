# Scenariusz, wariant C „Manifest”

Film trwa 30,5 s (915 klatek, 30 kl./s). Lektor czyta dziewięć zdań. Każde zdanie stoi na ekranie od cięcia jako blady napis, a słowo ciemnieje w klatce, w której lektor zaczyna je mówić. Dzięki temu film da się przeczytać bez dźwięku. Po trzech zdaniach przychodzi wstawka z interfejsem, która pokazuje to, co zdanie przed chwilą powiedziało.

Tekst lektora jest w `scenariusz.json` i z tego pliku idzie do syntezy. Długości ujęć nie są wpisane ręcznie: wynikają z długości nagranych zdań (`src/timeline.ts`), a każde ujęcie zaczyna się na uderzeniu muzyki (120 uderzeń na minutę, 15 klatek).

| Nr | Czas | Ujęcie | Lektor i napis | Obraz |
| --- | --- | --- | --- | --- |
| 1 | 0:00,0–0:03,0 | Wiadomość | „Ktoś to napisał.” „Ktoś podał dalej.” | Biała strona. U góry przesłana wiadomość: „Prezydent w Polsce może rządzić trzy kadencje, a językiem urzędowym jest polski.” Pod nią oba zdania dużym krojem. |
| 2 | 0:03,0–0:04,5 | Pytanie | „A skąd to wiadomo?” | Ta sama wiadomość, pod nią pytanie. |
| 3 | 0:04,5–0:07,0 | Nazwa | „Meritum sprawdza to w źródłach.” | Logo na całą szerokość zastępuje pierwsze słowo zdania, reszta zdania pod nim. |
| 4 | 0:07,0–0:10,0 | Zasada 1 | „Każde twierdzenie dostaje osobny werdykt.” | Sam napis. |
| 5 | 0:10,0–0:12,0 | Dowód 1 | (muzyka) | Wiadomość i dwa twierdzenia, które z niej wynikają. Pierwsze dostaje „Fałszywe”, drugie „Potwierdzone”. |
| 6 | 0:12,0–0:17,5 | Dowód 2, ujęcie trzymane | „Przy werdykcie jest cytat, słowo w słowo, i źródło.” | Jedyne ciemne ujęcie. Z lewej logo i zdanie lektora. Z prawej karta wyniku: „Fałszywe”, twierdzenie, cytat z Konstytucji i źródło. Werdykt pojawia się w ciszy, sekundę przed głosem. Na słowie „cytat” cytat się rozjaśnia, na „słowo w słowo” podświetla się „tylko raz”, na „źródło” rozjaśnia się i podkreśla tytuł źródła. |
| 7 | 0:17,5–0:19,5 | Zasada 2 | „Jak nie wiemy, to nie zgadujemy.” | Sam napis. |
| 8 | 0:19,5–0:21,5 | Dowód 3 | (muzyka) | Inna wiadomość: „Wczoraj w Gdańsku wyłączono wszystkie bankomaty.” Werdykt „Brak wystarczających dowodów” i „Czego nie udało się ustalić”. |
| 9 | 0:21,5–0:25,5 | Kanały | „Ten sam wynik na stronie, na Discordzie i we wtyczce.” | „Ten sam wynik”, pod spodem twierdzenie i trzy wiersze: strona WWW, Discord, wtyczka Chrome. Każdy wiersz ciemnieje na swoim słowie i dostaje ten sam werdykt „Fałszywe”. |
| 10 | 0:25,5–0:30,5 | Plansza końcowa | „Meritum. Sprawdź, zanim podasz dalej.” | Logo, „obywatelski radar dezinformacji”, zdanie lektora, na dole „Projekt konkursowy · Prawdowid · HackNation 2026” i „Lektor: ElevenLabs (elevenlabs.io)”. Ostatnie dwie sekundy bez ruchu. |

Znak z nazwą jest w lewym górnym rogu od pierwszej klatki. W ujęciach 3, 6 i 10 zamiast niego jest logo w dużym rozmiarze.

## Skąd są zdania

- „Meritum sprawdza to w źródłach”, „Każde twierdzenie dostaje osobny werdykt”, „cytat, słowo w słowo, i źródło”: `design-system/KEY_SELLING_POINTS.md`, sekcja 1 i tabela wymagań (jeden z pięciu werdyktów na twierdzenie; cytat przechodzi tylko wtedy, gdy fragment występuje dosłownie w tekście źródła; źródło ma tytuł, wydawcę, datę i link).
- „Jak nie wiemy, to nie zgadujemy”: werdykt „brak wystarczających dowodów” z opisem, czego nie ustaliliśmy (tamże). Zdanie jest wersją napisu z pierwszego filmu.
- „Ten sam wynik na stronie, na Discordzie i we wtyczce”: formularz WWW i bot na Discordzie na tym samym rdzeniu, wtyczka Chrome jako kanał dodatkowy (tamże, „Dwa kanały”, i README monorepo).
- „Sprawdź, zanim podasz dalej”: hasło z `KEY_SELLING_POINTS.md`.

Wyniki w ujęciach 5, 6, 8 i 9 to `CheckResult.done` i `CheckResult.abstain` z `design-system/contracts/examples.json`. Każde z tych ujęć ma w rogu podpis „przykład do pokazu · dane przykładowe”.

## Dźwięk

Muzyka jest zsyntezowana (`scripts/make-audio.mjs`), 120 uderzeń na minutę. W pierwszych dwóch ujęciach jest sam akord i jedno niskie uderzenie na każde zdanie. Puls zaczyna się razem z nazwą, milknie w ujęciu trzymanym i w ujęciu 8, wraca na kanały. Plansza końcowa to jeden akord, który wygasa. Pod głosem muzyka jest o 14 dB cichsza.

Dźwięki interfejsu są trzy, po jednym na znaczenie: „Fałszywe”, „Potwierdzone” i „Brak wystarczających dowodów”. Trzy wiersze kanałów mają po jednym cichym tonie.

## Czego film nie pokazuje

SMS-a, liczb z ewaluacji, kosztów, czasu odpowiedzi ani panelu moderatora, z tych samych powodów co pierwsza wersja (`film/scenariusz.md`). Nie ma też adresu strony, bo nie wiemy, pod jakim publicznym adresem produkt będzie dostępny dla widza filmu.
