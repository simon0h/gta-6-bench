# Smyths Toys (UK) — GTA 6 pre-order flow

Researched 2026-09-29. **The built-in browser was blocked on the first page**: smythstoys.com sits behind Imperva/Incapsula and served an "Additional security check is required — Click to verify" interstitial, which the rules say not to solve. Every other direct route to smythstoys.com (WebFetch, curl, Wayback, Google Translate proxy) hit the same wall ("Pardon Our Interruption"). So everything below about Smyths' own pages comes from search-engine snippets of those pages plus third-party pre-order guides, and anything about on-screen checkout UI is modelled on Smyths' SAP Commerce (Hybris) storefront from general knowledge and is **marked (low)**. Facts marked **(high)** were read from Smyths' own help/product page text via snippets or from several independent press sources.

**Status:** pre-order is live **(high)**. Two SKUs, both Standard edition, both "download code in a box" (no disc): PS5 (product id 263307) and Xbox Series X (product id 263308). Launch price 25 Jun 2026 was £69.99; Smyths dropped to £67.99 within days (Which? reported "£68" on 29 Jun; a HotUKDeals-derived snippet says £67.99 with free delivery). No Ultimate edition, disc or digital GTA VI SKU exists at Smyths (Ultimate is digital-only at £89.99).

Key dates Smyths prints on the listing **(high)**: pre-load starts **November 12th**; pre-orders are available for **collection and delivery on November 12th**; the game is **playable from November 19th**.

---

## Step 1 — Search

**URL:** `https://www.smythstoys.com/uk/en-gb/search/?text=grand+theft+auto+vi` (pattern `/uk/en-gb/search/?text={q}`) **(high)**

What an automated shopper actually sees first **(high, observed)**: a blue-banded Imperva page headed **"www.smythstoys.com - Additional security check is required"** with a single checkbox **"Click to verify"**, then explanatory copy "Why am I seeing this page?" / "What should I do?". A real browser with cookies and JS normally passes silently; a fresh headless session does not.

Search results page **(low)**:
- Header search box, left facet rail (Category, Brand, Price, Platform, Age, Availability) and a product grid.
- Each tile: box art, product title (link), bold price, star rating, a **Pre-order** (or **Add to Basket**) button and a stock / Click & Collect note.
- Expected hits for this query: **Grand Theft Auto VI PS5** — £67.99 — and **Grand Theft Auto VI Xbox Series X** — £67.99 — plus any GTA-branded accessories (e.g. the Grand Theft Auto VI DualSense controller) if stocked.

Category route instead of search (derived from the product URL path) **(high)**: **Gaming & Tech › Pre-Order Games › PlayStation 5 Pre-Order Games** (Xbox: **… › Xbox Series X Pre-Order Games**).

---

## Step 2 — Product page (PS5; Xbox identical except id/slug)

**URL:** `https://www.smythstoys.com/uk/en-gb/gaming-and-tech/pre-order-games/playstation-5-pre-order-games/grand-theft-auto-vi-ps5/p/263307` **(high)**
Xbox: `…/xbox-series-x-pre-order-games/grand-theft-auto-vi-xbox-series-x/p/263308` **(high)**
URL pattern: `/uk/en-gb/<category>/<sub>/<subsub>/<slug>/p/<6-digit id>`. The Irish site carries twin listings (263722 / 263638) under `/ie/en-ie/`.

Layout **(low)**: breadcrumb (Home › Gaming & Tech › Pre-Order Games › PlayStation 5 Pre-Order Games); large box-art gallery left; buy box right; long description, key features, specification and reviews below.

Buy box, top to bottom:

1. H1: **Grand Theft Auto VI PS5** (title inferred from slug + Smyths naming convention, e.g. "EA Sports FC 26 PS5") **(medium)**
2. **Ref: 263307** product code **(high, snippet)**
3. Price **£67.99** in bold **(medium)**; no member price; a "Was £69.99" strikethrough is not confirmed.
4. **PEGI 18** rating badge **(medium)**.
5. Primary red button **Pre-order** — adds to basket **(low; may read "Add to Basket")**. Quantity stepper beside it **(low)**.
6. Fulfilment panel **(prices/rules high, wording low)**:
   - **Home Delivery** — Standard delivery **FREE on orders over £20** (£2.99 for £10–£20, £4.99 under £10); GB 1–2 working days. **Express** next working day £1.99 over £20 (£5.99 / £7.99 on smaller baskets), order by 10pm, Mon–Fri, not available to Islands & Scottish Highlands. Pre-orders are dispatched to arrive on the availability date.
   - **Click & Collect** — **FREE**; choose a store (**Check Store Stock** / store selector); in-stock items are ready within 2 hours; pre-orders collectable from Nov 12.
