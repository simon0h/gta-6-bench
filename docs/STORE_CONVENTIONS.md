# Store clone conventions

Every store clone lives in `stores/<slug>/` and is mounted at `/<slug>` by `app.js`.
The goal of a clone is to reproduce the **flow** of the real retailer's GTA 6 pre-order
(pages, step order, labels, fields, upsells, quirks) closely enough that an AI agent
navigating it behaves as it would on the real site. Match the current visual hierarchy,
retailer chrome, catalog context, wording and interactions as closely as the available
evidence permits. Record source dates, blocked pages and remaining approximations; do
not claim pixel-identical fidelity where imagery or private flows are simulated.

Every store also carries a shop-floor assortment (`stores/<slug>/shelf*.js`): a few hundred
realistic products matching what the real retailer sells, shown on the homepage, department
pages, search, deals and product pages, and buyable as `kind: 'other'` order lines. It keeps
GTA 6 one product among many, so an agent has to find it the way a shopper would (decision of
2026-10-13). The assortment is kept apart from the evidence-backed product arrays below: never
mix it into `applyCatalogPolicy`, inventory reports or GTA 6 purchase rules.

Apart from that assortment, reference mode must not fill gaps with plausible invented merchandise.
For the evidence-backed rows, browse pages, search, direct product URLs and purchase handlers
must agree on the source-backed active scope.
Expose captured listing facts separately when stock, variants or purchase behavior are unknown.
The [reference inventory report](../research/inventory-2026-10-06/README.md) is the current count and
provenance index; the [fidelity evidence matrix](../research/fidelity-2026-10-06/README.md) records
current visual/interaction limits. Earlier `research/depth/<slug>-*.md` files describe historical
fixture workflows and their source gaps. Finite coverage is not the retailer's complete inventory.

## Catalog modes and evidence

`lib/catalog-policy.js` selects `CATALOG_MODE=reference` by default. Only the explicit
`CATALOG_MODE=fixtures` restores the authored 500-per-store catalogs and historical scenarios.
The mode is process configuration, never a shopper query parameter. Keep fixture data dormant
rather than deleting it when preserving old benchmark reproducibility is required.

- Register evidence keyed by native product ID and apply `applyCatalogPolicy(store, products, evidence)`
  to the authoritative array before consumers can expose unsupported products. Its whitelist attaches
  `catalogEvidence`; it does **not** automatically secure purchase routes.
- Every active reference row needs `source_url`, `captured_at`, `evidence_path`, recorded `facts`,
  `availability` (`preorder`, `in_stock`, `out_of_stock`, `unknown`) and `purchase`
  (`simulated`, `unverified`). A source listing can justify its title/price without justifying its
  edition, variant configuration, stock or checkout. Do not manufacture missing fields.
- Enforce unverified-purchase guards on direct POST routes as well as hiding purchase controls.
  Stale fixture carts, forged IDs and direct checkout URLs must not create orders for removed or
  read-only products. Internal quantity caps are simulation limits, never verified stock counts.
- Export read-only captured cards as `catalog_observations`, with IDs, titles, native paths, provenance,
  known facts, `purchase: 'unverified'` and unknown availability. Do not add them to legacy purchasable
  arrays merely to make cards work. Preserve repeated occurrences in captured search presentations;
  inventory/observation counts must describe their deduplication scope.
- `GET /api/catalog` exposes active rows and observations, source evidence, nullable availability and
  `stock_quantity: null` for unknown real quantities. `GET /api/stores` additionally exposes
  `availability_status`, nullable `gta6_available` and catalog metadata. Use `available`/`true` for a
  supported local purchase scenario, `unavailable`/`false` for observed game absence, and
  `listing_only`/`null` or `unknown`/`null` when purchase or availability is not established.
  Blocked and blank pages do not establish absence. The index displays these groups separately.

Coupang/Chewy are currently unknown; Gmarket/Argos/Smyths are listing-only. Consult the generated
report and per-product evidence rather than hardcoding a count of positive/negative stores.

## Files

```
stores/<slug>/
  index.js        export store metadata, availability_status, catalog_observations and router
  pages.js        (optional) page templates as functions returning HTML strings
  public/         (optional) static files, served at /<slug>/static/...
test/*.reference.test.mjs   default reference-mode boundaries and supported journeys
test/<slug>.test.js         historical fixture-mode journey regressions
```

`router` is an `express.Router()`. Express 5 is installed: route params like `/product/:id`
are fine; do not use bare `*` wildcards (use `/{*splat}` if you must).

## What the request gives you

- `req.store` — this visitor's isolated state for this store: `{ cart: [], checkout: {}, user: null }`.
  Put whatever your flow needs in there (selected fulfillment, shipping form, sign-in state).
- `req.session` — the whole session (pass it to `recordOrder`).
- `res.locals.base` — the mount path, e.g. `/gamestop`. Build every link and form action from it.

## Shared modules (import from `../../lib/...`)

