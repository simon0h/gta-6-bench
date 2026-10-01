# Rockstar Store (US) — GTA VI pre-order walkthrough

Researched 2026-09-29 with live browsing of https://store.rockstargames.com plus Rockstar Support, Xsolla help pages and press coverage. Pre-orders are live. The store sells the **Standard Edition code-in-box for $79.99 (PS5 or Xbox Series X|S)** directly; the **digital Standard and Ultimate editions only link out** to the PlayStation Store / Microsoft Store. Checkout is run by **Xsolla** inside a lightbox iframe, and **guest checkout is allowed** (no Rockstar Games account needed).

What I could not do: go past step 1 of the Xsolla checkout (that needs a real address), so the shipping-method, payment and confirmation screens are marked *inferred* below.

**Follow-up 2026-09-30:** passed the age gate with a placeholder date, pressed CONTINUE on the empty Xsolla address form to see its validation, and re-checked the cart. Main correction: the GTA VI **Pre-Order Now $79.99** button is *direct-to-checkout* — there is no "Added to Cart" popover and the game never appears in the Rockstar cart. Details in steps 4–8.

---

## Step-by-step flow

### 1. Homepage — `https://store.rockstargames.com/`

- Page title: `Rockstar Store | Official Store for GTA, Red Dead Redemption | Rockstar Store`
- A OneTrust cookie banner sits at the bottom: link "Cookie Policy", buttons **ACCEPT ALL COOKIES**, **REJECT ALL**, **COOKIE SETTINGS**, and a Close X. (I clicked REJECT ALL.)
- Hero carousel (2 slides, "Previous"/"Next" arrows, dot buttons "Go to slide 1/2"):
  - Slide 1: badge **COMING SOON** — heading **Grand Theft Auto VI: The Goodtime State – Vice City Collection** — "A premium Collector's Box featuring all the essentials for a good time, inspired by Leonida's hit TV show, Macca the Gator." — button **Pre-Order Now** → `/merchandise/gtavi-goodtime-state-vice-city-collection` ($399.99, "Grand Theft Auto VI game sold separately", Ages 18+).
  - Slide 2: badge **COMING SOON** — heading **Grand Theft Auto VI** — "Reserve today to unlock exclusive benefits and be ready to play at launch." — button **Pre-Order Now** → `/game/buy-gta-vi`.
- Product carousels below: "New Arrivals" (See all), "Games", "Best Sellers", promo tiles ("Essentials Collection Now Available / SHOP NOW", "Buy Gold Bars for PC / SHOP NOW"), "Grand Theft Auto Collection", "Red Dead Redemption Essentials Collection".
- The GTA VI tile in "Games": box art, **Grand Theft Auto VI**, **COMING SOON**, **$79.99**, platform chips **PlayStation 5** / **Xbox Series X**.

### 2. Finding the product

Three ways in:
1. Header nav **Games ▾ → Grand Theft Auto VI** (`/game/buy-gta-vi`).
2. Search box (placeholder **Search**) → `/search?q=grand%20theft%20auto%20vi`.
3. Hero slide / Games carousel tile.

Search results page (`/search?q=…`, page title "My Search"):
- h1 **Search for:** then **120 results**, a **Sort by... Relevance** dropdown and a **Filters** button.
- Facet rail: **CATEGORIES** (Bundle, Console Game, Full Digital Game, Gear), **GAME COLLECTIONS** (Bully, Grand Theft Auto, L.A. Noire, More), **PLATFORM** (apple store, google play, Nintendo Switch, More), **GEAR** (Game, Accessories, Apparel, Collectibles).
- Results grouped under **Games** then **Gear**. Each tile: 208×257 box art, title, optional **COMING SOON** badge, price. GTA VI is the first tile: "Grand Theft Auto VI / COMING SOON / $79.99".

### 3. Product page — `https://store.rockstargames.com/game/buy-gta-vi`

