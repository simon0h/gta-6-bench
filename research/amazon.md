# Amazon (US) — GTA VI pre-order flow, as observed 2026-09-29

Live browsing worked (no captcha) for search, both product pages, the sign-in wall, the empty cart and the sign-up entry screen. Everything past the sign-in wall (populated cart, checkout, confirmation) is reconstructed from Amazon's own help pages, a 2025 step-by-step checkout walkthrough and general knowledge; those parts are marked **[low confidence]**.

Summary: Amazon US sells only the **Standard edition, code-in-box, $79.99**, one ASIN per platform (PS5 `B0H6K928WL`, Xbox Series X|S `B0H6K49W6Y`). The buy box has a single orange **"Pre-order now"** button that is really *Buy Now* and goes straight to checkout; **an account is mandatory** (no guest checkout). Card is **charged when the box ships** (~Nov 12) under the **Pre-order Price Guarantee**.

---

## Step-by-step walkthrough

### 1. Search
- URL: `https://www.amazon.com/s?k=grand+theft+auto+vi` (pattern `/s?k={query}`; department-scoped `&i=videogames`).
- Header search box placeholder: **"Search Amazon"**, department dropdown defaults to **"All"**, orange magnifier button (aria "Go").
- Results header: **"1-16 of 346 results for "grand theft auto vi""**, **"Sort by: Featured"** dropdown (Featured · Price: Low to High · Price: High to Low · Avg. Customer Review · Newest Arrivals · Best Sellers), sub-line **"Check each product page for other buying options."**
- Left filter rail: Eligible for Free Shipping · Delivery Day (Get It by Tomorrow) · Condition (New / Used) · Customer Reviews (4 Stars & Up) · Price ($10 – $275+, slider + buckets) · Deals & Discounts · Brands (Rockstar Games, Nintendo, 2K) · Seller · Video Game Digital Download (Digital Download / Physical Copy) · Video Game Genre · ESRB Rating · Premium Brands · Department (PlayStation 5 Games, Xbox Series X & S Games, ...).
- The first result is the soundtrack **"Grand Theft Auto VI: The Album [Explicit]"** (MP3 / Audio CD $15.97 / Vinyl $49.98, "Pre-order Price Guarantee."). The game is result #10, a single list tile with two platform blocks:

  ```
  [cover image]  Grand Theft Auto VI - PlayStation 5 (Code in Box, Delivers 11/12/26, Playable 11/19/26)
                 ESRB Rating: Rating Pending | Nov 12, 2026 | by Rockstar Games
                 PlayStation 5                          Xbox Series X | S
                 9K+ bought in past month               2K+ bought in past month
                 $79.99                                 $79.99
                 Pre-order Price Guarantee.             Pre-order Price Guarantee.
                 FREE delivery Mon, Nov 16              FREE delivery Mon, Nov 16
                 Or fastest delivery Thu, Nov 12        Or fastest delivery Thu, Nov 12
                 This item will be released on November 12, 2026.
                 [ Add to cart ]  (yellow pill)
  ```
- Other tiles add star rating + count, "Join Prime to get FREE delivery ...", "More Buying Choices $X (N new offers)". Sponsored rows and "Renewed" GTA IV/V copies are interleaved. Pagination "Previous 1 2 3 … 20 Next".
- Searching **"grand theft auto vi ultimate edition"** returns 45 results, none of them GTA VI — Amazon US has no Ultimate ($99.99) or digital listing.

### 2. Product page (PS5; Xbox identical except where noted)
- URL: `https://www.amazon.com/Grand-Theft-Auto-VI-PlayStation-Delivers/dp/B0H6K928WL` (bare `/dp/B0H6K928WL` works; platform swatch loads the sibling ASIN with `?th=1`). Xbox: `/Grand-Theft-Auto-VI-Delivers-Playable/dp/B0H6K49W6Y`.
- Page title: "Amazon.com: Grand Theft Auto VI - PlayStation 5 (Code in Box, Delivers 11/12/26, Playable 11/19/26) : Everything Else".
- Breadcrumb: **Video Games › PlayStation 5 › Games** (Xbox: Video Games › Xbox Series X & S › Games). A sponsored banner strip sits above it.
- Three columns: image gallery (left; "Click to see full view", 5+ thumbnails, share icon), centre column, right buy box.

