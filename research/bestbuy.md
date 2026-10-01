# Best Buy (US) — pre-ordering Grand Theft Auto VI

Researched 2026-09-29 in the built-in browser (own background tab) plus Best Buy help pages and third-party guides. Pre-order is **live** on bestbuy.com for PS5 and Xbox Series X|S at **$79.99**, Standard edition only, sold as **Code in Box** (download code, no disc; box delivers/pre-loads 11/12/26, playable 11/19/26). **Guest checkout is allowed** ("Continue as Guest"). Anything marked **(low)** was not observed directly and comes from Best Buy help pages or general knowledge.

How far the browser got: search → both product pages → Pre-order click → cart (2 items, one Pickup, one Shipping) → cart "Checkout" button → "Sign In to Best Buy" interstitial with "Continue as Guest" → guest checkout page (all steps visible, contact-info validation triggered with empty fields, card/billing form read from the DOM). No data was typed and no order was placed, so the pickup-details / shipping-details sub-steps and the confirmation page were not seen.

**Follow-up (same day, no browser):** the browser tab pool was full and the search budget spent, so the collapsed steps were filled in from Best Buy's help pages (Store Pickup, Shipping Costs & Timing, Free Shipping) and from the DOM ids / API calls encoded in open-source Best Buy checkout bots (best-buy-sniper, PhoenixBot, harebot, PS5bot, kkapuria3, ThreadedLinx, Phoenix-Bot-2.0). Those bots date from 2020-21, so ids are **(medium)** confidence; where the 2026 DOM was observed (contact, billing, card labels) they still matched. See "DOM / API map" below.

**Second follow-up (2026-09-30, browser + bundles):** a fresh background tab re-ran search → PS5 product page (Shipping selected) → `Pre-order` → cart (now 3 units: PS5 ×2, Xbox ×1) → `/checkout/r/fast-track` → guest checkout, once with everything shipped (4 steps) and once with the PS5 line switched to Pickup (5 steps). The `Add gift options` sheet was opened and the card form was read from the accessibility tree (`MM/YY` / `CVV` placeholders confirmed). Nothing was typed and no order was placed. Because the later steps stay collapsed until contact info is entered, their wording was taken from Best Buy's own checkout JavaScript: `checkout.<hash>.js` embeds the full English content dictionary (including the `thankYouPage` strings), `payment-component-forms/index-6.3.113.js` holds the card-field config and validation strings, and the lazy `checkoutV2.<hash>.js` chunks (address form, add-pickup-person form, pickup-agent radio form, gift-options body) show which strings each form uses. Those are **(medium-high)**: real strings, but layout and order were not seen rendered.

---

## Step 1 — Search

**URL:** `https://www.bestbuy.com/site/searchpage.jsp?st=grand+theft+auto+vi` (server rewrites to `...searchpage.jsp?id=pcat17071&st=grand+theft+auto+vi`)
**Page title:** `grand theft auto vi - Best Buy`

Top to bottom:

- **h1 (visually hidden):** `grand theft auto vi search results`
- **Left rail "Filters":** `Get it fast` → checkboxes `Pickup · Ready today` (`Select Store` link) and `Shipping · Get it today` (ZIP `55423` link); `Sold & shipped by` → `Best Buy`; `Category` (All Video Games, Physical Video Games, XBOX Series X|S, Show all (4)); `Compatible Platform` (search box + PlayStation 5, XBOX Series X, PlayStation 4, Nintendo Switch, Windows, XBOX Series S, XBOX One, Android, Show all (10)); `Format` (Physical, Physical (Download Code Only), CD, VINYL); `Price` (min/max + `Set`, ranges); `Brand` (Activision, Rockstar Games, Take 2 Interactive, …); `Current Deals`; `Genre`; `Upcoming and New` → `Pre-Order`; `ESRB Rating`; `Customer Rating`; `Game Franchise` (Call of Duty, Grand Theft Auto, …).
- **Result heading:** `grand theft auto vi (41)`
- **Promo banner (above the grid):** `Grand Theft Auto VI` / `Exclusive member offer available with pre-order.` / link **`Pre-order this game`** (→ franchise hub) / `Available to play Thursday, 11/19/26.`
- Chip `Current Deals On Sale`; `Sort by:` combobox `Best Match`.
- **Product tiles** (grid, lazy-loaded as you scroll):

  | Tile text, in order |
  |---|
  | badge `Best Selling` |
  | box-art image |
  | `Grand Theft Auto VI - (Code in Box, Delivers 11/12/26, Playable 11/19/26) - PlayStation 5` (link) |
  | `ESRB Ratings: RP (Rating Pending)` |
  | `Publisher: Rockstar Games` |
  | `Release Date: 11/12/2026` |
  | `Not yet reviewed` |
  | `$79.99` (price module; renders after the tile is in view) |
  | yellow button **`Pre-order`** |
  | `Compare` checkbox · heart `Save` button |

  The Xbox tile is identical with `- XBOX Series X, XBOX Series S`. The first two tiles were the vinyl (`New! - Grand Theft Auto VI: The Album - Best Buy Exclusive - Clear Pink with Purple Splatter Vinyl - Includes Exclusive 12x24 poster`) and the CD (`New! - Grand Theft Auto VI: The Album - CD`), both `Release Date: 11/19/2026`, `Pre-order`. Released games show `Add to cart` and a star rating (`4.3 (64 reviews)`).
