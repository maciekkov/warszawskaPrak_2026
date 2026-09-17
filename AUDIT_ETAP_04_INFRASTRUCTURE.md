# Warszawska Park — ETAP 04 / Infrastruktura

## Zakres wdrożenia

Dodano nową sekcję bezpośrednio po „Postęp inwestycji” i przed kontaktem.

Sekcja składa się z dwóch części odwzorowujących dostarczony render:

1. **Nasze atuty**
   - główny nagłówek i lead,
   - 6 kart infrastruktury,
   - osobna karta „Gaz i światłowód”,
   - spokojna paleta krem / zieleń / złoto,
   - botaniczne detale i skryptowe mikrohasła.

2. **Infrastruktura w planie**
   - ten sam podkład `masterplan-map.jpg`, który jest używany przez masterplan,
   - bez interaktywnych masek / obrysów działek z sekcji sprzedażowej,
   - przełączalne i łączone warstwy: droga, woda, kanalizacja, energia, oświetlenie, zieleń / park, główny wjazd oraz gaz + światłowód,
   - możliwość włączenia kilku warstw jednocześnie,
   - prawy panel opisujący ostatnio wybraną warstwę,
   - legenda aktywnych warstw,
   - responsywny wariant desktop / tablet / mobile.

## Integracja

- Kotwica `#infrastruktura` prowadzi teraz do właściwej sekcji.
- CTA z końca sekcji „Postęp inwestycji” przewija właśnie do tego modułu.
- Kolejność strony: Hero → Masterplan / działki → Postęp inwestycji → Infrastruktura → Kontakt → Stopka.

## Kontrola techniczna

- Sprawdzono balans nawiasów i bloków w `main.jsx`.
- Sprawdzono balans bloków CSS.
- Każda warstwa ma osobny identyfikator i własny kolor.
- Reset „Plan działek” usuwa wszystkie aktywne warstwy.
- Warstwy działają w modelu multi-select.

## Ważne

Przebieg sieci w tej iteracji jest wizualizacją interaktywną przygotowaną pod docelowe dane branżowe. Podkład mapy jest właściwy i wspólny z masterplanem, natomiast przed publikacją techniczne przebiegi przewodów należy podmienić 1:1 na zatwierdzone trasy z dokumentacji branżowej, jeśli mają być przedstawiane jako dane techniczne, a nie poglądowe.
