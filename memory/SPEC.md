# SCOOT Eyewear — Living Spec

## Product
SCOOT Eyewear is an editorial, monochrome eyewear storefront based on the Manus reference site. The brand tagline is “Ride Your Own Style.” The catalog contains Brill, Ocala, Casama, Brazz, Duble, Kurera, Tropic, Satvale, and Fourty. Product and campaign images use the reference site's public assets; prices are Rp100.000 for all models except Casama at Rp110.000, with custom print adding Rp15.000 per piece.

## Pages and flows
- `/`: campaign hero carousel, featured collection, custom print banner, story, gallery, wholesale and WhatsApp CTAs.
- `/katalog/`: search, model checkbox filters, frame-color filter, price radio filter, sorting, and product cards.
- `/produk/:id/`: image gallery, color choice, plain/custom variant, custom text/file/note fields, quantity, add-to-cart and WhatsApp inquiry.
- `/custom-print/`, `/panduan-produk/`, `/tentang-kami/`, `/grosir/`, `/kontak/`: informational and contact pages.
- `/keranjang/`: localStorage-backed cart, quantity updates, removal, subtotal and WhatsApp checkout message.

## Data and integrations
- Cart key: `scoot-eyewear-cart` in browser localStorage.
- WhatsApp admin deep links use `6285156581959`.
- Custom files are kept as the selected filename in the cart and must be manually attached after WhatsApp opens; no upload backend is used.
- No login, accounts, payment gateway, or seeded credentials.

## Visual system
Light editorial layout, near-black/white/grey surfaces, restrained red accent, Space Grotesk headings, Inter body copy, sharp corners, responsive split layouts, sticky navigation and product purchase panel.