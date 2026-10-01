# EB Games (Australia) - pre-ordering Grand Theft Auto VI

Researched 2026-09-29. Retailer: EB Games Australia, https://www.ebgames.com.au (AUD, GST inclusive).

**How this was researched.** The built-in browser hit a Cloudflare "Just a moment..." bot challenge on the very first page (the search results), so under the rules it was closed and not retried. Every direct fetch (WebFetch and curl) of `www.ebgames.com.au` returned HTTP 403 with `cf-mitigated: challenge`. The web-search budget was already exhausted. What follows is therefore built from three kinds of sources:

1. **EB Games' own help centre** (`support.ebgames.com.au`). Its HTML is also challenged, but its Zendesk JSON API is open, so all 168 articles were pulled and read. Everything about deposits, charging, payment methods, delivery, Click & Collect, guest checkout and EB World below is quoted from there - high confidence.
2. **Search-result snippets** (Brave Search worked for a few queries before rate-limiting) and **Press Start Australia** articles for the product listings, URLs, prices, deposit and release timing - medium confidence.
3. **Inference** for anything visual (exact button labels on the product page, checkout field order, colours, header). These are marked *low confidence* and repeated in the Gaps list.

---

## 1. What is on sale

| Listing title | URL | Price | Format | Notes |
|---|---|---|---|---|
| Grand Theft Auto VI - PlayStation 5 | https://www.ebgames.com.au/product/ps5/330056-grand-theft-auto-vi | A$129.95 | Standard Edition, code in box (no disc) | Pre-order, A$10 deposit |
| Grand Theft Auto VI - Xbox Series X | https://www.ebgames.com.au/product/xbox-series-x/330060-grand-theft-auto-vi | A$129.95 | Standard Edition, code in box (no disc) | Pre-order, A$10 deposit |
| Grand Theft Auto VI: The Goodtime State - Vice City Collection | https://www.ebgames.com.au/product/loot/385339-grand-theft-auto-vi-the-goodtime-state-vice-city-collection | A$699.95 | Collectibles box, **game not included** | Listed 11:00am AEST 28 Sep 2026, sold out almost instantly |
| Grand Theft Auto VI Limited Edition - White - PlayStation 5 Controller | https://ebgames.com.au/product/ps5/384036-playstation-5-dualsense-wireless-controller-grand-theft-auto-vi-limited-edition-white | ~A$134.95 | DualSense controller | Pre-orders opened 10 Sep 2026 |