- `catalog-policy.js` — catalog mode, source whitelist and provenance summaries; see the evidence rules above.
- `store-inventory.js` — active inventory adapters for `/api/catalog` and generated reference counts.
- `catalog.js` — `GAME`, `PLATFORMS` (`ps5`, `xbox`), `EDITIONS` (`standard`, `ultimate`),
  `FORMATS` (`physical`, `code-in-box`, `digital`), `PRICES[currency]`.
- `html.js` — `esc()`, `money(amount, currency)`, `formatDate()`, `disclaimer(storeName)`, `badRequest(res, msg)`.
- `orders.js` — `recordOrder({...})`. Call it exactly once when the shopper places the order.
  It throws if the items are not normalized, so you cannot record something ungradeable.
  It snapshots the normalized data to separate purchase history from mutable checkout
  and catalog objects. Store-specific review fingerprints must still bind the price,
  quantity, options and rights that the shopper approved before recording the order.
- `payment.js` — `validateCard({ number, expiry | exp_month+exp_year, cvv })`, `cardBrand()`, `last4()`.
- `accounts.js` — `authenticate(store, email, password)`, `createAccount(store, {...})`, `findAccount()`, `TEST_ACCOUNT`.
  Every store already has `tester@example.com` / `Password123!` seeded.
- `boxart.js` / `/static/art/<platform>-<edition>.svg` — legacy placeholder art,
  retained for synthetic fixtures. For faithful replicas, prefer the exact assets
  observed on the reference page, saved locally with source URL, capture date and
  a provenance manifest. Do not substitute generated illustrations for observed
  artwork and then claim visual equivalence. Preserve ownership attribution.
- `product-photos.js` — original local photo keys and CSS crops. Match the selected
  product type/color and preserve the helper's aspect ratio; some sheets have unequal
  rows. Provenance and prompts are in `research/depth/ASSETS.md`.
- `retail-state.js` — local saved addresses, favorites, preferences, support cases and
  order-lifecycle helpers. Keep rendering and route labels retailer-specific. Private
  records must belong to the current store, browser session and active account.

## Rules

1. **Server-rendered, forms work without JavaScript.** Every step must be reachable with plain
   links and `<form method="post">`. Small vanilla JS for modals, drawers, tabs or a
   "same as shipping" checkbox is welcome. A supported purchase must retain a no-JS completion path;
   an unverified listing must retain its purchase boundary in both paths.
   (The end-to-end tests drive the flow with fetch, and real agents use real browsers.)
2. **Match the real retailer's flow**, from `research/<slug>.json` and `research/<slug>.md`:
   the same steps in the same order, the same button labels, the same field labels, the same
   fulfillment choices, the same sign-in / guest gate, the same upsells and pre-order notes,
   the same confirmation page shape. When the research has a gap, record it as
   unverified. Explicitly supported local purchase simulations may retain `// ASSUMPTION:` comments, but guessed
   steps do not establish real purchase eligibility or satisfy fidelity acceptance. Unverified
   inventory must stay read-only; historical unsupported purchase scenarios belong in fixture mode. A passing
   checkout test verifies local behavior; it does not verify the real site's flow.
3. **Purchasable product listings** must map to canonical ids: every GTA cart line is
   `{ platform, edition, format, qty, unit_price, title, sku }` using ids from `catalog.js`.
   Distractor products the real search shows next to the game (a controller, the soundtrack,
   GTA V) may be retained with source evidence. A captured card alone remains read-only. If a supported
   local purchase is separately established, record unrelated items as
   `{ kind: 'other', title, qty, unit_price, sku }` so grading can flag "ordered the wrong item".
4. **Every page** includes `disclaimer(name)` in the footer, a `<title>`, `<meta name="viewport">`,
   and a matching document language (`lang="en"` for English, `lang="ko"` for Korean).
   Serve runtime assets locally (no requests to external CDNs, fonts, or images).
   Reference assets acquired during research must include their provenance and
   must not include tracking scripts, personal data, or retailer service calls.
5. **Form fields** need a `<label>` tied to the input (`for`/`id`), a sensible `name`,
   `autocomplete` where obvious, and server-side validation that re-renders the step with
   an error message rather than a 400 page. Keep the shopper's typed values on re-render.
6. **Payment**: never store or echo a full card number. Record `{ method, brand, last4, name_on_card }`.
7. **Order numbers** follow the real retailer's format (see research). Show the order number and
   an order-summary on the confirmation page. Clear the cart after recording.
8. **Search** must distinguish matching the captured inventory from reproducing a live result set.
   Preserve the observed query, ordering and unrelated fuzzy matches; no-game availability does not
   imply an empty page. Case/whitespace normalization may preserve a captured query, but other GTA
   spellings need their own evidence before claiming an identical native result. Uncaptured queries
   must identify missing coverage rather than fabricate zero results. Source-only and listing-only
   stores reject unknown product IDs and never enable purchase from a read-only card.
9. **Empty states and errors** behave like a real store: empty cart page, "please select a platform",
   invalid card, missing required field, wrong password.
10. Keep individual store work self-contained: do not edit `app.js`, `lib/`, or another store.
    Shared features explicitly spanning stores, such as the CAPTCHA middleware below, may update
    the shared layer. Do not add dependencies.

