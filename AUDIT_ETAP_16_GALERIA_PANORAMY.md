# ETAP 16 — Galeria + panoramy

Dodano nową sekcję `#galeria` bezpośrednio po sekcji Lokalizacja i przed Postępem inwestycji.

## Galeria
- używa 5 dostarczonych zdjęć z drona,
- układ quiet-premium na ciemnozielonym tle: jeden duży kadr + cztery mniejsze,
- każde zdjęcie otwiera pełnoekranowy lightbox,
- lightbox ma nawigację poprzednie/następne oraz obsługę ESC i klawiszy strzałek,
- nawigacja strony i stopka dostały odnośnik `Galeria`.

## Panoramy
Pod galerią dodano dwie duże karty:
1. `Panorama nad inwestycją` — szeroki widok nad działkami.
2. `Panorama okolicy` — lasy, zbiorniki wodne i Lubsko.

Kliknięcie karty otwiera zdjęcie panoramiczne w pełnoekranowym podglądzie.

## Assety
- `gallery-01-inwestycja.jpg`
- `gallery-02-miasto.jpg`
- `gallery-03-jeziora.jpg`
- `gallery-04-okolica.jpg`
- `gallery-05-dzialki.jpg`
- `panorama-dzialki.jpg`
- `panorama-okolica.jpg`

## QA
- `main.jsx`: parseDiagnostics = 0 (TypeScript JSX parser)
- `PlotExplorer.jsx`: parseDiagnostics = 0
- CSS: nawiasy klamrowe zbilansowane.
