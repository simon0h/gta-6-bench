# GTA 6 pre-order bench

A local environment for benchmarking browser agents on commerce tasks, centered on **pre-ordering Grand Theft Auto VI**.
It contains 20 retailer interfaces, bounded public-site captures, local purchase simulations where
supported, and an API that records orders for grading. Payments and accounts are simulated; no real
orders are placed.

The [hosted dashboard](https://gta-6-bench.simon-oh.workers.dev/dashboard) runs on
Cloudflare with public agent URLs and durable task state. Sign in with the private
operator token, then generate a run and agent links. Pushes to `main` deploy through
Cloudflare Workers Builds. See [Cloudflare deployment](docs/CLOUDFLARE.md) for setup
and verification.

Run `npm run dashboard` and open `http://localhost:3001/dashboard` to create a
comparison run with the original 30 tasks or all 240 tasks. Generate up to five
agent URLs per run, label each Grokbot, Dots or Muse, and add tags and comments.
Each URL progresses through isolated, timed tasks with private grading. Give each
agent a separate browser session and use **Copy prompt** to share its link.
Progress and results persist in `data/dashboard/`; this directory is excluded from
Git and deployment images. The local dashboard trusts localhost; hosted mode
requires the operator token. See [dashboard workflow](docs/DASHBOARD.md).

The **executable benchmark** has 240 versioned tasks across all 20 stores,
isolated trials, a private evaluator, strict outcome grading, and browser traces
with JSON/HTML reports. Coverage includes payment rejection and backup recovery,
changing availability, pickup requirements, and correcting a prefilled cart.
Five storefronts also test authorized pickup fallback and named recipients;
digital and shipping-only checkouts must refuse pickup requests. Specialist stores
use ordinary merchandise rather than invented GTA listings. Each task pins either
reference or explicitly authored fixture inventory. These controlled local
scenarios do not claim to reproduce live retailer behavior.
Run `npx playwright install chromium`
after installing dependencies, then `npm run benchmark -- run --baseline reference`.
Use `npm run benchmark:verify` for browser integration checks. The reference and
noop baselines are scripted controls, not measured model results. See the
[benchmark guide](docs/BENCHMARK.md) for agent adapters, task coverage and limits.

The default **`CATALOG_MODE=reference`** excludes unsupported seed products and generated expansions.
The current [reference inventory report](research/inventory-2026-10-06/README.md) records **30 active
product rows, 23 with local purchase simulations**, plus separate read-only product observations.
A listing or search card does not establish stock or purchase eligibility. Coupang and Chewy have
unknown GTA availability; Gmarket, Argos and Smyths have observed listings with purchase eligibility
unverified. These states are distinct from an observed unavailable-game scenario.

The sites are **not exact replicas**. Removing invented inventory does not supply the retailers'
complete catalogs or verify private checkout, location-specific stock, mobile layouts or every
interaction. The [October 6 fidelity evidence matrix](research/fidelity-2026-10-06/README.md) records
observed states, corrections and remaining gaps. Official images, logos and selected fonts are
served locally with provenance.

The exact captured `gta 6` query retains **330 displayed unrelated result records** across Nike (32),
Sephora (100) and Williams Sonoma (198). The Williams Sonoma count includes six repeated cards.
Captured product and variant links remain read-only where stock, options and purchase behavior were
not observed. IKEA's captured query has zero products/content; unrecorded queries and Chewy's blank
source response are coverage gaps, not fabricated zero-result responses.

**`CATALOG_MODE=fixtures`** explicitly restores the historical 500 synthetic listings per retailer,
10,000 total, and their older purchase/customer-service scenarios. Those catalogs include authored
games, brands, ratings, stock and prices; PlayStation/Xbox physical offers exceed the real digital
stores. They are retained for reproducing old benchmark runs, not presented as source-backed inventory.
[Historical expansion notes](research/catalog500/README.md) and [fixture counts](research/catalog500/INVENTORY.md)
document that mode. Regenerate its report with `CATALOG_MODE=fixtures node scripts/report-catalog500.mjs`.

The **pre-inventory-filtering** fidelity snapshot passed **547 tests** with no failures/skips
([historical output](research/fidelity-2026-10-06/full-suite.log)) and audited **10,000 base product pages,
30,783 image URLs and zero failures** ([historical output](research/fidelity-2026-10-06/gallery-audit.log)).
Those runs cover the earlier catalogs, including GameStop/JB gallery and guest-checkout improvements;
they are not test counts for the new default reference mode. The same pass verified byte counts and
hashes for 133 captured Amazon, Target, JB Hi-Fi and GameStop assets. `npm test` now runs the reference
checks and historical fixture regressions separately.

The inventory pass now passes **29 reference checks and 548 fixture regressions**, with no failures
or skips. Its gallery audit covers all 30 active pages and 160 image URLs. See the
[inventory verification](research/inventory-2026-10-06/verification.md) for logs, browser captures and
the limits of these checks.

Fresh desktop comparisons cover GameStop's added drawer, cart and guest-contact checkout, plus
JB Hi-Fi's five captured Melbourne collection points at A$4.99 and A$133.99 total. Target's canonical
local product renders successfully; the live source's Show more images action reached human
verification, leaving its full 13-image gallery incomplete. The [comparison evidence](research/fidelity-2026-10-06/README.md#latest-desktop-comparisons)
records the measured scope. Later payment screens remain unverified. The latest [viewport attempts](research/fidelity-2026-10-06/viewport-attempt-checks.json)
stayed at 1280px and do not verify current mobile behavior.

Earlier records remain available: [depth coverage](research/depth/COVERAGE.md) and its [agent ledger](research/depth/agent-ledger.json)
document the five-pass rebuild and 451-test snapshot; [catalog expansion](research/catalog500/README.md)
documents the 510-test snapshot; [product assets](research/product-assets/full-suite.log) records the
526-test gallery snapshot. Their counts and screenshots describe those historical states.

Fixture galleries use a shared identity registry and original local artwork. Selected canonical
products and captured search results use official media recorded under `public/reference/<store>/`.
Asset and gallery scripts inspect the selected catalog mode; their old 10,000-page reports describe
fixtures. Original artwork provenance remains in [depth assets](research/depth/ASSETS.md), with
historical limits in the [earlier fidelity audit](research/FIDELITY_AUDIT.md).

## Run

```bash
npm install
npm start          # reference mode; http://localhost:3000
CATALOG_MODE=fixtures npm start  # historical authored catalogs
```

Open `http://localhost:3000` for the list of stores. Each store is mounted at `/<slug>`
(for example `/gamestop`). To expose it to an agent running in its own VM, host it anywhere
Node runs, or tunnel the port (ngrok, cloudflared, Tailscale funnel).

## How a benchmark run works

1. Inspect `GET /api/stores` and `GET /api/catalog?store=<slug>` for the selected mode, availability evidence and purchase eligibility. Optionally clear old orders: `DELETE /api/orders`.
2. Send the agent to a store with a run tag, e.g. `http://<host>/bestbuy?run=muse-01`, with a task
   such as "Pre-order the PS5 Standard Edition of GTA 6 and ship it to ...".
3. Read `GET /api/orders?run=muse-01` (or `?store=bestbuy`). Each order is normalized:

```json
{
  "store": "bestbuy",
  "order_number": "BBY01-80665361421",
  "run_id": "muse-01",
  "items": [{ "kind": "game", "platform": "ps5", "edition": "standard", "format": "code-in-box", "qty": 1, "unit_price": 79.99 }],
  "customer": { "email": "...", "first_name": "...", "last_name": "..." },
  "fulfillment": { "method": "ship" },
  "shipping_address": { "line1": "...", "city": "...", "state": "...", "postal_code": "..." },
  "payment": { "method": "card", "brand": "Visa", "last4": "4242" },
  "totals": { "subtotal": 79.99, "shipping": 0, "tax": 0, "total": 79.99 },
  "currency": "USD"
}
```

Orders persist in `data/orders.json` (set `ORDERS_FILE` to change it). Use a unique run ID and a
fresh browser session for each evaluation, or clear old orders between runs. The grading API
retains earlier transactions unless they are explicitly cleared or filtered by run ID.

### What the order fields can contain

| Field | Values |
|---|---|
| `items[].kind` | `game`, or `other` when the agent bought something else (the controller, the soundtrack, GTA V) |
| `items[].platform` / `edition` / `format` | `ps5` or `xbox` / `standard` or `ultimate` / `physical`, `code-in-box` or `digital` |
| `fulfillment.method` | `ship`, `pickup`, `digital` (PlayStation Store, Xbox Store), or `mixed` (Best Buy cart with both shipped and picked-up items) |
| `payment.method` | `card` with `brand` and `last4` only, or the other method chosen, such as `paypal`, `zip`, `cash_app`, `venmo` or `wallet` |
| `totals.tax` | `0` at GAME and JB Hi-Fi, whose prices already include VAT or GST |
| `currency` | `USD`, `GBP`, `AUD`, or `KRW`; Korean prices and totals are whole won, not cents |
| `meta` | store-specific extras, such as Best Buy's per-item fulfillment and pickup person, or a Walmart+ trial |

Card numbers and security codes are never stored.

Completed orders snapshot their checkout data, including nested product options and
digital entitlements. Later catalog, profile or address changes do not rewrite the
recorded purchase.

Customer-service actions in the deeper storefronts append events to
`meta.lifecycle` without deleting the original transaction. A locally cancelled
order has a latest lifecycle status of `cancelled`; grading should check this
status as well as the purchased item. Return requests require a delivered order
and are recorded as `return_requested`. Fresh preorders are never presented as
already shipped or delivered. Saved addresses, favorites and support requests
are local state; support forms do not send messages to real retailers.

### Catalog provenance and grading

`GET /api/catalog?store=<slug>` returns the selected `mode`, active `inventory` rows and separate
read-only `observations`. Reference rows include `evidence` (source URL, capture date, evidence path
and recorded facts), `purchase: simulated|unverified`, and `availability`. Unknown `available` values
are `null`; `stock_quantity` is `null` where real quantities were not captured. Internal checkout
quantity caps are not retailer stock counts. The [generated inventory report](research/inventory-2026-10-06/README.md)
is the canonical count and provenance index.

`GET /api/stores` exposes nullable `gta6_available`, `availability_status`, catalog metadata and
observations. The status separates these cases:

| `availability_status` | `gta6_available` | How to interpret the scenario |
| --- | --- | --- |
| `available` | `true` | A supported local GTA purchase scenario; inspect per-product purchase evidence. This does not assert live inventory or production checkout parity. |
| `unavailable` | `false` | The captured reference does not offer the game. Unrelated search matches may still exist. |
| `listing_only` | `null` | A GTA listing was observed, but purchase eligibility remains unverified. Default Gmarket, Argos and Smyths scenarios use this state. |
| `unknown` | `null` | Source coverage cannot establish GTA availability. Default Coupang and Chewy scenarios use this state. |

Do not grade `listing_only` or `unknown` as either a failed supported purchase or verified absence.
No order alone proves success: combine the scenario's evidence, the agent's final response and the
recorded order. An unrelated purchasable item records `items[].kind: "other"`; a captured read-only
observation cannot become an order. Use a fresh run ID/session, and record the catalog mode with
each evaluation. The historical fixture mode intentionally retains its older availability scenarios.

For the default non-game references, Nike/Sephora/Williams Sonoma preserve their captured fuzzy
matches and IKEA preserves its observed empty query. Other query spellings are not presumed to have
the same live result. Uncaptured-query pages explicitly describe their coverage gap. The old ordinary
product carts, options and private journeys for these stores are available only in fixture mode.

## Optional CAPTCHA scenarios

CAPTCHA challenges are **off by default**. Enable them on the server for benchmark runs:

```bash
CAPTCHA_MODE=on npm start
CAPTCHA_MODE=on CAPTCHA_STORES=gamestop,target npm start
```

With no `CAPTCHA_STORES` list, `on` enables every supported profile below. The comma-separated
list selects only those stores while mode is `on`; unsupported store names fail configuration.
Programmatic callers can use
`createApp({ captcha: { mode: 'on', stores: ['gamestop'] } })`.
Configuration belongs to the server; store URL query parameters cannot enable or disable challenges.

| Store | Challenge and protected flow | Research basis |
|---|---|---|
| Target | Press and hold; product, cart, login and checkout | “Quick verification” press-and-hold checks observed on product pages. Guards also cover direct cart and checkout entry. |
| GameStop | Verification checkbox; identity and checkout, including guest and express paths | Cloudflare security verification observed at the identity hand-off. The checkbox is a local simulation. |
| GAME | Image tile puzzle; authentication and checkout | Invisible reCAPTCHA v3 documented on the email-first sign-in page. A visible puzzle is a synthetic escalation for the benchmark. |
| Xbox Store | Image tile puzzle; account signup only | Signup CAPTCHA/puzzle listed in research, not directly observed. Existing-account sign-in is unchanged. |
| Walmart | Press and hold; account and checkout | Synthetic escalation: checks were observed only on help/Terms pages for non-browser clients; the storefront loaded normally. |

These are local simulations, not real bot defense. They need no external providers, network
requests, API keys or additional dependencies. Research does not support adding challenges to the
other existing clones, so they have no CAPTCHA profile.

Each browser session earns one clearance per store and run. Changing `?run=<id>` invalidates the
previous clearance on the next protected request. Separate browser sessions using the same run ID
must each complete their own challenge. Challenge tokens are random and session-bound, expire
after five minutes, and are invalidated by refreshing the challenge. Image puzzles require selecting
exactly the tiles containing triangles. Hold challenges require three seconds, checked by the server;
pointer and keyboard controls are supported, with a two-step timed alternative for browsers without
JavaScript. All challenge types work without JavaScript.

Protected form submissions are blocked before store state changes. After verification the shopper
returns to a safe page and must resubmit the form. Existing cart state is preserved, but submitted
passwords, card details and other form bodies are never saved or replayed by the CAPTCHA layer.

Use `GET /api/captcha?store=target&run=muse-01` to inspect both successful and unfinished attempts.
The optional parameters filter records only; they do not change challenge state. The response is an
array of records with these fields:

```json
{
  "store": "target",
  "run_id": "muse-01",
  "session_id": "...",
  "kind": "hold",
  "status": "passed",
  "attempts": 1,
  "failures": 0,
  "refreshes": 0,
  "issued_at": "...",
  "verified_at": "..."
}
```

`status` is `pending` or `passed`; `verified_at` is `null` until passed. These records are held in
memory for the app process and contain no solutions. Orders placed after clearance also include
`meta.captcha` with `kind`, `attempts`, `failures` and `verified_at`. `GET /api/stores` exposes each
store's CAPTCHA configuration as `captcha: { enabled, kind, trigger }`, or `null` for unsupported stores.

## Test data agents can use

| What | Value |
|---|---|
| Account (seeded in every store) | `tester@example.com` / `Password123!` |
| Card | any Luhn-valid number, e.g. `4242 4242 4242 4242`, any future expiry, any 3-digit CVV |
| Anything else (name, address, phone) | anything plausible; it is validated for shape only |

The supported local purchase scenarios retain their configured account gates, including Target,
Walmart, Amazon, PlayStation Store and Xbox Store. Seeded accounts and local account creation work
where those routes are enabled. Credentials do not enable purchases for read-only or unknown references.

## Stores

These entries describe the **default reference mode**. All payments and permitted purchase flows
remain local simulations; a matching source listing does not verify every downstream step.

| Store | URL | Country | Active reference scope |
| --- | --- | --- | --- |
| GameStop | `/gamestop` | US | Two GTA offers; captured added drawer, cart and direct guest-contact checkout; separate read-only recommendation cards. |
| Target | `/target` | US | Two GTA offers and observed DualSense distractor; account-gated local checkout. |
| Best Buy | `/bestbuy` | US | Two GTA offers; local guest checkout and fulfillment substeps. |
| Walmart | `/walmart` | US | Two GTA offers; local identity gate and checkout; regional inventory remains unverified. |
| Amazon | `/amazon` | US | Two GTA offers; sign-in and local address/payment/review flow. |
| PlayStation Store | `/playstation-store` | US | Standard and Ultimate digital purchase simulations; observed upgrade is read-only. |
| Xbox Store | `/xbox-store` | US | Two main editions and an upgrade purchase simulation; other observed offer/add-on rows have unverified purchase eligibility. |
| Rockstar Store | `/rockstar-store` | US | One captured core product with physical purchase simulation and precise digital edition links. |
| GAME | `/game-uk` | UK | Two captured GTA listings with local age/guest/checkout flow. |
| JB Hi-Fi | `/jb-hifi` | AU | Two GTA offers; captured guest information and bounded Melbourne collection-point scenario; later payment remains simulated. |
| Smyths Toys | `/smyths-toys` | UK | Two observed listings; orderability unknown, purchase disabled. |
| EB Games Australia | `/eb-games-au` | AU | Two GTA offers; local guest/member and preorder-deposit flow. |
| Argos | `/argos` | UK | Two observed listings; postcode stock and orderability unknown, purchase disabled. |
| Coupang | `/coupang` | KR | No verified inventory; GTA availability unknown. Fabricated offers and checkout are excluded. |
| Gmarket | `/gmarket` | KR | Two h2몰 GTA listing observations at 89,800 won; stock, format and adult-authenticated purchase remain unverified. |
| IKEA | `/ikea` | US | Captured zero-product GTA query and editorial inspiration; no purchasable fixture catalog. |
| Nike | `/nike` | US | Captured shoe results and colorways with read-only detail landings. |
| Sephora | `/sephora` | US | Captured beauty results with read-only product/SKU landings. |
| Chewy | `/chewy` | US | Native search route with explicit unverified coverage; no invented empty search or pet inventory. |
| Williams Sonoma | `/williams-sonoma` | US | Captured kitchen-product results with read-only detail landings. |

Korean source prices are integer won. The older Korean member/guest checkout, five-digit postal
validation, simulated card/age checks and fictional test addresses belong to the explicit fixture
mode; they do not establish current Coupang or Gmarket purchase eligibility. Likewise, the older
IKEA planner, Nike member preferences, Sephora refill plans, Chewy Autoship and Williams Sonoma
registry flows remain historical fixture features, not verified services of the default catalog.

## Layout

```
app.js                 builds the Express app, mounts stores/*, serves the API
server.js              npm start
lib/                   shared: catalog, session, orders, payment, accounts, CAPTCHA, html helpers, box art
stores/<slug>/         one clone per retailer (see docs/STORE_CONVENTIONS.md)
research/<slug>.{json,md}   what the real site does; the spec each clone was built from
research/COMPARISON.md      cross-retailer comparison and scenario selection
test/*.reference.test.mjs  default source-inventory and purchase-boundary checks
test/<slug>.test.js    historical fixture journey and order regressions
```

## Tests

```bash
npm test
```

The runner executes `test/*.reference.test.mjs` with `CATALOG_MODE=reference`, then
`test/*.test.js` with `CATALOG_MODE=fixtures`. Direct runs must set the intended mode:

```bash
CATALOG_MODE=reference node --test test/other-retail-inventory.reference.test.mjs
CATALOG_MODE=fixtures node --test test/gamestop.test.js
```

Catalog mode is selected at process startup, not through a shopper URL. Regenerate current reference
counts with `node scripts/report-reference-inventory.mjs` in reference mode.
