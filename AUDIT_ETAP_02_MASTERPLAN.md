# AUDIT ETAP 02 — MASTERPLAN / DZIAŁKI

Data: 2026-09-17

## Zakres

1. zachowanie zaakceptowanego hero i fixed headera z Etapu 01,
2. dodanie drugiej sekcji zgodnej z makietą „Wybierz działkę i poznaj szczegóły”,
3. integracja rzeczywistych numerów geodezyjnych, powierzchni i cen netto,
4. działający masterplan SVG + panel szczegółów,
5. synchronizacja z tabelą,
6. responsywność desktop / mobile,
7. integracja CTA działki z formularzem kontaktowym.

## Dane

- 45 warstw geometrycznych w masterplanie,
- 40 działek ofertowych,
- 19 działek Etapu I,
- 21 działek Etapu II,
- 5 warstw nieofertowych: 2 inwestycyjne, 2 parkowe, 1 drogowa,
- wszystkie działki ofertowe mają: numer, metraż, cenę netto, cenę netto/m², typ, etap oraz ścieżkę SVG.

## Testy wykonane

- parse + transpile kontrolny `src/main.jsx`: OK,
- parse + transpile kontrolny `src/PlotExplorer.jsx`: OK,
- parse + transpile kontrolny `src/plotData.js`: OK,
- unikalność 45 identyfikatorów: OK,
- zakres wszystkich punktów SVG w viewBox 1024×518: OK,
- brak brakujących cen/metraży dla 40 działek ofertowych: OK,
- liczba nawiasów CSS: zgodna,
- kontrolny render desktop 1440 px: OK,
- kontrolny render mobile 390 px: OK,
- mobile `scrollWidth === clientWidth`: OK — brak globalnego poziomego overflow,
- kontrolna tabela QA: 12 wierszy w widoku skróconym + pełna lista w komponencie produkcyjnym.

## Ograniczenie środowiska QA

Próba `npm install` w środowisku roboczym została przerwana przez brak odpowiedzi z rejestru npm. Z tego powodu nie wykonano pełnego buildu Vite w kontenerze. Kod JSX został niezależnie sparsowany i przetranspilowany przez lokalny kompilator TypeScript, a warstwa wizualna masterplanu została sprawdzona w Chromium na samowystarczalnym harnessie QA.
