# Store clone conventions

Every store clone lives in `stores/<slug>/` and is mounted at `/<slug>` by `app.js`.
The goal of a clone is to reproduce the **flow** of the real retailer's GTA 6 pre-order
(pages, step order, labels, fields, upsells, quirks) closely enough that an AI agent
navigating it behaves as it would on the real site. Pixel-perfect design is not the goal;
recognizable layout, brand colors, wording and step order are.

## Files

```
stores/<slug>/
  index.js        default export { slug, name, country, currency, description, router }
  pages.js        (optional) page templates as functions returning HTML strings
  public/         (optional) static files, served at /<slug>/static/...
test/<slug>.test.js   end-to-end test that drives the whole flow with test/helpers.js
```

`router` is an `express.Router()`. Express 5 is installed: route params like `/product/:id`
are fine; do not use bare `*` wildcards (use `/{*splat}` if you must).

## What the request gives you

- `req.store` — this visitor's isolated state for this store: `{ cart: [], checkout: {}, user: null }`.
  Put whatever your flow needs in there (selected fulfillment, shipping form, sign-in state).
- `req.session` — the whole session (pass it to `recordOrder`).
- `res.locals.base` — the mount path, e.g. `/gamestop`. Build every link and form action from it.

## Shared modules (import from `../../lib/...`)

- `catalog.js` — `GAME`, `PLATFORMS` (`ps5`, `xbox`), `EDITIONS` (`standard`, `ultimate`),
  `FORMATS` (`physical`, `code-in-box`, `digital`), `PRICES[currency]`.
- `html.js` — `esc()`, `money(amount, currency)`, `formatDate()`, `disclaimer(storeName)`, `badRequest(res, msg)`.
- `orders.js` — `recordOrder({...})`. Call it exactly once when the shopper places the order.
  It throws if the items are not normalized, so you cannot record something ungradeable.
- `payment.js` — `validateCard({ number, expiry | exp_month+exp_year, cvv })`, `cardBrand()`, `last4()`.
- `accounts.js` — `authenticate(store, email, password)`, `createAccount(store, {...})`, `findAccount()`, `TEST_ACCOUNT`.
  Every store already has `tester@example.com` / `Password123!` seeded.
- `boxart.js` / `/static/art/<platform>-<edition>.svg` — placeholder cover art. Never use real artwork or logos.

## Rules

1. **Server-rendered, forms work without JavaScript.** Every step must be reachable with plain
   links and `<form method="post">`. Small vanilla JS for modals, drawers, tabs or a
   "same as shipping" checkbox is welcome, but the no-JS path must still complete the order.
   (The end-to-end tests drive the flow with fetch, and real agents use real browsers.)
2. **Match the real retailer's flow**, from `research/<slug>.json` and `research/<slug>.md`:
   the same steps in the same order, the same button labels, the same field labels, the same
   fulfillment choices, the same sign-in / guest gate, the same upsells and pre-order notes,
   the same confirmation page shape. When the research has a gap, choose what that retailer
   most plausibly does and add a `// ASSUMPTION:` comment.
3. **Product listings** must map to canonical ids: every cart line is
   `{ platform, edition, format, qty, unit_price, title, sku }` using ids from `catalog.js`.
   Distractor products the real search shows next to the game (a controller, the soundtrack,
   GTA V) are welcome and make the benchmark realistic; record them as
   `{ kind: 'other', title, qty, unit_price, sku }` so grading can flag "ordered the wrong item".
4. **Every page** includes `disclaimer(name)` in the footer, a `<title>`, `<meta name="viewport">`,
   and `lang="en"`. No external assets (no CDNs, fonts, images from the internet).
5. **Form fields** need a `<label>` tied to the input (`for`/`id`), a sensible `name`,
   `autocomplete` where obvious, and server-side validation that re-renders the step with
   an error message rather than a 400 page. Keep the shopper's typed values on re-render.
6. **Payment**: never store or echo a full card number. Record `{ method, brand, last4, name_on_card }`.
7. **Order numbers** follow the real retailer's format (see research). Show the order number and
   an order-summary on the confirmation page. Clear the cart after recording.
8. **Search** must find the game for queries like `gta 6`, `gta vi`, `grand theft auto`, `grand theft auto vi`,
   `GTA6`. A search page and a direct product URL are both required.
9. **Empty states and errors** behave like a real store: empty cart page, "please select a platform",
   invalid card, missing required field, wrong password.
10. Keep individual store work self-contained: do not edit `app.js`, `lib/`, or another store.
    Shared features explicitly spanning stores, such as the CAPTCHA middleware below, may update
    the shared layer. Do not add dependencies.

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

## The end-to-end test

`test/<slug>.test.js` uses `startServer()` and `client()` from `test/helpers.js` to walk the
happy path exactly as an agent would (search → product → add to cart → cart → checkout steps →
place order → confirmation), then asserts via `/api/orders` that exactly one order was recorded
for this store with the expected `platform`, `edition`, `format`, `qty`, customer email,
fulfillment method and totals. Add a second test for at least one failure path
(e.g. invalid card re-renders the payment step with an error and records no order).

Existing store tests run with CAPTCHA disabled. CAPTCHA tests should explicitly enable the
profiles they exercise and cover the no-JavaScript completion path, failures and retries, token
expiry/refresh, session/store/run isolation, direct POST protection, and continuation to checkout.

Run with `npm test` or `node --test test/<slug>.test.js`.
