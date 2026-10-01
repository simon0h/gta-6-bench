# GameStop (US) — GTA 6 pre-order flow

Researched 2026-09-29 with the built-in browser (search → product → add to cart → cart → checkout hand-off) plus GameStop's own help-center articles. Checkout itself sits behind a Cloudflare bot check on `identity.gamestop.com`, so the sign-in/guest screen and the checkout form were never seen live. A follow-up pass (same day) filled in what it could from GameStop's own storefront JavaScript (`main.js`, July 2026 build, via the Wayback Machine) and from three archived live order-confirmation pages; anything still unobserved is flagged.

**Status:** pre-order is live. Two SKUs, both Standard edition, both "Code in Box" (no disc), both $79.99, both showing "Release Date: 11/12/2026" (the code-in-box ship/pre-load date; the game launches Nov 19). No Ultimate, disc or digital GTA VI SKU exists on GameStop.com today.

---

## Step 1 — Search

**URL:** `https://www.gamestop.com/search/?q=grand%20theft%20auto%20vi` (pattern `/search/?q={q}`)

Header search box placeholder: **"Search games, consoles & more"**.

What the shopper sees:

- Heading: **Search Results for "grand theft auto vi"** — sub-line **(4 items)** — right side: **Sort: Best Matches**
- Left facet sidebar (each a heading with checkbox rows and counts):
  - **Delivery Method**: Ship to Home · Same Day Delivery · Pick Up (icon toggles)
  - **Categories**: Video Games (2) · Gaming Accessories (1) · Electronics (1)
  - **Platform**: PlayStation 5 (2) · Xbox Series X (1)
  - **Condition**: New (4)
  - **Franchise**: Grand Theft Auto (4)
  - **Genre**: Action (2)
  - **New Releases**: Dropping In The Next 3 Months (4) · …6 Months (4) · …Year (4)
  - **More Ways To Shop**: Shop Pre-Orders (4)
  - Customer Rating · Color: White · **Brand**: Rockstar Games (3), Sony Interactive Entertainment (1) · **Edition**: Standard (2) · **ESRB**: Rating Pending (2)
- Result tiles (3 per row): cover art, title (link), price, optional "$X for Pros" line, "Release Date MM/DD/YYYY".
  1. **Grand Theft Auto VI - PlayStation 5 (Code in Box)** — $79.99 — Release Date 11/12/2026
  2. **Grand Theft Auto VI - Xbox Series X/S (Code in Box)** — $79.99 — Release Date 11/12/2026
  3. Sony DualSense Wireless Controller for PlayStation 5 - Grand Theft Auto VI White Limited Edition — $84.99 — Release Date 11/19/2026
  4. Grand Theft Auto VI: The Album (Original Soundtrack) 2x LP — $54.99 / $52.24 for Pros — Release Date 11/19/2026

Tile links:
- PS5: `/video-games/playstation-5/products/grand-theft-auto-vi---playstation-5-code-in-box/448295.html`
- Xbox: `/video-games/xbox-series-x%7Cs/products/grand-theft-auto-vi---xbox-series-x-s-code-in-box/448297.html`

A cookie banner sits at the bottom: "Some U.S. state privacy laws offer their residents specific consumer privacy rights…" with buttons **Accept** · **Opt-Out** · **More Info**. It does not block the page.

---

## Step 2 — Product page (PS5; Xbox is identical except where noted)

**URL:** `https://www.gamestop.com/video-games/playstation-5/products/grand-theft-auto-vi---playstation-5-code-in-box/448295.html`
**Tab title:** "GTAVI - PlayStation 5 - Pre-Order Now | GameStop"
**Breadcrumb:** Video Games › PlayStation 5 (Xbox: Video Games › Xbox Series X|S)

Layout: left ~60% is a vertical thumbnail rail (12 images) next to a large cover image with a "Next" arrow; right ~40% is the buy box.

Buy box, top to bottom:

