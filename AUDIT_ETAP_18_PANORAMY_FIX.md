# ETAP 18 — poprawka ładowania panoram 360°

- Usunięto React.StrictMode, który w trybie developerskim podwójnie uruchamiał i niszczył efekt zewnętrznego viewer-a WebGL.
- Photo Sphere Viewer nadal jest właściwym silnikiem panoram.
- Wymuszono `EquirectangularAdapter` z `useXmpData: false`.
- Dla obu plików podano ręcznie pełne dane panoramy 2048×1024 (2:1).
- Przed uruchomieniem viewer-a plik jest preładowywany przez przeglądarkę.
- Dodano czytelny stan ładowania i komunikat błędu zamiast nieskończonego systemowego `Loading...`.
- Panoramy pozostają oryginalnymi plikami equirektangularnymi i są renderowane jako interaktywny widok 360°, nie jako zwykłe zdjęcia.
