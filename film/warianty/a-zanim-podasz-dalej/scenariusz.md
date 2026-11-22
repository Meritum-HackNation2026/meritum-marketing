# Scenariusz, wariant A „Zanim podasz dalej”

40 s, 1920×1080, 30 kl./s. Muzyka ma 120 uderzeń na minutę, więc uderzenie to 15 klatek, a każde cięcie wypada na uderzeniu. Obietnica filmu: zanim podasz wiadomość dalej, możesz zobaczyć, na czym ona stoi.

Film idzie za jedną wiadomością: „Prezydent w Polsce może rządzić przez trzy kadencje, a językiem urzędowym jest polski.” Jej dwa twierdzenia i ich wyniki pochodzą z `contracts/examples.json` (`CheckResult.done`), trzeci wynik z `CheckResult.abstain`. W danych przykładowych są tylko te trzy twierdzenia, dlatego film nie ma montażu czterech kolejnych werdyktów z briefu i trwa 40 s zamiast 45.

Logo jest w lewym górnym rogu od pierwszej klatki. Przy werdykcie (ujęcia 6 do 8) rośnie o trzy czwarte. W ujęciach 3 i 14 wypełnia kadr.

## Ujęcia

| # | Czas | Ujęcie | Obraz | Lektor | Napis |
| --- | --- | --- | --- | --- | --- |
| 1 | 0:00–0:03 | Wiadomości | Trzy wiadomości wpadają na trzech uderzeniach: przesłany dymek, post, nagłówek | „Dostajesz to codziennie.” | treść wiadomości |
| 2 | 0:03–0:05 | Pytanie | Wiadomości rozmywają się, wchodzi pytanie | „Podać dalej?” | Podać dalej? |
| 3 | 0:05–0:06 | Nazwa | Logo na cały kadr | „Meritum sprawdza takie wiadomości w źródłach.” (do 0:08) | meritum |
| 4 | 0:06–0:08 | Wklejenie | Pole „Sprawdź informację”: wiadomość pojawia się cała, przycisk się wciska. Bez kursora i bez pisania | (dalszy ciąg) | |
| 5 | 0:08–0:10 | Sprawdzanie | Dziewięć kroków odhacza się w półtorej sekundy | (tylko muzyka) | |
| 6 | 0:10–0:11 | Werdykt z bliska | „Fałszywe” ląduje nad twierdzeniem, prawie w ciszy | | |
| 7 | 0:11–0:16 | Werdykt, cytat, źródło (ujęcie trzymane) | Kadr otwiera się na całą odpowiedź. Na słowie „cytatem” zaznaczają się słowa „tylko raz”, na słowie „źródłem” podkreśla się tytuł źródła. Powolny najazd o 3% | „Każde twierdzenie dostaje werdykt, z cytatem i ze źródłem.” | |
| 8 | 0:16–0:20 | Drugie twierdzenie | Druga połowa tej samej wiadomości: „Potwierdzone”, cytat z art. 27 | „A drugie zdanie z tej samej wiadomości się zgadza.” | |
| 9 | 0:20–0:23,5 | Brak dowodów | Inna wiadomość (bankomaty w Gdańsku): „Brak wystarczających dowodów” i to, czego nie udało się ustalić | „Kiedy źródeł brakuje, Meritum mówi wprost:” | |
| 10 | 0:23,5–0:27 | Zasada | Ciemna plansza, dwa wiersze wchodzą razem ze słowami lektora | „nie wiemy, więc nie zgadujemy.” | Nie wiemy, / więc nie zgadujemy. |
| 11 | 0:27–0:32 | Kanały | Trzy wiersze wchodzą, gdy lektor je wymienia: strona WWW, Discord, wtyczka Chrome. W każdym ten sam werdykt | „Na stronie, na Discordzie i we wtyczce wynik jest ten sam.” | nazwy kanałów |
| 12 | 0:32–0:35 | Powrót do wiadomości | Pierwszy dymek, pod nim dwa werdykty, po jednym na zdanie | „Sprawdź, zanim podasz dalej.” | Sprawdź, zanim podasz dalej. |
| 13 | 0:35–0:40 | Plansza końcowa | Logo, „obywatelski radar dezinformacji”, „Projekt konkursowy · Prawdowid · HackNation 2026”, drobno „Lektor: ElevenLabs (elevenlabs.io)”. Od 0:35,8 nic się nie rusza | „Meritum. Obywatelski radar dezinformacji.” | jak obok |

Pierwszy werdykt jest na ekranie w 10. sekundzie. Najdłuższe ujęcie trwa 5 s. Nazwa „Meritum” pada trzy razy: w 5., 22. i 35. sekundzie.

## Tekst lektora

Głos mówi łącznie 29,8 s (74% filmu), 59 słów. Tekst jest w `lektor.txt`, czasy każdego słowa w `src/data/lektor.json`.

| # | Start | Koniec | Kwestia |
| --- | --- | --- | --- |
| 1 | 0:00,2 | 0:01,8 | Dostajesz to codziennie. |
| 2 | 0:03,2 | 0:04,4 | Podać dalej? |
| 3 | 0:05,1 | 0:08,2 | Meritum sprawdza takie wiadomości w źródłach. |
| 4 | 0:11,0 | 0:15,5 | Każde twierdzenie dostaje werdykt, z cytatem i ze źródłem. |
| 5 | 0:16,2 | 0:19,8 | A drugie zdanie z tej samej wiadomości się zgadza. |
| 6 | 0:20,3 | 0:26,0 | Kiedy źródeł brakuje, Meritum mówi wprost: nie wiemy, więc nie zgadujemy. |
| 7 | 0:27,2 | 0:31,4 | Na stronie, na Discordzie i we wtyczce wynik jest ten sam. |
| 8 | 0:32,3 | 0:34,4 | Sprawdź, zanim podasz dalej. |
| 9 | 0:35,2 | 0:38,8 | Meritum. Obywatelski radar dezinformacji. |

## Napisy a czas czytania

Reguła z briefu: `sekundy = znaki / 17 + 0,5`.

| Napis | Znaki | Potrzeba | Jest na ekranie |
| --- | --- | --- | --- |
| Podać dalej? | 12 | 1,2 s | 2,0 s |
| Nie wiemy, więc nie zgadujemy. | 30 | 2,3 s | 3,4 s (drugi wiersz 2,6 s) |
| Sprawdź, zanim podasz dalej. | 28 | 2,1 s | 2,7 s |

Każdy z tych napisów powtarza słowa, które w tej chwili mówi lektor.

## Czego film nie pokazuje

SMS-ów, liczb z ewaluacji, kosztów, czasu odpowiedzi, panelu moderatora, logo ministerstwa ani logo innych organizacji. Nie ma kursora ani pisania zdań litera po literze.
