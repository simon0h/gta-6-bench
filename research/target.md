# Target (US) — pre-ordering Grand Theft Auto VI

Researched 2026-09-29. Pre-order is live on target.com for PS5 and Xbox Series X|S at $79.99, Standard edition only, sold as **Code in Box** (download code, no disc). Target requires a signed-in account to check out; there is no guest checkout.

How this was gathered: the built-in browser loaded the search results page and most of the product page (header, breadcrumb, variant buttons, fulfillment tabs, highlights, description). The price module and Preorder button were still skeleton placeholders when Target served a "Quick verification — Press & hold to confirm you're a human (and not a bot)" interstitial, so browsing stopped there. Prices, specs and policies were confirmed from server-rendered fetches of the two product pages and Target's own help articles. Anything marked **(low confidence)** is from general knowledge of target.com, not observed today.

**Follow-up 2026-09-30.** The browser hit the same press-and-hold check on the PDP (and the search page came back degraded: empty query, "We couldn't find a match for your search."), and Target's Redsky JSON API started answering curl with a PerimeterX 435 captcha page. The remaining gaps were therefore closed by reading Target's current production JS bundles for the product-page, cart and checkout apps (the exact label strings and the logic that chooses between them), Target help, and one publicly posted Target order confirmation. Anything marked **(bundle)** below is an exact string from that code, not a screenshot.

---

## Step 1 — Search

**URL:** `https://www.target.com/s?searchTerm=grand+theft+auto+vi`
**Page title:** `grand theft auto vi  : Target`

What the shopper sees, top to bottom:

- **h1:** `grand theft auto vi` (the query, lowercase)
- Toolbar: `Filter` (aria "Filters Menu. 0 applied"), `Sort`, then chips `Pickup`, `Same-day Delivery`, `Shipping`, `Shop in store`, `Deals`, `Compatibility` (expands to "What should it be compatible with?" → Xbox Series X, Nintendo Switch, Playstation 5, Playstation 4, Xbox One)
- Count line: `1,000+ results for “grand theft auto vi”`
- A sponsored tile first (Gran Turismo 7), then the two GTA VI tiles:

  | Tile text (in order) |
  |---|
  | `$79.99` |
  | `Rockstar Games™ Grand Theft Auto VI - PlayStation 5 (Code in Box, Delivers 11/12/26, Playable 11/19/26)` |
  | `Release date Thu, Nov 12` |
  | `Ships free - exclusions apply` |
  | red pill button **`Preorder`** (aria "Preorder Grand Theft Auto VI - PlayStation 5 (…)") |

  The Xbox tile is identical with `Xbox Series X|S` in the title. A third GTA tile follows: `$84.99` / `New at ▾` / `PlayStation™ 5 DualSense Controller - Grand Theft Auto VI LE` / `Release date Thu, Nov 19` / `Preorder`.
- Each tile has a heart icon labeled `sign in to favorite … to keep tabs on it`. Tiles with reviews show `4.6` / `4.57 out of 5 stars` / `(259)` / `Loved for: engaging gameplay`. Non-pre-order tiles show `Shipping arrives Fri, Oct 2` and a `Choose Options` or `Add to cart` button. Sale tiles show `$34.99 reg $39.99` + `Sale`; some show `When purchased online`.
- Pagination: `page 1 of 50`, `Next Page`.

Links: PS5 → `/p/grand-theft-auto-vi-playstation-5/-/A-1011529119`; Xbox → `/p/grand-theft-auto-vi-xbox-series-x-s/-/A-1011545811`.

The curated collection page `https://www.target.com/s/gta+6` (h1 `gta 6`) lists the same two game SKUs plus the controller, GTA V and the Trilogy. No Ultimate or Collector's edition exists on Target.

## Step 2 — Product page (PS5)

**URL:** `https://www.target.com/p/grand-theft-auto-vi-playstation-5/-/A-1011529119`
**Pattern:** `/p/<slug>/-/A-<TCIN>`
**Page title:** `Grand Theft Auto VI - PlayStation 5 (Code in Box, Delivers 11/12/26, Playable 11/19/26) : Target`

Layout, top to bottom / left to right:

