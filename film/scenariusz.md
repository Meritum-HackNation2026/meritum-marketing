# Scenariusz filmu promocyjnego

Film trwa 85 sekund (2560 klatek, 30 kl./s). Nie ma lektora: wszystko, co film mówi, jest napisem na ekranie. Poniżej każda scena z czasem, obrazem i dokładnym brzmieniem napisów.

Napisy trzymają się `design-system/KEY_SELLING_POINTS.md`, `design-system/PRODUCT.md` i README monorepo. Teksty interfejsu pochodzą z `copy/pl.json`. Wyniki sprawdzeń to dane przykładowe z `contracts/examples.json`, podpisane w kadrze.

| Nr | Czas | Scena | Obraz | Napis |
| --- | --- | --- | --- | --- |
| 1 | 0:00-0:07 | Wiadomość | Biała strona. Słowo po słowie pojawia się przesłana wiadomość: „Prezydent w Polsce może rządzić przez trzy kadencje, a językiem urzędowym jest polski.” Wiadomość traci ostrość, pod nią wjeżdża pytanie. | „wiadomość przesłana dalej”, potem „Podać dalej?” |
| 2 | 0:07-0:15 | Strona główna | Nowa strona główna z hasłem „Sprawdź, zanim podasz dalej.” i przykładowym wynikiem obok. Kursor klika „Sprawdź informację”. | „Bez konta i bez instalacji.” |
| 3 | 0:15-0:24 | Formularz | Strona `/sprawdz`. Kamera zbliża się do pola, wiadomość wpisuje się litera po literze, kursor klika „Sprawdź”. | „Wklejasz tekst albo link.” |
| 4 | 0:24-0:35 | Sprawdzanie | Strona sprawdzenia: pasek postępu i lista kroków, którą kursor rozwija. Kroki zaliczają się po kolei, trzy wyszukiwania biegną naraz. | „Każde sprawdzenie przechodzi przez te same kroki.”, potem „Cytat przechodzi dalej tylko wtedy, gdy jest dosłownie w źródle.” |
| 5 | 0:35-0:53 | Wynik | Dwa twierdzenia. Pierwsze dostaje werdykt „Fałszywe”; kamera zbliża się do cytatu z Konstytucji i do źródła, potem do siły podstawy, nad którą otwiera się objaśnienie. Drugie twierdzenie dostaje „Potwierdzone”. | „Każdy werdykt ma cytat, wydawcę i datę.”, „Siła wynika z tego, co widzisz.”, „Dwa twierdzenia, dwa werdykty.” |
| 6 | 0:53-1:01 | Brak dowodów | Inne sprawdzenie: „Wczoraj w Gdańsku wyłączono wszystkie bankomaty.” Werdykt „Brak wystarczających dowodów” i sekcja „Czego nie udało się ustalić”. | „Nie wiemy, więc nie zgadujemy.” |
| 7 | 1:01-1:09 | Wygląd | Kursor otwiera menu „Wygląd” i wybiera motyw ciemny, potem ciemny o wysokim kontraście. Nowy motyw otwiera się kołem od miejsca kliknięcia. | „Tryb ciemny i wysoki kontrast.” |
| 8 | 1:09-1:17 | Kanały | Ciemne tło, to samo twierdzenie i trzy wiersze, każdy z werdyktem „Fałszywe”: strona WWW („Formularz, bez konta i bez instalacji.”), Discord („/sprawdz albo „Sprawdź w Meritum” przy wiadomości.”), wtyczka Chrome („Przycisk „Sprawdź” pod postem.”). | „Jeden rdzeń, ten sam wynik.” |
| 9 | 1:17-1:25 | Zamknięcie | Biel wraca od lewej. Znak rysuje się kreską, obok słowo „meritum”. | „obywatelski radar dezinformacji”, „Każde ustalenie ma źródło. Gdy źródeł brak, mówimy to wprost.”, „HackNation 2026 · konkurs MSZ „Prawdowid”” |

## Dźwięk

Muzyka gra cały film i zmienia się ze scenami: na otwarciu sam pad i pojedyncze tony, od strony głównej arpeggio, od sprawdzania miękki puls. W scenie braku dowodów puls milknie. Na zamknięciu zostaje jeden akord, który wygasa.

Dźwięki interfejsu: kliknięcia, pisanie, ton po każdym kroku sprawdzania, osobny dźwięk dla każdego z trzech werdyktów, szum przy zmianie motywu. Wszystkie są cichsze od muzyki. Szczegóły w `CREDITS.md`.

## Czego film nie pokazuje

- SMS-a. Dokumenty produktu opisują ten kanał jako dodatek „jeśli starczy czasu”, więc film go nie obiecuje.
- Liczb z ewaluacji, kosztów i czasu odpowiedzi. Do filmu trafią dopiero po pomiarze.
- Panelu moderatora, sprawy `#S-…` i próby wstrzyknięcia poleceń z planu demo w `KEY_SELLING_POINTS.md`. Nowy interfejs nie ma jeszcze tych ekranów.