Page title: `Grand Theft Auto VI | Rockstar Store`. No breadcrumb.

**Hero** (full-bleed key art, dark purple/pink gradient, box art on the right):
- Game logo image, badge **COMING SOON**, h1 **Grand Theft Auto VI**
- Label **Select Platform** with two icon toggle buttons: **PS5** and **Xbox Series X|S** (8px radius; nothing selected on load; selected = white fill with dark text).
- Big peach pill button **Pre-Order Now** — this only scrolls to the "Compare Editions" section.
- Clock-icon line: **Order before November 20 to get the Vintage Vice City Pack at no additional cost\***
- ESRB badge **Rating Pending Likely Mature 17+** (links to esrb.org).

**Sticky sub-nav**: Game Details · Trailers · Screenshots · Compare Editions · FAQ · (More / "Jump to" menu on narrow widths) · **Pre-Order Now** (also just scrolls).

**Game Details**: description "Jason and Lucia have always known the deck is stacked against them. But when an easy score goes wrong, they find themselves on the darkest side of the sunniest place in America, in the middle of a criminal conspiracy stretching across the state of Leonida — forced to rely on each other more than ever if they want to make it out alive." Then **Release Date** November 19, 2026 · **Developer** Rockstar Games · **Publisher** Rockstar Games.

**Trailers**: two video thumbnails (Trailer 2, Trailer 1) with play buttons. **Screenshots**: 8 thumbnails + **View All**.

**Compare Editions** (two cards in a carousel, each with the same content list):
- Card 1: small "Grand Theft Auto VI" kicker, h3 **Ultimate Edition**, bullet list (Digital Standard Edition, '95 Grotti Cheetah, Hawk and Little Morgan Revolvers, Personalized Weapon Variants, Vice City Styles, Jason's Safehouse Vehicles, Ganado Retro Build, Rideout Customs Mod Shop, Sara's Unisex Salon, Shitzu Squalo, Stock 305 Clothing Store, '67 Vapid Dominator Buggy, Electric Fang Tattoo Parlor, One-Eyed Willie's Mod Shop, Goodtime Gear, PTT Youngin$ Compound, Classic Car Collection, Vintage Vice City Pack Pre-Order Bonuses, '55 Vapid Stanier Sedan and Garage, Outfits and Hairstyles, Exclusive Weapon Pattern, Digital Store Pre-Order Bonus, Free Month of GTA+), info line **Pre-load begins November 12, 2026**, button **Pre-Order Now**. No price shown.
- Card 2: h3 **Standard Edition**, same list, same info line, button **Pre-Order Now**. No price shown.
- These two buttons call `window.open()` to the platform store in a new tab, based on the selected platform:
  - Ultimate → `https://store.playstation.com/product/EP1004-PPSA01547_00-GTAVIULTIMATE001` or `https://www.xbox.com/games/store/grand-theft-auto-vi-ultimate-edition/9NNZSNHLR63L/0017/9W0CVZDS9RZF`
  - Standard → `https://store.playstation.com/product/EP1004-PPSA01547_00-GTAVISTANDARD001` or `https://www.xbox.com/games/store/grand-theft-auto-vi/9P3H4968GRSM/0017/9PWFKCT9JGKL`
  - After choosing Xbox, every Pre-Order Now button shows a small Xbox glyph.

