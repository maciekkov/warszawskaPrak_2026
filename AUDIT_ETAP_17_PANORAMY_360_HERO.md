# ETAP 17 — panoramy sferyczne 360° + nowe HERO

## Zmiany

1. Dwie panoramy nie są już pokazywane jako szerokie, statyczne zdjęcia.
2. Do projektu dodano framework **Photo Sphere Viewer** (`@photo-sphere-viewer/core` 5.15.1).
3. Źródłem viewerów są oryginalne pliki equirektangularne 2:1:
   - `dji_fly_20250505_143132_400_1746536187972_pano_optimized.jpg`
   - `dji_fly_20250422_104408_335_1745312040457_pano_optimized.jpg`
4. Każda panorama jest interaktywna: przeciąganie 360°, zoom oraz fullscreen.
5. Usunięto stare statyczne assety `panorama-dzialki.jpg` i `panorama-okolica.jpg`.
6. HERO korzysta teraz z pliku:
   - `dji_fly_20250420_135900_287_1745150439279_photo_optimized.jpg`
   który został zapisany jako `/public/assets/hero-bg.jpg`.

## Uruchomienie

```bash
npm install
npm run dev
```

`npm install` pobierze Photo Sphere Viewer i jego zależność Three.js.
