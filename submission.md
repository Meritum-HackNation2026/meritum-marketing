# Zgłoszenie konkursowe: Meritum

Plik ma dwie części: gotowy tekst do formularza (między znacznikami, limit 4000 znaków, pilnuje go `tests/test_submission.py`) i listę kontrolną §4 treści zadania z podziałem na to, co jest gotowe, i to, co musi zrobić człowiek.

| Pole formularza | Wartość |
| --- | --- |
| Nazwa zespołu | Meritum (do potwierdzenia przez zespół) |
| Tytuł | Meritum: obywatelski radar dezinformacji |
| Repozytorium | https://github.com/Meritum-HackNation2026 (repozytorium zbiorcze `meritum-monorepo`; po upublicznieniu, patrz lista poniżej) |
| Demo | https://meritum.gburek.app (aplikacja), https://meritum-x.gburek.app (makieta X) |
| PDF | `deck/meritum-own/meritum-own.pdf` (12 slajdów) |
| Film | link w `film/link.txt` (jeszcze nie nagrany) |

## Opis do formularza

<!-- opis:start -->
Meritum to obywatelski radar dezinformacji. Wklejasz tekst albo link, a system sprawdza każde twierdzenie w opisanych źródłach, cytuje dosłowny fragment i mówi wprost, gdy dowodów brakuje.

**Jak to działa.** Jedna ścieżka od początku do końca, bez ręcznej ingerencji: przyjęcie, wyłuskanie twierdzeń (model oddziela fakty od opinii), wyszukiwanie w korpusie i na żywo, werdykt, odpowiedź, zapis przebiegu. Werdyktów jest pięć, w tym uczciwe „brak wystarczających dowodów” z opisem tego, czego nie ustaliliśmy. Cytat przechodzi tylko wtedy, gdy fragment występuje dosłownie w tekście źródła; inaczej odpada przed pokazaniem. Każde źródło ma tytuł, wydawcę, datę, link i fragment. Wynik zawsze ma sekcję „Ograniczenia”.

**Kanały.** Formularz WWW jest podstawowy. Drugi kanał to aplikacja na Discordzie (komenda /sprawdz, polecenie przy wiadomości, wiadomości głosowe), która woła ten sam rdzeń i daje ten sam wynik. Jury może ją dodać do własnego serwera albo użyć makiety Discorda bez dołączania. Wtyczka Chrome z przyciskiem „Sprawdź” pod postami to kanał dodatkowy, dla jury opcjonalny.

**Architektura i przepływ danych.** Architektura heksagonalna: kanały to adaptery wejściowe, modele i wyszukiwarka to adaptery za portami, więc dostawcę zmienia konfiguracja. Frontend (React) i API (FastAPI) zlecają długie operacje workerom DBOS na PostgreSQL (pgvector). Pytanie przechodzi przez maskowanie danych osobowych (telefon, e-mail, PESEL), detektor wstrzyknięć poleceń i klasyfikację, potem badanie twierdzeń równolegle w korpusie i w sieci, ocenę wymowy źródeł, werdykt i walidację kontraktu. Kontrakty są w jednym repozytorium (`meritum-core`).

**Modele i dostawcy.** Model główny: Claude Haiku 5.5 przez OpenRouter (bez zachowywania danych); porównywaliśmy też Gemini 3.5 Flash (Vertex, europe-west3), GPT-6.1 Terra i Step 3.7 Flash. Embeddingi: Vertex AI (gemini-embedding-001, text-multilingual-embedding-002, europe-central2). Wyszukiwanie na żywo: Vertex AI Search ograniczone do domen z katalogu. Rejestr podmiotów przetwarzających z krajem jest w dokumentacji produktu.

**Źródła i licencje.** Katalog zaczyna się od listy źródeł organizatora (serwisy gov.pl i agencji), uzupełniają go ISAP, EUR-Lex, dane.gov.pl i BIP oraz fact-checkerzy z IFCN (fakenews.pl, pravda.org.pl, EUvsDisinfo). Dla każdej domeny sprawdzamy robots.txt i zastrzeżenia eksploracji tekstów; katalog podaje licencję i powód kwalifikacji. Oceny Demagoga i AFP Sprawdzam bierzemy tylko jako ocenę z linkiem przez Google Fact Check Tools API.

