# SpecVerse — smartphone explorer

A responsive React + Vite starter website with a curated 12-phone catalog, search, brand filters, sorting, up-to-three-device comparison, details pages, and theme persistence.

## Run

```bash
npm install
npm run dev
```

Build: `npm run build`. Deploy the `dist` directory to any static host (Netlify, Cloudflare Pages, Render Static Site, etc.).

## Data and image limitations

This is a **starter catalog**, not a complete GSMArena database or a live specs API. Data is stored in `phones.js` and should be reviewed against official manufacturer product pages before production use. Region-dependent specs may differ. Unknown fields are shown as 'Not available'. No prices are presented because they vary by region and time.

A product image is only shown if `image` is set and loads successfully. Otherwise a clearly generic illustration appears; this is **not** an official product photograph. Before using external images in production, confirm their licensing and reliability. Do not scrape or hotlink copyrighted catalog photos without permission. For fast production imagery, host permitted images locally, create WebP/AVIF thumbnails, and use an image CDN with caching.

## Production roadmap

- Replace starter data with an audited, licensed data ingestion pipeline.
- Store sources, timestamps, region and variant identifiers for each specification.
- Download and optimize licensed photos into local assets/CDN rather than relying on third-party hotlinks.
- Add automated ingestion jobs, admin review, monitoring, and tests before claiming comprehensive automatic updates.

## Daily updates and prices (v2)

Run `node update-data.mjs` to refresh `public/data/catalog.json`, `prices.json` and `status.json`. A GitHub Actions workflow (`.github/workflows/daily-update.yml`) runs once a day at 03:15 UTC, when the project is hosted in GitHub with Actions enabled. It commits verified changes. Your hosting provider must redeploy when those files change.

**Important:** The initial dataset has 12 editorial phones and **no verified live price feed**. Set GitHub Actions repository secrets `POCKET_FEED_URL` (legacy configuration key retained for compatibility) (HTTPS JSON endpoint from a provider you are licensed to use) and optionally `POCKET_FEED_TOKEN` to enable real device and price updates. Without a configured feed the daily workflow only checks and preserves existing data; it cannot discover new phones or prices on its own.

The provider should return:

```json
{
  "devices": [{"id":"example-phone","brand":"Example","name":"Example Phone","year":2026,"screen":"6.5-inch OLED","chip":"Example SoC","sourceUrl":"https://provider.example/phone"}],
  "prices": [{"deviceId":"example-phone","currency":"PKR","amount":150000,"sourceUrl":"https://retailer.example/phone","ptaStatus":"PTA approved"},{"deviceId":"example-phone","currency":"USD","amount":499,"sourceUrl":"https://retailer.example/global-phone"}]
}
```

Other supported specification fields: `network`, `bands`, `sim`, `announced`, `released`, `status`, `dimensions`, `weight`, `build`, `ipRating`, `resolution`, `refreshRate`, `brightness`, `protection`, `os`, `cpu`, `gpu`, `ram`, `storage`, `cardSlot`, `camera`, `cameraDetails`, `cameraVideo`, `selfie`, `selfieVideo`, `speakers`, `jack`, `wifi`, `bluetooth`, `nfc`, `gps`, `usb`, `sensors`, `biometrics`, `battery`, `charging`, `wirelessCharging`, `colors`, `models`, `image`. Only use image URLs you have permission to display. Values omitted by a provider show as **Not available**. The provider must return real regional market prices; USD prices are not automatically converted to PKR. The scheduled workflow may be delayed by GitHub, and a local-only website does not update unless you run the script or pull updated data.

## v3: expanding catalog and checking updates

- `node import-wikidata.mjs` discovers publicly described smartphone entries from Wikidata. It requires internet and may be rate-limited. Wikidata entries typically have **incomplete specifications**; this is not GSMArena-scale coverage.
- `node update-data.mjs` merges starter, previously verified, and discovered devices. Configure `POCKET_FEED_URLS` as a comma-separated list of **licensed HTTPS JSON providers** (same schema as above) to populate full specs and retailer prices. `POCKET_FEED_URL` remains supported.
- GitHub Actions runs discovery and feed synchronization daily; host must redeploy when data changes. The UI **Check updates** button fetches the latest *published* files; it does not trigger provider refresh from the browser.
- The catalog displays 24 phones at a time with a Load more button for larger datasets.
- Wikidata discovery is best effort and its entries are not automatically verified for completeness; do not present them as fully reviewed specifications.
- Actual live pricing requires providers; the current ZIP contains **no active price feeds** and therefore no real-time prices.
