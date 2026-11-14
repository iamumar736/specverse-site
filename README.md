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


## Hands-off catalog updates

SpecVerse now uses **GitHub Actions + the existing Render auto-deployment** to
refresh phone identities and source-verified technical specifications without
asking an operator to request a new edit each time.

| Job | UTC schedule | Purpose |
| --- | --- | --- |
| Daily catalog | 03:15 daily | Import open Android identities, try Wikidata, merge licensed feeds, validate, publish health |
| Samsung | 04:40 daily | Check 24 missing Samsung models across rotating official regions |
| Licensed device images | 05:40 daily | Check up to 12 model-matched, reusable images |
| Apple | 06:20 Mondays | Refresh Apple Support technical specs and add **newly confirmed iPhone model identities** |
| OPPO/vivo | 06:15 Tuesdays and Fridays | Inspect 120 verified-source pages per brand, rotating cursors |

The GitHub workflow schedules remain active only while GitHub Actions is
enabled and the repository remains active. GitHub cron can be delayed or
occasionally skipped. There is a **Run workflow** button as a manual fallback,
but manual use is not required for routine updates.

### Reliability controls
- Each manufacturer importer **preserves existing verified records** on
  upstream failures instead of replacing data with empty JSON.
- A shared GitHub Actions concurrency group serializes automated data
  publishing. Changes are committed to `main` with a safe rebase and **never
  force-pushed**, so Render can deploy after an accepted update.
- The main catalog refuses an unexpected drop of more than 10% of models.
  Validation failures stop publication.
- A single GitHub issue named **SpecVerse automated catalog updater needs
  attention** is automatically created or updated if a source job fails,
  including links to the failed GitHub Actions run.
- `/data/automation-health.json` reports source coverage,
  manufacturer-verified model counts, missing technical fields, and whether a
  paid/licensed price feed is configured. The homepage links to the report.

### What is / is not guaranteed
**Automatic discovery** of Android marketing model names comes from
DeviceFarmer and Wikidata; new iPhones can be discovered through Apple's
actual technical specification directory. Samsung and OPPO/vivo existing
catalog models get incremental source checks. This does not mean the system
can invent missing specifications for every new release.

Market prices require your own **licensed live retailer price source** via
`SPECVERSE_FEED_URL(S)` secrets. If none is configured, the site does *not*
manufacture or currency-convert live prices. An official page can disappear,
and source providers can throttle or block automated requests. Those cases
retain existing data and are flagged, rather than silently guessing.

To audit updates, visit GitHub **Actions** and the **Issues** tab. A future
change to the hosting provider, repository permissions or third-party data
licenses can still require human intervention.


## SpecVerse Orbital — cinematic product previews

The homepage now uses an astronaut-inspired orbit theme with visible,
CSS-animated phone silhouettes and brand-name transmissions along the desktop
side margins. This avoids image downloads, unlicensed trademarks, canvas
particle loops and large extra runtime packages. Users can pause the scene via
**Orbit Mode**; the preference is remembered in the browser. System
`prefers-reduced-motion` disables the background movement, and mobile
screens keep the lightweight nonanimated background for battery life.

### When does a phone show a realistic-looking fallback?
`photo-source-policy.js` makes the display decision:

- Use a suitable JPG, PNG, WebP or AVIF photograph/raster image when provided.
- Treat stock/generic/default placeholder paths and vector-only SVG files
  (including vector thumbnails saved as SVG.png) as illustrations rather than
  actual phone photography. The card then uses SpecVerse's richer, **original
  CSS 3D-style concept** treatment with brand accents.
- If a candidate photo fails to load, try the next acceptable candidate;
  otherwise show the illustrated placeholder. This fixes missing images that
  previously fell back to the same old vector file.
- Source URLs alone are not proof that every external image matches a
  particular device. Strict image identity checks are handled separately by
  the licensed image automation.

On a device detail page, **Inspect 3D concept** loads a real WebGL procedural
model via React Three Fiber only when clicked. Visitors can drag to rotate and
inspect the original metallic concept phone. Its colors and basic fold/flip
family hints are editorial choices, **not precise manufacturer geometry**,
and the controls label it clearly. Only one viewer can be opened at a time,
so 40 visible product cards do not create 40 WebGL canvases.

The verified manufacturer technical specs, prices, comparisons, original
product photographs and automatic imports are not modified by the theme.


