# JB Hi-Fi (AU) — pre-ordering Grand Theft Auto VI

Researched 2026-09-29 by live browsing jbhifi.com.au. Pre-order is live for **PS5** and **Xbox Series X** at **AU$129** each, Standard edition only, sold as **Code in Box** (download code, no disc). Release date shown everywhere is **19 Nov 26**; boxes are delivered / collectable from **12 November** for preloading. Checkout is a Shopify checkout on the JB domain and is **guest-first**: no account is needed and there is no sign-in wall.

How this was gathered: the built-in browser walked search → both product pages → Pre-order → add-to-cart modal → cart → Checkout → the first Shopify checkout page (all three delivery-method states). I stopped there because the next steps need an email/address. Payment methods, pre-order charge timing, delivery options and Click & Collect rules come from JB Hi-Fi's own help articles read in the same browser. WebSearch quota was exhausted and WebFetch cannot render jbhifi.com.au, so there are no third-party sources. Anything marked **(low confidence)** was not observed.

---

## Step 1 — Search

**URL:** `https://www.jbhifi.com.au/search?query=grand+theft+auto+vi`
**Page title:** `Search results: 'grand theft auto vi' | JB Hi-Fi`

Top to bottom:

- Breadcrumb `Home › Search results: 'grand theft auto vi'`
- **h1:** `20 results for "grand theft auto vi"`
- Toolbar right: `Show: 36 72 100` and `Sort by:` dropdown (`Best Match`, `Price: Low - High`, `Price: High - Low`, `New - Old`, `Old - New`, `Title: A - Z`, `Title: Z - A`, `Highest rated`)
- Left filter rail, each a `+` expander with checkboxes: `Brand`, `Price`, `Category`, `Primary Format - Games`, `Console compatibility`, `Game Genre`, `Game publisher`, `Game developer`, `Primary Format - Music`
- 3-column product grid. The two game tiles read, in order:

  | Tile text (PS5) | Tile text (Xbox) |
  |---|---|
  | badges `PRE-ORDER` (purple) + `PRE-ORDER DLC` (white) | same |
  | heart (wishlist) | same |
  | box art (PS5 blue header) | box art (Xbox green header) |
  | `Grand Theft Auto VI` | `Grand Theft Auto VI` |
  | `PlayStation 5` | `Xbox Series X` |
  | yellow tag `$129` | yellow tag `$129` |
  | green button **`Pre-order`** (flips to `Added`) | same |

  Links: PS5 → `/products/playstation-5-grand-theft-auto-vi`; Xbox → `/products/xbox-series-x-grand-theft-auto-vi`.

- Other GTA VI tiles: `Grand Theft Auto VI: The Goodtime State – Vice City Collection` — badges `COMING SOON`, `JB PERKS EXCLUSIVE`, `ONLINE ONLY`, subtitle `Grand Theft Auto VI`, `$699`, `+ DELIVERY FROM $22.99`, grey `Coming soon` (not orderable). `PS5 PlayStation 5 DualSense Wireless Controller Grand Theft Auto VI White Limited Edition` — `PRE-ORDER`, `ONLINE ONLY`, `$134`, `Pre-order`. Soundtrack: CD `$36.99` `+ DELIVERY FROM $4.99`, vinyl `$120`, `JB EXCLUSIVE` pink/blue vinyl `$140` `+ DELIVERY FROM $9.99`, all `Pre-order`.
- Released items show `Add to cart` instead, star rating like `4.3(24)`, and badges `RED HOT DEAL`, `ON SALE` (with `TICKET $99` struck through, `$89`, `$10 OFF^`), `IN-STORE ONLY` (grey `In-store only` button), `DIGITAL DOWNLOAD`, `NEW AT JB!`.
- Clicking a heart as a guest shows `You're one step away from having this in your wishlist!` with `Create account` / `Log in`.
- Footer: `Showing 20 of 20 results` then the disclaimer `^Discounts apply to previous ticketed / advertised price prior to the discount offer…`

## Step 2 — Product page (PS5; Xbox is identical apart from IDs and breadcrumb)