- Bottom: `17 of 41 products` · **`Show more`** · `Related searches` chips (`gta 6`, `ps5`, `ps5 controller`, `playstation 5`, `grand theft auto 6`) · several `Sponsored` slots.

Filtered URL used to isolate the games: `/site/searchpage.jsp?id=pcat17071&qp=category_facet%3DPhysical+Video+Games%7Epcmcat1487699281907&st=grand+theft+auto+vi`.

**Franchise hub** `https://www.bestbuy.com/site/video-game-franchises/grand-theft-auto/pcmcat301800050002.c?id=pcmcat301800050002` (title `Grand Theft Auto VI - Best Buy`): hero `Grand Theft Auto VI — Pre-order your copy now and check out an exclusive offer. — Available to play Thursday, 11/19/26.`; sections `Pre-order Grand Theft Auto VI` (the two SKUs), `Pre-order the music` (vinyl, CD), `Pre-order Limited Edition controller` (`Sony Interactive Entertainment - DualSense Wireless Controller – Grand Theft Auto VI Limited Edition for PS5, PC, Mac & Mobile - White`), `Exclusive My Best Buy offer — Plus and Total members get 10x rewards with pre-order of Grand Theft Auto VI. Exclusions, terms and conditions apply.` [`Pre-order`], `Sign up to receive notifications about Grand Theft Auto VI` (email field `Enter your email address`, `Sign up to be notified`), `About Grand Theft Auto VI`. **No Ultimate Edition, disc, or digital SKU exists on Best Buy.**

## Step 2 — Product page

**PS5 URL:** `https://www.bestbuy.com/product/grand-theft-auto-vi-code-in-box-delivers-11-12-26-playable-11-19-26-playstation-5/JXHY5RW2JZ/sku/6684968`
**Xbox URL:** `https://www.bestbuy.com/product/grand-theft-auto-vi-code-in-box-delivers-11-12-26-playable-11-19-26-xbox-series-x-xbox-series-s/JXHY5RKPCY` (SKU 6684969)
**Pattern:** `/product/<slug>/<productId>[/sku/<skuId>]`
**Page title:** `Grand Theft Auto VI (Code in Box, Delivers 11/12/26, Playable 11/19/26) PlayStation 5 - Best Buy`

Layout (two columns; gallery left, buy box right; long content below):