## Six-brand source-backed device specifications

SpecVerse has existing verified OPPO and Vivo model specification datasets.
A new importer extends manufacturer-source coverage to **Xiaomi** (including
REDMI and POCO families), **Infinix**, **Tecno** and **itel**.

The initial curated model references and their exact source URLs are in
`official-extra-brand-seeds.js`; each contains hardware details retrieved from
that manufacturer's product page and is only applied when the catalog has one
unique exact marketing-model match. Model name and 4G/5G, Pro/Plus/Ultra and
other SKU suffixes are not treated as interchangeable. The website uses these
reference specs even before the next scheduled scrape.

Every day at **07:10 UTC**, GitHub Actions runs
`.github/workflows/import-official-extra-brands.yml`:

- Checks a bounded rotating sample of missing Xiaomi, Infinix, Tecno and
  itel models against manufacturer-owned specification URLs.
- Accepts new technical fields only for an exact product identity with enough
  source evidence; does not infer missing specifications or scrape generic
  commercial retailer pages.
- Keeps existing verified records if manufacturer pages are unavailable,
  ambiguous, or the response contains fewer reliable technical fields.
- Publishes `/data/official-{xiaomi,infinix,tecno,itel}.json` and
  `/data/extra-brands-verification-coverage.json` with verified and missing
  counts. The master catalog importer overlays these data files, and the
  browser also loads them directly, so the latest source-backed facts are
  available between daily master catalog refreshes.

The existing OPPO/Vivo official importer continues twice weekly. Brand
specification variants can differ by Pakistan/international market. **Not all
models have full verified specifications**, and hardware information missing
from manufacturer sources is never fabricated. The workflow requires GitHub
Actions to remain enabled and permission to push verified data to `main`.


## Premium model-family concept renders

When SpecVerse has no usable manufacturer or other source-attributed
product photo for a device, it shows one of five **original AI-generated studio
concept illustrations** stored in `public/concept-renders/`. The images are
highly compressed WebP assets; the device information and actual sourced
photographs are not modified.

`concept-renders.js` chooses the illustration by general family rather than
repeating the same purple phone for every model:

- `island.webp` — a raised square/rectangular camera island
- `rings.webp` — separated camera rings, such as Galaxy-style concepts
- `visor.webp` — a horizontal camera bar, such as Pixel-style concepts
- `fold.webp` — a book-style folding-device concept
- `dual.webp` — a slim two-camera concept for entry and midrange families

These are **editorial placeholders, not verified images of the exact device**.
Actual colors, camera counts, camera positions, frames, and physical dimensions
can differ from a model's illustration. The model name remains clearly visible
and the card displays `Studio illustration`; the fallback also has an
accessible description. Source-backed photos are still displayed first. If a
studio illustration fails to load, the previous CSS-rendered fallback remains
available. No 3D engine is loaded for the 40-card grid; the separate optional
interactive WebGL detail concept remains on demand.

To add more variants, add an image to `public/concept-renders/` and update the
variant logic in `concept-renders.js` with corresponding tests.


## Google Search launch checklist

The Google search-ready website has two public HTML entry points: the main
smartphone catalog (`/`) and the optional mini games page (`/games/`).
Their titles, descriptions, canonical URLs, Open Graph metadata and structured
data are kept in `index.html` and `games/index.html`. Vite copies these
crawler-facing files from `public/` into production:

- `https://specverse.it.com/robots.txt`
- `https://specverse.it.com/sitemap.xml`

**First:** confirm your Render deployment serves `https://specverse.it.com/`
publicly over HTTPS and that the sitemap and robots URLs above load with HTTP
200, with no login, 404 or forwarding to an unrelated domain. The GitHub
build succeeding is not proof that the live Render/DNS configuration works.

**Then use Google Search Console:**

1. Open <https://search.google.com/search-console> with the Google account
   that should own this site.
2. Add a **URL-prefix** property: `https://specverse.it.com/`. Using a
   URL-prefix property allows a Google HTML tag or HTML file verification
   method even if DNS editing is unavailable.
3. Choose **HTML tag** under Google ownership verification and copy the
   complete Google-generated `google-site-verification` meta tag. Insert
   that exact tag into the `<head>` of `index.html` and deploy it. (You
   can provide the generated tag to the repository maintainer to add it.)
   Alternatively choose Google's file-upload method and put its *exact*
   generated filename and contents into `public/`, then deploy.
   Do **not** invent a token or use a token belonging to another account.
