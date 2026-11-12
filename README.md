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


## Verified-source animated device images (automatic)
The workflow `.github/workflows/device-visuals.yml` runs once per day at 05:40 UTC and can
also be run manually. It checks a bounded batch of model entries per run
(default 12), updates `public/data/animated-device-images.json`, and adds
any validated licensed photos to `public/device-visuals/`. GitHub Actions
commits the manifest, source credits and new licensed images to `main`,
which can cause Render to redeploy if automatic deployments are enabled.

A phone enters the automated animation manifest **only** if:
1. There is an independently imported **manufacturer-backed** specification record
   for its exact catalog ID with a verified source URL.
2. Wikimedia Commons provides a photo/illustration with a conservative exact
   model-name match. Concept art, mockups and cases are excluded.
3. The Commons image metadata declares a compatible CC BY, CC BY-SA or
   public-domain license suitable for reuse and image transformations.
4. The picture is accessible as an existing local curated file or as a valid
   size-limited JPG/PNG/WebP raster file. New untrusted SVGs are never imported.

The original product image is animated using a gentle **2D CSS float/parallax**
effect. This retains the image's pictured phone shape rather than generating
a synthetic body or inventing camera layout, fold mechanics or product colors.
**A model-name match is not a scientific verification of its precise geometry.**
Manufacturer asset catalogs and actual 3D models would be required for that.
Unverified images stay as they are. Errors and network outages do not replace
pictures with guesses. Image author, license and modification credits are
published at `/device-image-credits.html`.

This is an incremental workflow, **not** an instant source of accurate 3D models
for every brand. Most models will lack sufficient image/licensing evidence and
will remain unchanged. The job is bounded to avoid scraping at scale.
To force a cycle, open GitHub → Actions → "Verify and animate real phone images"
→ "Run workflow"; then check its logs and the manifest.

**Do not substitute AI-generated renders for source-verified product photos**;
AI renders can be used as explicitly labeled artistic concepts, not as proof
of a phone's true design.


## Mobile performance and automatic audits

SpecVerse now treats the optional Three.js hero as a progressive enhancement:
- Low-bandwidth, save-data, low-memory, touch, and narrow-screen visitors get
  the instant CSS device preview. They can explicitly press **View 3D** to load
  the full interactive renderer, without blocking browsing or comparisons.
- Three.js stops continuous rendering when the preview is offscreen, the browser
  tab is hidden or reduced motion is requested.
- GSAP entrance/ScrollTrigger animation modules are skipped on screens <=820px,
  and mobile device imagery/ambient gradients avoid continuous animation.
- Mobile touch targets are at least 44px and below-the-fold brand sections use
  content visibility to avoid painting unseen cards.

**Performance tooling** (development/CI only; adds no production JavaScript):
- `npm run build && npm run check:mobile-bundle` checks the initial homepage
  JavaScript/CSS gzip budget (180 KB) and confirms the 3D viewer stays
  code-split. This is a transfer-size guardrail, not an observed network metric.
- `.github/workflows/mobile-audit.yml` uses Google Lighthouse CI to measure
  emulated mobile performance, accessibility, LCP and layout shifts for the
  homepage and games page. Reports are uploaded to the GitHub Actions run.
  Initial Lighthouse thresholds are advisory, not blockers, until a stable
  baseline is established on real devices.

Actual speed depends on Render caching, internet quality and phone hardware.
Use PageSpeed Insights / Chrome DevTools on `specverse.it.com` after deploy
for field measurements; passing a build budget is not a guarantee of a
particular mobile Lighthouse score.


## Samsung specifications — official model coverage

The Samsung catalog currently has **184 tracked Samsung model identities**. At
the last reviewed update, **94 of 184** have Samsung-sourced technical profiles:
73 original Samsung regional product configurations and 21 additional, distinct
historical launch models from Samsung Newsroom. The remaining 90 must not be
presented as fully verified. Exact counts appear in
`public/data/samsung-verification-coverage.json` and are updated by automation.

Source-checked specifications include screen, camera, RAM, storage, battery,
charging, dimensions, weight, software, connectivity and other fields **only
when Samsung provided the information for that model**. Unknown fields remain
unavailable rather than inferred from similar models.

Run `node scripts/import-official-samsung.mjs --max=24 --regions=3` after
installing the parser (`npm install --no-save cheerio`) to check a rotating
batch of missing Samsung entries against official country-level product pages.
The workflow `.github/workflows/import-official-samsung.yml` runs once daily
at 04:40 UTC, or through Actions > "Import official Samsung model
specifications" > Run workflow. It remembers its region/model cursor, merges
newly verified fields without deleting existing accepted Samsung records, and
publishes an updated coverage report. A weekly/manual exhaustive one-shot
import is not assumed.

`samsung-archive-specs.js` contains documented *individual models* that
Samsung no longer features in current product sitemaps. Every record includes
a Samsung Newsroom source URL, reference market and a regional-variant caveat.
The importer **never** copies values to a similarly named Pro/FE/Ultra/5G
variant or substitutes a newer model for an older device.

An official source for every historical Samsung model is not guaranteed to be
available. Do not claim 100% complete Samsung specifications without actual
evidence, and do not use generic AI guesses or unsourced retailer numbers to
populate missing fields.
