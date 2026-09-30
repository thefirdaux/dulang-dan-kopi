# Dulang&Kopi website

Static HTML/CSS/JS site (no build step), implemented from the Figma file
[Dulang dan Kopi](https://www.figma.com/design/4hwL64YTUUMujywPYQ5uE4/Dulang-dan-Kopi).
Published with GitHub Pages at
<https://thefirdaux.github.io/dulang-dan-kopi/>.

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
| `tentang.html` | Tentang D&K — Latar Belakang | `10:76` |
| `mesej-pengasas.html` | Mesej Pengasas | `36:577` |
| `perniagaan-syarikat.html` | Perniagaan Syarikat | `56:266` |
| `tempah.html` | Tempah › Pickup — the whole menu | `64:161` |
| `your-chart.html` | Your Order | `129:3200` |

The header and the ☰ navigation drawer (`143:1540`) are repeated in every page:
with no build step there is nothing to include them from, so a change to either
has to be made in all six files. The drawer slides in from the right, pushes the
page left and dims it; its behaviour lives in `nav.js`.

## Scripts

| File | What it does |
|---|---|
| `nav.js` | Opens/closes the drawer and its dropdown groups |
| `menu.js` | Category tabs, search across all tabs, the cart bar, the Add to Cart sheet |
| `cart.js` | The cart itself, kept in `sessionStorage` so it lasts the visit |
| `chart.js` | Your Order: edit/remove lines, order total, hand-off to WhatsApp |

`tempah.html` holds all five categories as tab panels so one cart can collect
items across them. A card carries its own data: `data-price` /
`data-price-cold` when the price text isn't a plain number, and
`data-description` for the line shown in the Add to Cart sheet.

## Styles

- `styles.css` holds everything. Text styles mirror the Figma text styles one to
  one (`.type-title1`, `.type-title1-emphasized`, `.type-title2`,
  `.type-title3-emphasized`, `.type-body`, `.type-callout`, `.type-subheadline`,
  `.type-footnote`, `.type-caption2`), so a frame's style name maps straight to
  a class.
- Colours and the raised-card shadow are custom properties on `:root`. Each page
  sets `--color-drawer` next to its own `background`, and the drawer takes it.
- Font is SF Pro via the system font stack; SF Pro can't be embedded as a web
  font, so non-Apple devices fall back to their system UI font.

## Menu photos

Drop a photo in the project root named after the dish. It is centre-cropped
square, resized to 640px and saved as `assets/menu/<slug>.jpg`, then referenced
from the card as an inline `background-image` — which is also what carries it
into the Add to Cart sheet and the Your Order line. The originals stay in the
project root and are git-ignored.

## Caching

GitHub Pages serves with `max-age=600`, so every page requests `styles.css`,
`nav.js` and the rest with a `?v=<commit>` tag. Bump those tags in all the HTML
files whenever one of those files changes, or phones keep the stale copy.

## Not built yet

- Katering, Produk (D&K Bakery, Garlic Chili Oil) and Hubungi Kami are menu
  links pointing at placeholder anchors.
- "Bahasa" opens and lists Bahasa Malaysia / English Language, but choosing one
  does nothing — there are no translations.
- `WHATSAPP_NUMBER` in `chart.js` is empty, which keeps the "Send order to
  WhatsApp" button disabled.
- Most dishes still show the grey placeholder instead of a photo, and only the
  meal sets have a description.
