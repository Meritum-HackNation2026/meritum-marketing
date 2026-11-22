# Meritum: koszt wdrożenia (chmura vs on-prem) i plan skalowania

Stan na 2026-11-22. Opracowane na podstawie: `meritum-infra` (Terraform GCP i skrypty on-prem), `meritum-docs` (ADR-04, 14, 15, 18, 35), `meritum-monorepo` (README, `scripts/measure_costs.py`).

**Dokładne wyliczenia są w arkuszu `meritum-koszty-i-wyniki.xlsx`** (buduje go `build_workbook.py`), i to jego liczby trafiają na slajdy. Ten dokument powstał wcześniej, z cen GCP podanych w przybliżeniu i ze stałych 5 USD za 1000 sprawdzeń na model z wyszukiwarką. Arkusz bierze ceny z cenników z 22.11.2026, koszt modelu z benchmarku (6 USD za 1000 sprawdzeń; w lżejszym ruchu zespołu 1,2 USD), wyszukiwarkę ponad pulę bezpłatną, bramki i liczbę replik workera z pomiaru przepustowości. Wyniki obok siebie:

| Sprawdzeń miesięcznie | Ten dokument (§3) | Arkusz |
|---|---|---|
| 10 tys. | ok. 150 USD | 151 USD |
| 100 tys. | ok. 700 USD | 1 064 USD |
| 1 mln | ok. 6 500 do 8 000 USD | 9 551 USD |

Różni się też wniosek: w arkuszu model i wyszukiwarka to 32% rachunku przy 10 tys. sprawdzeń i 68% przy 100 tys., więc przewagę nad serwerami zyskują wcześniej, niż mówi §3. Kolejność wąskich gardeł z §5 jest w arkuszu ta sama.

**Co jest zmierzone, a co oszacowane.** Koszt modelu pochodzi teraz z **pomiaru**: `scripts/measure_costs.py` na 49 rekordach `CheckRecord` wyeksportowanych ze środowiska dev (2026-11-22). Ceny usług GCP, wyszukiwarki i sprzętu to nadal **wartości przybliżone z pamięci**. Potwierdź je w kalkulatorze GCP i w ofercie dostawcy sprzętu.

---

## 1. Co właściwie stawiamy

| Komponent | Dziś (on-prem, Dell Pro Max GB10) | Docelowo (GCP europe-central2, Terraform w `gcp/app`) |
|---|---|---|
| Wejście | Cloudflare tunel → nginx `meritum-gateway` | Cloudflare → Cloud Run |
| API (FastAPI) | kontener `meritum-api-<env>` | Cloud Run, 0 do 3 instancji, 1 vCPU / 512 MiB |
| Worker (DBOS) | kontener `meritum-worker-<env>` | VM e2-medium, autoskalowanie 1 do 3 na CPU 60% |
| Baza | jeden kontener PostgreSQL 18 + pgvector + pg_trgm + polski słownik | VM e2-medium z kontenerem Postgresa, dysk 20 GB, codzienne snapshoty (Cloud SQL odpada: nie załaduje polskiego słownika, ADR-04) |
| Frontend, makiety | kontenery nginx / Hono | do dopisania (w Terraformie jest API, worker, baza) |
| Pliki (nagrania, obrazy) | wolumen Dockera | bucket GCS w UE |
| Model językowy, embeddingi | **chmura**: OpenRouter (dev) / Vertex AI | Vertex AI w UE (`europe-west4`) |
| Bramki | DLP, klasyfikator wstrzyknięć, STT v2 | te same usługi Google |
| CI | 5 maszyn GCP e2-standard-4 | to samo |

Najważniejsza obserwacja: **dziś „on-prem" znaczy hosting aplikacji, a model i bramki i tak są w chmurze.** Dlatego koszt zależy głównie od liczby sprawdzeń, a nie od miejsca, gdzie stoi serwer.

---

## 2. Koszt jednego sprawdzenia (pomiar)

Źródło: `scripts/measure_costs.py` uruchomiony 2026-11-22 na 49 rekordach `CheckRecord` ze środowiska dev (eksport `meritum-dev-checkrecords.jsonl`).

| Wskaźnik | Wynik |
|---|---|
| Koszt 1 000 sprawdzeń (model, wszystkie rekordy) | **1,18 USD** |
| Koszt jednego sprawdzenia na prawdziwym modelu (44 rekordy) | ok. 0,0013 USD, maksimum 0,0042 USD |
| Model | `openrouter/anthropic/claude-haiku-5.5` (44 rekordy), `stub` (5 rekordów, koszt 0) |
| Wywołania modelu na sprawdzenie | średnio ok. 3 (od 1 do 6) |
| Tokeny na sprawdzenie | średnio ok. 4,6 tys. wejścia i 1,7 tys. wyjścia |
| Wyszukiwanie na żywo | średnio ok. 0,9 zapytania na sprawdzenie |
| Wg kanału | web 1,32 USD, Discord 0,88 USD (za 1 000) |
| Trafienia w pamięci wyników | 0% (ani jednego w tej próbce) |
| Statusy | 31 gotowych, 7 próśb o doprecyzowanie, 11 awarii technicznych |

