# Dulang&Kopi website

Static HTML/CSS/JS site (no build step), implemented from the Figma file
[Dulang dan Kopi](https://www.figma.com/design/4hwL64YTUUMujywPYQ5uE4/Dulang-dan-Kopi).

## Run locally

```bash
python3 serve.py
```

`serve.py` is a plain static server that sends `Cache-Control: no-store`, so
phones never show stale files while previewing.

Then open http://localhost:5173. To preview on an iPhone on the same Wi-Fi,
open `http://<your-mac-ip>:5173` (find the IP with `ipconfig getifaddr en0`).

## Pages

| File | Page | Figma node |
|---|---|---|
| `index.html` | Homepage (hero, "Pernah menjadi pilihan" logos) | `1:2` |
| `tentang.html` | Tentang D&K | `10:76` |

The header and the ☰ navigation drawer (Figma node `19:251`) are repeated in
both pages. The drawer slides in from the right, pushes the page left and dims
it; the open/close behaviour lives in `nav.js`.

## Styles

- `styles.css` holds everything. Text styles mirror the Figma text styles one to
  one (`.type-title1`, `.type-title1-emphasized`, `.type-title3-emphasized`,
  `.type-body`, `.type-callout`, `.type-subheadline`, `.type-footnote`).
- Font is SF Pro via the system font stack; SF Pro can't be embedded as a web
  font, so non-Apple devices fall back to their system UI font.

## Not built yet

Menu links for Tempah, Produk D&K and Hubungi Kami point to placeholder
anchors, "Bahasa" does nothing yet, and "Lihat Menu" points to `#menu`; those
pages/sections haven't been designed yet.
