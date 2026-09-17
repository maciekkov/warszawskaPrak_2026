# ETAP 19 — Panoramy 360° w schemacie Domy na Polnej

## Co zmieniono

- usunięto interaktywny viewer 360° osadzony bezpośrednio w dwóch kartach sekcji,
- karty panoram są teraz wyłącznie estetycznymi kartami promo,
- kliknięcie karty otwiera pełnoekranowy modal panoramy 360°,
- viewer Three.js jest inicjalizowany dopiero po otwarciu modala,
- mechanizm odwzorowuje rozwiązanie z projektu `domy-na-polnej-www`:
  - przeciąganie myszką i palcem,
  - zoom kółkiem myszy,
  - przyciski + / −,
  - reset widoku,
  - sterowanie strzałkami klawiatury,
  - ESC zamyka modal,
  - focus trap i blokada scrolla strony,
  - pełnoekranowa warstwa z topbarem i krótką instrukcją.

## Pliki panoramiczne

Viewer korzysta bezpośrednio z oryginalnych plików equirektangularnych 2:1:

- `dji_fly_20250505_143132_400_1746536187972_pano_optimized.jpg`
- `dji_fly_20250422_104408_335_1745312040457_pano_optimized.jpg`

## Karty promo

Z oryginalnych panoram wykonano osobne, perspektywiczne kadry podglądowe:

- `panorama-promo-inwestycja.jpg`
- `panorama-promo-okolica.jpg`

Są to tylko grafiki zapowiadające. Po kliknięciu uruchamiany jest właściwy plik panoramiczny 360°.

## Dependency

- usunięto `@photo-sphere-viewer/core`,
- dodano `three ^0.185.0`, analogicznie do `domy-na-polnej-www`.