**URL:** `https://www.jbhifi.com.au/products/playstation-5-grand-theft-auto-vi`
**Pattern:** `/products/<platform-slug>-<title-slug>`
**Page title:** `Grand Theft Auto VI Standard Edition on PS5 - Pre-Order Now - JB Hi-Fi`
**Breadcrumb:** `Home › Gaming › PlayStation › PS5 games › Grand Theft Auto VI` (Xbox: `Home › Gaming › Xbox › Xbox Series X|S games`)

On first visit a JB Perks popup covers the lower left: `WANT A $10 WELCOME COUPON*?` / `JOIN FOR FREE MEMBER BENEFITS!` / `Valid for 28 days from issue. T&Cs apply.` / button `Join & get my $10` / X to close.

Two-column layout. Left: vertical thumbnail strip (box art, four screenshots, DLC banner) and a large box-art image with the `CTC` rating mark; above it a `PRE-ORDER DLC` label and a `Similar items ›` link. Right (buy box), top to bottom:

1. purple badge `PRE-ORDER`; small PS5 logo
2. **h1** `Grand Theft Auto VI` (24px bold)
3. `MODEL: 5026555439930  SKU: 903000  PLU: 5026555439930` (Xbox: `MODEL: 5026555370219  SKU: 903001  PLU: 5026555370219`)
4. yellow price-tag shape with red `$129`
5. logos `afterpay`, `zip`, `PayPal` (each links to a help page)
6. grey row with coupon icon: `Log in to see if you have coupons.`
7. `Primary Format - Games` — horizontal tile carousel with `‹ ›` arrows: `The Goodtime State - Vice City Collection $699`, **`PS5 $129`** (selected, yellow), `XBOX $129`. Each tile links to the other product URL (separate listings, not a true variant switch).
8. green button **`Pre-order`** (277×50px, white bold 18px) with a square heart `Add to wishlist` button to its right
9. grey notice box with red `!` icon:
   - `No Disc Included (Code in Box).`
   - `Choose carefully as we do not accept change of mind returns for video games distributed by digital redemption code.`
   - `Download Code is single-use, non-transferable and subject to Rockstar Games, and PlayStation Terms of Service.` (Xbox: `…and Xbox Terms of Service.`)
   - `Available 19 November. Pick up your copy instore to preload from 12 November.`
10. `DESCRIPTION` — `Rating: CTC`, `Consumer Advice: CTC`
11. `Release date` / **`19 Nov 26`**
12. `Pre-order price guarantee` — `If the price of your pre-order drops before release day, we'll refund you the difference shortly after release.`
13. `↓ Product overview` anchor
14. `AVAILABILITY` — text box `Enter postcode or suburb`, link `Use my location`. Opens a store panel (`Your store` / `Click & Collect` / `Check store availability`); from our non-AU location it said `Sorry, there are no in-store options available for this product.`
15. yellow box `SEEN IT CHEAPER? ASK FOR A JB DEAL!` / `INSTORE | ONLINE` / `Excludes JB Hi-Fi Marketplace products` / buttons `Live chat` and `Call 13 52 44` (hours shown localised, e.g. `4pm – 3am (GMT-7)`)

There is **no quantity selector**. Scrolling shows a sticky mini-bar under the header: thumbnail, `Grand Theft Auto VI`, yellow `$129` tag, green `Pre-order`.

Below the buy box:

