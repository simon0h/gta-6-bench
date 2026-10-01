# GTA 6 pre-order bench

A synthetic environment for benchmarking computer-use / browser agents (Muse, Grok bot, and the like)
on one concrete task: **pre-order Grand Theft Auto VI**. It contains self-contained clones of real
retailers' pre-order flows, researched from the live sites in September 2026, plus an API that reports
exactly what each agent ordered so runs can be graded.

Nothing here is real: no real payments, no real accounts, no real artwork or logos.

## Run

```bash
npm install
npm start          # http://localhost:3000
```

Open `http://localhost:3000` for the list of stores. Each store is mounted at `/<slug>`
(for example `/gamestop`). To expose it to an agent running in its own VM, host it anywhere
Node runs, or tunnel the port (ngrok, cloudflared, Tailscale funnel).

## How a benchmark run works

1. Optionally clear old orders: `DELETE /api/orders`.
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

Orders persist in `data/orders.json` (set `ORDERS_FILE` to change it). Clear them between runs: the
seeded test account's order-history pages list every order that account has placed, so a later agent
would otherwise see an earlier agent's orders.

### What the order fields can contain

| Field | Values |
|---|---|
| `items[].kind` | `game`, or `other` when the agent bought something else (the controller, the soundtrack, GTA V) |
| `items[].platform` / `edition` / `format` | `ps5` or `xbox` / `standard` or `ultimate` / `physical`, `code-in-box` or `digital` |
| `fulfillment.method` | `ship`, `pickup`, `digital` (PlayStation Store, Xbox Store), or `mixed` (Best Buy cart with both shipped and picked-up items) |
| `payment.method` | `card` with `brand` and `last4` only, or the other method chosen, such as `paypal`, `zip`, `cash_app`, `venmo` or `wallet` |
| `totals.tax` | `0` at GAME and JB Hi-Fi, whose prices already include VAT or GST |
| `meta` | store-specific extras, such as Best Buy's per-item fulfillment and pickup person, or a Walmart+ trial |

Card numbers and security codes are never stored.

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

Stores that require an account on the real site (Target, Walmart, Amazon, PlayStation Store, Xbox Store)
require one here too. The seeded account works, and account creation works as well.

## Stores

| Store | URL | Country | What makes the flow different |
|---|---|---|---|
| GameStop | `/gamestop` | US | Guest allowed. Code-in-box only. Single-page checkout. Pro membership upsells. |
| Target | `/target` | US | No guest checkout. Add-to-cart drawer. Pickup / Delivery / Shipping tabs. |
| Best Buy | `/bestbuy` | US | "Continue as Guest". Redirects straight to cart. Checkout sub-steps. BBY01- order numbers. |
| Walmart | `/walmart` | US | Identity gate with one email-or-phone field. "Added to cart!" interstitial. Walmart+ plan card in checkout. |
| Amazon | `/amazon` | US | Sign-in wall. "Pre-order now" skips the cart; only search tiles add to cart, in place. Address, payment and review pages. |
| PlayStation Store | `/playstation-store` | US | Digital only. PSN sign-in. Edition cards. Checkout drawer, charged immediately. |
| Xbox Store | `/xbox-store` | US | Digital only. Microsoft sign-in. Edition picker. Purchase dialog. |
| Rockstar Store | `/rockstar-store` | US | Age gate after "Pre-Order Now". No cart step. Xsolla-style checkout. Digital editions link out to the console stores. |
| GAME | `/game-uk` | UK (GBP) | "I'm Old Enough" gate. Email-first guest checkout. Click & Collect. PayPal blocked for pre-orders. |
| JB Hi-Fi | `/jb-hifi` | AU (AUD) | Shopify-style three-step checkout. Paid in full at order. |

Smyths Toys (UK) and EB Games (AU) were researched too but not cloned. `research/COMPARISON.md` explains why.

## Layout

```
app.js                 builds the Express app, mounts stores/*, serves the API
server.js              npm start
lib/                   shared: catalog, session, orders, payment, accounts, CAPTCHA, html helpers, box art
stores/<slug>/         one clone per retailer (see docs/STORE_CONVENTIONS.md)
research/<slug>.{json,md}   what the real site does; the spec each clone was built from
research/COMPARISON.md      cross-retailer comparison and why these 10 were chosen
test/<slug>.test.js    end-to-end test that walks each clone's flow and checks the recorded order
```

## Tests

```bash
npm test
```
