# Warszawska Park — ETAP 07 / korekta masterplanu premium

## Zakres zmiany

Zmiana dotyczy wyłącznie interaktywnego masterplanu w sekcji wyboru działki. Pozostałe sekcje ETAP 06 pozostają bez zmian.

## Wdrożone korekty

1. Numery działek w górnym, wąskim rzędzie (265/14–265/29) są obrócone o 90° i wycentrowane w parcelach.
2. Wszystkie numery działek mają teraz jednolity, mniejszy rozmiar typografii. Usunięto wcześniejsze duże warianty etykiet.
3. Usunięto dodatkowy napis „NAJEDŹ LUB KLIKNIJ DZIAŁKĘ” z samego masterplanu, aby mapa była czystsza.
4. Działki mają bardzo delikatny kolor statusu także w stanie spoczynkowym.
5. Hover wzmacnia maskę oraz cienką obwódkę w kolorze statusu.
6. Kliknięcie/wybór działki pozostawia bardziej intensywną maskę i nieco mocniejszą, nadal subtelną obwódkę.
7. Zrezygnowano z grubej białej obwódki i ciężkiego glow. Efekt jest bardziej „quiet premium”.
8. Obsługa kolorów została przygotowana także dla przyszłych statusów: dostępna, zarezerwowana, sprzedana oraz Etap II.
9. Tereny wspólne nie reagują jak działki sprzedażowe i nie dostają przypadkowego hovera.
10. Podkład zdjęciowy i SVG przesunięto razem lekko w lewo oraz minimalnie powiększono, aby lepiej eksponować prawą/początkową część układu działek bez rozjechania geometrii.
11. Etykieta działki drogowej została ukryta, ponieważ nie jest działką ofertową i pogarszała czytelność mapy.

## Parametry wizualne

- etykieta działki: 20 jednostek SVG, jednolita dla całej mapy,
- hover: obwódka 1.35 px,
- selected: obwódka 1.65 px,
- spoczynek: obwódka 0.55 px,
- mapa: `translateX(-1.25%) scale(1.03)` — identyczna transformacja dla podkładu i warstwy SVG.

## QA

- `PlotExplorer.jsx` — parser TypeScript/JSX: OK,
- `plotData.js` — parser JavaScript: OK,
- `main.jsx` — parser JSX: OK,
- bilans klamer CSS: OK,
- wykonany podgląd kontrolny masterplanu: `references/qa-masterplan-etap07.png`.
