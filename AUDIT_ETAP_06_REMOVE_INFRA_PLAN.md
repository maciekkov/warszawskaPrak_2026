# ETAP 06 — usunięcie planu infrastruktury

Usunięto z renderowanej strony cały blok **„INFRASTRUKTURA W PLANIE / Zobacz plan infrastruktury na terenie inwestycji”**.

Zakres:
- usunięto interaktywną mapę infrastruktury,
- usunięto przełączniki warstw i panel szczegółów,
- usunięto logikę React związaną z warstwami mapy,
- usunięto nieużywane style CSS tego modułu,
- pozostawiono osobny blok „Nasze atuty”,
- zmieniono CTA w sekcji postępu na „ZOBACZ INFRASTRUKTURĘ”.

Kontrola techniczna:
- składnia JSX sprawdzona przez TypeScript transpileModule — OK,
- bilans nawiasów CSS — OK,
- brak fraz i komponentów usuniętego planu infrastruktury w `src/`.