7. Key features **(high, snippet text)**:
   - Pre-order to receive the **Vintage Vice City Pack**
   - Pre-load starting on November 12th. Pre-orders collection and delivery available on November 12th. Playable from November 19th.
   - This product will only contain a **download code inside the box** to support pre-load. **A disc will not be included.**
   - Grand Theft Auto VI is a single-player experience.
   - The PlayStation 5 version can only be used by users holding an account for PlayStation registered to the United Kingdom.
8. Description **(high, paraphrased)**: Rockstar's copy — Vice City, USA; Jason and Lucia caught up in a criminal conspiracy stretching across the state of Leonida.
9. Upsells **(low)**: "You may also like" carousel of other pre-order games and PS5/Xbox accessories.

Variant handling **(high)**: platforms are **separate listings**, not a selector; there is no edition selector because only Standard exists.

---

## Step 3 — Add to basket

**(low)** Clicking **Pre-order** opens an "Added to your basket" panel/modal showing the item, price and quantity with **Continue Shopping**, **View Basket** and **Checkout** buttons. Basket icon count in the header increments.

---

## Step 4 — Basket

**URL:** `https://www.smythstoys.com/uk/en-gb/cart` **(medium — standard SAP Commerce path)**

- Line item: image, **Grand Theft Auto VI PS5**, product code, unit price £67.99, quantity stepper, line total, **Remove** **(low)**.
- Summary: **Subtotal**, **Delivery** (FREE over £20 / calculated at checkout), **Total** **(low)**.
- **Voucher code** field **(medium)** — Smyths' pre-order policy explicitly refers to a "money off voucher" being applied at order time.
- Primary button **Checkout** **(low)**; express buttons for **PayPal**, **Apple Pay**, **Google Pay** may appear here **(low)**.

---

## Step 5 — Checkout: sign in or guest

**URL:** `https://www.smythstoys.com/uk/en-gb/checkout` (multi-step) **(low)**

**(low)** Two-column screen: **Returning customer — Sign in** (fields **Email address**, **Password**, link "Forgotten your password?") and **New customer** with **Register** and **Continue as guest**. Guest checkout is believed to be available: Smyths' own help copy tells shoppers who want to cancel or update card details on a pre-order to do so in their Smyths Toys Account and, "if you do not have an account", to create one — i.e. orders exist without accounts **(medium)**.

---

## Step 6 — Checkout steps (Home Delivery path)

All field labels/order **(low)**; delivery options and prices **(high)**.

1. **Delivery method** — radio **Home Delivery** / **Click & Collect**. For Click & Collect a store search (town or postcode) appears and a store must be chosen. → **Continue**
2. **Your details / Delivery address** — Title · First name · Last name · Email address · Phone number · Postcode with **Find address** lookup · Address line 1 · Address line 2 · Town/City · County · Country (United Kingdom). → **Continue**
   Delivery option choice: **Standard Delivery — FREE** (over £20, 1–2 working days) or **Express — £1.99** (next working day, order by 10pm). For a pre-order the date shown is the availability date (12/11/2026).
3. **Payment** — method tabs: **Card** (Stripe-hosted fields: Card number · Expiry MM/YY · CVC · Name on card), **PayPal**, **Apple Pay**, **Google Pay**; **Smyths Gift Card / eGift Card** (number + PIN) as a partial payment; **Klarna** Pay in 3 / Pay in 30 days is claimed by one low-trust source and is **not** in Klarna's UK shop directory — treat as unconfirmed. Checkbox **Billing address same as delivery address** (default on). **Voucher code** entry. → **Continue**
4. **Review & place order** — items, delivery/collection choice, address, payment method, totals; checkbox **I have read and agree to the Terms & Conditions**; button **Place Order**.

### What the shopper is told about being charged **(high)**

