# Warszawska Park — React / Vite

Aktualny etap: **ETAP 10 — Masterplan pełny kadr 1:1**.

## Uruchomienie

```bash
npm install
npm run dev
```

## Zaimplementowane

- sticky / transparentny header przechodzący w ciemny wariant po scrollu,
- pełnoekranowy hero z dolnym paskiem pięciu najważniejszych parametrów,
- interaktywny masterplan działek z panelem szczegółów i tabelą,
- sekcja lokalizacji,
- sekcja „Postęp inwestycji”,
- sekcja „Nasze atuty” z kartami dotyczącymi przygotowania terenu i mediów,
- formularz kontaktowy,
- rozbudowana stopka,
- responsywność desktop / tablet / mobile.

## Zmiana ETAP 06

Na życzenie usunięto z aplikacji cały blok:

**„INFRASTRUKTURA W PLANIE — Zobacz plan infrastruktury na terenie inwestycji”**

wraz z interaktywną mapą warstw: droga, woda, kanalizacja, energia, oświetlenie, zieleń, wjazd, gaz i światłowód.

Pozostawiono poprzedzającą go sekcję **„Nasze atuty”**, ponieważ jest odrębnym blokiem prezentującym cechy inwestycji. CTA w sekcji postępu zostało zmienione z „Zobacz cały plan inwestycji” na „Zobacz infrastrukturę” i prowadzi teraz do sekcji „Nasze atuty”.


## Zmiana ETAP 08

- pusty obszar masterplanu nad i pod działkami działa jak uchwyt `grab`;
- plan można przeciągać wyłącznie w poziomie, a podkład i SVG pozostają zsynchronizowane;
- w prawym dolnym rogu dodano nawigację strzałkami lewo / prawo;
- hover oraz zaznaczenie działki mają wyraźniejszą maskę koloru statusu;
- cienka obwódka ma większą intensywność koloru niż sama maska;
- pozostałe elementy strony pozostawiono bez zmian.


## Zmiana ETAP 10

- usunięto przesuwanie masterplanu oraz strzałki lewo / prawo;
- cały plan jest widoczny od lewej do prawej w jednym kadrze;
- podkład JPG i SVG używają identycznego układu współrzędnych 2013 × 1019 i skalują się jako jedna kompozycja;
- usunięto niezależne powiększenie podkładu i SVG, które powodowało rozjazd granic;
- hover, klik oraz kolory statusów pozostają bez zmian.

## ETAP 16 — Galeria + panoramy
Dodano sekcję galerii zdjęć z drona oraz dwa pełnoekranowe podglądy panoram. Sekcja znajduje się po Lokalizacji i przed Postępem inwestycji.