1. **Breadcrumb:** `Target` › `Video Games` › `PlayStation 5` › `PlayStation 5 Games`
2. **Left column — stacked image gallery:** 13 images, each with a `view full screen` button; a heart `sign in to favorite …` on the first; `Show more images` button. A `Skip images` link jumps to `#info-and-fulfillment`.
3. **Right column — buy box (`#info-and-fulfillment`):**
   - `Shop all Rockstar Games` (brand link)
   - **h1:** `Grand Theft Auto VI - PlayStation 5 (Code in Box, Delivers 11/12/26, Playable 11/19/26)`
   - `0 out of 5 stars` / `be the first!` / `12 Questions`
   - Price module: `$79.99` (single bold price, no strikethrough, no member price). There is **no Target Circle Card 5% line** under the price: the price module renders only rows supplied by Target's price API, which returns a plain regular price for this item, and none of the product-page app's 236 JS chunks contain a "Save 5%" / "with Target Circle Card" price string **(bundle)**. The only Circle Card wording in the buy box is the Shipping tab's ships-free line (cardholders see `Ships free with your` + the Target Circle™ Card logo).
   - **Platform** selector, pill buttons: `PlayStation 5` (selected) · `Xbox Series X | S` (links to TCIN 1011545811)
   - **Edition** selector, pill buttons: `Standard` (selected, only option)
   - **Fulfillment selector**, three tabs with illustrations: `Pickup` · `Delivery` · `Shipping`. Header context feeding these: `Ship to 95065` and store `Scotts Valley`. Tab subtitles **(bundle, chunk 68009)**: Pickup shows the pickup promise (`Ready on release date` for a pre-order the store can fulfil, `Ready within 2 hours` for stock items) or `Not available`; Delivery shows `As soon as <window>` when Same Day Delivery works, `Find it nearby` / `Not available` when it doesn't, and `Check availability` until a delivery address exists; Shipping shows the single word `Preorder` for a pre-order (other items: `Arrives <date>` / `Not available`). For this item at Scotts Valley the fulfillment API (2026-09-29) says Order Pickup and Same Day Delivery are unavailable and only shipping is pre-order sellable, so the tabs read Pickup `Not available`, Delivery `Check availability` (guest) / `Not available`, Shipping `Preorder`, with Shipping selected. Release-date Order Pickup exists only at select stores (the API's backup store Marina: `Ready on release date`), matching Target help's "testing Order Pickup and Drive Up options for select preorder items and at select stores". The selected Shipping cell reads: `Preorder for 95065` + `Edit ZIP code` link; green `Release date: Thu, Nov 12`; gray `Delivered on or shortly after release date`; then `Ships free with [Target Circle 360 logo] or $35 orders` (guest) / `Ships free with $35 orders` / `Ships free with your [Target Circle™ Card logo]` (cardholders). Policy: shipping is free on $35+ (this item qualifies) or $5.99; Same Day Delivery is $9.99 per order for non-members; pickup orders are charged when marked Ready for Pickup.
   - Primary CTA: red pill **`Preorder`** **(bundle)** — button map `PREORDER_BUYABLE` → text `Preorder`, aria `Preorder <title>`, data-test `preorderButton` (the search tile shows the same label; Target help says "you will have the option to Preorder on the product detail page"; the server-rendered fallback is a disabled `Add to cart`). A **`Qty`** dropdown (bold value, default `1`, options `1`–`2` because the purchase limit is 2; a native select on phones) sits in the same row to the left of the button **(bundle)**. Still not seen rendered — the bot check blocks hydration for automated browsers.
   - `Eligible for registries and wish lists` with buttons `Sign in` and `Add to list`
   - **At a glance:** badge `Compatible with PS5`
4. **About this item** accordion (tabs: `Details`, `Specifications`, `Shipping & Returns`, `Q&A (12)`; a `Load all content at once` button):
   - **Highlights:**
     - `This product will only contain a download code inside the box to support pre-load starting on November 12. A disc will not be included in the box. Code can only be used by users holding an account for PlayStation® registered to the US or Canada.`
     - `Pre-order to receive the Vintage Vice City Pack.`
     - `Grand Theft Auto VI is a single-player experience.`
   - **Description:** `Vice City, USA.` followed by the Jason-and-Lucia synopsis paragraph.
   - **Specifications:** Format `Download Code in Box`; Street Date `November 12, 2026`; Multiplayer `Single Player Only`; ESRB `RP - rating pending`; TCIN `1011529119`; UPC `710425673795`.
   - **Shipping & Returns:** cannot ship to PO Boxes, Alaska, Hawaii or US territories; `This item must be returned within 30 days of the date it was purchased in store, delivered to the guest, delivered by a Shipt shopper, or picked up by the guest.`