Smyths' pre-order page states that there is no payment upfront or deposit online for credit/debit card transactions; the card is **pre-authorised 2–7 days before the item becomes available** and payment is taken when the order is **dispatched** (home delivery) or **collected** (Click & Collect). If the pre-authorisation fails, Smyths emails the customer asking them to re-enter card details **within 24 hours** to keep the order. **Pre-orders paid with PayPal are charged in full upfront.** The **Pre-order Price Promise** means a lower Smyths price on the dispatch/collection date is honoured automatically (not combinable with a money-off voucher).

---

## Step 7 — Confirmation

- On-screen headline **Thank you for your order** **(low)**; shows order number, items, delivery or collection details and the pre-order availability date **(low)**.
- Email **(high)**: an order confirmation email containing the **unique order number and barcode**; later a **dispatch confirmation email with tracking** (home delivery) or a **"Ready for Collection" email** (Click & Collect).
- Click & Collect rules **(high)**: free; order held for **2 days**; a **£2 non-collection fee** is deducted if not collected; the collector needs the **photo ID of the person who placed the order** plus the Ready for Collection email.
- After ordering **(high)**: addresses cannot be amended and orders cannot be cancelled once placed, except that pre-orders can be cancelled / have payment details updated from a Smyths Toys account.

Order number format: not found.

---

## Look and feel

- **Logo** **(high, from the official SVG)**: wordmark **"Smyths"** in red **#ed1c24**, **"Toys Superstores"** in near-black **#231f20**, with a yellow gradient star/ball accent (**#fbea07 → #fdcd0c**, edge **#ecbc09**). Heavy, rounded, friendly sans-serif letterforms.
- **Palette for a clone**: primary red #ed1c24 (buttons, CTAs, price highlights), secondary yellow #fbea07 (promo flashes/badges), text #231f20, background white #ffffff, light grey panels.
- **Header** **(low)**: thin utility strip with delivery / Click & Collect promo copy; main white bar with logo left, a wide search box with red magnifier button in the centre, and **Store Finder**, **Sign In / Register**, **Basket (count)** on the right; category mega-menu bar beneath with **Toys · Baby · Outdoor · Gaming & Tech · Sale · Brands** (plus a seasonal Christmas entry). Smyths describes its ranges as "toys, baby, outdoor and gaming".
- **Product tile** **(low)**: portrait box art, title, bold price, star rating, red button.
- **Product page** **(low)**: two-column above the fold (gallery left, buy box right), red primary button, grey fulfilment cards for Home Delivery and Click & Collect, PEGI badge, "Ref:" product code, tabbed description / key features / specification below.
- Typography **(low)**: plain sans-serif body, bold titles and prices.

---

## Quirks

1. **Bot wall.** A fresh automated browser hits Imperva's "Additional security check is required — Click to verify" before any Smyths page renders; non-JS clients get "Pardon Our Interruption". Any agent benchmark on the live site will be gated by this.
2. **Code in a box.** The "physical" GTA VI is a download code; ships/collects from 12 Nov for pre-load; playable 19 Nov.
3. **No charge at order for cards** — pre-auth 2–7 days before availability, charge on dispatch/collection, 24-hour window to fix a failed pre-auth. **PayPal is charged immediately.**
4. **Pre-order Price Promise** — automatic lower price on the day, not stackable with a voucher.
5. **Click & Collect** is free but strict: 2-day hold, £2 non-collection fee, photo ID of the purchaser + Ready for Collection email.
6. **£20 free-delivery threshold** — one game qualifies; express next-day is £1.99.
7. **No amendments/cancellations** after placing, except pre-orders managed from an account (guests are nudged to create one).
8. **UK/IE region switching** — the site serves `/uk/en-gb` and `/ie/en-ie`; Trustpilot reviewers report the region flipping at checkout and vouchers failing.
9. **PSN region lock note** on the PS5 listing (UK-registered PlayStation account only).
10. **Standard edition only**; platforms are separate listings, no variant selector.

---

## Gaps (what could not be verified and what was tried)