**Wyniki testów.** Liczby pochodzą z naszego skryptu `meritum-eval` na golden secie (37 przypadków, zestaw deweloperski). Zestawu referencyjnego jury nie znamy, więc na nim niczego nie stroimy. Pomiar czasu i kosztu samego modelu: mediana 2,5 s (GPT-6.1 Terra) do 4,3 s (Claude Haiku 5.5) na sprawdzenie, koszt 100 sprawdzeń od 0,03 do 1,14 USD zależnie od modelu. Trafności werdyktów jeszcze nie podajemy: przebieg nie miał korpusu z bazy, więc miary (macro F1 od 0,08 do 0,13) nie nadają się do oceny jakości, tylko do porównania czasu i kosztu. Paczka do odtworzenia i raporty: `evals/reports/` w `meritum-worker`. Ekrany w demo to dane symulowane.

**Ograniczenia i ryzyka.** Brak korpusu w pomiarach i niewielki golden set; zestaw jury jest ukryty. Zależność od zewnętrznych dostawców (limity, koszty, awarie kończą się stanem „Problem techniczny”, nigdy werdyktem). Wyszukiwanie Vertex AI Search działa poza gwarancją UE. Serwis demo działa na serwerze zespołu, docelowo GCP. Wstrzykiwanie poleceń przez treść źródeł ograniczamy skanem i kwarantanną, ale odporność mierzymy dopiero na polskim zestawie ataków. Zgoda organizatorów na źródła nie jest na piśmie.

**Uruchomienie.** `git clone --recurse-submodules` repozytorium zbiorczego, potem `docker compose up`; klucze dostawców podaje się w zmiennych środowiska (opis w README `meritum-worker`). Testy: `uv run pytest`, `uv run behave`; ewaluacja: `uv run meritum-eval`.
<!-- opis:end -->

## Lista kontrolna §4

| Wymóg | Stan | Gdzie |
| --- | --- | --- |
| Nazwa zespołu, tytuł | tekst gotowy, nazwę potwierdza zespół | tabela wyżej |
| Opis do 4000 znaków | gotowy, długość sprawdza test | sekcja „Opis do formularza” |
| PDF do 12 slajdów | jest `deck/meritum-own/meritum-own.pdf` (12 slajdów); slajd 11 czeka na liczby, patrz niżej | `deck/meritum-own/` |
| Film do 3 minut | do nagrania | `film/` |
| Link do repozytorium z instrukcją | tekst gotowy, repozytoria są jeszcze prywatne | opis, sekcja „Uruchomienie” |
| Architektura, przepływ danych, modele, dostawcy, ograniczenia | w opisie; szczegóły w dokumencie produktu (`design-system`) | opis |
| Źródła z licencjami | w opisie; pełna lista z licencjami w katalogu źródeł | opis |
| Wyniki testów z danymi do odtworzenia | tylko czas i koszt; trafność czeka na korpus | `meritum-worker/evals/reports/` |
| Lista ryzyk | w opisie | opis |

## Co musi zrobić człowiek

1. **Film (do 3 minut).** Nagrać formularz WWW i makietę Discorda, wtyczkę jako opcję; wgrać i wpisać link do `film/link.txt`. Scenariusz w `film/scenariusz.md` jeszcze nie istnieje.
2. **PDF dla jury.** Wyeksportować deck właściciela (`deck/meritum-deck.pptx`) do `deck/meritum-deck.pdf` (w repozytorium jest tylko PPTX), albo wysłać `deck/meritum-own/meritum-own.pdf`.
3. **Slajd 11 (wyniki).** Wstawić liczby z `meritum-worker/evals/reports/2026-11-22-modele.json` (czas, koszt) po decyzji, czy pokazujemy porównanie bez trafności. Dopisać „dane symulowane” przy zrzutach z makiet.
4. **Upublicznić repozytoria** i potwierdzić, że `docker compose up` działa na czystej maszynie; wtedy podmienić link w tabeli.
5. **Nazwa zespołu** i wpis do formularza (kopia z sekcji opisu).
6. **Trafność werdyktów.** Powtórzyć ewaluację, gdy będzie korpus z bazy (meritum-worker#113); wtedy zaktualizować opis i slajd 11.