5. Sponsored carousel, several recommendation carousels, `Guest ratings & reviews (0)`, `Disclaimer`.

**Xbox page** (`/p/grand-theft-auto-vi-xbox-series-x-s/-/A-1011545811`) mirrors this: title `Grand Theft Auto VI - Xbox Series X|S (Code in Box, Delivers 11/12/26, Playable 11/19/26)`, `$79.99`, TCIN `1011545811`, UPC `710425693809`, Model Compatibility `Xbox Series S, Xbox Series X`, same highlights and bonus, `We regret that this item cannot be shipped to PO Boxes.`

## Step 3 — Add to cart

Not observed (bot check), but fully specified in the PDP bundles **(bundle: `AddToCartDrawerContent`, `ModalHeadingAddedToCart`, `ModalContentAddToCartSuccess` / `…V1`)**. Clicking `Preorder` opens Target's **add-to-cart drawer** — the code consistently calls the container a drawer (`closeAddToCartDrawer`, `SUPPRESS_CART_SUCCESS_DRAWER`, nicollet `type: "drawer"`), i.e. a panel that slides in from the right on desktop and up from the bottom on phones (geometry medium confidence; contents high). Top to bottom:

- Heading: green checkmark icon + **`Added to cart`**
- The added item card (image + title)
- Gray line `Edit delivery method in cart` (add-on items get an orange `This item only ships with $35 orders.` instead)
- `Available deals` block with Target Circle offer checkboxes when offers apply (toast `Check the box to get the savings!`)
- A protection-plan offer card when the item is ESP-eligible (this game is: the $13.00 Allstate 2-year plan)
- Two stacked full-width pills: **`Continue shopping`** (the red primary; closes the drawer) and `View cart & check out` (outlined; links to `/cart`). Target help words the same choice as "view cart & check out" or "continue shopping".
- A recommendations carousel keyed to the added item

Error heading: `Item not added to cart`. The header badge changes from `cart 0 items` to `cart 1 item`.

## Step 4 — Cart

**URL:** `https://www.target.com/cart`
**Headline:** `Cart`

Verified from Target help: the cart holds up to 99 items and adding does not reserve stock; to remove an item "Select the X in the upper right hand corner of the item tile or reduce the qty to 0". Target help still calls the checkout button `I'm ready to check out` (app: `Proceed to checkout`), but the current cart bundle renders **`Sign in to check out`** for guests (A/B variants `Secure checkout` / `Continue to checkout`) and **`Check out`** once signed in (`Check out ($35 minimum)` for under-threshold Same Day Delivery carts, `Check out all` for mixed carts) **(bundle)**.

Layout **(bundle, 2026-09-30 cart chunks)** — two columns on desktop: items on the left, a sticky order-summary column on the right.

- **Line item:** image; title link; a fulfillment group heading per delivery method with a change-delivery-method radio group (`Shipping` / `Order Pickup` / `Drive Up` / Same Day Delivery); price; `Qty` dropdown (1–2 here, `Max quantity reached` when capped); `Save for later`; `Remove item`. For a pre-order, the line under the title reads **`Release date Thu, Nov 12`** (data-test `preorderStreetDate`; `Release date to be announced` when no date), immediately followed by the shipping note — `Ships free - exclusions apply` (link) for guests, `Ships free with $35 orders`, or `Ships free with` + Circle 360 / Circle Card logo for members.
- **Order summary column:** heading `Order summary`, rows `Subtotal`, `Discounts` (when any), `Estimated taxes`, `Regional fees` / `Handling fee` (when any), `Total`, a free-shipping row with a green checkmark and the note `Spend $35 or more using any payment method (excludes AK, HI and U.S. protectorates).`, the footnote `*Total savings may differ at checkout based on Target Circle™ Card savings and other discounts`; then the **`Promo code`** cell (promo-tag icon, h3 `Promo code`, trailing `Add` link — aria `Add for promo code`, becomes `Edit` once applied) which opens an `Add promo code` modal-drawer with one `Promo code` input (4–36 chars) and a full-width `Apply` button (toasts `Promo code applied.` / `Promo code removed.`); then the red **`Check out`** button, and directly beneath it, in one row, the express buttons: an outlined pill with the **PayPal** logo (aria `Pay with PayPal`; guests see `Check out with PayPal — Sign in to your Target account to use PayPal.`) and, where Apple Pay is available (Safari), a native **Apple Pay** button — half width each when both show. A sticky header line reads `$79.99 est. total · 1 item`.
- **Below the items:** Target Circle Card banner (`Learn more about Target Circle Card offer` → `Learn more`), the save-for-later section (empty state `Save your items for later`) and a recommendations carousel.