- Australian RRP (Press Start, 25 Jun 2026): Standard A$129.95, Ultimate A$159.95. **EB Games only sells the Standard Edition**; the Ultimate Edition is digital-only on the PlayStation and Xbox stores (r/EBGAMES thread snippet agrees: "EB Games only has the Standard Edition available on their website").
- Release date shown: **19 November 2026**. Product-page text (from the search snippet): "Delivery starts November 12, allowing the game to be downloaded and installed in advance. Grand Theft Auto VI is releasing and becomes playable on November 19." That is because the physical edition is a **pack-in code with no disc** (Rockstar's decision, reported by Press Start and GTA6Index).
- Pre-order bonus (Rockstar, all retailers): the "Vintage Vice City Pack" for pre-orders and purchases made before 20 November. Not verified on the EB listing.
- One snippet for `/featured/playstation-5` showed the PS5 pre-order at **A$124.95** instead of A$129.95. Unresolved - could be a promo, an EB World PLUS price, or a stale index.
- Pre-orders went live in Australia at 12:00am AEST on 25 June 2026 (Press Start).

---

## 2. Step-by-step shopper flow

The help centre article "How do I place an order or preorder?" (updated 29 Sep 2026) gives the canonical five steps. Quoted verbatim:

> 1. Click the user avatar to the left of the cart to login or create an EB World account
> 2. Use the search function or browse to your hearts content, then simply select what you want by clicking add to Cart
> 3. When you are ready to complete your purchase, select Checkout Now
> 4. Choose a store to collect your order from or select your preferred shipping option
> 5. Select your preferred payment type, enter the require information and click Place order
>
> Once you are all done we will send you an email confirming we have received your order!

Below is that path expanded with everything else the help centre and sources say.

### Step 0 - Landing / bot check
`https://www.ebgames.com.au/` (and every sub-page) may first show a Cloudflare interstitial titled **"Just a moment..."** with the text "Performing security verification - This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot." Real browsers pass automatically; automation is blocked. A faithful clone for an agent benchmark should model this gate (or at least the delay).

### Step 1 - Search
- URL pattern: `https://www.ebgames.com.au/search?q=grand+theft+auto+vi` (query param `q`).
- Results (from search-engine index): "Grand Theft Auto VI - PlayStation 5", "Grand Theft Auto VI - Xbox Series X", the Vice City Collection, the Limited Edition DualSense controllers, plus the franchise hub `/grand-theft-auto` and `/featured/preorder-now`.
- Tile contents (*low confidence*): box art, title, platform, price "A$129.95", a Pre-Order badge, deposit amount.
- Search box placeholder text: not verified.

### Step 2 - Product page
- URL pattern: `/product/<platform-slug>/<numeric-id>-<name-slug>` - e.g. `/product/ps5/330056-grand-theft-auto-vi`.
- Headline: **Grand Theft Auto VI** with platform (PlayStation 5 / Xbox Series X). Platforms are **separate listings**, not a selector on one page.
- Price: "A$129.95". Deposit line: A$10 (homepage snippet: "A$129.95 pricing and $10 deposit"). No member price or strikethrough seen for this title.
- Release/availability text: release date 19 November 2026; the "Delivery starts November 12 ... playable on November 19" paragraph.
- Primary button: **"Add to Cart"** per the help centre. On pre-order products the label may read "Pre-Order" - *unverified*.
- Fulfilment shown on page (*low confidence for placement*): Delivery and Click & Collect; costs and ETAs "will be displayed at checkout" (Terms snippet).
- Upsells likely visible: EB World join prompt, EB World PLUS, the GTA VI DualSense controllers, the Vice City Collection, buy-now-pay-later logos.

### Step 3 - Add to cart
Clicking add to cart puts the pre-order into the cart as a deposit item (*low confidence on the visual: inline confirmation/cart count update*). Follow-on buttons: view cart / **"Checkout Now"**.

### Step 4 - Cart
- Cart URL: not verified.
- Line item: art, title, platform, price with deposit, quantity, remove. Multi-buy help says "adjust the quantity in your cart before checking out", so a quantity control exists.
- Promo code: a **"Promo Code"** box appears during checkout; "Only one promo code can be used per order."
- Summary: subtotal, deposit due today, balance due before release, shipping calculated at checkout, total (GST inclusive - "All prices displayed on our website include GST").
- Checkout button: **"Checkout Now"**.

### Step 5 - Sign in or Guest
- Entry point is the **user avatar icon to the left of the cart**: login, create an EB World account, or **"FORGOTTEN PASSWORD"**.
- **Guest checkout is allowed.** The help centre says for order tracking: "Please ensure you are selecting whether you are an EB World member or a Guest, these can be selected at the top. The login you choose will depend on whether you were logged in to your EB World account when you created your order." And for cancelling: "if no account was used then use the Guest login."
- Sign-in fields: Email, Password.
- EB World sign-up fields (verbatim from "How to create an EB World Account"): First Name, Last Name, Email Address, Password, Date of Birth, Mobile Number, Preferred Store (optional), checkbox agreeing to EB World Terms & Conditions and Privacy Policy, a CAPTCHA, then the **"Sign Up"** button and a confirmation email link.

### Step 6 - Delivery or Click & Collect
Help step 4: "Choose a store to collect your order from or select your preferred shipping option."

Delivery facts (all from the help centre):
- Processing 1-2 business days; **Standard 2-7 business days, Express 1-3 business days** after dispatch. Express is sometimes hidden (lithium batteries, stock/carrier limits).
- Carriers: Australia Post, StarTrack, Couriers Please. PO Boxes and Parcel Lockers accepted.
- Free shipping: "Occasionally we run free shipping promotions. Please check the website banners and your checkout page to see if your order qualifies." (No standing threshold.)
- Same Day Delivery via **Uber** in some areas, offered in checkout when available; orders after 2pm go next day; in-stock items only.
- "If you order a preorder item and an in-stock item together, we'll usually ship the in-stock item immediately and the preorder item closer to release."

Click & Collect facts:
- "When shopping online, choose Click & Collect during checkout, then choose your store. When your Click & Collect order is ready for collection, we'll send you a notification."
- In-stock orders ready within about 15 minutes and held up to 6 weeks; **preorder pickup windows depend on your EB World level**.
- If a store rejects the order you get: change store, home delivery with complimentary free shipping, or a full refund.

Address fields (*low confidence, standard AU form*): First Name, Last Name, Email, Mobile Number, Address, Suburb, State, Postcode.

### Step 7 - Payment
Help step 5: "Select your preferred payment type, enter the require information and click **Place order**."

- Accepted online: Visa, Mastercard, American Express, PayPal, Zip, EB Games / Zing gift cards, Afterpay, PayPal Pay in 4, Klarna Pay in 4. "No, EB Games does not apply surcharges for Visa, Mastercard, PayPal, or Buy Now Pay Later services."
- **Pre-order restrictions:**
  - "Afterpay is not available for: Online preorders for home delivery and Click & Collect ... If your order contains any one of these products, then Afterpay won't be an available payment option in the checkout."
  - "PayPal Pay in 4 is not available for preorders. If your order contains a preorder item, then PayPal Pay in 4 won't be an available payment option in the checkout."
  - Zip: "You can pay the deposit for online Click & Collect preorders using Zip." But "the remaining balance cannot be paid in store using Zip."
  - Click & Collect page snippet: "For preorder products, you can pay using: Credit Card: Visa, Mastercard or Amex".
- Card fields (help centre wording when troubleshooting): card number, expiry, CVV/verification number.
- **What is charged now:** the deposit only. Terms: "When you place a preorder through the Website, you must pay a deposit at the time of ordering. The remaining balance for your preorder will be charged to the same payment method used to pay the deposit (such as a credit card or ZIP)."
- **When the balance is charged:** "When you place a pre-order for delivery you will be required to pay a deposit to secure the order, with the remaining balance being charged 1-7 days before the estimated release date. We do not have the facility to accept incremental payments towards delivery pre-orders." Pickup pre-orders can be paid off in store at the nominated store (EB Games gift cards, trades, bank or credit cards).
- **If the balance charge fails:** email with instructions to update the card; "If we have not received contact from you within 10 days and your preorder remains unpaid, your order may be cancelled. Please note that pre-order hold times will depend on your EB World level."
- No separate review page is documented; "Place order" is the final action (*low confidence*).

### Step 8 - Confirmation
- "Once you are all done we will send you an email confirming we have received your order!"
- A second email with tracking arrives on dispatch; the order page has a large **"TRACK DELIVERY"** button.
- Order history: `https://www.ebgames.com.au/account/order-history` with an EB World / **Guest** toggle; delivery orders show "four options" for self-service changes (address, cancel, etc.) until processing is too far along. Tax invoice downloadable under "My Orders".
- Confirmation headline and order-number format: not verified.

### Cancelling
- Delivery orders: self-service on the order-history page; "If your order has been processed too far, you may not get the option".
- Online preorders for in-store pickup: "visit the pick-up store no earlier than 1 business day after the order online was placed"; customer service cannot cancel these.
- Reddit users report deposits are fully refundable if you change your mind (snippet only).

---

## 3. Look and feel (mostly low confidence - live CSS could not be read)

- **Logo:** "EB GAMES" wordmark. The Wikimedia SVG of the logo uses red `#db373f` and near-black `#1c1414`; the EB World logo uses red `#e1251b`. Expect a red-on-white/black brand.
- **Header (left to right):** logo, search bar, then the account **avatar icon immediately left of the cart icon** (this placement is stated twice in the help centre). A category nav row sits below (PlayStation, Xbox, Nintendo, PC, Preorders, Trading Cards, Collectibles, Toys, Clothing, Preowned, Deals, EB World - labels inferred from the site's known sections and support categories).
- **Typography:** bold uppercase sans-serif headings; plain sans-serif body. Prices as "A$129.95".
- **Product tile:** portrait box art, title, platform, price, Pre-Order badge and deposit line.
- **Product page:** art gallery left; title, platform, price, deposit and release date right; "Add to Cart"; Delivery / Click & Collect info; description; related products.
- **Help centre**: Zendesk, categories "Delivery & Collection", "Orders & Preorders", "Payment Options", "EB World", "Returns & warranties", "Trade In, Preowned & Reboot", "Gift Cards", "General & Feedback", "Announcements & Troubleshooting".

---

## 4. Quirks a clone should reproduce

1. Cloudflare bot challenge in front of every page (automation blocker; the support subdomain is challenged too, but its JSON API is open).
2. Deposit model: A$10 now, balance auto-charged to the same method 1-7 days before release; failure email, 10-day grace, hold time tied to EB World level.
3. Afterpay and PayPal Pay in 4 disappear from checkout when a preorder is in the cart; Zip works for the deposit but not for the in-store balance.
4. Code-in-box physical edition with the code "delivered" from 12 November for preload; playable 19 November.
5. Only the Standard Edition is sold; Ultimate is digital-only. The A$699.95 Vice City Collection excludes the game and sold out instantly; EB World PLUS members get early-access queues for exclusives.
6. Guest checkout with a separate "Guest" login on the order-history page.
7. Click & Collect store selection at checkout; preorder pickup windows vary by EB World level; online-for-pickup preorders can only be cancelled in store.
8. Same Day Delivery via Uber in some areas (2pm cutoff); preorders ship separately from in-stock items.
9. GST-inclusive prices, no card surcharges, one promo code per order.
10. EB World signup has a CAPTCHA and email confirmation; EB World PLUS is A$49/12 months with PLUS-only preorder prices.

---

## 5. Gaps

- No live page of `www.ebgames.com.au` was read (Cloudflare challenge via browser, WebFetch and curl). Product titles, URLs, prices and the A$10 deposit come from search snippets and Press Start.
- A$124.95 vs A$129.95 discrepancy on the PS5 listing unresolved.
- Exact CTA label on the pre-order page, add-to-cart behaviour, cart/checkout URLs, checkout field labels and order, review step, confirmation headline and order-number format are inferred.
- Header/nav/colours/typography inferred; only logo colours are sourced.
- Whether PayPal (full), gift cards or Klarna can pay a preorder deposit is not explicitly stated.
- Reddit threads and YouTube walkthroughs could not be opened; only snippets were used.

---

## 6. Sources

EB Games (blocked, listed for completeness / from snippets):
- https://www.ebgames.com.au/search?q=grand+theft+auto+vi
- https://www.ebgames.com.au/product/ps5/330056-grand-theft-auto-vi
- https://www.ebgames.com.au/product/xbox-series-x/330060-grand-theft-auto-vi
- https://www.ebgames.com.au/product/loot/385339-grand-theft-auto-vi-the-goodtime-state-vice-city-collection
- https://ebgames.com.au/product/ps5/384036-playstation-5-dualsense-wireless-controller-grand-theft-auto-vi-limited-edition-white
- https://www.ebgames.com.au/grand-theft-auto
- https://www.ebgames.com.au/featured/preorder-now
- https://www.ebgames.com.au/featured/playstation-5
- https://www.ebgames.com.au/terms
- https://www.ebgames.com.au/clickandcollect
- https://www.ebgames.com.au/ebworld/terms
- https://www.ebgames.com.au/account/order-history

EB Games help centre (read via https://support.ebgames.com.au/api/v2/help_center/en-us/articles.json):
- https://support.ebgames.com.au/hc/en-us
- https://support.ebgames.com.au/hc/en-us/articles/4656624307983-How-do-I-place-an-order-or-preorder
- https://support.ebgames.com.au/hc/en-us/articles/4656654527503-Can-I-pay-for-my-preorder-before-the-release
- https://support.ebgames.com.au/hc/en-us/articles/4656655452303-What-happens-if-my-online-preorder-payment-fails
- https://support.ebgames.com.au/hc/en-us/articles/4656630731407-How-do-I-pay-my-preorder-off-if-I-placed-online-for-pick-up-in-store
- https://support.ebgames.com.au/hc/en-us/articles/13814821212943-Do-you-ship-preorders-separately-from-other-items
- https://support.ebgames.com.au/hc/en-us/articles/5069686856335-Why-has-my-preorder-been-cancelled
- https://support.ebgames.com.au/hc/en-us/articles/4656319445135-How-do-I-cancel-my-order
- https://support.ebgames.com.au/hc/en-us/articles/4962104409743-How-do-I-track-my-order
- https://support.ebgames.com.au/hc/en-us/articles/13813901730831-Where-can-I-view-my-order-history-or-invoices
- https://support.ebgames.com.au/hc/en-us/articles/4656373549327-Updating-address-details
- https://support.ebgames.com.au/hc/en-us/articles/4656507502223-What-is-Click-Collect
- https://support.ebgames.com.au/hc/en-us/articles/4656218028687-When-will-my-Click-Collect-order-by-ready-for-collection
- https://support.ebgames.com.au/hc/en-us/articles/4656234970639-How-long-will-my-Click-Collect-order-be-held-at-store
- https://support.ebgames.com.au/hc/en-us/articles/4656257051279-What-happens-if-my-Click-Collect-order-is-rejected
- https://support.ebgames.com.au/hc/en-us/articles/4656530329871-Can-I-cancel-or-change-an-order-paid-with-Afterpay-or-Zip
- https://support.ebgames.com.au/hc/en-us/articles/13814791616911-Do-you-offer-free-shipping
- https://support.ebgames.com.au/hc/en-us/articles/4656627007759-How-long-will-it-take-to-ship-to-my-address
- https://support.ebgames.com.au/hc/en-us/articles/4656058966543-Why-is-express-post-not-an-option
- https://support.ebgames.com.au/hc/en-us/articles/13814108857103-Can-I-deliver-to-a-PO-Box-or-Parcel-Locker
- https://support.ebgames.com.au/hc/en-us/articles/4962579190927-Same-Day-Delivery-How-It-Works
- https://support.ebgames.com.au/hc/en-us/articles/4962618500239-Who-will-deliver-my-order
- https://support.ebgames.com.au/hc/en-us/articles/4962618016783-What-happens-if-I-place-my-Same-Day-Delivery-order-after-2-00pm
- https://support.ebgames.com.au/hc/en-us/articles/13814010524815-Are-there-any-surcharges-for-certain-payment-methods
- https://support.ebgames.com.au/hc/en-us/articles/13813962118159-How-do-I-use-a-promo-or-discount-code
- https://support.ebgames.com.au/hc/en-us/articles/13814028112399-Will-I-be-charged-GST-on-my-purchase
- https://support.ebgames.com.au/hc/en-us/articles/4656562541839-What-can-Afterpay-be-used-on
- https://support.ebgames.com.au/hc/en-us/articles/4656561800207-How-does-Afterpay-work
- https://support.ebgames.com.au/hc/en-us/articles/5063673319183-Who-can-use-Afterpay
- https://support.ebgames.com.au/hc/en-us/articles/4962623228687-How-does-it-work
- https://support.ebgames.com.au/hc/en-us/articles/4962101634191-Buy-now-pay-later-safely-with-PayPal
- https://support.ebgames.com.au/hc/en-us/articles/6409238468367-I-have-been-charged-the-full-amount-for-PayPal-Pay-in-4
- https://support.ebgames.com.au/hc/en-us/articles/7783517361295-PayPal-Support
- https://support.ebgames.com.au/hc/en-us/articles/4656605004303-Can-Zip-be-used-in-store
- https://support.ebgames.com.au/hc/en-us/articles/5061521707407-What-can-Zip-be-used-on
- https://support.ebgames.com.au/hc/en-us/articles/4656579213583-Who-can-use-Zip
- https://support.ebgames.com.au/hc/en-us/articles/4962655336975-How-to-checkout-with-Klarna
- https://support.ebgames.com.au/hc/en-us/articles/4962099849999-How-do-the-payments-work
- https://support.ebgames.com.au/hc/en-us/articles/5067630577167-I-am-having-issues-using-my-credit-card-on-your-site
- https://support.ebgames.com.au/hc/en-us/articles/11294594464399-How-to-create-an-EB-World-Account
- https://support.ebgames.com.au/hc/en-us/articles/4656462257935-How-do-I-activate-my-account
- https://support.ebgames.com.au/hc/en-us/articles/4656473646223-Need-your-password-reset
- https://support.ebgames.com.au/hc/en-us/articles/4656508851599-Earning-Carrots-Leveling-Up
- https://support.ebgames.com.au/hc/en-us/articles/4656708012047-What-is-the-birthday-reward-for-my-level
- https://support.ebgames.com.au/hc/en-us/articles/4656642056335-What-is-the-Game-Guarantee
- https://support.ebgames.com.au/hc/en-us/articles/13207353243919-What-is-EB-World-PLUS
- https://support.ebgames.com.au/hc/en-us/articles/13207385254415-How-much-is-EB-Plus
- https://support.ebgames.com.au/hc/en-us/articles/13207382038159-What-are-the-EB-Plus-benefits
- https://support.ebgames.com.au/hc/en-us/articles/13207422675983-Does-EB-Plus-guarantee-me-a-product-in-an-exclusive-release
- https://support.ebgames.com.au/hc/en-us/articles/4656713493263-How-do-I-become-a-Level-V-5-member
- https://support.ebgames.com.au/hc/en-us/articles/17129671984527-Price-Match-Promise

Press and guides:
- https://press-start.com.au/news/playstation/2026/06/25/heres-the-aussie-grand-theft-auto-6-prices/
- https://press-start.com.au/news/playstation/2026/06/23/heres-when-grand-theft-auto-6-pre-orders-go-live-in-australia/
- https://press-start.com.au/news/2026/06/24/heres-when-grand-theft-auto-6-pre-orders-go-live-in-australia-2/
- https://press-start.com.au/news/2026/06/24/grand-theft-auto-6s-physical-editions-wont-include-a-disc/
- https://press-start.com.au/news/2026/06/24/heres-what-in-each-of-grand-theft-auto-6s-editions/
- https://press-start.com.au/news/playstation/2026/09/04/grand-theft-auto-6-dualsense-controller-pre-order-australia/
- https://press-start.com.au/news/playstation/2026/09/25/the-grand-theft-auto-6-vice-city-collectors-edition-australia/
- https://press-start.com.au/news/playstation/2026/09/28/aussie-grand-theft-auto-6-collectors-edition-pre-orders-will-go-live-today/
- https://press-start.com.au/news/playstation/2026/09/28/the-700-grand-theft-auto-6-collectors-edition-sold-out-instantly-in-australia/
- https://press-start.com.au/?s=gta+6+pre-order
- https://gta6index.com/guides/gta-6-preorder-guide/

Community (snippets only; pages could not be opened):
- https://www.reddit.com/r/EBGAMES/comments/1ueujve/info_relating_to_gta_6_physical_preorders/
- https://www.reddit.com/r/EBGamesAus/comments/1uecx4f/gta_6_preordering/
- https://www.reddit.com/r/EBGAMES/comments/1u9izoa/gta_vi_preorders_begin_on_june_25_how_can_i/
- https://www.reddit.com/r/EBGAMES/comments/1syy9uq/are_eb_games_preorders_actually_worth_doing/

Search and branding:
- https://search.brave.com/search?q=site%3Aebgames.com.au+grand+theft+auto+vi
- https://search.brave.com/search?q=site%3Aebgames.com.au+pre-order+deposit+online+charged
- https://search.brave.com/search?q=site%3Aebgames.com.au+delivery+click+and+collect+shipping+cost+help
- https://search.brave.com/search?q=site%3Aebgames.com.au+payment+methods+afterpay+zip+paypal+gift+card
- https://search.brave.com/search?q=site%3Aebgames.com.au+EB+World+membership+levels+points+join
- https://search.brave.com/search?q=reddit+EB+Games+GTA+6+pre-order+online+deposit+EB+World
- https://search.brave.com/search?q=EB+Games+Australia+guest+checkout+online+order+without+account+help
- https://en.wikipedia.org/wiki/EB_Games
- https://upload.wikimedia.org/wikipedia/commons/1/12/Logo_of_EB_Games.svg
- https://upload.wikimedia.org/wikipedia/commons/0/0b/Ebworld_logo_bck.svg