**Centre column, top to bottom (exact text):**
1. **Grand Theft Auto VI - PlayStation 5 (Code in Box, Delivers 11/12/26, Playable 11/19/26)** (24px, regular weight)
2. Visit the Rockstar Games Store (link)
3. Platform : PlayStation 5 | Rated: Rating Pending
4. 9K+ bought in past month (Xbox: 2K+)
5. **$79.99** (28px, cents superscript; no list price / strikethrough)
6. Get $50 off instantly: Pay $29.99 upon approval for Amazon Visa.
7. FREE Returns ▾
8. Savings  Pre-order Price Guarantee. Terms
9. Platform For Display: PlayStation 5 — swatches **[Xbox Series X | S] [PlayStation 5]** (selected swatch has a blue border)
10. Edition: Standard — single swatch **[Standard]**
11. **About this item**
    - This product contains a download code inside the box — no disc is included. Customer shipments will begin arriving November 12 for pre-load; game is playable starting November 19. Code can only be used by users holding an account for PlayStation registered to the US or Canada. *(Xbox page omits the last sentence.)*
    - Pre-order to receive the Vintage Vice City Pack.
    - Grand Theft Auto VI is a single-player experience.
12. Report an issue with this product or seller

**Buy box (right, white card, 1px #D5D9D9 border, 8px radius), top to bottom:**
```
$79.99
FREE delivery Monday, November 16
Or fastest Release Day delivery Thursday, November 12
📍 Delivering to San Jose 95112 - Update location
This item will be released on November 12, 2026.   (green/teal availability text)
Pre-order now.
Quantity: [1 ▾]   (options 1–5)
[ Pre-order now ]   ← orange pill #FFA41C, full width
Shipper / Seller   Amazon.com
Returns            FREE 30-day refund/replacement   (Xbox: "30-day refund / replacement")
Payment            Secure transaction
See more
[ Trade-In and save ]   (white pill, green border)
[ Add to List ]         (white pill, grey border)
```
- **There is no "Add to Cart" button.** The "Pre-order now" control is `input#buy-now-button name="submit.buy-now"` inside `form#addToCart` (POST `/gp/product/handle-buy-box`). Clicking it goes to `/checkout/entry/buynow?...isBuyNow=1&ASIN=B0H6K928WL&quantity=1`, which for a guest immediately redirects to the sign-in wall (step 4).
- Price-details popover: "Shipping cost, delivery date, and order total (including tax) shown at checkout."
- Returns popover: "Quick refund — Usually issued within 24 hours." · "FREE return — At least one free return option available." · "Convenient dropoff — At any of our 50,000 US locations." · "See return policy".

**Below the fold:** "Frequently bought together" (This item + The Legend of Zelda™: Ocarina of Time + Metroid™ Ravenous → **Add all 3 to Cart**, "To see our price, add these items to your cart.", "Some of these items ship sooner than the others. Show details") · "Customers who bought this item also bought" carousel · sponsored "Products related to this item" (×2) · **Product information** table (ASIN B0H6K928WL · Release date November 12, 2026 · Best Sellers Rank #33 in Video Games, #5 in PlayStation 5 Games · Package Dimensions 6.69 x 5.31 x 0.51 inches; 2.82 ounces · Type of item Video Game · Language English · Rated Rating Pending · Manufacturer Rockstar Games · Date First Available June 23, 2026) · Warranty & Support · "Would you like to tell us about a lower price?" · **Product Description** ("Vice City, USA. Jason and Lucia have always known the deck is stacked against them. But when an easy score goes wrong…") · Product Videos (influencer, "Earns commissions") · sponsored brand strip · **Customer reviews** (all stars 0%, "Sign in to see customer reviews.").

### 3. Add to cart (only from the search tile) **[low confidence]**
The search tile's yellow **"Add to cart"** (`input name="submit.addToCart"`) posts the ASIN. Amazon then shows an "Added to cart" confirmation (either a full page with recommendations or a right-side drawer, depending on the session):
```
✓ Added to cart
[thumb]  Platform For Display: PlayStation 5
                                   Cart Subtotal: $79.99
                                   [ Proceed to checkout (1 item) ]   (yellow)
                                   [ Go to Cart ]                     (white)
…for you based on Grand Theft Auto VI…   [Add to cart] [Add to cart] …
```
I could not trigger this live (the click did not register from the hidden pane; Amazon's `/gp/aws/cart/add.html?ASIN.1=…` form URL redirects to sign-in).

### 4. Cart — `https://www.amazon.com/gp/cart/view.html?ref_=nav_cart`
Observed (empty, guest):
- Top banner: **"Get a $50 Amazon Gift Card instantly upon approval for Amazon Visa"** with a mini table (Current Total $0.00 · Savings – $50.00 · Cost After Savings $0.00 · Savings Remaining $50.00) and **Learn more**.
- Heading **"All Carts"**; carousel "Customers Who Bought Items in Your Recent History Also Bought" whose tiles use yellow **"Pre-order"** buttons for unreleased games and **"Add to cart"** for in-stock ones.
- Empty state: **"Your Amazon Cart is empty"** · link **Shop today's deals** · yellow **[Sign in to your account]** · white **[Sign up now]**.
- Footer notes: "The price and availability of items at Amazon.com are subject to change. The Cart is a temporary place to store a list of your items and reflects each item's most recent price." and **"Do you have a gift card or promotional code? We'll ask you to enter your claim code when it's time to pay."**

With an item **[low confidence, from the 2025 walkthrough + knowledge]**:
```
Shopping Cart                                              Price
[img] Grand Theft Auto VI - PlayStation 5 (Code in Box…)   $79.99
      This item will be released on November 12, 2026.
      Pre-order Price Guarantee · FREE delivery Mon, Nov 16 · FREE Returns
      Platform For Display: PlayStation 5 · Edition: Standard
      ☐ This is a gift
      Qty: [1 ▾]   Delete | Save for later | Share
--------------------------------------------------------------
Subtotal (1 item): $79.99
                                        Right box:  Subtotal (1 item): $79.99
                                                    ☐ This order contains a gift
                                                    [ Proceed to checkout ]  (yellow)
```
No promo-code field, no shipping/tax/total, no PayPal/Apple Pay. A yellow "Some items in your Cart have changed price…" banner appears when a price moved. Clicking **Proceed to checkout** as a guest → sign-in wall.

### 5. Sign-in wall (observed) — `https://www.amazon.com/ap/signin?...openid.assoc_handle=amazon_checkout_us...`
Reached from "Pre-order now". Minimal white page, amazon logo, one card:
```
Sign in or create account
Enter mobile number or email
[__________________________]
[ Continue ]   (yellow)
By continuing, you agree to Amazon's Conditions of Use and Privacy Notice.
Need help?
Buying for work?
Create a free business account
```
Footer: Conditions of Use · Privacy Notice · Help · © 1996-2026, Amazon.com, Inc. or its affiliates.
Validation strings embedded in the page: "Enter your mobile number or email", "Invalid mobile number", "Invalid email address", "Something's not right. Try again."
The form posts to `/ax/claim?openid.return_to=https://www.amazon.com/checkout/entry/buynow?...&policy_handle=Retail-Checkout`, so after authentication the shopper lands directly in checkout. **No guest option exists.** `/ap/register` shows the identical screen (account creation branches after the email is entered: Your name · Password (at least 6 characters) · Re-enter password · one-time code verification — **[low confidence]**).

### 6. Checkout **[low confidence — layout from Amazon help pages + 2025 walkthrough]**
Slim header: amazon logo | **Checkout (1 item)** | lock icon. Numbered sections down the left, sticky **Order Summary** on the right.

**6a. Shipping address** — "Choose a shipping address" (current variant: "Delivering to…").
- Saved addresses as radios, each with "Edit address | Edit delivery preferences"; "Your pickup locations" (Amazon Counter / Locker / Fresh); links **Add a new delivery address** · Find a pickup location near you; yellow **[Use this address]**.
- "Add a new address" modal (header "Enter a new shipping address"): blue bar "Save time. Autofill your current location." [Autofill] · **Country/Region** (select, United States) · **Full name (First and Last name)** · **Phone number** ("May be used to assist delivery") · **Address** ("Street address or P.O. Box" / "Apt, suite, unit, building, floor, etc.") · **City** · **State** (Select) · **ZIP Code** · **Delivery instructions (optional)** ("Add preferences, notes, access codes and more") · ☐ Make this my default address · yellow **[Add address]**. Street field autocompletes.
- Until an address is chosen the summary shows "Items (1): $79.99 · Shipping & handling: -- · Total before tax: -- · Estimated tax to be collected: -- · Order total: --".

**6b. Payment method** — "Choose a payment method".
- **Your credit and debit cards** (columns Name on card / Expires on) · **+ Add a credit or debit card › Amazon accepts all major credit cards.** (modal: Card number · Name on card · Expiration date Month/Year · billing address defaults to shipping) · **Your available balance** — "Enter a gift card, voucher or promotional code" [Enter Code] [Apply] · **Other payment methods** — "+ Add a personal checking account (Use your US based personal checking account.)" · Amazon Visa / Store Card offer · yellow **[Use this payment method]**.
- Accepted (help page): Visa (Prime Visa and Amazon Visa), Amazon Store Card, Amazon Secured Card, MasterCard/EuroCard, Discover Network, American Express, prepaid Visa/MC/Amex cards, checking account, Amazon.com Gift Card (combinable with one card), EBT/OTC/FSA/HSA for eligible items only. Not accepted: PayPal, Apple Pay, Google Pay. "Card Verification value (CVV) is mandatory for all Amazon Store Card transactions."

**6c. Review items and shipping** (current variant: "Items and shipping").
- Item row: image · title · $79.99 · Qty [1 ▾] · delivery radios: **FREE delivery: Monday, November 16** / **Release-Date Delivery: Thursday, November 12** (FREE with Prime Two-Day; fee otherwise). Help page: "select Release-Date Delivery at checkout"; ensure the order contains only the eligible item.
- Address block ("Change", "Edit delivery preferences"), payment block ("Paying with Visa 0182", "Billing address: …", "Change", "Add a promotional code" [Enter code][Apply]).
- Right rail: yellow **[Place your order]** · "By placing your order, you agree to Amazon's privacy notice and conditions of use." · **Order Summary**: Items (1): $79.99 · Shipping & handling: $0.00 · Total before tax: $79.99 · Estimated tax to be collected: $X.XX · **Order total: $XX.XX** (red) · "How are shipping costs calculated?" · "Prime shipping benefits have been applied to your order." (Prime only).
- Footer: "*Why has sales tax been applied? See tax and seller information." · "Need help? Check our Help pages or contact us" · "For an item sold by Amazon.com: When you click the "Place your order" button, we'll send you an email message acknowledging receipt of your order. Your contract to purchase an item will not be complete until we send you an email notifying you that the item has been shipped." · "You may return new, unopened merchandise in original condition within 30 days of delivery…" · "Need to add more items to your order? Continue shopping on the Amazon.com homepage."
- A passkey / one-time-code challenge may be inserted "during high-risk transactions" (Amazon help).

**Charge timing:** card authorised at order; charged when the code-in-box ships (~Nov 12) at the lowest Amazon price between order time and end of release day (Pre-order Price Guarantee, refund of the difference within 48 h if it ships early and the price later drops). Cancel any time before shipment: Your Orders → View or change this order → Cancel items → reason → **Request cancellation**.

### 7. Confirmation **[low confidence]**
```
✓ Order placed, thanks!
Confirmation will be sent to your email.
Delivering to <Name>, <City, ST ZIP>   ·   Arriving Nov 12 (Release-Date Delivery)
Order number 113-XXXXXXX-XXXXXXX   Review or edit your recent orders
[ Continue shopping ]  + recommendation carousels / Prime & Amazon Visa offers
```
Order numbers are 3-7-7 digits (e.g. 114-6223405-5188207). A second "Shipped" email arrives when the box ships and the card is charged.

---

## Look and feel
- **Header:** dark belt `#131921` (logo, location pin "Delivering to San Jose 95112 / Update location", search bar with "All" department dropdown + "Search Amazon" input + orange `#FEBD69` magnifier, "EN" flag, "Hello, sign in / Account & Lists", "Returns / & Orders", cart icon with orange `#F08804` count "0" + "Cart"). Second row `#232F3E` with hamburger "All" and ~30 text links (Early Prime Deals … Gift Cards). Product pages add a white "Video Games" store sub-nav (PS5, Xbox Series X|S, Switch, Nex Playground, PS4, PC, Arcade Gaming, Accessories, VR, Trade-In, Deals, Best Sellers, New Releases, Digital Games). Footer: "Back to top" bar, four link columns (Get to Know Us / Make Money with Us / Amazon Payment Products / Let Us Help You), language/country selector, long affiliate grid, legal links.
- **Colours:** page `#FFFFFF`, text `#0F1111`, links `#2162A1`, borders `#D5D9D9`, savings red `#C10015`, add-to-cart yellow `#FFD814`, buy-now / pre-order orange `#FFA41C`, brand orange `#FF9900`.
- **Type:** "Amazon Ember", Arial, sans-serif; 14px body, 12px nav row 2, 24px regular-weight product title, 28px price with superscript cents, 18px promo text.
- **Controls:** every primary button is a full pill (100px radius) with dark text; secondary buttons white with `#888C8C` border; dropdowns are bordered white pills ("Quantity: 1"); swatches are small rounded rectangles, selected one gets a blue outline.
- **Product tile (search):** horizontal card — image left (~220px), text block right; title as a two-line blue link, meta line "ESRB Rating: … | date | by …", platform sub-blocks in two columns each with price, delivery lines and a yellow "Add to cart".
- **Product page:** three-column layout (gallery ~40%, centre text ~35%, buy box ~25%), buy box is a bordered card that stays near the top; long-scroll below with bundles, carousels, spec table, description, reviews.
- **Sign-in / checkout chrome:** stripped white pages with only the logo (checkout adds "Checkout (N items)" and a lock icon); no top nav.
- **Imagery:** PS5 cover art (white PS5 header band, GTA VI key art of Jason and Lucia against a Vice City sunset, "PS5" logo top-left) — described, not downloaded.

## Quirks
1. Product-page buy box has **one** button, orange "Pre-order now", which is *Buy Now* → straight to checkout entry. No Add to Cart there; Add to cart only on the search tile.
2. **Account required.** The wall appears at Buy Now, at Proceed to checkout, at Add to List and even for Amazon's add-to-cart form URL. No guest checkout.
3. Listing release date = **Nov 12, 2026** (ship/arrival day of the code box); playable Nov 19. Title encodes both; "Release Day delivery Thursday, November 12" is therefore a week before launch.
4. **Code in box**, no disc; PS5 code restricted to US/Canada PlayStation accounts.
5. **Pre-order Price Guarantee**, charge at shipment, free cancellation before shipment.
6. **Standard edition only**; no Ultimate or digital SKU on Amazon US.
7. Platform is a swatch pair mapped to two ASINs; "Edition: Standard" is a single swatch.
8. Quantity capped at 5.
9. Amazon Visa promos on the product page ("$50 off instantly") and cart ("$50 Amazon Gift Card").
10. ZIP inferred from IP; delivery dates recalc per ZIP.
11. Reviews hidden for guests ("Sign in to see customer reviews.").
12. Noisy search: soundtrack album ranks #1, game is #10, sponsored/renewed tiles interleaved.
13. Bundle ("Add all 3 to Cart") and "Trade-In and save" upsells inside the buy area.
14. Stock flips: sold out in ~5 h at launch (June 25, 2026); expect "Currently unavailable" states and restocks.
15. Passkey/OTP challenge can be inserted before "Place your order".

## Sources
Live (browser):
- https://www.amazon.com/s?k=grand+theft+auto+vi
- https://www.amazon.com/dp/B0H6K928WL (→ /Grand-Theft-Auto-VI-PlayStation-Delivers/dp/B0H6K928WL)
- https://www.amazon.com/dp/B0H6K49W6Y (→ /Grand-Theft-Auto-VI-Delivers-Playable/dp/B0H6K49W6Y)
- https://www.amazon.com/s?k=grand+theft+auto+vi+ultimate+edition
- https://www.amazon.com/ap/signin?...openid.assoc_handle=amazon_checkout_us (via "Pre-order now")
- https://www.amazon.com/gp/cart/view.html?ref_=nav_cart
- https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B0H6K928WL&Quantity.1=1 (redirects to sign-in)
- https://www.amazon.com/ap/register

Amazon help pages (main host returned 503 to the fetch tool; read via Amazon's digprjsurvey.amazon.com mirror of the same node IDs):
- https://www.amazon.com/gp/help/customer/display.html?nodeId=G4BRP7LCB9DSDNCR — About the Pre-Order Price Guarantee
- https://www.amazon.com/gp/help/customer/display.html?nodeId=GK4Y6CVAHRLMPC55 — Release-Date Delivery
- https://www.amazon.com/gp/help/customer/display.html?nodeId=GRCTKGZRHE3L2C65 — Order with Release-Date Delivery
- https://www.amazon.com/gp/help/customer/display.html?nodeId=GFBWMNXEPYVJAY9A — Accepted Payment Methods
- https://www.amazon.com/gp/help/customer/display.html?nodeId=GF3GA88LAZ36ZMSQ — Shopping Cart Prices
- https://www.amazon.com/gp/help/customer/display.html?nodeId=GSL37WQTJZUYA9QE — Cancel Items and Orders
- https://digprjsurvey.amazon.com/csad/help/node/TM0z2tvxdI4nu36ypt — How to Place an Order
- https://digprjsurvey.amazon.com/csad/help/node/G4BRP7LCB9DSDNCR, /GK4Y6CVAHRLMPC55, /GRCTKGZRHE3L2C65, /GFBWMNXEPYVJAY9A, /GF3GA88LAZ36ZMSQ, /GSL37WQTJZUYA9QE

Third-party:
- https://education.uw.edu/sites/default/files/users/user4624/PlacingOrderswithAmazon_Scribe_Updated2025.pdf (2025 checkout walkthrough, Amazon Business shell)
- https://www.pushsquare.com/news/2026/06/gta-6-physical-edition-doesnt-come-with-discs-its-a-code-in-the-box
- https://opencritic.com/news/33616/gta-6s-code-in-a-box-hasnt-stopped-it-from-selling-out-on-amazon-ridiculously-fast
- https://www.thesixthaxis.com/2026/06/25/grand-theft-auto-6-pre-orders-are-live-70-80-e80-regional-pricing-confirmed/
- https://www.gfinityesports.com/article/gta-6-pre-orders-explained-where-to-buy-and-what-to-expect
- https://www.gfinityesports.com/article/does-gta-6-have-a-disc-version-physical-editions-explained
- https://www.digitalcitizen.life/gta-6-preloads-begin-on-november-12-for-digital-and-physical-code-copies/
- https://www.deceptive.design/articles/amazon-deceptive-cart-button-hides-proceed-to-checkout-
- Attempted but truncated (not used for facts): https://windowscentral.com/gta6-faq-how-to-preorder, https://www.tomsguide.com/news/live/gta-6-pre-orders-news-and-live-updates, https://www.techradar.com/live/news/draft-gta-6-pre-orders-stock
