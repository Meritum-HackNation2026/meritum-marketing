# Zgłoszenie konkursowe: wymagania formalne

Treść zadania konkursu MSZ „Prawdowid” wymienia osiem rzeczy, które musi zawierać projekt wysłany do oceny. Ten plik ma je wszystkie w jednym miejscu: przy każdej jest gotowa treść albo link do materiału w tym repozytorium. Stan na 22 listopada 2026.

## Stan w skrócie

| # | Wymóg | Stan | Gdzie |
| --- | --- | --- | --- |
| 1 | Nazwa zespołu, tytuł i opis do 4000 znaków | tekst gotowy, nazwę potwierdza zespół | [sekcja 1](#1-nazwa-zespołu-tytuł-i-opis) |
| 2 | Prezentacja PDF, najwyżej 12 slajdów | są dwie wersje, zespół wybiera jedną | [sekcja 2](#2-prezentacja-pdf) |
| 3 | Film demonstracyjny pod linkiem, najwyżej 3 minuty | trzy warianty pod publicznymi linkami, zespół wybiera jeden | [sekcja 3](#3-film-demonstracyjny) |
| 4 | Link do repozytorium z instrukcją uruchomienia | instrukcja gotowa, repozytoria są prywatne | [sekcja 4](#4-repozytorium-i-uruchomienie) |
| 5 | Architektura, przepływ danych, modele, dostawcy, ograniczenia | gotowe | [sekcja 5](#5-architektura-przepływ-danych-modele-dostawcy-ograniczenia) |
| 6 | Źródła, licencje, kwalifikacja i aktualizacja | gotowe | [sekcja 6](#6-źródła-licencje-kwalifikacja-i-aktualizacja) |
| 7 | Wyniki testów z danymi do odtworzenia | zmierzone, część celów niespełniona, odporność niezmierzona | [sekcja 7](#7-wyniki-testów) |
| 8 | Lista ryzyk | gotowa | [sekcja 8](#8-ryzyka) |

Co jeszcze musi zrobić człowiek, jest na [końcu pliku](#co-zostało-do-zrobienia).

## 1. Nazwa zespołu, tytuł i opis

| Pole formularza | Wartość |
| --- | --- |
| Nazwa zespołu | Meritum (do potwierdzenia przez zespół) |
| Tytuł | Meritum: obywatelski radar dezinformacji |

Opis do formularza jest między znacznikami. Limit 4000 znaków pilnuje `tests/test_submission.py`.

<!-- opis:start -->
Meritum to obywatelski radar dezinformacji. Wklejasz tekst albo link, a system sprawdza każde twierdzenie w opisanych źródłach, cytuje dosłowny fragment i mówi wprost, gdy dowodów brakuje.

**Jak to działa.** Jedna ścieżka bez ręcznej ingerencji: przyjęcie, wyłuskanie twierdzeń (model oddziela fakty od opinii), wyszukiwanie w korpusie i na żywo, werdykt, odpowiedź, zapis przebiegu. Werdyktów jest pięć, w tym „brak wystarczających dowodów” z opisem tego, czego nie ustaliliśmy. Cytat przechodzi tylko wtedy, gdy fragment występuje dosłownie w tekście źródła. Każde źródło ma tytuł, wydawcę, datę, link i fragment, a wynik zawsze ma sekcję „Ograniczenia”.

**Kanały.** Formularz WWW jest podstawowy. Aplikacja na Discordzie (komenda /sprawdz, polecenie przy wiadomości) woła ten sam rdzeń i daje ten sam wynik; jury może użyć makiety Discorda bez konta. Wtyczka Chrome z przyciskiem „Sprawdź” pod postami jest dodatkiem.

**Architektura i przepływ danych.** Architektura heksagonalna: kanały to adaptery wejściowe, modele i wyszukiwarka to adaptery za portami, więc dostawcę zmienia konfiguracja. Frontend (React) i API (FastAPI) zlecają sprawdzenie workerom DBOS na PostgreSQL (pgvector). Pytanie przechodzi przez maskowanie danych osobowych, detektor wstrzyknięć poleceń i klasyfikację, potem badanie twierdzeń równolegle w korpusie i w sieci, ocenę wymowy źródeł, werdykt i walidację kontraktu.

**Modele i dostawcy.** Model główny: Claude Haiku 5.5 przez OpenRouter. Embeddingi: Vertex AI w regionie UE. Wyszukiwanie na żywo: Vertex AI Search ograniczone do domen z katalogu. Oceny fact-checkerów: Google Fact Check Tools API. Rejestr podmiotów przetwarzających z krajem jest w dokumentacji.

**Źródła i licencje.** Katalog ma 64 domeny: 54 urzędowe i pierwotne (serwisy gov.pl i agencji z listy organizatora, ISAP, EUR-Lex, dane.gov.pl, BIP) oraz 10 wtórnych (fact-checkerzy z IFCN, EUvsDisinfo). Każda pozycja ma wydawcę, licencję albo podstawę prawną, wynik kontroli robots.txt i zastrzeżeń eksploracji tekstów, częstotliwość odświeżania i powód kwalifikacji. Korpus odświeża się co 15 minut i ma migawki co godzinę.

**Wyniki testów.** Liczby pochodzą z naszego skryptu `meritum-eval` na jawnym zestawie 64 przypadków, przez API wersji dev. Ostatni przebieg z 22.11: trafność werdyktu macro-F1 0,82 według raportu i 0,65 w liczeniu ścisłym (cel 0,75), pokrycie cytowań 90% (cel 95%), precyzja cytatów według sędziego 83% (cel 85%), wstrzymanie przy braku dowodów 100% (cel 80%), mediana czasu 50 s (cel 30 s). Odporności na wstrzyknięcia poleceń w całym potoku jeszcze nie zmierzyliśmy. Zestawu referencyjnego jury nie znamy i niczego na nim nie stroimy. Raporty wszystkich przebiegów i polecenie do odtworzenia są w `evals/reports/` w `meritum-worker`. Zrzuty w prezentacji i filmie to dane symulowane.

**Ograniczenia i ryzyka.** Czas odpowiedzi jest prawie dwa razy dłuższy od celu. Zestaw testowy jest nasz i mały. Zależymy od zewnętrznych dostawców: ich awaria kończy się stanem „Problem techniczny”, nigdy werdyktem. Vertex AI Search działa poza gwarancją UE. Demo działa na serwerze zespołu, docelowo GCP. Wstrzykiwanie poleceń przez treść źródeł ograniczamy skanem i kwarantanną. Zgody organizatora na źródła nie mamy na piśmie.

**Uruchomienie.** `git clone --recurse-submodules` repozytorium zbiorczego, potem `docker compose up`. Bez kluczy system startuje na atrapach i nic nie opuszcza komputera. Testy: `uv run pytest`, `uv run behave`; ewaluacja: `uv run meritum-eval`.
<!-- opis:end -->

## 2. Prezentacja PDF

Wymóg: PDF, najwyżej 12 slajdów, z problemem, użytkownikami, architekturą, demonstracją, wynikami testów, ryzykami i dalszymi krokami.

| Plik | Slajdy | Co to jest |
| --- | --- | --- |
| [`deck/meritum-deck.pdf`](../deck/meritum-deck.pdf) | 12 | deck zespołu, eksport z PowerPointa; źródło [`deck/meritum-deck.pptx`](../deck/meritum-deck.pptx) |
| [`deck/meritum-own/meritum-own.pdf`](../deck/meritum-own/meritum-own.pdf) | 12 | nasza wersja tej samej historii; źródło [`deck/meritum-own/index.html`](../deck/meritum-own/index.html) |

Jury dostaje jeden plik. Oba mają te same 12 slajdów i wszystkie wymagane części: problem, użytkowników i kanały, architekturę (slajd 8), demonstrację, wyniki testów (slajd 9), koszty i skalowanie (slajdy 10 i 11), ryzyka i dalsze kroki. Liczby na slajdach pochodzą z arkusza [`docs/meritum-koszty-i-wyniki.xlsx`](../docs/meritum-koszty-i-wyniki.xlsx). Dodatek poza limitem slajdów: [`deck/meritum-own/dodatek.pdf`](../deck/meritum-own/dodatek.pdf). Jak budować i eksportować decki: [`deck/README.md`](../deck/README.md).

Publiczne kopie: [prezentacja Meritum](https://meritum-static.gburek.app/pitch/meritum-own.pdf), [prezentacja zespołu](https://meritum-static.gburek.app/pitch/meritum-deck.pdf), [arkusz](https://meritum-static.gburek.app/meritum-koszty-i-wyniki.xlsx), [dodatek](https://meritum-static.gburek.app/dodatek.html).

## 3. Film demonstracyjny

Wymóg: film dostępny pod linkiem, najwyżej 3 minuty.

| Plik | Długość | Stan |
| --- | --- | --- |
| [`film/meritum-film.mp4`](../film/meritum-film.mp4) | 85 s | w repozytorium; scenariusz w [`film/scenariusz.md`](../film/scenariusz.md) |

Trzy krótsze warianty czekają na wybór w PR #22, #23 i #24; po scaleniu będą w `film/warianty/`. Wszystkie trzy są już dostępne publicznie, bez logowania:

| Wariant | Długość | Adres |
| --- | --- | --- |
| A „Zanim podasz dalej”, z lektorem | 40 s | https://meritum-static.gburek.app/film/meritum-film-a.mp4 |
| B „Jedno zdanie”, bez lektora | 40 s | https://meritum-static.gburek.app/film/meritum-film-b.mp4 |
| C „Manifest”, z lektorem | 31 s | https://meritum-static.gburek.app/film/meritum-film-c.mp4 |

Do formularza idzie jeden adres: ten, który wybierze zespół. Zrzuty interfejsu w filmie to dane symulowane i każde ujęcie z wynikiem ma taki podpis. Źródła dźwięku i krojów: [`film/CREDITS.md`](../film/CREDITS.md).

## 4. Repozytorium i uruchomienie

Wymóg: link do repozytorium kodu z instrukcją uruchomienia.

Repozytorium zbiorcze: https://github.com/Meritum-HackNation2026/meritum-monorepo. Składa komponenty jako submoduły. W dniu pisania wszystkie repozytoria organizacji są prywatne, więc jury zobaczy je dopiero po upublicznieniu albo po dodaniu do organizacji.

```bash
git clone --recurse-submodules git@github.com:Meritum-HackNation2026/meritum-monorepo.git
cd meritum-monorepo
cp .env.example .env         # opcjonalnie: własne klucze
docker compose up --build
```

| Adres | Co |
| --- | --- |
| http://localhost:8080 | aplikacja webowa |
| http://localhost:8080/api/docs | dokumentacja API |
| http://localhost:8080/api/v1/health | test gotowości |
| http://localhost:3000 | makiety platform i Discorda |

Potrzebny jest Docker z Compose 2.24 lub nowszym. Bez pliku `.env` system startuje na atrapach modelu, embeddingów i transkrypcji. Pełna instrukcja, opis zmiennych i test dymny są w sekcji „Uruchomienie lokalne” README repozytorium zbiorczego.

Demo bez instalacji: https://meritum.gburek.app (aplikacja) i https://meritum-discord.gburek.app (makieta Discorda).

## 5. Architektura, przepływ danych, modele, dostawcy, ograniczenia

Wymóg: krótki opis architektury, przepływu danych, użytych modeli, dostawców i najważniejszych ograniczeń.

**Architektura.** Kanały (strona WWW, aplikacja na Discordzie, wtyczka Chrome, SMS i konektor MCP w wersji dev) wołają jedno API w FastAPI. API zapisuje zlecenie w kolejce w PostgreSQL, a worker wykonuje je jako workflow DBOS. Kanały są adapterami wejściowymi, a model, wyszukiwarka i magazyn plików stoją za portami, więc dostawcę zmienia konfiguracja. Kontrakty danych są w jednym repozytorium, `meritum-core`. Całość działa w kontenerach Docker na serwerze zespołu; docelowo GCP w regionie europe-central2.

**Przepływ danych.** Pytanie przechodzi kolejno przez: maskowanie danych osobowych, detektor ukrytych poleceń, wyłuskanie twierdzeń, trzy wyszukiwania naraz (korpus, świeże publikacje z domen katalogu, oceny fact-checkerów), ocenę wymowy każdego źródła, sprawdzenie, czy cytat jest w źródle słowo w słowo, napisanie odpowiedzi i zapis przebiegu. Zapis usuwamy po 30 dniach.

**Modele i dostawcy.**

| Do czego | Dostawca i model |
| --- | --- |
| model językowy | OpenRouter: Claude Haiku 5.5 |
| embeddingi | Vertex AI, region UE |
| wyszukiwanie na żywo | Vertex AI Search, tylko domeny z katalogu |
| oceny fact-checkerów | Google Fact Check Tools API |
| maskowanie, transkrypcja, tekst z obrazu | Google Cloud w UE: Sensitive Data Protection, Speech-to-Text, Cloud Vision |

**Ograniczenia.** Mediana czasu odpowiedzi to około 50 s przy celu 30 s. Vertex AI Search nie ma gwarancji przetwarzania w UE. Awaria dostawcy kończy się stanem „Problem techniczny”. SMS i konektor MCP działają tylko w wersji dev.

Szczegóły są w dokumentacji `meritum-docs`: [komponenty](https://github.com/Meritum-HackNation2026/meritum-docs/blob/main/docs/architektura/komponenty.md), [przepływ danych](https://github.com/Meritum-HackNation2026/meritum-docs/blob/main/docs/architektura/przeplyw-danych.md), [porty i adaptery](https://github.com/Meritum-HackNation2026/meritum-docs/blob/main/docs/architektura/porty-i-adaptery.md), [prywatność](https://github.com/Meritum-HackNation2026/meritum-docs/blob/main/docs/prywatnosc.md). Diagram architektury jest na slajdzie 8 obu prezentacji ([zespołu](../deck/meritum-deck.pdf), [Meritum](../deck/meritum-own/meritum-own.pdf)), a pełny diagram kontenerów w [dodatku](../deck/meritum-own/dodatek.pdf). Koszty i plan skalowania: [`docs/koszty-i-skalowanie.md`](../docs/koszty-i-skalowanie.md).

## 6. Źródła, licencje, kwalifikacja i aktualizacja

Wymóg: opis wykorzystanych źródeł, ich licencji, sposobu kwalifikacji i aktualizacji.

Meritum szuka dowodów tylko w jawnym katalogu: [`catalog/catalog.json`](https://github.com/Meritum-HackNation2026/meritum-core/blob/main/catalog/catalog.json) w `meritum-core`. Katalog ma 64 domeny.

| Podział | Liczba |
| --- | --- |
| urzędowe i pierwotne | 54 |
| wtórne | 10 |
| instytucje | 36 |
| dane publiczne | 15 |
| fact-checkerzy | 10 |
| akty prawne | 3 |

**Co jest w katalogu.** Serwisy gov.pl i agencji z listy organizatora, ISAP i EUR-Lex dla aktów prawnych, dane.gov.pl, strony BIP, a ze źródeł wtórnych fact-checkerzy z IFCN (fakenews.pl, pravda.org.pl) i EUvsDisinfo.

**Licencje.** Każda pozycja ma pole z licencją albo podstawą prawną, na przykład dokument urzędowy z art. 4 ustawy o prawie autorskim, oraz wynik kontroli robots.txt i zastrzeżeń eksploracji tekstów i danych. Domeny z zastrzeżeniem pomijamy.

**Kwalifikacja.** Każda pozycja ma wpisany powód kwalifikacji, a wykluczona powód wykluczenia; bez powodu wpis nie przechodzi walidacji. Demagoga i AFP Sprawdzam nie pobieramy, bo blokują automaty. Ich oceny bierzemy tylko jako ocenę z linkiem przez Google Fact Check Tools API. Konkret24 jest wykluczony, bo wymaga umowy licencyjnej.

**Aktualizacja.** Workflow `corpus_ingest` rusza co 15 minut i odświeża każdą pozycję z jej własną częstotliwością. Co godzinę powstaje migawka korpusu z sumami kontrolnymi, a jej identyfikator trafia do wyniku sprawdzenia. Kopia EUvsDisinfo synchronizuje się osobnym workflow.

Pełny opis: [źródła i katalog](https://github.com/Meritum-HackNation2026/meritum-docs/blob/main/docs/jak-dziala/zrodla.md) w `meritum-docs`. Zgody organizatora na użycie źródeł nie mamy na piśmie.

## 7. Wyniki testów

Wymóg: wyniki testów według sekcji 6 treści zadania, z danymi pozwalającymi odtworzyć rezultat.

Wszystkie liczby pochodzą z naszego skryptu `meritum-eval`. Zestaw to `evals/golden/fact-checks.json` w `meritum-worker`: 64 przypadki, które przygotowaliśmy sami. Zestawu referencyjnego jury nie znamy. Przebieg idzie przez API wersji dev, z prawdziwą wyszukiwarką i modelem, ze współbieżnością 4.

Ostatni przebieg, `fact-checks-2026-11-22-7b.json` (22.11.2026, 07:24 UTC):

| Miernik | Wynik | Cel MVP | Spełniony |
| --- | --- | --- | --- |
| trafność werdyktu, macro-F1 z raportu | 0,82 | co najmniej 0,75 | tak |
| trafność werdyktu, macro-F1 ścisłe | 0,65 | co najmniej 0,75 | nie |
| pokrycie cytowań | 90% | co najmniej 95% | nie |
| precyzja cytatów według sędziego | 83% | co najmniej 85% | nie |
| wstrzymanie przy braku dowodów | 100% | co najmniej 80% | tak |
| odporność na wstrzyknięcia poleceń | nie zmierzono | co najmniej 90% | brak |
| czas odpowiedzi, mediana | 50 s | najwyżej 30 s | nie |

Jak zmieniały się wyniki w kolejnych przebiegach tego samego dnia:

| Przebieg | Start (UTC) | Macro-F1 | Trafność | Pokrycie cytowań | Precyzja cytatów | Wstrzymanie | Mediana [s] |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0, bazowy | 03:08 | 0,46 | 0,41 | 1,00 | 0,45 | 0,86 | 39 |
| 1 | 03:47 | 0,54 | 0,58 | 0,93 | 0,43 | 1,00 | 47 |
| 2 | 04:27 | 0,61 | 0,66 | 0,97 | 0,51 | 1,00 | 53 |
| 3 | 05:00 | 0,73 | 0,73 | 0,94 | 0,60 | 1,00 | 53 |
| 5 | 05:48 | 0,82 | 0,83 | 0,88 | 0,58 | 1,00 | 51 |
| 7 | 07:08 | 0,81 | 0,80 | 0,88 | 0,84 | 1,00 | 53 |
| 7b | 07:24 | 0,82 | 0,83 | 0,90 | 0,83 | 1,00 | 50 |

Zastrzeżenia do tych liczb:

- Macro-F1 z raportu zamienia dozwolony werdykt alternatywny na oczekiwany, więc zalicza klasę „wprowadzające w błąd”, której potok nigdy nie zwraca. Liczenie ścisłe bierze tylko werdykty, które system naprawdę zwrócił, i daje 0,65 dla przebiegu 7b (`evals/reports/research.md`). Bez zastrzeżeń spełniamy więc jeden cel z sześciu: wstrzymanie przy braku dowodów.
- Poprawki powstawały na tych samych 64 przypadkach, więc wynik może być zawyżony.
- Przebiegi 0 do 2 mają opis przyczyn błędów w `evals/reports/fact-checks.md`. Przebiegi 3 do 7b mają na razie tylko raporty JSON, bez takiej analizy.
- Zgłoszenie worker#247 opisało dwa błędy pomiaru: sędzia cytatów nie widział źródła, a macro-F1 zaliczało klasę, której potok nie zwraca. Zgłoszenie jest zamknięte, ale przebieg 5 powstał przed poprawką i jego macro-F1 jest zawyżone.
- Raporty mają też pole `citation_correctness` z wartościami od 0,05 do 0,14. To inny miernik niż precyzja cytatów i przed wysłaniem zgłoszenia trzeba ustalić, który z nich odpowiada celowi „poprawność cytowania 85%”.
- Pole `robustness` jest puste we wszystkich przebiegach. Bramki przed modelem były mierzone osobno (`evals/reports/gates-*.json`), ale to nie jest odporność całego potoku.
- Koszt modelu w przebiegu 2: 0,60 USD za 100 sprawdzeń, bez opłat za wyszukiwarkę.

Jak odtworzyć:

```bash
git clone git@github.com:Meritum-HackNation2026/meritum-worker.git && cd meritum-worker
uv sync
set -a; source ../.env; set +a    # OPENROUTER_API_KEY dla sędziego cytatów
MERITUM_LLM_PROVIDER=openrouter MERITUM_LLM_MODEL=anthropic/claude-haiku-5.5 \
  uv run meritum-eval --cases evals/golden/fact-checks.json --api https://meritum-dev.gburek.app \
  --judge --fresh --max-concurrency 4 --output evals/reports/moj-przebieg.json
```

Sędzia cytatów wymaga własnego klucza OpenRouter. Bez sieci to samo polecenie działa na atrapie modelu (`MERITUM_LLM_PROVIDER=stub`), ale wtedy liczby nie są porównywalne.

Raporty i opis metody: [`evals/reports/`](https://github.com/Meritum-HackNation2026/meritum-worker/tree/develop/evals/reports) w `meritum-worker`, w tym [`fact-checks.md`](https://github.com/Meritum-HackNation2026/meritum-worker/blob/develop/evals/reports/fact-checks.md). Dokładne parametry polecenia są w README tego repozytorium. Wyniki widać też w aplikacji pod `/panel/eval`, a administrator może dać jurorowi dostęp do odczytu jednorazowym linkiem.

## 8. Ryzyka

Wymóg: krótka lista najważniejszych ryzyk, obejmująca co najmniej halucynacje, stronniczość źródeł, prywatność, prompt injection, dostępność i nadużycia.

| Ryzyko | Co robimy | Co zostaje |
| --- | --- | --- |
| Halucynacje | Cytat musi być w tekście źródła słowo w słowo, inaczej odpada przed pokazaniem. Bez cytatu nie ma werdyktu. | Precyzja cytatów według sędziego to 83%, poniżej celu; ścisła trafność werdyktu to 0,65. |
| Stronniczość źródeł | Katalog jest jawny, z powodem kwalifikacji każdej domeny. Dwie strony jednego wydawcy liczą się jako jedno źródło. Gdy źródła się różnią, pokazujemy obie strony i nie rozstrzygamy. | Katalog opiera się głównie na źródłach urzędowych. |
| Prywatność | Maskujemy telefon, e-mail i PESEL przed modelem. Zapis usuwamy po 30 dniach. Rejestr podmiotów przetwarzających jest jawny. | Vertex AI Search działa poza gwarancją UE. |
| Prompt injection | Kontrola przed każdym wywołaniem modelu, kwarantanna stron z wyszukiwania, zapis każdej próby. Model nie ma narzędzi, które zmieniają dane. | Odporności całego potoku jeszcze nie zmierzyliśmy. |
| Dostępność | WCAG 2.2 AA, prosty język, formularz na telefonie bez instalacji, tryb wysokiego kontrastu i powiększanie tekstu. | Nie testowaliśmy z czytnikiem ekranu. |
| Nadużycia i awarie | Limity zapytań. Przy awarii dostawcy pokazujemy „Problem techniczny”, nigdy werdykt. | Ochrona przed masowym ruchem zależy od Cloudflare. |

## Co zostało do zrobienia

1. **Film.** Wybrać jeden z trzech wariantów z [sekcji 3](#3-film-demonstracyjny) i wpisać jego adres do formularza.
2. **Jedna prezentacja.** Wybrać PDF dla jury z [sekcji 2](#2-prezentacja-pdf).
3. **Repozytoria.** Upublicznić je albo dać jury dostęp, i sprawdzić `docker compose up` na czystej maszynie.
4. **Poprawność cytowania.** Ustalić, który miernik odpowiada celowi 85%, i poprawić opis, jeśli to nie precyzja według sędziego.
5. **Odporność na wstrzyknięcia.** Zmierzyć ją w całym potoku albo zostawić w zgłoszeniu jako niezmierzoną.
6. **Nazwa zespołu** i wpis do formularza: kopia z [sekcji 1](#1-nazwa-zespołu-tytuł-i-opis).