- `DON'T MISS OUT ON THIS!` banner (Vice City key art, `PRE-ORDER BONUS` ribbon): **`Pre-Order DLC!`** `Flash back to when the neon burned brightest with the Vintage Vice City Pack, featuring the timeless two-tone ’55 Vapid Stanier sedan and garage alongside the world-famous Ocean Beach, decadent outfits and hairstyles for both Jason and Lucia, and an iconic weapon pattern that echoes the excess of the past.` / `Offer ends 18 Nov 2026`
- `FREQUENTLY BOUGHT TOGETHER` carousel (Logitech G Astro A20X headset `$249` RED HOT DEAL, Legion Pro OLED monitor `TICKET $1699` → `$1299` `$400 OFF^`, DualSense Edge `$329`, Marvel's Wolverine `$109`, PS5 Slim `$999`, EA Sports FC 27 `$99`, Call of Duty: Modern Warfare 4 - 2XP Edition `$89` Pre-order, NBA 2K27 `$99`, DualSense Charging Station `$49`, Zelda: Ocarina of Time (Day One Edition) `$109` Pre-order). Each tile: `Add to cart` and `View alternatives`.
- `DESCRIPTION` (collapsible): `Delivery and pickup starts November 12, allowing the game to be downloaded and installed in advance. Grand Theft Auto VI is releasing and becomes playable on November 19.` / `This box contains a download code (no disc). The PlayStation 5 version can only be used by users holding an account for PlayStation® registered to Australia` / `Grand Theft Auto VI is a single-player experience.` / `Vice City, USA.` / story paragraph / Rockstar legal text. Spec list: `Genre Action & Adventure`, `Rating CTC`, `Consumer Advice CTC`, `Game developer Rockstar Games`, `Game publisher Rockstar Games`, `Console compatibility PlayStation 5`, `Read more`.
- `RECOMMENDED FOR YOU` carousel; page footer disclaimer.

## Step 3 — Click "Pre-order"

The button briefly reads `Added!`, the header Cart icon gets a `1` badge and a **full-screen modal** (light grey `#F5F5F5`, X top right) opens over the page, URL unchanged:

- green check + **`Item added to your cart!`**
- thumbnail + `Grand Theft Auto VI`, with buttons **`Review cart`** (black) and **`Checkout`** (green) on the right
- `ENHANCE YOUR PRODUCT` — carousel of accessory/game tiles (title, stars, badge, yellow price, green `Add to cart`, heart), progress bar + `›`
- `Review cart` / `Checkout` repeated at the bottom

(A hidden header mini-cart panel also exists: `My Cart`, `Your cart is empty`, `Includes GST. Shipping calculated at checkout.`, `Checkout`.)

## Step 4 — Cart

**URL:** `https://www.jbhifi.com.au/cart` — **title** `Your Shopping Cart`

- **h1** `My Cart`; right: `🛒 Continue shopping`
- Line item card: thumbnail · `Grand Theft Auto VI` · `ⓘ Pre-order release date 19 Nov 2026` · quantity dropdown `1` (options 1–5) · `$129.00` · `🗑 Remove`
- Right summary card: `Coupon code` text box + `Apply` · `Availability` `Enter postcode or suburb` text box + `Use my location` · `Subtotal $129.00` · `Includes GST. Shipping calculated at checkout.` · green **`Checkout`**
- No express wallets on this page.
- Below: `Don’t forget these` carousel of upsell tiles.

## Step 5 — Checkout, page 1: Customer and Shipping Information

Clicking `Checkout` goes straight to Shopify checkout on the JB domain:
`https://www.jbhifi.com.au/checkouts/cn/<token>/en-us/information` — title `Customer and Shipping Information - JB Hi-Fi - Checkout`.

**No sign-in or "continue as guest" screen exists; guest checkout is the default.**

Header: yellow bar with only the `JB HI-FI` logo (centred). Breadcrumb: `Cart › Customer and Shipping Information › Shipping › Payment`. Two columns; right column is the order summary (thumbnail with `1` badge, `Grand Theft Auto VI`, `$129.00`, discount-code area, `Subtotal $129.00`, `Shipping Calculated at next step`, `Total AUD $129.00`).

Left column, in order:

1. `Express checkout` block with an `OR` divider — in our session it stayed a grey loading skeleton, so the wallet buttons are unconfirmed.
2. **`Your details`** — `Email` (required; helper `Used for your order confirmation and cart reminders`, ⓘ tooltip) · checkbox `Keep me in the loop on hot news and offers!` (unchecked)
3. **`Delivery method`** (`Choose a delivery method`) — radio cards, selected one highlighted yellow:
   - **`Delivery`** (default, truck icon) → shows `Shipping address`
   - `Click & Collect` (store icon) → replaces the address block with **`Pickup locations`** + detected location (`📍 United States` for us) with a `Change location` button. With nothing found: red box `No stores available with your item` and `Ship your items or search elsewhere`. `search elsewhere` shows `Pickup locations` / `Cancel`, black button `Use my location`, `OR`, `Country/region` select (`Australia`), text box `Suburb or postcode`, button `Find stores`. `Continue to shipping` is greyed out until a store is chosen.
   - `Ship to collection point` (pin icon) → **`Collection point`**: black `Use my location`, `or`, `Country/region` select, text box `Address, suburb or postcode`, button `Search`.
4. **`Shipping address`** (Delivery selected) — floating-label fields in this order: `Country/Region` (select, default `Australia`) · `First name` | `Last name` (side by side) · `Company (optional)` · `Address` (with search icon = autocomplete) · `Address line 2 (optional)` · `Suburb` | `State/territory` (select: Australian Capital Territory, New South Wales, Northern Territory, Queensland, South Australia, Tasmania, Victoria, Western Australia) | `Postcode` · `Mobile phone` (ⓘ) · checkbox `Save this information for next time`. Required: email, first/last name, address, suburb, state, postcode, mobile.
5. Buttons: `‹ Return to cart` (left) and green **`Continue to shipping`** (right).

No validation messages were triggered (no data entered).

## Step 6 — Shipping **(low confidence — not observed)**

Standard Shopify step: contact / ship-to summary with `Change` links, then a `Shipping method` radio list with prices, button `Continue to payment`. JB's help page lists the possible methods: `Standard Delivery (2 – 12 days)` via Australia Post Mail (untracked, used for games) / Australia Post eParcel / Team Global Express Priority (2 – 4 days); `Express Delivery (1 – 2 business days)`; `Courier Delivery (next business day)` — **pre-orders are not eligible**; Uber ASAP/Scheduled for metro store stock. Help also says the extra pre-order delivery time "is highlighted during the checkout process".

## Step 7 — Payment **(low confidence — not observed)**

Accepted online (JB help, exact list): `Visa, Mastercard, American Express credit and debit cards, PayPal, Apple Pay, Afterpay, Zip, UnionPay, Latitude Interest Free and JB Hi-Fi Gift Cards.` Notes: Apple Pay only in Safari on Apple devices; Diners Club via PayPal; Afterpay, Zip and PayPal cannot be combined. Expected Shopify layout: `Payment — All transactions are secure and encrypted`, accordion of methods (Credit card with `Card number`, `Expiration date (MM / YY)`, `Security code`, `Name on card`; PayPal; Afterpay; Zip; Latitude; gift card code box), `Billing address` radio `Same as shipping address` (default) / `Use a different billing address`, button **`Pay now`**. There is no separate review page; the order is placed from this step.

**Charge timing:** paid in full at order time. JB help: "Pre-orders allow you to pay for an item you want ahead of its release day." Pre-orders dispatch from the Victorian warehouse 1 day before release (orders inside 3 business days of release may ship after release). Price guarantee: a drop before release is refunded after release.

## Step 8 — Confirmation **(low confidence — not observed)**

Shopify-style `Thank you, <name>!` / `Your order is confirmed` page with order number, contact, shipping address, method, payment, order summary and `Continue shopping`. JB emails an order confirmation; Click & Collect orders get an email + SMS when ready (pre-orders: from store opening on release day), and the email/SMS shows the order number or barcode to scan in store together with photo ID.

---

## Look and feel

- **Colours:** header yellow `#FFEC0F`; nav bar and secondary buttons black `#000000`; page white `#FFFFFF`; panels/modals light grey `#F5F5F5`; CTA green `#028702` with white text; price digits red `#E02020` inside a yellow tag; `PRE-ORDER` badge purple `#812990`; `RED HOT DEAL` red.
- **Typography:** `Roboto, arial, sans-serif` throughout, including checkout. Body black on white. Product h1 24px/700. Section headings are uppercase condensed display type (`DESCRIPTION`, `AVAILABILITY`, `FREQUENTLY BOUGHT TOGETHER`, `ENHANCE YOUR PRODUCT`). Buttons are bold, square-cornered (0px radius).
- **Header:** thin black promo strip (rotating text, X close) → yellow bar with black italic `JB HI-FI` wordmark + `ALWAYS CHEAP PRICES` tagline at left, white pill search (`Search products, brands, and more…`) centred, icon+label buttons `Track order` `Stores` `Log in` `Cart` at right → black nav bar: `New` `Products` `Brands` `Deals & Catalogues` `Clearance` `Services` `Gift Cards` `Join JB Perks` `News & Reviews` (dropdown mega-menus). A floating yellow `Chat` bubble sits bottom right on every page.
- **Product tile:** white card; badges top-left, heart top-right; box art; title (bold), platform subtitle (grey), stars + count, yellow price tag with red whole-dollar price, optional delivery-from line, full-width green button.
- **Product page:** two columns (gallery left, buy box right), yellow highlights for the selected variant tile, grey notice box for pre-order/code-in-box warnings, yellow price-match box, carousels below.
- **Checkout:** stripped white page, yellow logo bar, grey floating-label inputs, yellow highlight on the selected delivery-method card, green primary button, order summary in a grey right column.

## Quirks

- Code in Box only (no disc), $129 whole-dollar display, no Ultimate edition; $699 Vice City Collection is "Coming soon" and JB Perks exclusive.
- Platform variants are separate URLs joined by a tile carousel; no quantity selector on the PDP; cart qty max 5.
- Add-to-cart is a full-screen modal with upsells, not a drawer.
- Shopify checkout on the JB domain; guest-first with no auth screen; email → delivery method radio → address.
- Three fulfilment choices in checkout: Delivery, Click & Collect (store finder that geolocates; Continue disabled until a store is picked), Ship to collection point.
- Pre-orders charged at order time; ship 1 day before release; not eligible for courier; C&C ready at store opening on release day; bonuses may be online-delivery only.
- Preload from 12 Nov; playable 19 Nov. Rating `CTC` (Check the Classification).
- JB Perks $10 popup on first PDP visit; "Seen it cheaper? Ask for a JB Deal" price-match box; wishlist requires an account. JB Hi-Fi Perks is a free membership ($10 welcome coupon, member discounts, early sale notices, Birthday Perk, receipt-free); joining needs a JB account and an Australian mobile number. Not required to buy.
- BNPL (Afterpay/Zip/PayPal) can't be combined; Apple Pay is Safari-only.

## Gaps

- Shipping and Payment steps, confirmation page and emails not observed (would need personal data).
- Express-checkout wallets never rendered; cart page has none.
- Login/signup fields not observed (no sign-in rule).
- Click & Collect store list for an AU postcode not tested; shipping cost for this game unknown.
- No third-party sources: WebSearch quota exhausted; WebFetch cannot render jbhifi.com.au.

## Sources

- https://www.jbhifi.com.au/search?query=grand%20theft%20auto%20vi
- https://www.jbhifi.com.au/products/playstation-5-grand-theft-auto-vi
- https://www.jbhifi.com.au/products/xbox-series-x-grand-theft-auto-vi
- https://www.jbhifi.com.au/cart
- https://www.jbhifi.com.au/checkouts/cn/<token>/en-us/information (session-specific token)
- https://www.jbhifi.com.au/pages/help-and-support
- https://www.jbhifi.com.au/pages/help-and-support/payments
- https://www.jbhifi.com.au/pages/help-and-support/online-payment-methods
- https://www.jbhifi.com.au/pages/help-and-support/orders
- https://www.jbhifi.com.au/pages/help-and-support/how-do-pre-orders-work
- https://www.jbhifi.com.au/pages/help-and-support/why-cant-i-order-multiple-copies-of-the-same-item
- https://www.jbhifi.com.au/pages/help-and-support/delivery-and-collection
- https://www.jbhifi.com.au/pages/help-and-support/what-are-the-delivery-options-for-online-purchases
- https://www.jbhifi.com.au/pages/help-and-support/when-will-i-get-my-pre-order
- https://www.jbhifi.com.au/pages/help-and-support/what-is-click-and-collect
- https://www.jbhifi.com.au/pages/help-and-support/click-and-collect-pre-orders
- https://www.jbhifi.com.au/pages/help-and-support/my-account
- https://www.jbhifi.com.au/pages/help-and-support/jb-perks
- Linked from the PDP but not opened: https://www.jbhifi.com.au/pages/help-and-support/afterpay, https://www.jbhifi.com.au/pages/help-and-support/zip, https://www.jbhifi.com.au/pages/help-and-support/paypal-pay-in-4