4. In Search Console select **Verify**, then open **Sitemaps** and submit
   `sitemap.xml` (full URL: `https://specverse.it.com/sitemap.xml`).
5. Use **URL inspection** on `https://specverse.it.com/` and choose
   **Request indexing** if Google reports it is not indexed. Check the Pages
   and Sitemaps reports to monitor Googlebot's crawl status.

A sitemap is a hint to Google and **does not guarantee indexing**, search
ranking, immediate discovery or display. This repository cannot claim that
Google verification or sitemap submission has happened until the site owner
completes those authenticated Search Console steps.

**Current scope:** SpecVerse currently runs a React SPA for phone details,
filters and comparisons. Those screens do **not** yet have independent,
crawlable, server-rendered product URLs. The sitemap lists only genuine HTML
routes instead of inventing thousands of model URLs. To rank individual
smartphone models on Google, add stable per-model URLs and crawlable product
content first, then extend the sitemap with those real URLs.

## Signal Edition — cinematic interactive phone discovery

The homepage uses the **Relay-style motion/storytelling principles** from
the user's reference video without copying that site's branding, source code
or paid component assets. SpecVerse remains its own graphite-and-sage
smartphone discovery platform.

- **Original animated SVG signal lines** live inside the hero and workflow
  overview. All decorative artwork is `aria-hidden`, `pointer-events:none`
  and respects user settings and `prefers-reduced-motion`.
- **The Decision Engine** lets visitors choose two actual catalog models,
  shows their listed display, chipset and battery, flags missing data as
  "Not listed", then opens the existing side-by-side comparison with those
  exact model IDs selected.
- **GSAP + ScrollTrigger** choreograph the hero and section entrances on
  capable desktop devices. Both are dynamically imported, all effects are
  restored/cleaned up on navigation, and content is visible when JavaScript
  motion fails.
- **Lenis** is dynamically imported on eligible desktop devices only,
  with its recommended CSS, smooth wheel scrolling and ScrollTrigger
  synchronization. It never replaces native touch scrolling, and is skipped
  for reduced-motion/data-saving mobile scenarios.
- Design composition draws on the modern animated component patterns seen
  in **React Bits** and **21st.dev**. All layout and effect code here is
  original and owned by the SpecVerse project; no marketplace component,
  trademark or proprietary graphic is copied. The coding work is applied
  through the GitHub integration rather than claiming to run a separate
  Claude Code process.
- Color contrast, keyboard focus, native `select` controls, a manually
  pausable motion toggle, and small-screen single-column layouts are kept.

The original product photo pipeline, device details, pricing source links,
40-phone grid, daily imports, games and Google Search verification files
remain intact. The homepage design is decorative; it does not imply any
specific benchmark results or automatically guarantee a phone is "better".


## Google AdSense ownership verification (site review)

The site owner supplied the publisher ID `ca-pub-1196332171109259`
through the Google AdSense ownership screen. The matching **Google-supplied
async verification/ad loader** is installed in the `<head>` of the two
real public HTML pages (`index.html` and `games/index.html`). The
recommended seller declaration is published as `public/ads.txt`:

`google.com, pub-1196332171109259, DIRECT, f08c47fec0942fa0`

**After the latest GitHub commit is deployed on Render**, open
`https://specverse.it.com/` and `https://specverse.it.com/ads.txt`.
The site must be publicly accessible without a password or captcha and serve
its actual HTML (not a 404). In Google **AdSense → Sites → specverse.it.com**,
choose **AdSense code snippet**, tick **I've placed the code**, and click
**Verify**. Once Google confirms ownership, click **Request review**.

Google may take several days or up to several weeks to approve the site.
The code and ads.txt establish **setup, not approval**, and do not guarantee
that any ads are currently displaying or that AdSense policies have been
satisfied. Do not remove the verification code. No ad placements are
fabricated in this commit; ad-display controls can be managed in AdSense
after approval. Google's review can fail if the publicly accessible site
lacks substantial original content, violates policy, or is unreachable.

This is separate from Google **Search Console** ownership, which uses the
existing `public/google4cf6fe8e0eed95a5.html` verification file.