**Physical (Code-in-Box) Version Available** (the only thing the Rockstar Store sells itself):
- Box-art image (Sony or Xbox case depending on platform), text **Physical versions will only contain a download code inside the box to support pre-load on November 12. A disc will not be included in the box.** and **\*While supplies last, further details below.** ("below" links to #faq)
- Button **Pre-Order Now** with **$79.99** stacked underneath — this is the real add-to-cart.
- Store data behind it: PS5 SKU `357725-US`, Xbox SKU `357733-US`, Xsolla project `100851`, price 79.99 USD, max quantity 4, pre-order date 2026-06-01, pre-load 2026-11-12, release 2026-11-19.

**Upgrade to the Ultimate Edition**: "Purchased the game? Upgrade to the Ultimate Edition on PlayStation Store at any time." (says "Microsoft Store" when Xbox is selected) — button **Upgrade Now** with an external-link icon.

**FAQ** accordion (9 items) — key answers:
- *What is a code-in-box?* — download code only; internet + platform account required; PlayStation codes are region-locked (US/CA shipments only work on US/CA PlayStation accounts).
- *When does the code-in-box ship?* — "Shipping will be available starting November 12, 2026. After game launch, physical orders will ship in an estimated 1–7 days, depending on shipping selection."
- *How do I cancel a pre-order on the Rockstar Store?* — contact fulfillment partner Xsolla via https://help.xsolla.com/pre-orders/cancel-pre-order; you need your order number and the email you ordered with.
- *What regions does the Rockstar Store ship to?* — 20 countries (US, Canada, UK + 17 European); "Costs of shipping for your order will be presented at checkout."
- *Where can I find the receipt for my order?* — "Receipts for all purchases are sent to the email address associated with your Rockstar Games account or specified during Guest checkout."

Then **Supported Languages**, **Trademarks and Copyrights**, **Legal Disclosure**.

### 4. Pre-Order Now $79.99 — age gate, then straight to the checkout gate (verified 2026-09-30)

Clicking **Pre-Order Now $79.99** (PS5 selected) opens a centered 680px lightbox (background #161616, 4px radius, close X top-right):

> **Verify your age**
> Enter your date of birth
> [Month ▾] [Day ▾] [Year ▾]
> [OK] (disabled until all three are chosen)

The three buttons open dropdown menus (January–December, 1–31, years counting down from the current year). Once all three are set, **OK** enables. There are no validation messages — the button simply stays disabled until the date is complete.

Pressing OK does **not** add the game to the cart and there is **no "Added to Cart" popover**. Instead the age gate closes and the **Sign In or Continue as Guest** modal (see step 6) opens right on the product page. Choosing **CONTINUE AS GUEST** shows a spinner ("Entering checkout window") and then the Xsolla lightbox at the Shipping Address step, still on `/game/buy-gta-vi`. Throughout, the header cart icon keeps its plain "cart" name with no badge, and `/cart` afterwards still reads "Your cart is empty" — the game only exists in Xsolla's own cart (`cart_id=current`, project 100851).

(Merchandise product pages have three buttons: **Buy Now**, **Add to Cart**, **Add to Wishlist**; **Add to Cart** is what produces the small dark #222222 "Added to Cart" popover under the cart icon with a **Go To Cart** button. The GTA VI page has none of these — only the Pre-Order Now buttons above, and its real one behaves like a Buy Now.)

### 5. Cart — `https://store.rockstargames.com/cart`

Page title "My Cart", h1 **My Cart**. Two columns: line items left (~523px), **Order Summary** right (~294px).

Line item (list row with 1px rgba(255,255,255,0.2) bottom border): image (160px) · title (link) · price · **Qty: 1** (dropdown menu button, max 4) · stock label (e.g. "Low stock") · **Remove** (underlined text). Under the list: **Subtotal (1 item): $3.99**.

Order Summary:
```
Order Summary
Total for Items          $3.99
Subtotal (1 item)        $3.99
Add $71.00 to this order to qualify for FREE standard shipping.
[ PROCEED TO CHECKOUT ]          (amber #FFAB00, black uppercase text, 6px radius)
Taxes and shipping will be calculated in the checkout window.
```
Empty cart shows "Your cart is empty", "Total for Items $0.00", "Subtotal (0 items) 0.00", "Get FREE shipping with orders over $74.99", and the button is disabled. No promo-code field, no PayPal/Apple Pay buttons, no upsells.

The line-item details above come from a merchandise item. The GTA VI code-in-box never shows up on this page — its button bypasses the Rockstar cart entirely (step 4), so there is no cart line item, title or platform label to report for the game.

### 6. Checkout gate — "Sign In or Continue as Guest"

**PROCEED TO CHECKOUT** (merchandise) — or, for GTA VI, simply passing the age gate on the product page — opens a 768px modal (background #161616, 8px radius):

> **Sign In or Continue as Guest**
> Choose to sign in or checkout as guest
>
> **Sign In** — Sign in to keep track of your previous purchases and payment information. — [ SIGN IN ] (amber)
> **Continue as Guest** — A valid email and shipping address are required for your order. — [ CONTINUE AS GUEST ] (white outline)

- **SIGN IN** → `window.open` to `https://signin.rockstargames.com/connect/authorize/t2gp-rs?returnUrl=…&lang=en` (Rockstar Games Account / Social Club OAuth). The header's **Sign In** button does the same.
- **CONTINUE AS GUEST** → the modal closes and a 680×650 lightbox iframe opens over the current page (the cart for merchandise, the product page for GTA VI), loading `https://store.xsolla.com/pages/cart?cart_id=current&project_id=100851&auth=<guest token>&access_data=<base64 JSON>` which redirects to `https://purchase.xsolla.com/pages/cart?…`. The `access_data` blob sets `currency: USD`, `language: en`, `ui.theme: "rockstar-dark"`, `ui.size: "medium"`, `user.country: US`, saved payment accounts disabled, and custom parameters (`t2_storefront: "Rockstar Games Webstore"`, `site_id: RSG`, `warehouse_country: US`, the SKU, item title, `page: /cart`).

### 7. Xsolla checkout, step 1 — Shipping Address (observed)

Black background, Arial, white text at 60–80% opacity. Page heading **Shipping Address** (24px), uppercase sub-heading **Recipient Shipping Address** (merchandise flow), blue info banner — for GTA VI it reads **You cannot change your shipping address once you submit your pre-order.** (the merchandise flow says "…submit your order.").

Fields in order (inputs #1A1A1A, 32px tall, 4px radius, labels above; required unless noted):
1. **Country** — selector row pre-filled **USA**
2. **First Name**
3. **Last Name**
4. **City**
5. **Region/State**
6. **Postal Code**
7. **Street Address**
8. **Apartment** — optional
9. **Phone** (US flag + "+" country-code prefix) — required, even for guests
10. **Email**

Button **CONTINUE** (gold #FCAF17, dark text, uppercase, 2px radius, bottom right).

Below the form, Xsolla's own consent bar: two checkboxes — "I give my consent for Xsolla to use my personal data to offer and/or market customized services to me." and "I consent to enable all cookies listed within the Cookie Policy." — with **Agree to all** and a close X. This bar sits on top of the CONTINUE button until you dismiss it. Footer: "Xsolla is an authorized video game software distributor providing clients with advanced technical tools for their games." · © 2006-2026 Xsolla · Secure Connection · Privacy Policy | EULA | Refund Policy | Legal Agreements.

**Validation (observed 2026-09-30 by pressing CONTINUE on the empty form):** there is no page-level error. Every required input gets a red bar on its left edge; the first invalid field (First Name) is focused with a gold border and a small red tooltip **Required** appears under it. Clicking into another empty required field (e.g. Phone) moves the **Required** tooltip to that field. Apartment shows a green check mark. "Required" is the only message text seen — format errors (bad email/phone/ZIP) were not tested because no data was typed.

No order summary, price, shipping cost or charge-timing text is shown on this step. The iframe is cross-origin, so its contents only appear in screenshots (the parent page exposes just an "Entering checkout window" placeholder).

### 8. Xsolla checkout, later steps (not reached — inferred from Xsolla's help and developer pages, low/medium confidence)

- **Shipping method**: exact labels, carriers, prices and ETAs are still unverified. Rockstar only says "Costs of shipping for your order will be presented at checkout" and "Shipping duration may vary depending on the shipping option you choose when checking out"; the cart page promises free standard shipping over $74.99 (so free for the $79.99 game).
- **Review step**: probably none. Xsolla's Pay Station docs describe the payment screen as two columns — order information (item name, VAT/tax line, **Total**) beside the payment-method list / card form — so the summary sits alongside the payment form rather than on a separate review page. The address is already locked after step 7.
- **Payment methods** (Xsolla's generic lists; the project-specific set was not seen): cards — Visa, Mastercard, Maestro, American Express, Discover, Cash App Card (credit/debit/prepaid/gift, per help.xsolla.com "Supported card types"); PayPal (Rockstar Support's "Rockstar Store Errors 2001/2002" article references PayPal via Xsolla on this store); Google Pay (Pay Station shows a Google Pay quick-pay button at the top of the UI by default on non-Safari browsers unless the merchant disables it); Apple Pay (supported, shown in the list or as the first screen only if configured). The card section is headed **Payment via card** (Xsolla docs). Field labels were not observed — best guess Card number, MM/YY, CVV/CVC and, for US cards, a ZIP; no separate billing address is expected (Pay Station reuses the shipping details; low confidence).
- **Pay button label**: not verified. Pay Station uses a single primary button under the Total; best knowledge is **Pay** (possibly with the amount) — low confidence.
- **Charge timing**: nothing in the store UI mentions it — not the product page, age gate, guest modal, cart or the Xsolla address step (the only related on-screen line is the banner "You cannot change your shipping address once you submit your pre-order."). The policy lives only on help.xsolla.com ("When will I be charged for my pre-order?"): *"Your payment account will not be charged until the physical pre-order is ready to be shipped."* · *"You will receive a notification email about two weeks prior to your payment method being charged for a pre-order."* · *"Pre-orders will be canceled if your payment method cannot successfully be charged at the time of the product's release."* Whether the unseen payment step repeats this is unknown. (Xsolla's general refund policy says pre-order payment "is taken at the time of purchase" — the physical-pre-order help page is the more specific statement.)
- **Confirmation**: Pay Station's "payment status page" — a heading, a status message and a return button whose default copy is **Back to the Game** (merchants can rename it, e.g. "Back to Store"). The exact heading was not observed; best guess is a "Thank you for your purchase" / "Payment successful" style line (low confidence).
- **Order number**: a numeric Xsolla transaction ID (invoice_id) with no prefix. Game-support pages describe Xsolla receipts as carrying a 9–10-digit transaction number; Xsolla's docs note that from June 1, 2026 transaction IDs are int64, so newer ones may be longer. This is the "Order number" Xsolla's cancel-pre-order and physical-refund forms ask for ("from the Pre-Order Confirmation email"). Medium confidence.
- **Emails**: Rockstar — "Receipts for all purchases are sent to the email address associated with your Rockstar Games account or specified during Guest checkout." Xsolla — "If you enter an email address while making a payment, all receipts will be emailed to you." (from mailer@xsolla.com); the confirmation email is the "electronic purchase receipt" and "will contain information about your Order". Then a notice about two weeks before the charge, and a shipping-confirmation email with a tracking link when it ships (one tracking number per box). Xsolla is the merchant of record for physical items (Rockstar refund policy page).

---

## Look and feel

- **Theme**: dark. `html` background #161616, header bar pure black #000000, body text rgba(255,255,255,0.8), headings white.
- **Header** (fixed, ~90px at 1024px wide): hamburger "Open menu" · white R\* logo + "Store" · menubar **GAMES / GAME ADD-ONS / GTA+ / MERCHANDISE / FEATURED** (13.5px bold uppercase, dropdown groups; collapses into the hamburger drawer at ≤1024px) · pill search field with magnifier and placeholder "Search" · user icon "Sign In" · cart icon with count badge.
- **Fonts**: "Helvetica Now Text" for body/UI, "Helvetica Now Display" for headings, Arial fallback. Product h1 22.5px/700. Prices 16px/700 white.
- **Colors** (CSS variables on `:root`): `--color-primary` #FFAB00 (amber, used for PROCEED TO CHECKOUT and SIGN IN), `--color-secondary` #CC0000, `--color-promo-attribute` #FDB935, `--color-error` #AA3333, `--color-success` #38871E, `--color-info` #225599, neutrals #000/#161616/#404040/#FFF. The GTA VI page overrides the game accent to peach **#FFD4A8** for its pill CTAs (black text, 18px bold, 54px tall, border-radius 1000px).
- **Badges**: "COMING SOON" is a small light pill with 13.5px bold uppercase black text.
- **Product tile**: portrait box art (aspect ~123%), title under it, optional COMING SOON badge, price, platform chips (home carousels only). Square corners, transparent tile background.
- **Product page layout**: full-width hero with key art background, text column left (badge, title, platform toggles, CTA, bonus line, ESRB), box art right; sticky section sub-nav; stacked sections (Game Details, Trailers carousel, Screenshots carousel, Compare Editions carousel of two edition cards, Code-in-Box banner with box image left and text/button right, Upgrade banner, FAQ accordion, languages, legal).
- **Cart/checkout modals**: #161616 panels, 6–8px radius, amber primary button + white-outline secondary button, uppercase 16px bold labels.
- **Xsolla iframe**: black, Arial, gold #FCAF17 buttons with 2px radius, grey #808080 country selector, blue rgba(4,67,125,0.7) info banner.
- **Footer**: Rockstar eagle logo, link row (Rockstar Support, Privacy Policy, Cookie Policy, Terms of Service, Do Not Sell or Share My Personal Information, Refunds, Cookie Settings), legal line, "English" language button, "Back to top".

## Quirks

- Only the Standard Edition code-in-box is sold here; every digital edition button is a link-out to PlayStation Store / Microsoft Store in a new tab. Ultimate Edition is not available as code-in-box on the Rockstar Store.
- Platform must be chosen first (PS5 / Xbox Series X|S); it changes the link-out targets, box art, and which SKU is added.
- Two of the three "Pre-Order Now" buttons in the top half of the page just scroll down; only "Pre-Order Now $79.99" starts a purchase — and it goes straight to checkout (age gate → sign-in/guest modal → Xsolla lightbox on the product page) without ever touching the Rockstar cart. No "Added to Cart" popover, no cart badge, no cart line item for the game.
- Age gate (date of birth) before the checkout gate; OK stays disabled until Month/Day/Year are all set, with no error messages.
- No disc; box contains a download code; ships from November 12, 2026; PlayStation codes are region-locked.
- Checkout is an Xsolla iframe lightbox (over the product page for GTA VI, over the cart for merchandise) rather than a Rockstar-hosted page; the shipping address is locked after submit ("…once you submit your pre-order."); guest saved-payment is disabled.
- Xsolla address form: every field except Apartment is required, including Phone; empty required fields get a red left bar and the focused one a red "Required" tooltip.
- No charge-timing text anywhere in the observed UI; the "charged when ready to ship" rule is only on help.xsolla.com.
- Guest checkout allowed; sign-in is a Rockstar Games Account OAuth popup (never required).
- Max 4 per SKU; free standard shipping over $74.99; ships to 20 countries only.
- No promo codes, express pay buttons, pickup, or membership program in the store flow. GTA+ ($7.99/Month) is a separate subscription product.
- Two cookie consents (OneTrust on the store, Xsolla's inside checkout).
- Pre-order cancellation only through Xsolla's form (order number + email).

## Sources

- https://store.rockstargames.com/
- https://store.rockstargames.com/game/buy-gta-vi
- https://store.rockstargames.com/search?q=grand%20theft%20auto%20vi
- https://store.rockstargames.com/cart
- https://store.rockstargames.com/merchandise/buy-loneliest-robot-greeting-card (used to walk add-to-cart → cart → checkout without the age gate)
- https://store.rockstargames.com/merchandise/gtavi-goodtime-state-vice-city-collection
- https://store.rockstargames.com/game/gta-plus
- https://store.rockstargames.com/refund-and-return-policy
- https://store.xsolla.com/pages/cart?cart_id=current&project_id=100851 → https://purchase.xsolla.com/pages/cart (guest checkout iframe)
- https://signin.rockstargames.com/connect/authorize/t2gp-rs?returnUrl=%2Fconnect%2Fgateway%3Forigin%3Dhttps%3A%2F%2Fstore.rockstargames.com&lang=en
- https://support.rockstargames.com/articles/40DHWEDBnq5jUuWJqKcH02/grand-theft-auto-vi-pre-order-purchase-support-faq
- https://support.rockstargames.com/store
- https://help.xsolla.com/pre-orders
- https://help.xsolla.com/en/pre-orders/cancel-pre-order
- https://help.xsolla.com/en/pre-orders/when-i-will-be-charged-for-my-pre-order
- https://help.xsolla.com/en/pre-orders/change-pre-order-information
- https://xsolla.com/products/paystation/accept-payments
- https://xsolla.com/refund-policy-ps?language=en&project_id=100851&policy_version_id=5
- https://www.rockstargames.com/VI
- https://www.gamedeveloper.com/press-release/rockstar-games-announces-pre-orders-for-grand-theft-auto-vi
- https://www.pushsquare.com/guides/where-to-pre-order-gta-6-on-ps5
- https://www.t3.com/tech/gaming/its-official-exact-time-gta-vi-pre-orders-go-live-and-two-price-options
- https://www.pushsquare.com/news/2026/06/gta-6-physical-edition-doesnt-come-with-discs-its-a-code-in-the-box
- https://www.videogameschronicle.com/news/rockstar-confirms-there-will-be-no-disc-version-of-gta6-at-launch/
- https://www.digitalcitizen.life/gta-6-preloads-begin-on-november-12-for-digital-and-physical-code-copies/
- https://www.igeeksblog.com/how-to-pre-order-gta-6-on-ps5-and-xbox/
- https://insider-gaming.com/how-to-pre-order-gta-6-date/

Added 2026-09-30:
- https://support.rockstargames.com/articles/1v0gPkZJ8IiKarabrFPHZU/rockstar-store-order-receipts
- https://support.rockstargames.com/articles/46YkMi4rHxYXMeIHtZiKaE/grand-theft-auto-vi-pre-order-details
- https://support.rockstargames.com/articles/2ptsKYrubNAxsZUL8OXyd9/rockstar-store-errors-2001-2002 (search snippet only; fetch timed out)
- https://help.xsolla.com/ (help-center index)
- https://help.xsolla.com/en/payments/supported-card-types
- https://help.xsolla.com/en/payments/card-verification
- https://help.xsolla.com/en/receipts/where-can-i-find-my-receipts
- https://help.xsolla.com/en/refunds/refund-physical-product
- https://help.xsolla.com/physical-products
- https://xsolla.com/refund-policy
- https://developers.xsolla.com/payment-ui-and-flow/payment-ui/
- https://developers.xsolla.com/payment-ui-and-flow/payment-ui/ui-theme-customization/
- https://developers.xsolla.com/payment-ui-and-flow/payment-ui/how-to-configure-redirects/
- https://developers.xsolla.com/payment-ui-and-flow/payment-ui/how-to-customize-emails-to-users/
- https://drimage.oqupie.com/portals/2252/articles/58350 (search snippet only; page 404s — Xsolla receipts carry a 9–10-digit transaction number)
