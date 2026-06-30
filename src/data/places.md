# Places

Source of truth for the Traces map. Edit this file to add or remove cities —
coordinates **and city boundary polygons** are resolved automatically by
`scripts/geocode.mjs` (runs on `npm run dev` and `npm run build`) and cached
in `places.cache.json`.

## Format

Each section below holds a markdown table. Columns:

- **City** — display name. For disambiguation, prefer `City, Country`
  (e.g. `Paris, France` not just `Paris`). The geocoder uses this string
  verbatim against OpenStreetMap.
- **Years** — free text, e.g. `2023`, `2018–2020`, `2020–present`. Optional.
- **Note** — short one-liner shown in the tooltip. Optional.

Leave a cell empty by writing nothing between the pipes (`| |`). Do **not**
remove the header or separator rows.

## Lived

| City             | Years        | Note |
|------------------|--------------|------|
| Hangzhou, China  | 2022–2025    |      |
| Ningbo, China    | 2000–2018    |      |
| Shanghai, China  | 2018–2022    |      |
| New York, USA    | 2025–2026    |      |

## Traveled

| City              | Years | Note |
|-------------------|-------|------|
| Chengdu, China    | 2025  |      |
| Xiamen, China     | 2018  |      |
| Nanjing, China    | 2018  |      |
| Guangzhou, China  | 2018  |      |
| Chongqing, China  | 2025  |      |
| Sanya, China      | 2024  |      |
| Haikou, China     | 2024  |      |
| Changsha, China   | 2025  |      |
| Jinan, China      | 2025  |      |
| Shenzhen, China   | 2025  |      |
| Hong Kong, China  | 2023  |      |
| Beijing, China    | 2025  |      |
| Qingdao, China    | 2025  |      |
|Kunming, China|2025||
|Osaka|2025||
|Nara, Japan|2025||
|Kobe|2025||
|Tokyo|2025||
|Kyoto|2025||
|Sapporo|2025||
|Otaru|2025||
|Hakodate|2025||
|Paris|2025||
|Lyon|2025||
|Nice|2025||
|Monaco|2025||
|Cannes|2025||
|Philadelphia|2025||
|Miami|2026||
|Geneva|2025||
|Interlaken|2025||
|Zurich|2025||
|Milan|2025||
|Venice|2025||
|Florence|2025||
|Rome|2025||
|Athens|2025||
|Cairo|2025||