**Czego ten pomiar nie obejmuje** (skrypt tego nie liczy, bo te pozycje nie mają wpisu w `models`):
- wyszukiwanie na żywo: przy ok. 0,9 zapytania i cenie rzędu 2 do 4 USD za 1 000 zapytań dochodzi ok. 2 do 4 USD na 1 000 sprawdzeń (moje założenie ceny);
- DLP, klasyfikator wstrzyknięć, embeddingi, transkrypcja nagrań (Speech-to-Text v2, rząd 0,016 USD za minutę audio).

**Rozsądna wartość do planowania: ok. 5 USD za 1 000 sprawdzeń** na modelu klasy Haiku. Przy mocniejszym, droższym modelu składnik modelu rośnie kilkukrotnie, więc przyjmuję 10 do 20 USD za 1 000.

Zastrzeżenia do pomiaru:
- próbka jest mała (49 sprawdzeń) i to ruch testowy zespołu, a nie prawdziwych użytkowników;
- 11 awarii technicznych skraca średnią (kończą się wcześniej), a 5 rekordów ze stubem ma koszt zero, więc prawdziwy koszt „udanego" sprawdzenia jest nieco wyższy niż 1,18 USD;
- kwotę `cost_usd` liczy wasz kod z cennika, więc warto raz porównać ją z fakturą OpenRouter;
- zero trafień w pamięci wyników oznacza, że oszczędności z cache dopiero są przed wami.

---|---|
| Model klasy „tani" (ok. 1 / 5 USD za mln tokenów) | ok. 0,02 USD |
| Model klasy „średni" (ok. 3 / 15 USD za mln) | ok. 0,06 USD |
| Wyszukiwanie na żywo (Vertex AI Search) | ok. 0,01 USD |
| DLP, embeddingi, klasyfikator | poniżej 0,005 USD |
| **Razem** | **ok. 0,03 do 0,08 USD (30 do 80 USD za 1 000)** |

Dodatkowo: transkrypcja nagrań (Speech-to-Text v2, rząd 0,016 USD za minutę audio). Trafienie w pamięci wyników (`cache_hit`) kosztuje prawie zero, więc 30% trafień obniża rachunek za model o ok. 30%.

---

## 3. Koszt miesięczny: chmura (GCP, tylko prd)

Na podstawie zasobów z `gcp/app` (ceny przybliżone, region Warszawa):

| Pozycja | Minimum | Pod obciążeniem (3 workery) |
|---|---|---|
| VM Postgres e2-medium | ok. 30 USD | ok. 30 USD |
| Dysk 20 GB + snapshoty 7 dni | ok. 4 USD | ok. 4 USD |
| Worker e2-medium (1 do 3) z dyskiem | ok. 32 USD | ok. 96 USD |
| Cloud Run API | 5 do 20 USD | 20 USD |
| Cloud NAT, ruch wychodzący | ok. 10 USD | ok. 15 USD |
| Secret Manager, Artifact Registry, logi | ok. 10 USD | ok. 15 USD |
| Cloudflare (Free albo Pro) | 0 | 25 USD |
| **Infrastruktura razem** | **ok. 90 do 110 USD** | **ok. 200 USD** |
| Środowisko dev (osobny worker i API) | +40 USD | +40 USD |

Budżet w Terraformie to 100 USD miesięcznie z alertami przy 50, 90 i 100%, więc **konfiguracja domyślna ledwo mieści się w budżecie bez żadnego ruchu na modelu**. Twarde limity to `api_max_instances` i `worker_max_replicas`.

**Najdroższa pozycja infrastruktury to CI, nie produkt:** 5 maszyn e2-standard-4 działających cały czas to ok. 500 do 550 USD miesięcznie. Dokumentacja w jednym miejscu mówi o 3 maszynach, w innym o 5, więc warto sprawdzić, ile jest naprawdę. Zmniejszenie do 1 do 2 maszyn albo runnery uruchamiane na żądanie obniża koszt o kilkaset USD.

### Razem, chmura (infrastruktura + model)