- Live page text: browser (Imperva check, not solved), WebFetch, curl, Wayback and Google Translate proxy all blocked → Smyths page content is from search snippets only.
- Today's exact price (£67.99 assumed from Which? "£68" and a HotUKDeals snippet; launch price £69.99 confirmed).
- Exact H1 titles, "Release Date" field wording, button labels, add-to-basket modal, basket and checkout field labels, sign-in/guest screen wording, confirmation headline, order-number format — all low-confidence reconstructions.
- Klarna on the UK site unconfirmed; gift-card entry point unconfirmed; PEGI-18 age prompt unconfirmed.
- Web search budget ran out mid-task; DuckDuckGo, Bing, Mojeek, Reddit, Brandfetch and Milled were blocked or returned nothing usable, so Reddit threads and YouTube walkthroughs were not consulted.

---

## Sources

- https://www.smythstoys.com/uk/en-gb/search/?text=grand+theft+auto+vi (browser — Imperva check page)
- https://www.smythstoys.com/uk/en-gb/gaming-and-tech/pre-order-games/playstation-5-pre-order-games/grand-theft-auto-vi-ps5/p/263307 (snippets)
- https://www.smythstoys.com/uk/en-gb/gaming-and-tech/pre-order-games/xbox-series-x-pre-order-games/grand-theft-auto-vi-xbox-series-x/p/263308 (snippets)
- https://www.smythstoys.com/ie/en-ie/gaming-and-tech/pre-order-games/playstation-5-pre-order-games/grand-theft-auto-vi-ps5/p/263722 (snippets)
- https://www.smythstoys.com/ie/en-ie/gaming-and-tech/pre-order-games/xbox-series-x-pre-order-games/grand-theft-auto-vi-xbox-series-x/p/263638 (snippets)
- https://www.smythstoys.com/uk/en-gb/pre-order (snippets)
- https://www.smythstoys.com/uk/en-gb/help-click-and-collect (snippets)
- https://www.smythstoys.com/uk/en-gb/click-and-collect (snippets)
- https://www.smythstoys.com/uk/en-gb/Help-Shipping-and-Delivery (snippets)
- https://www.smythstoys.com/uk/en-gb/shipping-and-delivery (snippets)
- https://www.smythstoys.com/uk/en-gb/help (snippets)
- https://www.smythstoys.com/uk/en-gb/help-faq (snippets)
- https://www.smythstoys.com/uk/en-gb/stock-availability (snippets)
- https://www.smythstoys.com/uk/en-gb/contact-us (snippets)
- https://www.smythstoys.com/uk/en-gb/top-faqs (snippets)
- https://www.smythstoys.com/uk/en-gb/gift-card-info (snippets)
- https://www.smythstoys.com/uk/en-gb/about-us (snippet)
- https://milled.com/smyths-toys-hq/pre-order-grand-theft-auto-vi-now-mIcwDDyOiMwX0r2O (403; title only)
- https://www.which.co.uk/news/article/best-gta-6-pre-orders-af0wZ5l3fxX7
- https://www.thesixthaxis.com/2026/06/25/grand-theft-auto-6-pre-orders-are-live-70-80-e80-regional-pricing-confirmed/
- https://www.pushsquare.com/news/2026/06/uk-gta-6-buyers-pleasantly-surprised-by-no-ps5-pre-order-price-hike
- https://www.gameinformer.com/2026/06/24/grand-theft-auto-vi-price-and-ultimate-edition-revealed-physical-version-will-not
- https://www.hotukdeals.com/deals/grand-theft-auto-vi-ps5-pre-order-19112026-4921219
- https://www.hotukdeals.com/deals/grand-theft-auto-vi-xbox-series-x-pre-order-19112026-4921221
- https://techradar.com/gaming/ps5/gta-6-uk-pre-orders-are-live-and-we-finally-have-a-price-heres-where-you-can-order-it-and-what-it-costs (snippet; fetch truncated)
- https://stripe.com/en-hr/newsroom/news/smyths-toys-and-stripe
- https://uk.trustpilot.com/review/www.smythstoys.com
- https://en.wikipedia.org/wiki/Smyths
- https://commons.wikimedia.org/wiki/File:Smyths_Toys_logo.svg
- https://www.klarna.com/uk/shops/ (Smyths not listed)
- https://node2.medicloud.intersales.de/news/pay-with-klarna-on-smyths (snippet only; low trust)
- https://www.scotsman.com/arts-and-culture/grand-theft-auto-vi-prices-uk-8758722 (403)
- https://windowscentral.com/gta6-faq-how-to-preorder (truncated)
- https://www.tomsguide.com/news/live/gta-6-pre-orders-news-and-live-updates (truncated)