1. Breadcrumb `Best Buy > Video Games > All Video Games > Physical Video Games`, link `Shop Rockstar Games`.
2. Badge `Best Selling` `In PS5 Games`.
3. **h1:** `Grand Theft Auto VI - (Code in Box, Delivers 11/12/26, Playable 11/19/26) - PlayStation 5`
4. Meta line: `ESRB Rating: RP (Rating Pending)` · `SKU: 6684968` · `Release Date: 11/12/2026` · `Reviews coming soon` · `Sold by Best Buy`.
5. Image gallery (thumbnails + `View All Images`): box art (PS5 cover, Lucia/Jason art), a `PRE-ORDER BONUS OCEAN VIEW VINTAGE VICE CITY PACK` promo image, screenshots.
6. `About this product` — description begins `Vice City, USA. Jason and Lucia have always known the deck is stacked against them…` then the retailer notes: `This product will only contain a download code inside the box to support pre-load starting on November 12. A disc will not be included in the box. Pre-order to receive the Vintage Vice City Pack. The Grand Theft Auto VI: Ultimate Edition Upgrade will also be available for Grand Theft Auto VI: Standard Edition owners to purchase separately at any time…` `See more`.
7. `Compatible Platform(s): PlayStation 5` — chips `PlayStation 5` (selected) · `XBOX Series X / XBOX Series S` · `+ 4 more` (each chip is a link to a separate listing).
8. **Buy box:** price `$79.99` (big `$` `79` `99`), `or 4 payments starting at $20.00 with [Zip] Learn more >`.
   `Availability` — two radio cards:
   - **`Pickup` — `Ready on Release Date`** (default, checked) → helper line `Order now for pickup on Release Date at Compton` (store from geolocation; `Your Store: Compton` button in header).
   - **`Shipping` — `Delivered on or shortly after Release Date`** → helper line `FREE shipping to 90001`.
   Big yellow button **`Pre-order`** (271×48 px, 8 px radius, #FFE200, dark text). Beside it: heart `Save`, `Deal Alert`. Below: `Sold by Best Buy`, link `Return & Exchange Policy`.
   `Finance options` — `10% back in rewards on your first day of purchases when approved for the My Best Buy® Credit Card or choose financing`; `Buy now. Pay later. 4 payments starting at $20`.
9. `Key Accessories:` carousel — vinyl `$49.98` [`Pre-order`], CD `$17.98` [`Pre-order`]; `Related Item` (Sponsored, e.g. `Halloween: The Game - PlayStation 5 $39.99`).
10. `Features`: `Download code` (…no disc…), `Pre order` (`Pre-order to receive the Vintage Vice City Pack.`), `Single player` (`Grand Theft Auto VI is a single-player experience.`), `See all features`.
11. `Specifications`: `ESRB Rating RP (Rating Pending)`, `Compatible Platform(s) PlayStation 5`, `Software Format Physical (Download Code Only)`, `See all specifications`.
12. `Reviews` (none), `Featured products` (Sponsored Meta Quest tiles), `Compare similar products` (PS5 vs Xbox GTA VI, other games), `Questions & Answers` (customer Q&A such as `Where is ultimate version?`), `Level up your game` carousel.

No quantity selector, no protection-plan modal, no cross-sell modal on click.

## Step 3 — Add to cart

Clicking **`Pre-order`** adds the SKU with the selected fulfillment and **navigates straight to `/cart`** (no modal, no drawer, no toast). The header cart link becomes `cart, 1 item`. Clicking Pre-order on the second SKU behaves the same (`cart, 2 items`).

## Step 4 — Cart

**URL:** `https://www.bestbuy.com/cart` · **title** `Cart - Best Buy` · **h1** `Your Cart`
(Before the cart XHR resolves the page briefly shows `Your cart is empty` / `Have an account? Sign in to see your cart`.)

Each line item:

```
[thumbnail]  Grand Theft Auto VI - (Code in Box, Delivers 11/12/26, Playable 11/19/26) - PlayStation 5   (link)
             Final sale. Not returnable.            (brown text)
             Sold by Best Buy        badge: Pre-order
             Item Availability
               ( ) Pickup at Compton — Pickup on Release Date        ← "Select a store to see availability" if none
               (•) FREE Shipping to 55423 — Delivered on or shortly after Release Date
             Item Quantity [1 ▾]  (options 1, 2, 3)
             Save for later   Remove
                                                                   Price  $79.99
```

Right column **`Order Summary`**: `Subtotal $159.98` · `Shipping FREE` · `Store Pickup FREE` · `Estimated Sales Tax $15.82` · `Total $175.80` · yellow **`Checkout`** button (#FFE000, 4 px radius) · PayPal button with `By using PayPal Checkout, you agree to Best Buy's Terms & Privacy Policy` · `My Best Buy® members enjoy exclusive offers & free shipping on eligible items with no minimum purchase. Sign in or create an account now` · `10% back in rewards on first day of purchases or flexible financing for new My Best Buy® Credit Cardmembers. Show me how >` · `Looking for a lease to own option? Enjoy the tech you want today. Learn more >` · `4 payments starting at $43.95 — Select Zip under 'Other payment options' when checking out.` · `Buying a gift for someone special? Gift options can be added in checkout. Learn more >` · `Disclaimers`.

Below the items: `Saved Items — Your list is currently empty — Need inspiration? Check out recommended items, or search for items to save.` and a `People also bought` carousel. A Blue Assist chat bubble floats bottom-right (`Best Buy Help. Hi, need shopping advice or product support? Let me know.` with chips `Price Match`, `Change Shipping or Pickup`, `Payment Methods`). There is **no promo-code box on the cart** (it lives in checkout).

## Step 5 — Sign in or continue as guest

Clicking **`Checkout`** (a `<button>`, posts to `/checkout/r/fast-track`) sends a signed-out shopper to `https://www.bestbuy.com/identity/signin?token=…` · **title** `Sign In to Best Buy`. Header: logo + `Return to cart`.

Two columns:

- **`Returning Customers`** — `Sign in for faster checkout.` · field `Email Address` · checkbox `Keep me signed in.` (info: `We'll keep you signed in on this device.`) · `By continuing or signing in, you agree to our Terms and Conditions, Privacy Policy, and My Best Buy™ Terms.` · **`Continue`** (submit; password is requested on the next screen — not opened) · `Sign in with a Passkey` · `Sign in with Apple` · `Sign in with Google`
- `or`
- **`New Customers`** — `Don't have an account? No problem, you can check out as a guest. You'll have the option to create an account during checkout.` · `By continuing as guest, you agree to our Terms and Conditions and Privacy Policy.` · **`Continue as Guest`**

(The generic sign-in page `/identity/global/signin` is the same form titled `Sign in or create your account` with `Don't have an account? Create an account` → `/identity/newAccount`.) Deep-linking `/checkout/r/fast-track` skipped this screen and opened the guest checkout directly.

## Step 6 — Checkout (single page, numbered accordion)

**URL:** `https://www.bestbuy.com/checkout/c/standard` · **title** `Checkout – Best Buy`
Header: blue bar with logo only; `Back to cart` link with item-count badge; **h1 `Checkout`**; running `Total: $88.59` (one PS5 pickup item) / `$175.80` (two items).

Steps depend on the fulfillment mix (all three observed). Pickup-only cart: **1 Contact info → 2 Pickup details → 3 Payment method**. Shipping-only cart: **1 Contact info → 2 Shipping address → 3 Shipping details → 4 Payment method**. Mixed cart: **1 Contact info → 2 Shipping address → 3 Shipping details → 4 Pickup details → 5 Payment method**.

**1 Contact info** (open by default)
- `Email address` (type email)
- `Phone number` (type tel)
- `By placing your order, you agree that Best Buy or its authorized service partners may call or text you at the phone number above to fulfill your order, or with information about your purchase, including delivery and scheduling. Calls may be live or pre-recorded and may be automated. Message/data rates may apply.`
- `Opt-in for text updates` → checkbox `My orders, services and appointments`
- blue **`Continue`** (#014FD3)
- Validation seen with empty fields: `Please enter an email address.` and `Please enter a phone number.` (inline, under each field).

**2 Shipping address** (only with a shipped item; collapsed — labels from the 2026 checkout bundle + `address-form` chunk, **high**; layout **medium**)
- `First name` (maxLength 50) · `Last name` (50)
- `Address` (maxLength 35; Smarty type-ahead with `Show Suggestions` / `Hide Suggestions` toggle; help links `Military`, `Non-US Address`)
- link `Add Apt., Suite, Floor (optional)` reveals `Apt., Suite, Floor (optional)`
- `City` · `State` (select, placeholder `Select`: AL…WY incl. AA/AE/AP, DC, PR, GU, VI, AS, MP) · `ZIP code`
- checkboxes: `Save this address to my profile` and `Make this my default shipping address` (signed-in only) and **`Use as billing address`** — DOM id `useAsBillingCheckbox`, form field `useAsBilling`; rendered only while the order has no billing address yet and **initially checked** for a new address, so billing = shipping by default (medium-high). 2021 bot id for the same box: `save-for-billing-address-ui_address_2` (the bot un-checks it before typing a separate billing address).
- Notices: `Note: If you ship to a PO BOX, it can take up to a week longer to receive your item than shipping to a residential or business address.`; unverifiable address → alert `We are unable to verify the address, please make sure address you entered is correct.` and modal `We're unable to verify this address.` / `Please make sure the address you entered is correct.` → `Update address` / `Keep as entered`; `Please check your address` / `The address you entered may need an apartment, unit, or suite number.`
- Validation: `Please enter a first name.` / `Please enter a valid first name.`, `Please enter a last name.` / `…valid last name.`, `Please enter address.` / `Please enter a valid address.` / `Delivery is unavailable to P.O. Box addresses. Please enter a physical address.`, `Please enter city name.` / `…valid city.`, `Please enter a ZIP code.` / `…valid ZIP code.`
- **No phone field** here (phone is step 1). Toast after saving: `Shipping address updated`.
- **`Continue`** (`.button--continue button`)

**3 Shipping details** (collapsed — logic sourced from the checkout bundle, **medium-high**)
- Rows come from `items[].metadata.fulfillmentOptions.shippingDetail.levelOfServices[]` (id + `totalPrice`/`offerTotalPrice`; chosen value `items[].fulfillment.levelOfService`). `$0` prints as `FREE`; headings are date-based — `Get it by {date}`, `Get it` (today), `As soon as`, `Should ship by` — never carrier tiers. Best Buy help: `During checkout, you can choose an estimated arrival date from the options provided.`
- Pre-order heading by `displayDateType`: `FULFILL` → **`Delivered on or shortly after Release Date`** (or `…shortly after {date}`); `IN_HAND` → `Get it by Release Date` / `Get it by {date}`; `NONE` → `Release date not yet available` + `We'll notify you when it's ready to ship`. GTA VI shows `Delivered on or shortly after Release Date` in the summary (observed).
- **The method chooser is not rendered when an item has exactly one level of service and it is FREE** (`levelOfServices.length === 1 && price === "FREE" → null`), so for this SKU expect only the item card with `Delivered on or shortly after Release Date` and no radio row. Whether the API also offers a paid expedited level for the pre-order is unverified **(low)**.
- Gift options: the control is **`Add gift options`** in the Summary panel (observed; `Edit gift options` once saved). It opens a side sheet **`Gift options`** (dialog, `Close Sheet`) listing each item: shipped items → checkbox **`Include gift message`** (observed) revealing `Recipient email address` + `Gift message` (150 chars, `Characters Remaining`); pickup items → **`Include gift receipt`** with `You'll receive a gift receipt when you pick up your item.` Button **`Save gift options`**; toast `Gift options updated`. Errors: `Please enter a gift message.`, `Edit message to remove inappropriate language.`, `Your gift message contains some special characters that we don't recognize. Please revise your message.` No separate gift control was seen inside the collapsed step (medium).

**4 / 2 Pickup details** (collapsed — strings from the checkout bundle and its `add-pickup-person` / `pickup-agent-radio-form` chunks, **high** for wording, **medium** for layout) — store `Compton`, `Pickup on Release Date` / `We'll notify you when it's available for pickup` (summary, observed); API fulfillment type `inStorePickup` (2021 bots: `IN_STORE_PICKUP`).
- There is **no "Me / Someone else" radio**. The step shows a **`Pickup person`** row that defaults to the shopper — rendered `{name} (Name on billing address)` or `You (Name on billing address)` — with a call-to-action button (`id="changePickupPersonButton"`, same style as the `Edit` links on address cards) that opens a sheet titled **`Pickup person`**.
- Guest sheet (add-pickup-person form): **`First name`**, **`Last name`**, **`Email address`**, **`Phone number`** (autocomplete given-name / family-name / email / tel; phone stripped to digits), checkbox `Remember for future pickups` (`addToProfileCheckbox`), primary button **`Confirm pickup person`** (older modal: title `New Pickup Person`, button `Continue`). Toast `Pickup person updated`; guard `Save your pickup person selection to continue.` → the name is **two fields**.
- Signed-in sheet: radio list `Name on billing address` + saved persons (name, email, phone, `Edit`) + `Add new pickup person`.
- The thank-you page then prints `Make sure {First} {Last} brings their photo ID and your order number to the store.` Other pickup strings: `Pickup location`, `Method` (`Counter` / `In-Store` / `Locker`; `Curbside pickup — app only`), `Photo ID required`, `Only the person named on the billing address is allowed to pick up this order.`
- Help page rules unchanged: `You'll need to provide the pickup person's name, email address and phone number.`; bring `your government-issued photo ID` + `Your order number`; `We'll hold your items at the store for 5 days`; `Ready for pickup` email `is a separate email from your order confirmation`; pickup-person changes within 5 days.

**Payment method** (form is in the accessibility tree even while collapsed, but off-canvas until the step opens)
- Card logos: `My Best Buy Consumer Credit Card`, `My Best Buy Visa`, `Mastercard`, `Visa`, `Discover`, `Amex`, `Union Pay`, `JCB`
- `Card number` (2026 id `number`, inputmode number, maxLength 19, no placeholder; 2021 bot id `#optimized-cc-card-number`) · `Expiration date` (**one input**, id `expirationDate`, placeholder **`MM/YY`** — observed) · `Security code` (id `cvv`, type tel, maxLength 4, placeholder **`CVV`** — observed; icon `the security code is the 3 digit CVC code found on the back of the card`, 4 for Amex; SR text `Enter the 3- or 4-digit security code associated with your card.`)
- Validation (payment-component bundle; one message per field for empty or malformed input — medium): **`Please enter a valid card number.`**, **`Please enter a valid expiration date.`**, **`Please enter a valid Security Code.`**; `Card not accepted, please use a different card.`; billing `Please enter a first name.` / `…last name.` / `Please enter a valid address.` / `Please enter a city.` / `Please select a state.` / `Please enter a ZIP code.` Card banners: `Your credit card is expired. Please use a different card or update the expiration date.`, `Your card expires in 15 days…`, and for pre-orders `Your credit card is expiring soon. Since one of your items won't be charged until it's available, we need you to use a different card for this order.` Saved cards: `Confirm your security code` / `Confirm and place order`; `Save this card to my profile`, `Make this my preferred card`.
- **`Billing address`**: `First name`, `Last name`, `Address` (`Military` / `Non-US Address` links, `Add Apt., Suite, Floor (Optional)`), `City`, `State` (select), `ZIP code` (`payment.billingAddress.*`). You fill this for a pickup-only cart (no shipping address, as observed) or when `Use as billing address` was unchecked in the Shipping address step; **there is no "Same as shipping" checkbox in this step**. With the box checked, the component's other view — a read-only `billing-info` address-card list (`Use saved address` / `Add new` / `Save`; edit flow `Update Address` / `Keep Address as Entered`) — is expected in place of the form **(medium-low, inferred from the bundle)**.
- `or` → PayPal button (`Finance charge may apply` — PayPal Pay Later messaging)
- `Add gift card, store credit or discount code` (expander; sheet `Add gift card or code`, input `Card number or discount code` + PIN, hints `15, 16 or 18-digit numbers. PIN required.` / `Letters and/or numbers. PIN not required.`, errors `Please enter a valid gift card number.` / `Please enter a valid gift card or discount code.` / `Please enter a valid PIN.`)
- Zip appears under `Other payment options` (per cart copy) **(low)**; payment-component feature flags: applePay, payWithPoints, giftCards, promoCodes, paypal, buyNowPayLater, threeDSecure
- `By clicking place order, you agree to Best Buy's Terms & Privacy Policy.`
- yellow **`Place order`** (#FFE200; `.button--place-order button.btn-primary`)

**Summary panel (right):** `Pickup on Release Date` / `We'll notify you when it's available for pickup` (pickup item) and `Delivered on or shortly after Release Date` (shipped item); item title; `Final sale. Not returnable.`; `Sold by Best Buy`; `$79.99`; `Subtotal $79.99`; `Store Pickup FREE`; `Shipping FREE`; `Est. Sales Tax $8.60`; `Apply for a tax exempt account`; `Total $88.59`; `Add gift options`. With a shipped subtotal of $100+ to the default 55423 (MN) ZIP a `Road Improvement and Food Delivery Fee $0.50` line (link to the sales-tax help page) appears; `Store Pickup FREE` appears only when a pickup item is in the cart; a random `We'd like your feedback!` survey dialog (`Yes` / `No`) can overlay the page.

Footer: `Returns & Exchanges` · `Get Support` · `Give Feedback` · `Terms & Conditions` · `Privacy` · `Interest-Based Ads` · `Prices and offers are subject to change. © 2026 Best Buy. All rights reserved. …`

There is **no separate review page**; the summary panel is the review and `Place order` is the final click.

## Step 7 — Confirmation (not rendered; copy sourced from the checkout bundle)

No order was placed, so the page was never rendered. **Sourced:** the URL is `https://www.bestbuy.com/checkout/r/thank-you` (checkout bots detect success by landing on it), the order number format is `BBY01-###########` (e.g. `BBY01-80665361421`), and the page copy comes from the `thankYouPage` strings inside `checkout.0213d23….js` **(medium-high)**:

- **h1 `Thanks for your order!`** · `Order #: {orderId}` (also `Checkout complete`, `Transaction ID: …`)
- **`We're sending a confirmation email to {email}`** (redesign string; older layout: `For all your order details, check out the confirmation email we're sending to **{email}**.`)
- Shipped items: `Ship to` + `Your order will arrive by Release Date: **{date}**.` (variants `Your order will arrive by **{date}**.`, `Your order will ship by **{date}**.`, `We'll send you an email when your order is ready to ship`)
- Pickup items: `Your order will be ready for pickup on Release Date: **{date}** at **{store}**.` + `We'll send you an email when it's ready for pickup.` (or `We'll begin prepping your order and notify you when your order is ready for pickup.`); alternate pickup person → `Make sure **{First} {Last}** brings their photo ID and your order number to the store.`; `Curbside pickup — app only` / `You'll need the Best Buy app to use curbside pickup.`
- Guest create-account block: heading `Create an account`, checkbox `Save your details securely for faster checkout next time.`, disclaimer `By creating an account and saving your details, you agree to our Terms and Conditions, Privacy Policy, and My Best Buy™ Terms.`; success `Welcome to the Club!` / `You've successfully created a My Best Buy account!`; failure `Create Your Account` / `Sorry, but we were unable to create your account. Please try again.`
- SMS opt-in variant: `Thanks for signing up!` / `We'll be sending you a confirmation text shortly.`; marketplace note `Your purchase is split into multiple orders, because it includes items sold and shipped by a Marketplace Seller.`

**Still unverified (low):** section order and the totals / payment-summary layout. **Confirmation email:** a Feb-2021 WeSupply review describes the header `Thanks for your order` with per-fulfillment sections (Store pickup / Ship to home / Ship to store) and a `View the order` link (medium-low); the subject line and body sentence were not found (Baymard's receipt pages are paywalled). Best Buy help confirms the email exists (`Ready for pickup` `is a separate email from your order confirmation`); Terms: `Our order confirmation to you does not signify our acceptance of your order`.

## DOM / API map (for the synthetic environment)

From open-source Best Buy checkout bots (2020-21) — selectors **(medium)**, endpoints **(medium)** — plus the 2026 rows, which come from the live checkout / payment bundles **(medium-high)**.

| Where | Selector / endpoint |
|---|---|
| Cart shipping radio | `[name=availability-selection][id*=shipping]` |
| Cart ZIP change | `.change-zipcode-link` → `.update-zip__zip-input` |
| Cart checkout | `.checkout-buttons__checkout button` (→ `/checkout/r/fast-track`) |
| Guest button | `.cia-guest-content .js-cia-guest-button` |
| Checkout container | `.checkout__container .fulfillment` |
| Contact info | `user.emailAddress`, `user.phone`, `#text-updates` (API `smsOptIn`) |
| Shipping address | `consolidatedAddresses.ui_address_2.{firstName,lastName,street,street2,city,state,zipcode}`, `save-for-billing-address-ui_address_2` |
| Card | `#optimized-cc-card-number`, `#credit-card-cvv` (older `#cvv`) |
| Billing | `payment.billingAddress.{firstName,lastName,street,city,state,zipcode}` |
| Step continue | `.button--continue button` |
| Place order | `.button--place-order button.btn-primary` / `.button__fast-track` |
| Success | URL `/checkout/r/thank-you` |
| 2026 shipping address | `useAsBillingCheckbox` (`Use as billing address`, default checked); fields `firstName` / `lastName` / `addressLine1` / `addressLine2` / `city` / `state` / `postalCode`; `saveToProfile`, `defaultAddress` |
| 2026 pickup person | `changePickupPersonButton` → sheet fields `firstName` / `lastName` / `emailAddress` / `phoneNumber`, `addToProfileCheckbox`, `Confirm pickup person` |
| 2026 card | `number` (maxLength 19), `expirationDate` (placeholder `MM/YY`), `cvv` (placeholder `CVV`, maxLength 4); billing form class `payment-component-billing-address` |
| 2026 gift options | sheet `Gift options`: `includeGiftMessage` / `includeGiftReceipt`, `emailAddress`, `giftMessage` (150) → `Save gift options` |
| 2026 fulfillment | `items[].fulfillment.type` = `shipping` / `inStorePickup`; `items[].fulfillment.levelOfService` ← `metadata.fulfillmentOptions.shippingDetail.levelOfServices[].id` |
| Bundles | `/~assets/bby/_com/checkout.<hash>.js` (content dictionary incl. `thankYouPage`), `/~assets/bby/_com/payment-component-forms/index-6.3.113.js`, lazy `/~assets/bby/_com/checkoutV2.<hash>.js` chunks (map in `v2Runtime.<hash>.js`) |
| API: contact | `PATCH /checkout/orders/{orderId}` `{emailAddress, phoneNumber, smsNotifyNumber, smsOptIn}` |
| API: fulfillment | `PATCH /checkout/orders/{orderId}` `{items:[{id, type:"DEFAULT", selectedFulfillment:{shipping:{address:{firstName,…,useAddressAsBilling,giftMessageSelected}, levelOfService}}}]}`; types `SHIPPING` / `IN_STORE_PICKUP` |
| API: card | `PUT /payment/api/v1/payment/{paymentId}/creditCard` `{creditCard:{number(encrypted), expMonth, expYear, cvv, type, binNumber}}` |
| API: submit | `POST /checkout/orders/{orderId}/` |

## Charging / policy facts

- Terms & Conditions: `we will preauthorize your order amount (including for pre-orders) with your payment method at the time you place the order` … `If a preauthorization of a pre-order expires before fulfillment, the preauthorization will be reversed and another preauthorization will be made closer to the confirmed availability date.` Charge is taken when the item ships / is ready for pickup (Deku Deals, QuerySprout).
- Free shipping: `orders $35 and up`; the `$35 minimum does not apply to My Best Buy™, My Best Buy Plus™ or My Best Buy Total™ members`; Plus/Total get free 2-day.
- Membership: My Best Buy free · Plus `$29.99/year` · Total `$199.99/year`; GTA VI promo: Plus/Total members get 10x rewards (~$7.99 in points).
- Zip: pay-in-4 (or 8), first instalment at checkout, `select Zip under 'Other Payment Options'`.
- Returns: opened video games exchange-only for identical item; codes/digital content non-returnable — hence `Final sale. Not returnable.` on this SKU; standard window 15 days.
- Pickup changes (store or person) must be requested within 5 days; unclaimed pickups cancelled and refunded after 5 days.

## Look and feel

- **Header:** blue bar `#0046BE` — yellow price-tag logo (link `best buy home`) · wide white search box (`Search Best Buy`, magnifier `Submit search`) · `Your Store: Compton` · account button · cart icon with count. Second row white: `Shop`, `Deals`, `Support & Services`, `Discover` mega-menu buttons + link row (Sports Hub, Top Deals, Deal of the Day, Gift Ideas, Best Buy Membership, Financing & Rewards, Gift Cards, Trade-In, Best Buy Business). A light-blue utility band `#F1F8FF` appears under the header. Checkout/sign-in pages strip this to a blue bar with the logo and a `Back to cart` / `Return to cart` link.
- **Colors:** primary blue `#0046BE`; link blue `#0457C8`; action yellow `#FFE200` (product page, place order) / `#FFE000` (cart checkout); checkout Continue blue `#014FD3`; body white `#FFFFFF`; text `#040C13`; warning text (`Final sale`) `#983E00`.
- **Type:** proprietary `Human BBY Digital` (falls back to Arial/Helvetica); 13 px base, product h1 20 px weight 500; prices set as big dollars with superscript cents.
- **Product tile:** vertical card — badge, image, title link, ESRB/publisher/release-date lines, `Not yet reviewed` or stars + count, price, full-width yellow `Pre-order`/`Add to cart` button, `Compare` checkbox and heart.
- **Product page:** gallery left, buy box right (price → Zip line → Availability radio cards → yellow Pre-order → Sold by / return policy → Finance options), then accessories carousel, Features, Specifications, Reviews, Compare, Q&A.
- **Cart:** items left in white cards with per-item fulfillment radios; sticky Order Summary card right with yellow Checkout, PayPal, membership and financing promos.
- **Checkout:** numbered accordion steps left (`1 Contact info`, `2 …`), sticky Summary right, blue Continue per step, yellow Place order under the total.

## Quirks

- `Pre-order` → straight to `/cart`; no confirmation modal.
- `Release Date: 11/12/2026` on the listing is the ship/pre-load date; play date is 11/19/26 (in the title).
- Code-in-box only; Ultimate Edition is not sold — the page tells you to buy the upgrade on PlayStation/Xbox stores after redeeming the code.
- `Final sale. Not returnable.` on a physical box.
- Store (`Compton`) is auto-selected from geolocation and Pickup is the default fulfillment; shipping ZIP defaults to `55423` (Best Buy HQ) until location is known.
- Checkout steps vary with the fulfillment mix (3, 4 or 5 steps: pickup-only / shipping-only / mixed); one page, no separate review page.
- Guest checkout via `Continue as Guest`; deep link `/checkout/r/fast-track` skips the interstitial.
- Estimated sales tax appears before any address (store/ZIP based).
- Quantity capped at 3 in the cart; no quantity control on the product page.
- Heavy membership upsell (search banner, franchise hub 10x rewards, cart, sign-in page) and BNPL (Zip) messaging; PayPal available from the cart.
- Search grid and cart list lazy-render only in-viewport content — an agent that doesn't scroll sees fewer tiles and an "empty" cart.
- Pickup needs photo ID + order number; the alternate pickup person is set from the `Pickup person` row (defaults to you) via a sheet with First name / Last name / Email address / Phone number — no "Me / Someone else" radio; 5-day hold.
- "Billing = shipping" is the `Use as billing address` checkbox in the **Shipping address** step (default checked), not in Payment; pickup-only carts therefore always show the full billing form.
- Shipping rows are labelled by estimated arrival date and offered per item, and the chooser is hidden when the only option is FREE (expected for this pre-order); gift options are per item (`Include gift message` for shipped, `Include gift receipt` for pickup).
- Success page is `/checkout/r/thank-you` — `Thanks for your order!`, `Order #: …`, `We're sending a confirmation email to …`, plus a guest `Create an account` checkbox (`Save your details securely for faster checkout next time.`).
- Minnesota's `Road Improvement and Food Delivery Fee $0.50` shows up in checkout when $100+ ships to the default 55423 ZIP; the cart says `Estimated Sales Tax: Calculated in checkout` once an item is set to Shipping.
- Pre-order card check: `Your credit card is expiring soon. Since one of your items won't be charged until it's available, we need you to use a different card for this order.`
- Zip copy scales with the cart (`4 payments starting at $20` → `$43.95` → `8 payments starting at $30.00` at $239.97); Apple Pay is switched on in the payment component but only renders in Safari.
- A `We'd like your feedback!` survey dialog can pop over the checkout page.

## Sources

Best Buy (browsed): search results; filtered search (Physical Video Games); PS5 product page (JXHY5RW2JZ / SKU 6684968); Xbox product page (JXHY5RKPCY / SKU 6684969); franchise hub pcmcat301800050002; `/cart`; `/identity/signin?token=…` (checkout interstitial); `/identity/global/signin`; `/checkout/r/fast-track` → `/checkout/c/standard`.

Best Buy (fetched): Help Center pcmcat204400050014; Shipping, Delivery & Store Pickup pcmcat316000050003; Shipping Costs & Timing pcmcat203400050006; Free Shipping pcmcat276800050002; Store Pickup pcmcat204400050014; Change shipping/pickup pcmcat316000050009; Return & Exchange Policy pcmcat260800050014; Terms and Conditions pcmcat204400050067; Zip BNPL pcmcat1727878406362; Best Buy Membership pcmcat1679668833285.

Third party: slickdeals.net/f/19843152 (10x rewards deal thread); dekudeals.com/articles/pre-order-video-games; querysprout.com/best-buy-pre-order-policy; gematsu.com (pricing, Ultimate, bonus); hothardware.com GTA 6 preorder guide; shacknews.com/article/149756; manofmany.com GTA 6 pre-order pricing; gfinityesports.com pre-orders explained; docs.runalloy.com/best-buy/shopper-experience; baymard.com Best Buy receipt benchmark (order-number format; page paywalled); videogameschronicle.com (Best Buy affiliate pre-order campaign).

Open-source Best Buy checkout bots (DOM ids, API endpoints, thank-you URL): github.com/UncleBen58/best-buy-sniper (src/pages/bestbuy.ts — shipping/billing/card selectors, save-for-billing checkbox); github.com/Strip3s/PhoenixBot (sites/bestbuy.py — `/checkout/r/thank-you` success check, guest flow); github.com/nubonics/harebot (sites/bestbuy.py — checkout API payloads: useAddressAsBilling, giftMessageSelected, availableLevelsOfService, creditCard PUT); github.com/eg9y/PS5bot (BESTBUY_FLOW.md — user.emailAddress/user.phone, optimized-cc-card-number, payment.billingAddress.*); github.com/kkapuria3/BestBuy-GPU-Bot (best-buy-tm.js — cvv ids, text-updates/smsOptIn, fast-track URL); github.com/ThreadedLinx/BestBuy_Checkout_Bots; github.com/ahmedmani/Phoenix-Bot-2.0 (SHIPPING / IN_STORE_PICKUP fulfillment types); github.com/LeonShams/BestBuyBulletBot; github.com/nickconnors/RTX-3070-Best-Buy-Bot. Also bestbuy.com/checkout/r/thank-you (URL only) and bestbuy.com/profile/ss/guestorderlookup (guest order lookup entry point).

Best Buy checkout JavaScript (fetched 2026-09-30 and read offline; script URLs listed from the live checkout page): `https://www.bestbuy.com/~assets/bby/_com/checkout.0213d23b5b614f9df8b0d2e8f458c559.js` (content dictionary: `thankYouPage`, `giftOptions`, `addPickupPersonModal`, `preOrderMessage`, `useAsBillingAddress`, validation strings, `Road Improvement…` fee label); `…/payment-component-forms/index-6.3.113.js` (card-field config: `MM/YY`, `CVV`, maxLengths, `Please enter a valid card number.` etc., billing list/form views, feature flags); `…/v2Runtime.e40289c2328a3b46930df7549f18f305.js` (chunk map); lazy chunks `checkoutV2.6d9fd3aa580a8da24d26969d0a474c44.js` (add-pickup-person drawer form), `checkoutV2.9a926e243a05907f9b284ac7ff00fab7.js` (add-pickup-person modal), `checkoutV2.643a2da0787194a51e8254f3adc5d382.js` (pickup-agent radio form), `checkoutV2.0a5dd269bfaccde29a44e6788b32927f.js` (gift-options body), `checkoutV2.33050a9e377b2bfcb6e357869df9e027.js` (address form). Third party: wesupplylabs.com Best Buy UX & post-purchase review (Feb 2021: confirmation-email header `Thanks for your order`, thank-you page pickup notices); enervee.com support (on-screen confirmation + email); support.ouraring.com Purchases from Best Buy US (`Pick Up Details` at checkout).
