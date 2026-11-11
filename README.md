# MM Metal Matriex — website

Static single-page site for MM Metal Matriex (raised access floors, metal ceilings, accessories).
No build step: open `index.html`, or serve the folder with any static host (GitHub Pages works as-is).

- `index.html` — page content
- `css/styles.css` — styles
- `js/main.js` — interactive floor, product tabs, panel anatomy, load-rating chart, enquiry form
- `assets/img/` — photos taken from the product catalogue

## Before going live
Set the contact details at the top of `js/main.js` (`SITE.email`, `SITE.phone`, `SITE.address`).
The enquiry form emails `SITE.email`; until it is set, the email opens with no recipient.