1. Brand link: **Rockstar Games**
2. H1: **Grand Theft Auto VI - PlayStation 5 (Code in Box)**
3. Blue pill badge: **50+ Purchased Recently** (PS5 only)
4. Price **$79.99** (large, bold) beside **Release Date: 11/12/2026**
5. Red full-width button: **Pre-Order**
6. Card-style selector: **Platform** / **PlayStation 5** / **+1 more** › — opens a list with options **PlayStation 5**, **Xbox Series X** (each is a separate listing)
7. **Condition** — **New** (single chip) — **$79.99**
8. **Delivery: Ship to Home**
   - Tile **Pick up in-store** — **Not Available**
   - Tile **Ship to Home** — **2-3 business days** (selected)
   - **FREE Shipping on Pre-Orders $59+. Exclusions apply**
   - **Arrives on or shortly after release day**
9. Credit-card banner: **Get A FREE Pro Membership ($85+ in savings)** / **+ 2% back on all purchases with the GameStop Pro Credit Card.** (links: Apply Now · See if You're Pre-Qualified)
10. **ESRB Rating: RP (Rating Pending)**
11. **Billing does not occur until order is processed**
12. **Features**
    - This product will only contain a download code inside the box to support pre-load starting on November 12. A disc will not be included in the box. Code can only be used by users holding an account for PlayStation® registered to the US or Canada. *(Xbox listing drops the account sentence)*
    - Pre-order to receive the Vintage Vice City Pack.
    - Grand Theft Auto VI is a single-player experience.
    - Show more...
13. Accordions: **Product Description** · **Specs** (collapsed; the description panel only holds a Pro block: "GameStop Pro Benefits — Level up to Pro! Pros can gain $60 in annual value for just $25/year. Already a member? Sign In" + **Join Pro Now**)

Below the fold: carousels **Top Games To Explore Next**, **Recommended Accessories For You**, **More Like This**, **People Also Bought**, **Recommended Deals**, then **Questions & Answers**. Other tiles show Pro pricing ("$61.74 for Pros", "PRO - 5% OFF"); the GTA VI SKUs do not.

No quantity selector on the product page. No protection plan offered.

---

## Step 3 — Click "Pre-Order" (add to cart)

No navigation. The header cart icon gets a red **1** badge and a modal slides in from the right:

- Title with green check: **Added to the cart** — X close
- Thumbnail + **Nice! Your "Grand Theft Auto VI - PlayStation 5 (Code in Box)" has been added to cart.**
- Red full-width button: **View Cart & Checkout** → `/cart/`
- **People Also Bought** carousel (Grand Theft Auto V - PlayStation 5 $18.99 / $18.04 for Pros; Red Dead Redemption… $29.99; NBA 2K27 $64.99 / $61.74 for Pros; …) with Previous / Next arrows

---

## Step 4 — Cart

**URL:** `https://www.gamestop.com/cart/` · title "Cart | GameStop"

Two-column layout. Left column:

- Grey section bar with house icon: **Ship To Home: 1 Item**
- Line item: thumbnail · **Grand Theft Auto VI - PlayStation 5 (Code in Box)** (link) · **Condition: New** · **Platform: PlayStation 5** · right-aligned **$79.99**
- Delivery radio (pre-selected): **FREE Shipping on Pre-Orders $59+. Exclusions apply** / **Arrives on or shortly after release day**
- **Quantity:** dropdown **Qty 1** (options Qty 1 … Qty 5) · **Save for Later** · **Remove**
- Pro upsell block **Don't Miss Out**: "Get $60 in value and free shipping on orders $54+* when you join GameStop Pro!" / "Get $5 Monthly Pro Rewards, 5% Extra Off Pre-Owned and Collectibles, and That's Just the Start" / "Join today **$25/Year**" / button **Join Pro** / footnote "*Exclusions apply. Visit our terms at https://www.gamestop.com/TermsConditions.html for more information."
- **Need Help? Call 1-800-883-8895**

Right column **ORDER SUMMARY**:

- **Subtotal (1 item)** $79.99
- **Shipping & Handling** FREE
- **Estimated Tax** ⓘ $5.70
- **Estimated Total** **$85.69**
- Express slot — **OR** divider — Zip logo **or pay in installments**. The slot is a **PayPal Smart Button** (PayPal SDK iframe, accessibility name `PayPal-paypal`, logo only, no text; `main.js` tags the click as "proceed to paypal"). The container is `.checkout-and-applepay`, so Safari on Apple devices also gets an **Apple Pay** button (SFCC `applepay.js`). In the automated Chromium browser neither painted, so the area above OR looked blank.
- Red uppercase button **PROCEED TO CHECKOUT** → `https://www.gamestop.com/checkout/login/?required=false`
- Accordion **ENTER PROMO CODE** → label "Promo Code", text field, **Submit**; empty-submit error "No coupon code entered". (Help center: coupons cannot be used on pre-orders.)

Tax is estimated before any address is entered.

Second-session note: the guest basket had persisted, and clicking **Pre-Order** again added a *second* line item for the same SKU (Qty 1 each) instead of bumping the quantity — **Ship To Home: 2 Items**, **Subtotal (2 items)** $159.98, **Estimated Tax** $11.40, **Estimated Total** $171.38.

---

## Step 5 — Checkout hand-off (blocked)

Clicking **PROCEED TO CHECKOUT** loads `/checkout/login/?required=false`, which 302s to
`https://identity.gamestop.com/oidc/auth?scope=api:read offline_access openid address email phone profile&response_type=code&client_id=gamestop&redirect_uri=https://sfcc-ocapi.gamestop.com/shopper/auth/v1/idp/callback/default-gamestop&checkout=true&loginRequired=false…`

That page showed only a dark Cloudflare interstitial: **identity.gamestop.com — Performing security verification — "This website uses a security service to protect against malicious bots…"** Per the research rules I stopped there and did not retry. The follow-up session hit the same wall (tab title "Just a moment...") and also stopped.

What is known about the screen behind it:

- **Guest checkout is allowed** (help center, high confidence): "You can check out as a guest, but creating an account makes it easier to track, manage, and return orders." `loginRequired=false` in the URL matches this.
- **Where the UI lives** (URL evidence, high confidence): the OIDC provider serves its pages at `identity.gamestop.com/interaction/{uid}` (sign-in) and `identity.gamestop.com/interaction/{uid}/create-account` (registration). Every Wayback capture of those pages is a Cloudflare 403, and `www.gamestop.com/login/` has been a redirect stub into identity since Feb 2025.
- **What the page contains** (GameStop's own `main.js` analytics hooks, medium confidence on existence, low on wording): a sign-in form with **Email**, **Password**, a **"keep me signed in"** checkbox and a **Sign In** button; a **Forgot password** link (`.forgot-password-link-js`); a **Create Account** button (`.create-account-initial .create-account-button`); and a guest button in its own block, `.login-guest-checkout .checkout-as-guest`, tagged in analytics as **"Guest Checkout"**. Best guess for the visible text: **"Checkout as Guest"** (low confidence; "Continue as Guest" is the alternative).
- Whether the guest path asks for an email *before* the shipping form is unknown. Confirmation pages print the email under **Billing Address**, so it is at least collected with billing/contact info.

## Step 6 — Checkout form (not observed; structure from GameStop's main.js + help center)

**Layout: one page, not a wizard (medium confidence).** GameStop's storefront JS has a `.single-page-checkout` mode, and the help article "How Do I Place an Order on GameStop.com?" (updated 5/20/2026) describes a single "final checkout screen": **Confirm your shipping address → Apply gift cards or trade-in credit → Enter your payment method → Select "Place Order"**. The same bundle still carries the legacy Salesforce SFRA three-stage flow (`#checkout-main[data-checkout-stage]` = `shipping` → `payment` → `placeOrder`, URLs `/checkout/?stage=shipping#shipping` and `/checkout/?stage=payment#payment`, buttons `.submit-shipping` / `.submit-payment`, SFRA default labels "Next: Payment" / "Next: Place Order"), so a fallback or A/B to that flow is possible. No intermediate continue-button label could be verified.

**Shipping section** (labels are SFRA defaults, **low confidence**): First Name, Last Name, Address 1, Address 2, City, State (select), ZIP Code, Phone Number. The form is `form.shipping-form` (class `guest-checkout` for guests). Phone is definitely *collected* (it prints under Shipping Address on confirmations); whether it is *required* is unverified. Email is not on this section. Shipping methods are radios (`name$="_shippingMethodID"`) in a `.shipping-method-set` with a `.display-name` and price; method names seen on confirmations: "Premium $0.00", "Rush $x.xx". An address-suggestion modal exists ("suggested address" analytics). Help center: continental U.S. only; no freight forwarders, hotels or business addresses.

**Payment section** (field *names* verified from `main.js`, visible labels not):

- Payment methods are **tabs** (`.payment-options a.nav-link[data-bs-toggle="tab"]`): a credit/debit card tab (title not verified; method id `CREDIT_CARD`), **PayPal**, and a tab literally titled **BUY NOW, PAY LATER** (Zip per the help center; a legacy `#klarna-checkout-btn` also survives in the code).
- Card form: `dwfrm_billing_creditCardFields_cardNumber` (**Card Number**, Cleave.js-formatted, brand detection for visa/mastercard/discover/amex/unionPay/jcb/diners), `dwfrm_billing_creditCardFields_expirationMonthYear` (**one combined MM/YY field**, not two selects), `dwfrm_billing_creditCardFields_securityCode` (**Security Code**, max 3 digits, 4 for Amex). **No Name on Card field** exists; the confirmation shows the billing-address name as card holder. Cards are tokenised with CyberSource Secure Acceptance Flex (`SA_FLEX`). Whether the label reads "Security Code" or "CVV" is unverified.
- Billing address defaults to the shipping address (checkbox to change, low confidence on label). Email is entered here (contact info).
- **Gift cards** are a separate apply block (`#giftCertificateAmount`, method id `GIFT_CERTIFICATE`, analytics "Payment | Gift Card Applied"), up to 2 per order. The **GameStop Pro Credit Card** is entered as a card in the card tab (`purCC:avsError` handling). **Trade-in credit** is applied here per the help center (no client-side trace).
- A payment summary with an **Edit** link (`.updatePaymentLink`, analytics "Edit Payment") appears once payment is entered.

**Place Order** (help center wording, high confidence on the label): in single-page mode there is no separate review page — the button sits on the same page next to the order-summary column (Subtotal / Shipping & Handling / Estimated Tax / Estimated Total, same rows as the cart), medium-low confidence on exact placement.

Accepted online payment methods (help center): Visa, MasterCard, American Express, Discover (one card per order), PayPal (incl. Pay in 4), Zip (4 or 8 payments, fees "displayed at checkout before you confirm"), GameStop Credit Card, GameStop Gift Cards (max 2), trade-in credit. Cash and trade cards are in-store only. Apple Pay appears only as the cart express button in Safari.

Charging (help center): "When you place an order, GameStop places a temporary authorization on your payment method. You are NOT fully charged until the order ships." **Pre-orders are charged about 1 week before the release date.** Product page wording: "Billing does not occur until order is processed." No charge-timing sentence exists in the checkout client JS or on the archived confirmation pages; whether the checkout page shows one is unverified.

## Step 7 — Confirmation (verified from archived live pages)

Three archived confirmation pages (June 2025 card order, April 2026 card order, July 2026 PayPal order) were read via the Wayback Machine; only UI labels were kept, no customer data.

**URL:** `/order/confirmation/?ID={orderNo}&token={token}` (older URLs also carried `fraudStatus=success&hasProSku=false&playerToProUpgradFlow=false&proRenewFlow=false&paypalExpressCart=…`). **Tab title:** "Order Confirmation | GameStop". Order numbers are 16 digits: `1100000…` in 2025, `1101000…` in 2026.

Page, top to bottom:

1. Pro upsell banner **Don't Miss Out** — "Get $60 in value when you join GameStop Pro!" / "Join today **$25/Year**" / **JOIN PRO**
2. H4 **Thank you for your order!** (CSS renders it as THANK YOU FOR YOUR ORDER!) — **We've sent you a confirmation email.**
3. **Order Number:** 1101000085862818 · **Order Date:** 7/28/2026 (format M/D/YYYY)
4. Shipment group header **Shipping Now**, columns **Products** / **Shipping Details**: product title, then **Shipping Method** with name and price (e.g. "Premium $0.00", "Rush $x.xx")
5. Totals card: **Subtotal** · **Total Discount** · **Gift Cards Applied (n)** · **Shipping & Handling** FREE · **Shipping Surcharge** · **Shipping & Delivery Discount** · **Estimated Tax** ⓘ "Sales tax is an estimate only, final total is subject to change." · **Total** · **Total Savings :** (zero-value rows hidden)
6. Link **Return To Shopping**
7. H4 **SHIPPING** → **Shipping Address**: name, street, City, ST ZIP, phone
8. H4 **PAYMENT** → **Billing Address** (name, street, City, ST ZIP, email) and **Payment Method** — card orders: "Credit Card" + holder name + brand + `************1234` + "Expiration M/YYYY" + "Amount: $X"; PayPal orders: the PayPal account email + "Amount: $X"
9. Standard footer

No create-account form and no charge-timing text appeared on any of the three captures. Guest orders can only be cancelled by emailing care@gamestop.com; signed-in orders can be cancelled from Account → Order History until processing starts.

---

## Look and feel

- **Header (white):** hamburger **Menu** · black **GameStop** wordmark (red accent in the logo) · wide rounded search field with magnifier, placeholder "Search games, consoles & more" · right cluster: **Trade-In** (arrows icon) · **Sign In** (person icon) · **Cart** (cart icon with red count badge).
- **Nav row (white, scrollable, chevrons on dropdown items):** Trading Cards · Deals · Shop My Store · Pre-Order · Collectibles & More · PlayStation · Nintendo Switch · Xbox · Pre-Owned · New & Upcoming · Only At GameStop · Digital Store · Retro Gaming · GS Pro Credit Card.
- **Promo strip** below nav on a light-grey band: "Pre-Order The Newest Trading Cards Before They Sell Out."
- **Colors:** page white `#FFFFFF`; text black `#000000`; primary red `#DA362C` (Pre-Order, Proceed to Checkout), modal button red `#E7230D`; section/promo band grey `#F2F4F7`; social-proof badge blue `#006CE1` on `#D3E7FC`; "for Pros" price lines and "PRO - 5% OFF" tags in the same red.
- **Type:** Open Sans 14px body and nav (nav 600 weight); Poppins 600 for price (28px) and primary buttons (14px). Buttons: 4px radius on PDP, 2px on cart, uppercase on cart. Material Icons for UI glyphs.
- **Product tile:** cover art on white, title (2-line clamp), bold price, optional smaller "$X for Pros", "Release Date MM/DD/YYYY" or star rating + count.
- **Product page:** thumbnail rail + hero image left, buy box right; grey-bordered cards for the Platform selector and delivery tiles; badge pill after the title.
- **Footer:** columns GET HELP / LEGAL & PRIVACY / ABOUT US, SIGN UP email box with **JOIN**, GET THE APP, CONNECT WITH US, "© 1999-2026 GameStop", region links Australia & New Zealand · France, "Cookie Preferences".

## Quirks

- "Code in Box": no disc; PS5 code locked to US/Canada PlayStation accounts.
- Listed release date 11/12/2026 is the code-in-box ship date; launch is Nov 19. Delivery copy: "Arrives on or shortly after release day."
- Only Standard edition sold; no Ultimate/disc/digital SKU.
- In-store pickup "Not Available" for this item; Ship to Home only.
- Free shipping threshold is $59+ for pre-orders ($79+ regular, $54+ Pro).
- Promo-code field exists but coupons are not accepted on pre-orders.
- Authorization at order; charge about a week before release. Split pay online only via PayPal Pay in 4 or Zip.
- Guest pre-orders cancel only via email to care@gamestop.com.
- identity.gamestop.com OIDC login/guest hand-off is behind Cloudflare bot detection.
- Cookie banner (Accept / Opt-Out / More Info) is non-blocking.
- Cart estimates tax before address entry (geo default).
- A default "my store" name appears in the header on some pages; PDP has hidden "Change Store" / "Verify Address" controls.
- Quantity is picked in the cart (Qty 1–5), not on the PDP.
- Xbox title says "Xbox Series X/S" but the Platform selector says "Xbox Series X".
- Pro upsells everywhere: credit-card banner and "Join Pro Now" on PDP, "Don't Miss Out" block in cart.
- Guest basket persists across sessions; re-adding the same SKU creates a second line item instead of Qty 2.
- Checkout is Salesforce Commerce Cloud (SFRA): the live bundle has both a single-page checkout and the legacy shipping → payment → placeOrder stages.
- Card expiry is one MM/YY field; no Name on Card; CyberSource Flex tokenisation.
- Payment methods are tabs; the BNPL tab is titled "BUY NOW, PAY LATER".
- Order numbers moved from `1100000…` (2025) to `1101000…` (2026).
- Cart express slot = PayPal iframe (logo only) + Safari-only Apple Pay; looks empty in Chromium.

## Sources

Browser (live, 2026-09-29):
- https://www.gamestop.com/search/?q=grand%20theft%20auto%20vi
- https://www.gamestop.com/video-games/playstation-5/products/grand-theft-auto-vi---playstation-5-code-in-box/448295.html
- https://www.gamestop.com/video-games/xbox-series-x%7Cs/products/grand-theft-auto-vi---xbox-series-x-s-code-in-box/448297.html
- https://www.gamestop.com/cart/
- https://www.gamestop.com/checkout/login/?required=false → https://identity.gamestop.com/oidc/auth… (Cloudflare challenge; stopped)
- https://www.gamestop.com/help/articles/156000190556 (GameStop Pre-Orders — How They Work, updated 8/21/2026)
- https://www.gamestop.com/help/articles/156000190437 (How Do I Place an Order on GameStop.com?)
- https://www.gamestop.com/help/articles/156000190557 (Ways to Pay at GameStop)
- https://www.gamestop.com/help/articles/156000190550 (Shipping Options at GameStop)
- https://www.gamestop.com/help/articles/156000382697 (How Do I Cancel an Online Pre-Order?)
- https://www.gamestop.com/help/ and /help/categories/156000560712 (help home, "Payments & Gift Cards" topic)
- https://www.gamestop.com/help/articles/156000383776 (How Does Zip Work At GameStop?, updated 4/23/2026)
- https://www.gamestop.com/help/articles/156000383763 (Why Was I Charged Twice?, updated 4/23/2026)

Wayback Machine (browser, 2026-09-29; customer data not copied):
- https://web.archive.org/web/20260729030312/https://www.gamestop.com/order/confirmation/?ID=1101000085862818&token=… (live confirmation page, PayPal order, July 2026)
- https://web.archive.org/web/20260430175004/https://www.gamestop.com/order/confirmation/?ID=1101000081166600&token=… (card order, April 2026)
- https://web.archive.org/web/20250617082620/https://www.gamestop.com/order/confirmation/?ID=1100000074030513&token=… (card order, June 2025)
- https://web.archive.org/web/20260729030312id_/https://www.gamestop.com/on/demandware.static/Sites-gamestop-us-Site/-/default/v1785284996003/js/main.js (storefront JS, grepped for checkout hooks and form field names)
- CDX index queries for identity.gamestop.com/* (all HTML captures 403), www.gamestop.com/login/ (redirect stubs into identity since Feb 2025), www.gamestop.com/checkout/login/ (302s only)

Web (search/fetch):
- https://hothardware.com/news/gta-6-preorder-guide-read-carefully-before-buying
- https://www.dekudeals.com/articles/pre-order-video-games
- https://shipito.com/en/stores/gamestop
- https://manofmany.com/entertainment/gaming/gta-6-pre-order-pricing-bonuses-release-date
- https://www.rivo.io/blog/gamestop-pro-membership
- https://www.player.one/gamestop-pro-membership-loses-rewards-points-2026-customers-question-its-value-163349
- https://www.gamestop.com/order/confirmation/?ID=1100000073394880&token=… (URL pattern from search index only)
- https://gamefaqs.gamespot.com/boards/691087-playstation-4/78982372 (snippet only; fetch 403)
