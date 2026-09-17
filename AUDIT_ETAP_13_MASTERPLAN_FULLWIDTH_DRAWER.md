# ETAP 13 — Masterplan full width + panel działki

Wdrożone zmiany:
- masterplan zajmuje praktycznie całą szerokość sekcji/viewportu;
- zdjęcie i SVG są renderowane wewnątrz jednego SVG, więc zachowują wspólny układ współrzędnych;
- mapa ma poziomy pan: przeciągnięcie po pustym obszarze przesuwa widok lewo/prawo;
- dodano dyskretne przyciski lewo / wyśrodkuj / prawo;
- kliknięcie działki otwiera panel szczegółów wysuwany z lewej strony;
- kliknięcie tej samej działki ponownie zamyka panel;
- kliknięcie innej działki przy otwartym panelu podmienia jego zawartość bez zamykania;
- kliknięcie pustego obszaru mapy zamyka panel;
- wybranie działki z tabeli otwiera ten sam panel na masterplanie;
- brak domyślnie otwartego panelu po wejściu do sekcji.

Walidacja:
- PlotExplorer.jsx: poprawna składnia JSX (TypeScript transpile diagnostics: 0 errors)
- main.jsx: poprawna składnia JSX (TypeScript transpile diagnostics: 0 errors)
- styles.css: tinycss2 — 0 błędów parsowania