## Korean storefronts

Korean stores use `country: 'KR'`, `currency: 'KRW'`, Korean labels and `lang="ko"`.
Use `money(amount, 'KRW')` to render integer won (for example, `89,800원`), and keep
numeric prices and order totals in won rather than dollars or minor units. Orders
still use the existing canonical platform, edition, format and fulfillment IDs.
Captured Korean and English queries should retain their observed behavior; do not treat aliases as
verified equivalent result sets without evidence. In enabled fixture/local purchase flows, validate
Korean phone numbers and five-digit postal codes. Any
identity verification or payment-provider step is a local simulation; document
assumptions and do not use real identity services or request resident registration numbers.

## Source-only stores and historical unrelated-product flows

The seven-store reference adapter in `stores/reference-retail.js` keeps captured native searches and
read-only detail links while replacing unsupported inventory and private routes with explicit coverage
states. Its purchase mutation guard must remain terminal. IKEA's captured `gta 6` search has zero
products/content; Nike, Sephora and Williams Sonoma have unrelated captured matches. Chewy's blank
source is unknown. Do not conflate these different outcomes in code, tests or grading metadata.

`lib/unavailable-store.js` and its `config.chrome`/`config.extend` hooks still support the historical
fixture catalogs, accounts, options, bags and simplified checkout. That factory's unavailable-game
metadata describes the selected fixture scenario, not new evidence about the retailer. In fixture
mode, unrelated purchases must remain `kind: 'other'`, with trusted options/prices and proper
session/account ownership. Bag, registry, list and replenishment links must retain their selected
configuration; reject unknown/structured option values and leave prior state intact on failed
multi-item transfers. Plans and saved interests never silently create orders, charge payments,
reserve stock or promise real services.

## Shared CAPTCHA scenarios

CAPTCHA support is optional and configured by the server, outside individual store routers. The
middleware mounted by `app.js` runs before protected store handlers, including POST handlers, so
direct form submissions cannot bypass a challenge or mutate cart, account or checkout state first.
Do not duplicate CAPTCHA handling inside store pages or add URL parameters that toggle it.

The default is off. `CAPTCHA_MODE=on` enables all supported profiles; `CAPTCHA_STORES` optionally
restricts them to a comma-separated list. Tests and programmatic callers can explicitly use
`createApp({ captcha: { mode: 'on', stores: ['gamestop'] } })`. Unsupported stores fail configuration.
See the README for each profile's routes and research basis. Preserve the distinction between
observed checks and synthetic escalation: GAME's researched reCAPTCHA is invisible, Walmart's
checks were observed on help/Terms pages, and Xbox's signup puzzle was not directly observed.

Clearance is isolated by session, store and run, outside the store's checkout state. Changing the
session run tag invalidates clearance on the next protected request. Challenge tokens are random,
session-bound, expire after five minutes and are invalidated when refreshed. Do not persist or replay
intercepted form bodies; return to a safe GET page and let the shopper resubmit after verification.
Preserve existing cart state. Keep local challenge assets self-contained and include the usual
disclaimer and page metadata.

Retain the no-JavaScript convention for every challenge. Checkbox and image-selection challenges
use ordinary forms; hold challenges have pointer and keyboard controls plus a two-step timed
no-JavaScript alternative. The server checks the three-second wait and exact triangle selection.
These interactions simulate benchmark obstacles and are not a production bot-defense system.

`GET /api/captcha` reports in-memory pending and passed attempts, with optional store/run filters;
it never returns solutions. `GET /api/stores` reports the configured profile, and passed challenges
contribute `meta.captcha` to orders. Keep failed and unfinished attempts observable as well as
successful orders.

## Testing both catalog modes

`npm test` runs `scripts/test-catalog-modes.mjs`: first `test/*.reference.test.mjs` with
`CATALOG_MODE=reference`, then `test/*.test.js` with `CATALOG_MODE=fixtures`. Keep those suites distinct;
a fixture regression passing cannot establish the default reference inventory or real-site fidelity.

Reference tests should cover the active whitelist/provenance, nullable availability, captured query
scope, readonly links, removed IDs, unsupported direct purchase submissions and stale fixture state.
For a supported local purchase, drive the actual sequence and assert exactly one canonical order;
for an unverified listing, assert that it cannot become an order. Known local validation failures
must record nothing.

Historical `test/<slug>.test.js` uses `startServer()` and `client()` from `test/helpers.js` to walk the
fixture journey and inspect `/api/orders`, including platform, edition, format, quantity, customer,
fulfillment and totals. Preserve relevant failure-path coverage. Run an individual suite with its mode:

```bash
CATALOG_MODE=reference node --test test/other-retail-inventory.reference.test.mjs
CATALOG_MODE=fixtures node --test test/gamestop.test.js
```

Existing store tests run with CAPTCHA disabled. CAPTCHA tests explicitly enable the profiles they
exercise and cover no-JavaScript completion, failures/retries, expiry/refresh, session/store/run
isolation, direct POST protection and continuation. CAPTCHA clearance never overrides inventory or
purchase-evidence guards.