| Sprawdzeń miesięcznie | Infrastruktura | Model i wyszukiwarka (ok. 5 USD za 1 000; mocniejszy model 10 do 20) | **Razem** |
|---|---|---|---|
| 10 tys. | ok. 100 USD | 50 USD (100 do 200 USD) | **ok. 150 USD** (200 do 300 USD) |
| 100 tys. | ok. 200 USD | 500 USD (1 000 do 2 000 USD) | **ok. 700 USD** (1 200 do 2 200 USD) |
| 1 mln | 1 500 do 3 000 USD (większa baza z HA, 15 do 30 workerów) | 5 000 USD (10 000 do 20 000 USD) | **ok. 6 500 do 8 000 USD** (11 500 do 23 000 USD) |

Wniosek po pomiarze: **do ok. 100 tys. sprawdzeń miesięcznie koszt wyznacza infrastruktura, a nie model.** Dopiero w okolicach miliona sprawdzeń model i wyszukiwarka zaczynają przeważać. To odwraca moje pierwsze założenie. Przy tych liczbach największe oszczędności dają: obcięcie CI (ok. 500 USD miesięcznie), jedna VM zamiast kilku w dev, a dopiero potem optymalizacja modelu.

---|---|---|---|
| 10 tys. | ok. 100 USD | 300 do 800 USD | **ok. 400 do 900 USD** |
| 100 tys. | ok. 200 USD | 3 000 do 8 000 USD | **ok. 3 200 do 8 200 USD** |
| 1 mln | 1 500 do 3 000 USD (większa baza z HA, 15 do 30 workerów) | 30 000 do 80 000 USD | **ok. 32 000 do 83 000 USD** |

Wniosek: od około 10 tys. sprawdzeń miesięcznie **model stanowi 75 do 95% kosztu**. Oszczędności trzeba szukać tam (pamięć wyników, bramki przed LLM z ADR-35, tańszy model), a nie w rozmiarze VM.

---

## 4. Koszt: on-prem

Dwa warianty, bo „on-prem" może znaczyć dwie rzeczy.

### Wariant A: aplikacja on-prem, model w chmurze (stan obecny)

| Pozycja | Koszt |
|---|---|
| Serwer Dell Pro Max GB10 (ok. 4 000 USD, dziś już w posiadaniu zespołu) | amortyzacja 36 mies. ok. 110 USD miesięcznie |
| Prąd (ok. 100 W średnio) | ok. 20 USD |
| Łącze, UPS, kopie zapasowe | ok. 20 do 40 USD |
| Administracja (czas ludzi) | ok. 0,1 etatu, najważniejszy ukryty koszt |
| Model i usługi w chmurze | tak samo jak w sekcji 3 |

Infrastruktura wychodzi ok. 150 do 170 USD miesięcznie i **nie jest wyraźnie tańsza od chmury**. Różnica to głównie administracja i brak HA. Serwer dzieli host z projektami TuttiTrip i ExactDocs, więc obciążenie tamtych projektów wpływa na Meritum.

### Wariant B: w pełni on-prem z własnym modelem (ADR-14: „serwer z GPU jako opcja")

| Pozycja | Koszt |
|---|---|
| 2 × GB10 (aplikacja + inferencja, zapas na awarię) + switch, UPS, NAS na kopie | ok. 10 000 do 12 000 USD jednorazowo, ok. 300 do 350 USD miesięcznie w amortyzacji |
| Prąd, łącze | ok. 50 USD miesięcznie |
| Administracja | 0,1 do 0,2 etatu |
| Model | brak opłat za tokeny |

Opłaca się, gdy opłata za model i wyszukiwarkę przekracza ok. 400 USD miesięcznie. Przy zmierzonym koszcie modelu klasy Haiku (ok. 5 USD za 1 000) to **dopiero ok. 80 tys. sprawdzeń miesięcznie** (przy mocniejszym modelu ok. 20 do 40 tys.), i to pod warunkiem że otwarty model da jakość porównywalną po polsku. Przy obecnym, bardzo niskim koszcie modelu własny GPU raczej się nie zwróci. Tego repozytorium nie dowodzi: ewaluacja (ADR-27, 28) mierzy dziś modele Vertex i Anthropic. Przepustowość jednej maszyny GB10 szacuję rzędowo na kilka tysięcy sprawdzeń dziennie (pamięć 128 GB, ale przepustowość pamięci ogranicza generowanie), co **wymaga benchmarku na waszym modelu**.

Zaleta wariantu B, której nie widać w cenie: dane nie opuszczają Polski, co jest zgodne z założeniami konkursu MSZ (mniejsza zależność od dostawców spoza EOG). Dziś na ścieżce i tak stoi Cloudflare (USA), co ADR-14 wprost odnotowuje.

---

## 5. Jak skalować: kolejność wąskich gardeł

Od najszybciej występującego:

