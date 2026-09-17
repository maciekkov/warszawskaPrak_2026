# ETAP 09 — Masterplan: mocniejsze statusy + pełny pan

- Hover działki: maska statusu zwiększona do ok. 50% krycia.
- Selected: maska zwiększona do ok. 64% krycia.
- Obrys hover/selected ma prawie pełną jasność i pozostaje cienki (1.18 / 1.38 px).
- Dodany statusowy glow w kolorze zielonym / złotym / czerwonym.
- Zdjęcie i SVG są skalowane razem (`MASTERPLAN_ZOOM = 1.30`), więc pozostają idealnie zsynchronizowane.
- Limit przesuwania jest obliczany z realnego nadmiaru szerokości po zoomie; można dojść do obu skrajnych krawędzi mapy.
- Strzałki przesuwają plan większym krokiem i clampują dokładnie na końcu.
- Drag za pusty obszar nadal działa i korzysta z tego samego pełnego zakresu.
