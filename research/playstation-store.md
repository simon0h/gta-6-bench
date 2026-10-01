# PlayStation Store (US) — pre-ordering Grand Theft Auto VI

Researched 2026-09-29 with the built-in browser (concept page, both product pages, search results) plus PlayStation support pages and third-party guides. Pre-orders are live: Standard $79.99, Ultimate $99.99, PS5 only, digital only.

What the browser could and could not do: the product, concept and search pages loaded fully and were inspected (text, DOM, computed styles). Clicking **Pre-Order** or **Sign In** did not navigate anywhere in the sandbox (no request to Sony's sign-in domain was made), so the sign-in screen, cart, checkout overlay and confirmation are documented from PlayStation's own help pages, the PS Store manual and general knowledge. Those sections are marked with a confidence note.

Follow-up pass (same day, browser only — WebSearch/WebFetch quotas were exhausted): confirmed the cart is a **right-side drawer** opened by the header **Cart** button (signed out it shows only `Sign In To Proceed` + a blue **Sign In** pill), that `/en-us/cart` redirects to `/en-us/pages/cart/` (signed out: the store's "This probably isn't what you're looking for..." fallback), and that `checkout.playstation.com` is a bare embedded app (direct load gives `Error | Checkout` — "Something went wrong." + **Close**). Sony's sign-in domain is refused by the browser's safety rules, so the sign-in screen is still not observed. Official help articles were re-read for the add-card flow (two screens: card > **Next**, billing address > **Save**), wallet rules, "Require Password at Checkout" and the sign-in link labels.


Third pass (2026-09-30, browser + web): instead of signing in, the checkout client itself was read. The drawer is the Next.js "web-checkout" app at `checkout.playstation.com`; its build manifest lists the routes (`/buynow/[sku]`, `/` cart, `/login`, `/thankyou`, `/error`, `/transaction-history`, `/post-purchase/order-history`, `/unified/*`) and its page HTML carries the full English string table (`msgid_*`), so the drawer's headings, summary rows, button labels and legal lines are quoted from the live client. The product page's own data shows the **Pre-Order** CTA is a `BUY_NOW` action (not add-to-cart), and the payment-method / add-card screens are a second hosted iframe (`transact.playstation.com`, English strings at `/i18n/en-us.json`). The Sony sign-in page is still unobserved: the browser refused the store's sign-in endpoint and WebFetch is blocked for `my.account.sony.com`.

## Step-by-step walkthrough

### 1. Entry — search

- Any store page. Header tier 1 has the PlayStation logo, mega-menu buttons **Store / PS5 / Games / PS Plus / Accessories / News / Support**, then on the right the **SONY** wordmark, a blue pill **Sign In** button and a magnifier **Search** button.
- Clicking **Search** expands an inline search field. Placeholder: `Search PS Store`. Accessible label: "Search PlayStation Store. To change where to search, choose from the previous menu." A **Cancel search** control closes it.
- Submitting navigates to `https://store.playstation.com/en-us/search/grand%20theft%20auto%20vi`.

### 2. Search results

- Page title: `PlayStation Store | Search | grand theft auto vi`
- H1: **You searched for: *grand theft auto vi***
- Count line: `1 - 24 of 128` (screen-reader text: "128 total results, displaying 1 to 24"). A **Filter** button sits near the count.
- Grid: 6 tiles per row, each about 145 x 207 px. Tile anatomy top to bottom: square cover art with a small translucent dark **PS5** chip overlaid on the art; an 8 px uppercase grey type label (`PRE-ORDER`, `GAME BUNDLE`, `VIRTUAL CURRENCY`, `ADD-ON PACK`); the title in 14 px black; an optional PS Plus tag (`Included`, `Extra`, `Exclusive`); the price in 14 px dark grey or the word `Unavailable`. The whole tile is a link to `/en-us/product/{id}`.
- First three tiles:
  1. **Grand Theft Auto VI** — PS5 — PRE-ORDER — `$79.99` → `/en-us/product/EP1004-PPSA01547_00-GTAVISTANDARD001`
  2. **Grand Theft Auto VI: Ultimate Edition** — PS5 — PRE-ORDER — `$99.99` → `/en-us/product/EP1004-PPSA01547_00-GTAVIULTIMATE001`
  3. **Grand Theft Auto VI: Ultimate Edition Upgrade** — PS5 — PRE-ORDER — `Unavailable` → `/en-us/product/EP1004-PPSA01547_00-ULTEDTIONUPGRADE`
- Remaining tiles are GTA Online, GTA V bundles, GTA Trilogy and Shark Cash Cards. Pagination at the bottom: `1 2 3 … 6`.

### 3. Product page (concept page and per-edition product pages)

Two URL forms render the same template:

- `https://store.playstation.com/en-us/concept/10000730/` — edition-agnostic "concept" page; currently shows the **Ultimate Edition** as the featured edition.
- `https://store.playstation.com/en-us/product/EP1004-PPSA01547_00-GTAVISTANDARD001` (Standard) and `.../EP1004-PPSA01547_00-GTAVIULTIMATE001` (Ultimate).

Top to bottom, exactly as shown (Ultimate page; Standard differs only where noted):

1. **Hero** — full-width key art on the right; on the left a dark card (`rgba(31,32,36,0.97)`) containing:
   - H1 `Grand Theft Auto VI: Ultimate Edition` (Standard page: `Grand Theft Auto VI`) — 34 px, weight 300, white
   - `Rockstar Games`
   - `11/18/2026 09:00 PM PST`
   - Tag chips: `PS5` · `ULTIMATE EDITION` (or `STANDARD EDITION`) · `PS5 PRO ENHANCED`
   - Price `$99.99` (Standard `$79.99`) — 22 px, weight 300, white
   - Promo line: `1-month GTA+ subscription with pre-order. Auto-renews. Check Game and Legal Info* below.`
   - Buttons: **Pre-Order** (orange `#D63D00` pill, white bold 14 px, full card width, 34 px tall) and **Add to Wishlist** (outlined translucent pill with heart icon)
   - ESRB `RP` badge with `May contain content inappropriate for children`
2. **Compatibility notices** row: `In-game purchases optional` · `Offline play enabled` · `1 player` · `Remote Play supported` · `PS5 Version` · `Vibration function and trigger effect supported (DualSense wireless controller)` · `PS5 Pro Enhanced`
3. **Media carousel** — screenshots/video thumbnails with a **Next** arrow.
4. **Editions:** — two dark cards side by side, each with cover art, edition name, feature bullets, price, promo line and its own **Pre-Order** + **Add to Wishlist** buttons:
   - **Standard Edition**: `Grand Theft Auto VI`, `Vintage Vice City Pack`, `One Month of GTA+`, `7-Day Pre-load` — `$79.99`
   - **Ultimate Edition**: `Grand Theft Auto VI`, `Ultimate Edition Upgrade`, `Vintage Vice City Pack`, `One Month of GTA+`, `7-Day Pre-load` — `$99.99`
5. **Add-Ons** — tile `Grand Theft Auto VI: Ultimate Edition Upgrade` · `PS5` · `PRE-ORDER` · `Unavailable`, with a **Show More** button.
6. **Game and Legal Info** — the pre-order offer text (verbatim):
   - `Pre-order Grand Theft Auto VI and get one month of GTA+ on PlayStation 5 at no extra cost. Subscription continues until canceled.`
   - `Offer ends November 19th 2026.`
   - `You'll receive a confirmation email with redemption instructions. Your GTA+ subscription is non-transferable, and can only be redeemed on the account used to pre-order the game.`
   - `Must be redeemed by March 31st 2027.`
   - `Purchase prior to 19 November 2026 at 23:59:59 to receive: -The Vintage Vice City Pack -One Month of GTA+`
   - a longer GTA+ auto-renewal paragraph linking to `https://www.playstation.com/support/games/gta-vi-offer-terms/`
   - `Grand Theft Auto VI is a single-player experience.`
   - Description: `Vice City, USA. Jason and Lucia have always known the deck is stacked against them...` (Ultimate page adds the ULTIMATE EDITION UPGRADE bullet list of vehicles, weapons, outfits and shops.)
7. **Game info** table: `Platform: PS5` · `Release: 11/18/2026` · `Publisher: Rockstar Games` · `Genres: Action`
8. **Legal text**: online-features / software-license / "Purchase grants a license to the digital product..." paragraphs and the Rockstar copyright line.
9. **Footer** (PlayStation blue): `Country / Region: United States`, Support, Privacy Policy, Do Not Share My Personal Information, Website Terms of Use, Sitemap, PlayStation Studios, Legal, About SIE, PlayStation Terms of Service, **PS Store Cancellation Policy**, Health Warnings, About Ratings, social links, `© 2026 Sony Interactive Entertainment LLC`.

There is no quantity selector, no platform dropdown (PS5 only), no fulfillment choice (digital only), no breadcrumb, and no charge-timing text on the page itself.

### 4. Clicking Pre-Order (signed out) → sign-in

*Not observed in the sandbox; from Sony/PlayStation help pages (confidence medium). The browser refuses both `my.account.sony.com` and the store's sign-in endpoint, WebFetch is blocked for the Sony domain, and clicking **Pre-Order** signed out produced no visible change (the cross-origin redirect is blocked and the drawer does not open).*

- Every sign-in entry (header **Sign In** pill, the drawer's **Sign In** button, the signed-out **Pre-Order** / **Add to Wishlist** clicks) goes through the store toolbar's session endpoint `https://web.np.playstation.com/api/session/v1/signin?redirect_uri=<store url>` (toolbar config: `signInEndpoint: "/signin"`, cookie `isSignedIn`), which forwards to Sony's sign-in at `my.account.sony.com/central/signin/...` and returns to the product page.
- Screen, per Sony's account help (basic300): headline **Sign In**; step 1 field **Sign-in ID (Email address)** → **Next**; step 2 **Password** → **Sign In**; optional **Sign in with Passkey**; if 2-step verification is on, a **confirmation code** field → **Verify** (or a backup code). Links: **Trouble Signing In?**, reset your password, create a new account (PlayStation help calls it **Create New Account**).
- There is no guest option. Creating an account: "Go to Account Management and select Create New Account. Enter your details and preferences and select Next on each screen. Verify your email address." (official). Field list — date of birth, country/region, state, language, email, password, Online ID, first/last name, terms acceptance — is from general knowledge.
- After sign-in the shopper lands back on the product page; the header now shows the avatar and the **Cart** icon (the avatar menu includes **Game Library** > **Purchased** and **Payment Management**, per official articles).

### 5. Clicking Pre-Order (signed in) → the drawer opens on "Confirm Pre-Order"

*Routing and labels read from the product page's CTA data and the live checkout client's code and string table (confidence medium-high for wording, medium for visual order). The drawer itself was only seen signed out.*

Observed:

- The global header carries a **Cart** icon button even when signed out. Clicking it slides a **drawer in from the right** over the dimmed, blurred page: about 40% of the viewport wide, white, a round outlined **X** close button top-right. Signed out it shows the client's `/login` view: heading `Sign in to proceed` (rendered in title case as `Sign In To Proceed`) and a blue pill **Sign In** near the bottom.
- The drawer's text is not in the store page's accessibility tree, i.e. it is a cross-origin iframe — the web-checkout client from `checkout.playstation.com`.
- `https://store.playstation.com/en-us/cart` redirects to `https://store.playstation.com/en-us/pages/cart/`; signed out that page renders the store fallback `This probably isn't what you're looking for...` / `Back to Store or Home.`
- The product page data defines each **Pre-Order** button as a `GameCTA` of type `PREORDER` whose `action.type` is **`BUY_NOW`** with `skuId` `EP1004-PPSA01547_00-GTAVISTANDARD001-U001` (Standard) or `EP1004-PPSA01547_00-GTAVIULTIMATE001-U001` (Ultimate) and `rewardId OUTRIGHT`. The store's CTA runner treats `BUY_NOW | ADD_TO_CART | OPEN_CART` as drawer actions.

Definite path for the clone (signed in):

1. **Pre-Order** opens the drawer immediately on the client's `/buynow/{sku}` view — **not** on a cart. There is no "added to cart" step and no **Checkout** button.
2. Drawer header: **Confirm Pre-Order** (the client's `HEADER_CONFIRM_PREORDER` string, used because the item is a pre-order; a regular Buy Now shows **Confirm Purchase**). Close **X** top-right.
3. Item tile: 80 × 80 cover art, `Grand Theft Auto VI` / `Grand Theft Auto VI: Ultimate Edition`, ESRB rating image, pre-order dates (`Release Date: %date%`, `Expected download date: %date% %time%`), price.
4. **Payment method** section — the hosted `transact.playstation.com` iframe: the default instrument (`Card ending in %num%`, PayPal, etc.), wallet funds (`Wallet Balance` / `Wallet funds`), and a change control that opens **Change Payment Method** — `Please select a payment method.` with a **Default** tag and **Add Payment Method**.
5. Optional **Redeem Code** box (`Enter discount code` placeholder, **Apply**) — present in the client, rendering for a US digital buy-now unverified. A PlayStation Visa promo strip (`Earn points and get rewarded when you use the PlayStation® Credit Card.`) may also appear.
6. Summary rows: **Subtotal**, **Tax**, (**Discount** only if a code is applied), **Total (1 item)**; US-only link **Learn more about taxes and fees** (→ playstation.com/support/store/taxes-information/).
7. Legal line, then the orange **Pre-Order & Pay** button (see step 6). **Continue Shopping** closes the drawer.

The header **Cart** icon opens the same client on its cart view instead: title `Cart | Checkout`, header **Cart (1 Item)** / **Cart (N Items)**, the same item rows (with **Remove**), payment method, summary and confirm button — again with no separate Checkout step. Empty cart: **Your Cart** / `Your cart is empty.` / **Continue Shopping**. (The client's `/unified/cart` route with **Continue to Checkout** is the PS Direct hardware cart; the digital store session runs with `isUnifiedCart = false`.)

### 6. Confirming the purchase (inside the drawer)

*Labels from the live client (confidence medium-high). Observed: loading `https://checkout.playstation.com/` or `/cart` directly (no store session) redirects to `https://checkout.playstation.com/error?cartAction=%2Ferror` — a bare white page titled `Error | Checkout` with the heading `Something went wrong.` and a single **Close** button.*

- The sales-tax line **Tax** sits in the summary directly above the button (the client inserts the Tax row for tax-exclusive countries such as the US and shows it as **Total (1 item)** below); amounts arrive pre-formatted from the server.
- Button label logic in the client: `Processing...` while submitting; otherwise **Pre-Order & Pay** when the cart/buy-now contains a pre-order; **Order & Pay** for regular items in SCEE/LatAm; **Confirm Purchase** for regular US items (and Brazil). For GTA VI the button therefore reads **Pre-Order & Pay**, and the older sources' **Confirm Purchase** applies only to non-pre-order items.
- Legal line for a US digital pre-order (verbatim): "You'll be charged for your pre-order when you select [Pre-Order & Pay]. If the price drops before the product is released, we'll refund you the difference. When you select [Pre-Order & Pay], you agree the purchase is governed by the PlayStation Terms of Service. You also acknowledge that your purchase of any digital content amounts to a license, subject to the PlayStation End User License Agreement." (Regular US items: "By selecting [Confirm Purchase], you agree to complete the purchase in accordance with the PlayStation Terms of Service before using this content. You also acknowledge ... End User License Agreement.")
- If the account setting **Require Password at Checkout** is on, a **Password** prompt (`Enter your password`; error `Incorrect password`) appears above the button and the drawer notes `[Require Password at Checkout] setting is turned on.` (official: "the password screen appears whenever you make a purchase").
- Payment methods: wallet funds first (official: "your wallet funds are used first. If your wallet funds don't cover the full balance of a purchase, the remainder can be settled using other payment methods."); saved cards (Visa, Mastercard, American Express, Discover — up to 3); one saved service (PayPal, Venmo, Apple Pay or Cash App Pay). Gift cards are redeemed as codes into the wallet beforehand.
- **Add Payment Method** (official, two screens; labels from the transact iframe's string file and add-card template): **Add Payment Method** → **Add a Credit/Debit Card** (`Add your payment method (maximum 3 credit/debit cards).`) → card screen **Credit/Debit Card Number** (card type auto-detected; fallback `- Select credit/debit card type -`), **Cardholder's Name**, expiry **Month** / **Year** selects (**Expires On**), **CVV** (`This is the 3- or 4-digit code on your credit/debit card.`) → **Next** → billing screen **Billing Information**: **First name**, **Last name**, **Street address**, **Address 2 (optional)**, **City**, **State**, **ZIP Code**, **Country or region**, **Phone number** → **Save**. Success: `Credit/debit card has been successfully added.` Option **Set as Default Payment Method** (`Your default payment method is used to complete your purchase when your wallet doesn't have enough funds.`). PayPal: **Add a PayPal Account**, then log in to PayPal. The string file also holds a newer label set (`Card number`, `Expiration date`, `CVV number`, `Cardholder's name`), so casing may differ by screen version.

### 7. Confirmation

*From the client's `/thankyou` view (confidence medium-high for wording; not seen rendered).*

- Document title `Thank You | Checkout`. H2 **Thank you for your purchase!** with the buyer's Online ID on the line beneath.
- Item tile with cover art and, for pre-orders, `This game will be released on %date%.` (single item; multi-item lists say `Releases on: %date%`).
- Download hint box: heading **Download to Console**, text `Start downloading to your console from your game library.` (mobile app: **Start Downloading** / `Select Library in PlayStation App, and then select the game you want to download to your console.`).
- Buttons: **Download from Library** (primary; opens `library.playstation.com`) and **Continue Shopping**; legal footer; **X** to close.
- **No order number on screen.** `ORDER NUMBER` strings exist only on the client's one-commerce order-confirmation / order-history pages (PS Direct hardware). The order number arrives in the receipt email ("Thank you for your purchase from PlayStation®Store", listing Order Number, Online ID, date/time, items and amounts — 11-digit numeric in the one example seen) and in Account Management > Transaction History / `checkout.playstation.com/post-purchase/order-history`.
- Official post-purchase wording: "You are charged and the pre-order appears in your Library, PlayStation Store, and PlayStation App." Remote download later: avatar (top right) > **Game Library** > **Purchased** > select the game > **Download**.
- The pre-order appears immediately in the PSN Library, PS Store and PS App with a countdown to `11/18/2026 09:00 PM PST`; pre-load opens 7 days before. The GTA+ month is claimed separately on the GTA+ product page by March 31, 2027 and auto-renews afterwards.

### Charging and cancellation (official)

- "You'll be charged when you select Pre-order for a game on PlayStation Store." (PlayStation Support)
- Cancellation policy (US): paid 14+ days before release → cancel any time before release if the main content has not started downloading (pre-load counts); paid within 14 days of release → cancel up to 14 days after payment. Cancelling is done by contacting PlayStation Support or via Transaction History for eligible purchases; refunds go to the original payment method where possible, otherwise to the wallet.

## Look and feel

- **Header**: white, two tiers. Tier 1 = PlayStation "PS" logo, mega-menu buttons Store / PS5 / Games / PS Plus / Accessories / News / Support, right side SONY wordmark, blue pill **Sign In** (`#0070CC`, white 14 px medium), search icon. Tier 2 = **PlayStation Store** wordmark link, then Latest / Collections / Deals / Subscriptions / Browse (14 px medium, black).
- **Typography**: Sony's "SST" sans (fallback Helvetica/Arial). Body text `#363636`. Product H1 34 px weight 300; price 22 px weight 300; buttons 14 px weight 700; tile titles 14 px regular; tile type labels 8 px bold uppercase grey.
- **Colors**: page background white `#FFFFFF`; product hero/edition cards dark `#1F2024` (97% over key art) with page section `#121314`; CTA orange `#D63D00`; sign-in / accent blue `#0070CC`; footer PlayStation blue `#003697`; secondary text `#6B6B6B`.
- **Buttons**: fully rounded pills (radius 999 px, 34 px tall). Primary = solid orange with white text. Secondary (Wishlist) = translucent white fill with a white border.
- **Search tile**: square art with a translucent dark platform chip; label, title, optional PS Plus tag, price stacked beneath; 6 per row on desktop.
- **Product page**: dark hero with text card on the left and key art on the right; light content area below with compatibility icons, media carousel, dark edition cards, add-on tiles, long legal text; blue footer.
- **Images** (not downloaded): hero key art at `https://image.api.playstation.com/vulcan/ap/rnd/202606/1818/1c8e3e304f0bad2d99ffed828ad460ebe5949608cb82a5dd.png` (illustrated Jason and Lucia in the Vice City style cover art); edition cards and add-on tiles use the square cover art. The image CDN returned 403 in the sandbox so art was not viewed.

## Quirks

- Digital only, PS5 only, one price, no quantity, no delivery/pickup, license bound to the PSN account.
- PSN account required for Pre-Order and Wishlist; no guest checkout; sign-in happens on a separate Sony domain.
- Concept page vs product page: `/concept/10000730/` shows the featured edition (Ultimate) plus an Editions comparison; each edition also has its own `/product/` URL. Editions are separate listings with their own Pre-Order buttons, not a dropdown.
- Release displayed as an unlock timestamp `11/18/2026 09:00 PM PST` (Nov 19 midnight Eastern); `7-Day Pre-load`.
- Charged immediately at pre-order; cancel by contacting support under the 14-day / no-pre-load rules.
- Cart is a right-hand drawer, not a page: the header **Cart** icon (present even signed out) slides a white panel over the dimmed page; signed out it shows the client's login view `Sign in to proceed` (displayed `Sign In To Proceed`) with a blue **Sign In** pill; signed in it is headed **Cart (N Items)**. `/en-us/cart` redirects to `/en-us/pages/cart/`, which signed out shows the "This probably isn't what you're looking for..." fallback.
- Checkout runs inside that drawer as a cross-origin iframe from `checkout.playstation.com`, with the payment-method / add-card screens in a second hosted iframe from `transact.playstation.com`; tax appears there as a **Tax** row, not on the product page. Loading the checkout domain directly gives a bare `Error | Checkout` page ("Something went wrong." + **Close**).
- Signed out, **Pre-Order** does not open the drawer — it redirects to Sony sign-in; only the **Cart** icon opens the drawer. Signed in, **Pre-Order** is a `BUY_NOW` action: the drawer opens straight on a **Confirm Pre-Order** view (item, payment method, Subtotal / Tax / Total (1 item), **Pre-Order & Pay**) — no cart step, no **Checkout** button.
- The confirm button for this title is **Pre-Order & Pay**, not **Confirm Purchase** (the client switches the label whenever the order contains a pre-order); its legal line promises a refund of the difference if the price drops before release.
- The on-screen confirmation (**Thank you for your purchase!** + Online ID, **Download from Library**, **Continue Shopping**) shows no order number; it is only in the receipt email / Transaction History.
- US carts get a **Learn more about taxes and fees** link (the client shows it only for country US).
- Optional **Require Password at Checkout** setting inserts a password prompt before every purchase (not when funding the wallet).
- Wallet-first payments: gift cards go into the wallet via code, wallet funds are spent first, and any remainder goes to the selected card/service. **Add Funds** lives under avatar > **Payment Management** (wallet balance shown at the top).
- GTA+ bonus must be claimed manually on the GTA+ product page and auto-renews.
- ESRB `RP` with "May contain content inappropriate for children"; no age gate.
- The Ultimate Edition Upgrade add-on is listed but `Unavailable`.
- OneTrust "Privacy Preference Center" cookie dialog exists on every page.

## Sources

- https://store.playstation.com/en-us/concept/10000730/
- https://store.playstation.com/en-us/product/EP1004-PPSA01547_00-GTAVISTANDARD001
- https://store.playstation.com/en-us/product/EP1004-PPSA01547_00-GTAVIULTIMATE001
- https://store.playstation.com/en-us/product/EP1004-PPSA01547_00-ULTEDTIONUPGRADE
- https://store.playstation.com/en-us/search/grand%20theft%20auto%20vi
- https://www.playstation.com/support/games/gta-vi-offer-terms/
- https://www.playstation.com/en-us/support/games/pre-order-games-automatic-download-ps-store/
- https://www.playstation.com/en-us/support/store/payment-methods-accepted-on-ps-store/
- https://www.playstation.com/en-us/support/store/purchase-games-apps-ps-store/
- https://www.playstation.com/en-us/support/store/ps-store-add-remove-change-payment/
- https://www.playstation.com/en-us/legal/playstation-store-cancellation-policy/
- https://www.playstation.com/en-us/support/store/cancel-ps-store-pre-order/
- https://www.playstation.com/en-us/support/store/ps-store-refund-request/
- https://manuals.playstation.net/document/en/store/purchase.html
- https://www.pushsquare.com/guides/where-to-pre-order-gta-6-on-ps5
- https://www.igrandtheftauto.com/gta6/news/what-happens-if-you-pre-order-gta-vi-on-playstation
- https://www.igeeksblog.com/how-to-pre-order-gta-6-on-ps5-and-xbox/
- https://www.tomsguide.com/news/live/gta-6-pre-orders-news-and-live-updates (content truncated)
- https://techradar.com/gaming/the-ps5-homepage-ps-store-and-ps-app-have-all-been-updated-with-a-new-gta-6-ui-as-pre-orders-begin (content truncated)
- https://www.sony.co.jp/en/united/acm_account/supports/en_ww/basic300.html
- https://www.niksula.hut.fi/~atiainen/sony.html
- https://store.playstation.com/en-us/pages/cart/ (observed redirect target of /en-us/cart; signed-out fallback page)
- https://checkout.playstation.com/error?cartAction=%2Ferror (observed: direct load of the checkout app)
- https://www.playstation.com/en-us/support/store/ps-store-credit-debit-card/
- https://www.playstation.com/en-us/support/store/ps-store-paypal-payment/
- https://www.playstation.com/en-us/support/store/ps-store-top-up-wallet/
- https://www.playstation.com/en-us/support/store/check-ps-store-transaction-subscription-service/
- https://www.playstation.com/en-us/support/store/ps-store-checkout-password/
- https://www.playstation.com/en-us/support/account/password-reset/
- https://www.playstation.com/en-us/support/account/create-account/
- https://www.playstation.com/en-us/support/games/find-download-games-ps-store/
- https://www.wikihow.com/Buy-Games-from-the-PlayStation-Store (dated web walkthrough: Show Cart > Proceed to Checkout > Confirm Purchase)
- https://checkout.playstation.com/ (web-checkout client: route manifest, page chunks and the English msgid table in its page data, read 2026-09-30)
- https://transact.playstation.com/ (hosted payment-method iframe used inside the drawer)
- https://transact.playstation.com/i18n/en-us.json (the payment iframe's English string table)
- https://web-toolbar.playstation.com/ (store header/cart toolbar bundle: sign-in endpoint and cart config)
- https://static.playstation.com/wca/v2/js/ (store CTA bundle: PREORDER CTA -> BUY_NOW action)
- https://www.playstation.com/support/store/taxes-information/
- https://www.playstation.com/en-us/support/games/pre-order-games-automatic-download-ps-store/ (re-read: "You'll be charged when you select Pre-order")