1. **Limity dostawcy modelu (RPM/TPM).** Najpewniej pierwszy twardy sufit (koszt nie będzie nim przez długo) przy wzroście ruchu. Wniosek o podniesienie limitów Vertex AI trzeba złożyć z wyprzedzeniem, najlepiej z drugim modelem zapasowym. Limit współbieżności w kolejce DBOS już istnieje (ADR-18) i chroni przed przekroczeniem.
2. **Limity ruchu w API (`slowapi`).** Liczą w pamięci każdego procesu osobno, więc przy kilku instancjach Cloud Run limit się rozjeżdża (ADR-18 to opisuje). Naprawa: wspólny licznik w PostgreSQL albo Redisie, zanim `api_max_instances` pójdzie powyżej 1.
3. **Skalowanie workerów na CPU jest złym sygnałem.** Worker czeka głównie na model i sieć, więc CPU zostaje niskie mimo długiej kolejki. Lepiej skalować po długości kolejki DBOS (liczba oczekujących sprawdzeń, jest już `MERITUM_MAX_PENDING_CHECKS`) albo po opóźnieniu. Cel to 30 s na sprawdzenie.
4. **PostgreSQL jako pojedynczy punkt.** Jedna VM trzyma kolejkę DBOS, dane aplikacji i korpus z pgvector. Kolejne kroki: (a) większa VM i pgBouncer, (b) replika do odczytu dla korpusu i wyszukiwania, (c) wydzielenie bazy DBOS na własną maszynę, (d) HA (np. Patroni). Cloud SQL nie wchodzi w grę przez polski słownik, więc pozostaje własna baza albo zmiana na słownik dostępny w zarządzanej usłudze.
5. **Korpus ma jednego pisarza** (`meritum_worker_prd`). Przy dużym korpusie wczytywanie warto wydzielić do osobnego zadania, a odczyt oprzeć o replikę.
6. **Obserwowalność kosztu na bieżąco:** `CheckRecord` już zapisuje tokeny, więc dashboard „koszt na sprawdzenie i na kanał" kosztuje niewiele pracy, a daje alarm przed przekroczeniem budżetu.

### Etapy

| Etap | Skala | Co zrobić |
|---|---|---|
| 0, dziś | demo, do ok. 1 tys. sprawdzeń/mies. | jedna VM/serwer, stuby lub tani model, budżet 100 USD |
| 1 | do ok. 10 tys. | pomiar kosztu (`measure_costs.py`), wspólny limiter, skalowanie workerów po kolejce, cache wyników, alert budżetowy na model |
| 2 | do ok. 100 tys. | osobna większa VM bazy + pgBouncer + replika, 5 do 10 workerów, zapasowy dostawca modelu, tańszy model dla łatwych przypadków (bramki ADR-35), tryb batch dla zadań nieinteraktywnych (ewaluacja, wczytywanie korpusu) |
| 3 | 1 mln i więcej | GKE Autopilot albo k3s zamiast ręcznych VM, HA bazy, wielu dostawców modeli z routingiem po koszcie, rozważenie własnego modelu na GPU dla ruchu masowego, CDN i wydzielone środowisko dla wtyczki |

W trybie on-prem etapy 1 i 2 oznaczają wydzielenie osobnych hostów dla bazy, API/workerów i GPU (obecnie wszystko jest na jednej maszynie wspólnej z innymi projektami), a etap 3 to k3s na kilku węzłach plus węzeł GPU z vLLM.

---

## 6. Rekomendacja

1. **Pomiar już jest, ale mały.** 49 sprawdzeń testowych dało ok. 1,2 USD za 1 000 na modelu. Powtórzcie go na kilkuset prawdziwych sprawdzeniach, na modelu docelowym (jeśli nie Haiku), z wyszukiwarką i bramkami wpisanymi do `models`, i porównajcie z fakturą OpenRouter.
2. **Do konkursu i pilotażu: chmura GCP** (Terraform już jest, region UE, budżet i limity wbudowane). Koszt rzędu 150 do 300 USD miesięcznie, w większości infrastruktura.
3. **On-prem w wariancie A nie oszczędza wiele** poza kosztem, który już ponieśliście. Ma sens jako rozwiązanie zapasowe i do demonstracji suwerenności danych.
4. **Wariant B (własny model) rozważać dopiero** po benchmarku jakości po polsku i przy ruchu powyżej ok. 80 tys. sprawdzeń miesięcznie (przy modelu klasy Haiku), albo gdy decydują względy suwerenności danych, a nie cena.
5. **Od razu obciąć koszt CI** (5 maszyn e2-standard-4 to ok. 500 USD miesięcznie).
6. **Uzupełnić luki:** Terraform nie obejmuje frontendu i makiet, a README i docs podają różną liczbę runnerów (3 i 5).
