# ETAP 10 — Masterplan: pełny kadr 1:1 bez pan

## Cel
Usunąć problem rozjeżdżania podkładu JPG i interaktywnego SVG oraz pokazać cały masterplan od lewej do prawej w jednym kadrze.

## Wprowadzone zmiany
- usunięto mechanizm pan / drag oraz strzałki nawigacyjne;
- usunięto dodatkowe skalowanie `MASTERPLAN_ZOOM = 1.30`;
- usunięto niezależne `transform: scale(1.18)` z warstwy SVG;
- JPG i SVG są teraz osadzone absolutnie w tym samym kontenerze o proporcji 2013/1019;
- oba elementy mają dokładnie `width:100%` i `height:100%`, więc skalują się wspólnie i proporcjonalnie;
- na desktopie, tablecie i mobile nie jest wymuszany minimalny rozmiar mapy powodujący poziome przewijanie;
- zachowano interaktywny hover, klik, statusy, etykiety działek i panel szczegółów;
- zachowano mocne kolory statusów z ETAP 09.

## Weryfikacja
- plik podkładu ma natywny rozmiar 2013 × 1019 px;
- `MASTERPLAN_VIEWBOX` wynosi `0 0 2013 1019`;
- wykonano kontrolny render pełnego kadru z tym samym podkładem i ścieżkami SVG;
- skrajne działki po lewej i prawej stronie mieszczą się w jednym kadrze;
- geometria ścieżek pokrywa się z białymi granicami działek na podkładzie.
