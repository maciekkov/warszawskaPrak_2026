# ETAP 14 — Masterplan Full Fit + Compact Drawer

## Zakres korekty

1. Usunięto poziomy pan oraz strzałki nawigacji masterplanu.
2. Cały układ działek jest renderowany jednocześnie na jednej szerokości — od skrajnej lewej do skrajnej prawej działki.
3. Podkład JPG i geometria SVG są renderowane w jednym SVG i korzystają z tego samego układu współrzędnych, więc nie mogą rozjechać się wskutek osobnego skalowania/transformacji.
4. Zastosowano wspólny viewBox `0 245 2013 600`, który obejmuje cały układ działek i ogranicza zbędny obszar zdjęcia powyżej i poniżej osiedla.
5. Panel szczegółów pozostaje wysuwany z lewej strony, ale został skompaktowany i nie ma wewnętrznego scrollbara.
6. Panel zawiera w jednym widoku: zdjęcie, status, typ/etap, numer działki, metraż, cenę netto, cenę za m², krótki opis, media, CTA i informację cenową.
7. Zachowano zachowanie interakcji: klik tej samej działki zamyka panel, klik innej podmienia dane, klik pustego pola zamyka panel.

## Techniczna zasada integralności mapy

Zdjęcie podkładowe jest osadzone jako `<image>` wewnątrz tego samego elementu `<svg>` co ścieżki działek. Zarówno raster, jak i `path` korzystają z przestrzeni 2013×1019. Kadrowanie odbywa się wyłącznie przez wspólny `viewBox`, bez osobnych transformacji CSS obrazu i overlayu.
