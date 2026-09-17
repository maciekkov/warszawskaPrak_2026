# Audyt ETAP 01 V2 — hero + stała nawigacja

Wersja po korekcie układu sekcji hero.

## Wdrożone zmiany

- Menu główne jest prawdziwym elementem interfejsu (`position: fixed`), a nie częścią grafiki hero.
- W stanie początkowym menu jest transparentne i wkomponowane w zdjęcie hero; logo i linki są jasne.
- Po rozpoczęciu scrollowania menu przechodzi w ciemnozielony, mniej transparentny wariant z blur i pozostaje widoczne nad całą stroną.
- Układ hero został skompresowany: mniejszy nagłówek, krótsze odstępy, niższe CTA.
- Pięć parametrów inwestycji znajduje się przy dolnej krawędzi hero i jest częścią pierwszego widoku desktopowego.
- Pasek parametrów zachowuje separatory, złote ikony i ciemny gradient tła fotografii dla czytelności.
- Dodano offset dla kotwic, aby stały header nie zasłaniał sekcji po kliknięciu nawigacji.
- Zachowano mobilne menu rozwijane; po otwarciu korzysta z tego samego ciemnego wariantu nagłówka.

## Walidacja

- JSX przepuszczony przez parser/transpiler TypeScript bez diagnostyki.
- Sprawdzono strukturę klas odpowiedzialnych za fixed header, stan scrolled i dolny feature strip.
- Sprawdzono brak pozostałości starego `absolute` headera i starego przesunięcia zdjęcia hero o wysokość menu.
- Paczka nie zawiera `node_modules`; instalacja pozostaje standardowa: `npm install`, następnie `npm run dev`.