The empty cart page today rendered only the header, an email box (`Get top deals, latest trends, and more.` / `Sign up`) and the footer.

## Step 5 — Checkout: sign-in wall

**URL:** `https://www.target.com/checkout` (indexed entry `https://www.target.com/checkout/start`; unauthenticated shoppers are sent to `https://www.target.com/login`, page title `Login: Target`).

Target help, verbatim: `You'll need to sign in to a Target account in order to proceed with checkout.` and `A Target account is required to place an order in the Target app or on Target.com.` There is **no guest option**.

Sign-in screen options (from Target's manage-account help): email + password; `Sign in with passkey` (Face ID, fingerprint or device PIN); a phone-number verification code "without a password"; and `Create your Target account`. Creating an account asks for email address, first and last names, mobile phone (optional), then `Set up a passkey (recommended…)` or `Create a password` (8–20 characters, 2 of lowercase/uppercase/numbers/special, no `<>`), then `Create account`.

## Step 6 — Checkout: Delivery, Payment, Review

Target help describes the sequence as: sign in → "Follow the prompts to enter delivery and payment information" → "Review your order, then select **Place my order**" → "You'll receive an order confirmation email after you place your order." It adds: `Credit card or CVV re-entry will be required if a shipping address is updated during checkout`.

Checkout is a **single-page accordion** **(bundle, 2026-09-30 checkout build)**: each step is a container with active/pending states (e.g. data-test `STEP_SHIPPING_CONTAINER`) that pushes its own URL (`/checkout/shipping`, `/checkout/payment`, `/checkout/review`; `/checkout/schedule-delivery`, `/checkout/paypal`, `/checkout/digital-delivery`, `/checkout/gift-option` for other cases). A collapsed `Cart` items accordion sits above the steps; the header is reduced to the logo.

1. **Shipping address** (step heading; `Address` when Target's single-address drawer flag is on, `Home address` + `Used to calculate any applicable tax` for digital-only orders) — fields `First name`, `Last name`, `Address line 1` (typeahead), `+ Address line 2` → `Address line 2 (optional)`, `Zip code`, `City`, `State`, `Phone number`, `Set as default address` checkbox, `Delivery instructions (optional)`; validation `Verify your address` → `Use verified address` / `Use unverified address`; submit **`Save & continue`** (`Save` when editing a saved address). Service line `Standard Shipping`; the pre-order shows its release date instead of an arrival date. Pickup orders get an `Order Pickup` / `Drive Up` cell with a `Pickup person` section (`Add`); Same Day Delivery gets `Delivery window`, `Delivery date`, `Substitution preferences`, `Bag preferences`, `Delivery instructions (optional)`.
2. **Payment** — heading `Payment` with `Select payment type` (empty state `Add payment` → `Add`); card form `Card number`, `Exp MM/YY`, `Security code` (placeholder `Enter CVV`; `CVV is required`), `Name on card`, `Billing address` defaulting to the shipping address (`Add a new billing address`), `Save as default payment card`; alternatives `Target Circle Card`, PayPal, Apple Pay, Cash App Pay, Affirm, PayPal Pay in 4, gift card (`Pay with a Target GiftCard`: card number + access number, `Apply`), EBT / HRA-FSA, split payment (`Splitting this payment with a non-Target card will reduce 5% savings on this order and increase your order total.`), `Target Circle Rewards`, promo code drawer; submit **`Save and continue`** on desktop, `Save & continue` on small screens, `Save` when editing a saved card. A `Confirm CVV` prompt appears when a saved card needs its code again (also forced when the shipping address changes).
3. **Review** — collapsible `Order summary` (`$<total> total`) with `Subtotal`, `Discounts`, `Estimated taxes`, `Regional fees`, `Handling fee`, `Total`, `Order savings`; item groups by fulfillment method (`Arrives on or shortly after release date` for the pre-order) with address or store; payment (card brand + last 4); sticky red pill **`Place your order`** (data-test `placeOrderButton`; Affirm / PayPal / Cash App selections swap it for an outlined "Pay with …" button), followed by `By placing an order, you agree to the following:` with `Target terms and conditions` and `privacy policy` links. Target help's older label `Place my order` no longer matches the bundle.

Accepted payment methods (verified, Target help): Target Circle™ Card (Debit, Credit, Mastercard, Reloadable Account); Visa, Mastercard, American Express, Discover/Novus, Target PCard, foreign-bank credit cards; Apple Pay; Cash App Pay; PayPal (not for Target Plus items); Affirm, Sezzle, PayPal Pay in 4, Afterpay, Klarna, Zip; Target GiftCards / eGiftCards; third-party Visa/MC/Amex/Discover gift cards; HRA/FSA/HSA cards; SNAP EBT online (not with split tenders).

**Charge timing (verified, Target help):** `You won't be charged for your order until it ships or is ready for pickup.` `A new authorization hold will be placed 7 days before the street date.` `At the time of shipment, we will invoice you for the exact price of the item.` Authorization holds "are not actual charges, they allow your bank to reserve funds"; `Once an item has shipped, the authorization hold is removed and charges will post`. Pickup orders: `We'll charge your method of payment when your order is marked Ready for Pickup.`

## Step 7 — Confirmation

Verified: an order confirmation email is sent; orders mixing Target, Target Plus Partner and Same Day Delivery items split into separate order numbers and emails; pre-orders arrive "by the estimated delivery date provided in your Order Confirmation email, which is typically on or shortly after the release date"; orders are viewed under your name → `Purchase History`; cancellation is via `Request cancellation` on the item in order details, only while it "has yet to process for shipping".

Page **(bundle: cart app `pages/order-confirmation` chunk, page title `Order confirmation : Target`, route `/order-confirmation`)**: a 32px green checkmark, then h1 **`Thanks for your order!`**, then `We'll send confirmations and order updates to <email>` (pickup orders: `We'll let you know when it's ready. Don't forget to use the Target app to tell us you're on the way.`; Drive Up orders replace the h1 with `Next, make sure you have the Target app` + `Get the app`), then **`Order # <number>`**, item groups per fulfillment method (`<n> item(s)`, `Arriving <date>` / `Arriving by <date>` — for the pre-order on or shortly after the release date), the delivery address, and an outlined **`View order details`** button (aria `view details for order #<n>`, link `/orders/<id>`), plus `Need to make changes?` → `Edit your order as soon as possible.`, a Circle 360 upsell and a shopping-preferences survey.

**Order number format:** 15 digits with no separators. A publicly posted Target order confirmation (Scribd document 848191712, a store-pickup order) shows `Order # 902001863311107` under `Thanks for your order!`. The leading digits vary by order type; from memory, shipped Target.com orders usually start `102…` (e.g. `102001234567890`) — prefix **(low confidence)**, length medium-high.

---

## Look and feel

- **Header, row 1 (utility):** left — location-pin button `Ship to 95065` and store button `Scotts Valley`; right — `Target Circle™`, `Target Circle™ Card`, `Target Circle 360™`, `Registry & Wish List`, `Weekly Ad`, `Find Stores`.
- **Header, row 2 (main):** red bullseye logo (link "Target home", no wordmark) · `Categories` (hamburger / main menu) · `Deals` · `Pickup & delivery` · a wide centered search field in a light gray `#F7F7F7` rounded bar, placeholder `What can we help you find?`, mic icon (`search by voice`), clear button, red circular submit, and an `Ask Target` button · right: person icon `Account, sign in` and cart icon with count badge `cart 0 items`.
- **Colors:** Target red `#CC0000` (rgb 204,0,0) for the logo, primary CTAs and search button; body text `#333333`; page background `#FFFFFF`; light gray surfaces `#F7F7F7`; skeleton placeholders `#d6d6d6`.
- **Typography:** `"Helvetica for Target", HelveticaForTarget, Targetica, "HelveticaNeue for Target", "Helvetica Neue", Helvetica, Arial, sans-serif`. Bold weights for prices, titles and buttons. The search h1 is the raw query in lowercase.
- **Buttons:** primary = bold white text on `#CC0000`, fully rounded (`border-radius: 999px`); secondary = white pill with dark gray border; variant options (Platform/Edition) are pill toggles with the selected one outlined dark.
- **Product tile:** square image with heart top-right → badge line → bold price (sale: price + `reg $X` / `was $X` + `Sale`) → optional `When purchased online` → brand + full title → stars, rating text, review count, `Loved for: …` → fulfillment line (`Release date …` / `Shipping arrives …`) → `Ships free - exclusions apply` → red pill CTA (`Preorder` / `Choose Options` / `Add to cart`).
- **Product page:** two columns on desktop — stacked tall image gallery on the left, sticky buy box on the right (brand link, title, rating row, price, Platform/Edition pills, three fulfillment tabs with small illustrations, CTA, registry block, At a glance badges); full-width accordion sections below (Details, Specifications, Shipping & Returns, Q&A), then carousels and reviews.
- **Images to describe, not download:** PS5 box art with Rockstar Games and PS5 branding; screenshot slides of Vice City; the Xbox box art in green trim.

## Quirks

- Account wall: no guest checkout at all; sign-in (password, passkey or phone code) precedes Delivery/Payment.
- "Physical" means Code in Box: a download code, no disc, and the title says so. Street date Nov 12 (pre-load) vs playable Nov 19.
- Standard edition only; no Ultimate/Collector's on Target. A GTA VI DualSense controller ($84.99, `Preorder`, release Nov 19) sits next to the game.
- Platform buttons on the PDP navigate to a different TCIN (separate listing per platform).
- ZIP and store context in the header (`Ship to 95065`, `Scotts Valley`) governs the Pickup/Delivery/Shipping tabs; pickup orders may add an alternate pickup person and are charged at Ready for Pickup.
- Pre-order money flow: auth hold at order, new hold 7 days before street date, charge at ship, price invoiced at shipment; `Request cancellation` until processing.
- Shipping restriction: no PO Boxes, AK, HI, US territories.
- Bot detection: automated browsing got a press-and-hold "Quick verification" interstitial on the PDP on both 2026-09-29 and 2026-09-30 (the search page also degraded to "We couldn't find a match for your search." on the second day, and the Redsky JSON API began returning a PerimeterX 435 captcha page to curl); the buy box stayed a skeleton. Page props expose `isAiAgent` / `isBot` and a `GLOBAL_AGENTIC_COMMERCE_LATEST_VERSION_ENABLED` flag. Server-rendered HTML and the static JS bundles remain reachable.
- The add-to-cart confirmation is a drawer (not a redirect to the cart) whose red primary button is `Continue shopping`; `View cart & check out` is the outlined secondary.
- The PDP Shipping tab's one-word subtitle for a pre-order is `Preorder`, not an arrival date; the selected cell reads `Preorder for <ZIP>`, `Release date: <date>`, `Delivered on or shortly after release date`.
- Cart button reads `Sign in to check out` for guests and `Check out` when signed in; Target help's "I'm ready to check out" is outdated.
- Search tile CTA says `Preorder` for pre-orders and `Choose Options` for multi-variant items.
- Cart max 99 items, adding doesn't reserve; mixed sellers split orders; changing address in checkout forces CVV re-entry.
- Signed-in Circle offers (a 20% student/teacher offer in Aug 2026 took the game to $63.99) apply at checkout.

## Sources

- https://www.target.com/s?searchTerm=grand+theft+auto+vi (browser)
- https://www.target.com/p/grand-theft-auto-vi-playstation-5/-/A-1011529119 (browser + fetch)
- https://www.target.com/p/grand-theft-auto-vi-xbox-series-x-s/-/A-1011545811 (fetch)
- https://www.target.com/p/playstation-5-dualsense-controller-grand-theft-auto-vi-le/-/A-1013468584
- https://www.target.com/s/gta+6
- https://www.target.com/cart
- https://www.target.com/checkout/start
- https://www.target.com/login
- https://www.target.com/help/articles/orders-purchases/create-an-order
- https://www.target.com/help/articles/orders-purchases/pre-orders
- https://www.target.com/help/articles/orders-purchases/pre-authorization-charges
- https://www.target.com/help/articles/orders-purchases/track-order
- https://www.target.com/help/articles/orders-purchases/edit-or-cancel-your-order
- https://www.target.com/help/article/000063898
- https://www.target.com/help/articles/payment-options/accepted-payment-options
- https://www.target.com/help/articles/target-account/create-account
- https://www.target.com/help/articles/target-account/manage-account
- https://www.target.com/help/article/000057407
- https://www.target.com/help/articles/target-circle/about-target-circle-360
- https://www.target.com/help/article/000062733
- https://www.target.com/help/articles/delivery-options/drive-up-order-pickup
- https://help.target.com/help/subcategoryarticle?childcat=Pre-orders&parentcat=Orders+&+Purchases=&searchQuery=search+help
- https://help.target.com/help/TargetGuestHelpArticleDetail?articleId=ka95d000000gMevAAE&articleTitle=How+do+I+check+out%3F
- https://help.target.com/help/TargetGuestHelpArticleDetail?articleId=ka91Y000000g0TcQAI&articleTitle=When+will+I+be+charged+for+a+Pre-order+item%3F
- https://help.target.com/help/TargetGuestHelpArticleDetail?articleId=ka95d000000wpXRAAY&articleTitle=Do+you+price+adjust+Pre-order+items?
- https://www.dekudeals.com/articles/pre-order-video-games
- https://slickdeals.net/f/19863597-target-circle-student-offer-grand-theft-auto-vi-playstation-5-or-xbox-series-x-preorder-63-99
- https://www.gtabase.com/articles/gta-6/gta-6-editions-guide-pre-order-bonus-special-editions-content
- https://www.tomsguide.com/news/live/gta-6-pre-orders-news-and-live-updates
- https://windowscentral.com/gta6-faq-how-to-preorder
- https://www.digitalcitizen.life/gta-6-preloads-begin-on-november-12-for-digital-and-physical-code-copies/
- https://www.imore.com/how-order-groceries-target-online-pickup-or-delivery
- https://www.forward2me.com/retailers/target/review/
- https://www.zinc.com/integrations/target
- https://baymard.com/checkout-usability/benchmark/step-type/receipt/17625-target
- https://baymard.com/checkout-usability/benchmark/step-type/payment/106-target-step-4
- https://baymard.com/checkout-usability/benchmark/step-type/delivery-options/4157-target-step-3
- https://baymard.com/checkout-usability/benchmark/step-type/order-review/2211-target-step-9
- https://racklify.com/encyclopedia/query/target-guest/
- https://www.scribd.com/document/848191712/Order-confirmation-Target (public upload of a Target order confirmation: "Thanks for your order!", "Order # 902001863311107")
- https://www.target.com/help/articles/delivery-options/same-day-delivery (2026-09-30: "Select electronics & video games" excluded; $9.99 fee / free for Circle 360 on $35+)
- https://assets.targetimg1.com/webui/top-of-funnel/_next/static/chunks/_app-caf4a0027094e71e.js and chunks 68009.64f11a0ac815ff64.js, 74752.f65b9b9b79375395.js, component-add-to-cart-ModalContentAddToCartSuccess*.js (2026-09-30 PDP app: Preorder button map, Qty picker, fulfillment tab logic and strings, add-to-cart drawer; all 236 chunks listed by the PDP HTML and the webpack runtime were grepped)
- https://assets.targetimg1.com/webui/cart/_next/static/chunks/pages/cart-5bc7bc6828ae61b1.js and chunks 5368.292cd36b7f3efb3f.js, 7557.73e9d67123c2edcb.js, 3131-db27be76ed992204.js, pages/order-confirmation-6164f4d0f9b1de29.js (2026-09-30 cart app: checkout / PayPal / Apple Pay buttons, Order summary + Promo code cell, line-item strings, confirmation page)
- https://assets.targetimg1.com/webui/commerce/checkout/_next/static/chunks/ — pages/checkout-6bf70d7a72f3a45a.js, 667-dcd4dd9635d75e4b.js, 6793-f0c6d075428bc02e.js, 1949-066205ee68ab1fcc.js, 5687-e941e372a5f99769.js (2026-09-30 checkout build: step headings, address fields, "Save & continue" / "Save and continue", "Place your order", order-summary rows)
