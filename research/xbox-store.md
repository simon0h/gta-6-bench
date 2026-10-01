# Xbox Store (xbox.com, US) - GTA VI pre-order walkthrough

Researched 2026-09-29 with the built-in browser (signed out, US locale) plus Microsoft support pages. Pre-order is live. Everything up to the sign-in wall was observed directly; everything after it is marked **(not observed)** and comes from Microsoft docs or general knowledge of the Microsoft Store purchase flow.

Follow-up (same day): the post-sign-in steps were re-checked against Xbox Support's "Making purchases on Xbox" and "Pre-order Xbox digital games in the Microsoft Store" pages, the Microsoft Store Terms of Sale (loaded in the browser) and Microsoft's Keep-me-signed-in documentation. Those raise Steps 4-5 from "general knowledge" to "documented by Microsoft" (medium confidence); the confirmation screen (Step 6) is still unverified. WebSearch was unavailable during the follow-up, so only known URLs were used.

Summary of the path a shopper takes:

1. Search "grand theft auto vi" (or browse Games) -> tile "Grand Theft Auto VI $79.99+ PRE-ORDER"
2. Product page -> pick edition in "CHOOSE EDITION" -> green "PRE-ORDER $79.99+" button (or "..." -> "Add to cart" -> Cart -> "Checkout")
3. Microsoft account sign-in wall (login.live.com) - no guest option: "Email or phone number" -> **Next** -> password -> **Sign in** -> "Stay signed in?" (**Yes** / **No**)
4. **(documented, not observed)** Direct path: Microsoft Store purchase dialog on the product page - "Choose a way to pay" / "Confirm payment" screen, then press **Pre-order** again on the confirmation screen. Cart path: Microsoft Store checkout page - "Step 1: Shipping" / "Step 2: Payment", optional "Add a promo code", **Place order**
5. **(not observed)** Confirmation + email "Microsoft Store - Order Confirmation (Order #...)"; order appears at account.microsoft.com/billing/orders ("Payment & billing > Order history"); card charged about 10 days before release

---

## Step 1 - Entry: search

- URL: `https://www.xbox.com/en-US/search/results?q=grand%20theft%20auto%20vi`
- Header search: click the magnifier icon; an inline search box appears with placeholder **"Search Xbox.com"**, submit button "Search", and a "Cancel" button. Submitting goes to `/en-US/search/results?q={q}`.
- Page headline: **"Search results for: grand theft auto vi"**
- Result-type tabs (top, underlined active tab): **Games (25)** | **Add-Ons (25)** | **Subscriptions (1)** | **Hardware (4)** | **Support** | **General**
- Left rail: **"Sort by Relevance"** dropdown, then **"Filters"** accordions: Play with, Accessibility, Prices, Genre, Subscriptions, Age Rating, Multiplayer, Technical Features, Handheld compatibility, Supported Language.
- Results grid (3 columns): each tile is one link. Tile contents top to bottom: portrait cover art, bold title, price line, optional ribbon.
  - Tile 1: **"Grand Theft Auto VI"** / **"$79.99+"** / ribbon **"PRE-ORDER"** -> `/en-US/games/store/grand-theft-auto-vi/9p3h4968grsm`
  - Tile 2: **"Grand Theft Auto VI: Ultimate Edition"** / **"$99.99+"** / ribbon **"PRE-ORDER"** -> `/en-US/games/store/grand-theft-auto-vi-ultimate-edition/9nnzsnhlr63l`
  - Tile 3: "Grand Theft Auto VI" / "View game" (the base-game entry inside the bundle, id 9nl3wwnzlzzn; no price)
  - Other tiles show "View game", or a sale layout: "$49.99" struck through, "$24.99+", badge "-50%".
- Bottom: **"Load more"** button.
- Accessible name of a tile: "Grand Theft Auto VI, $79.99"; sale tiles read "Original price $49.99, on sale for $24.99".

## Step 2 - Product page (Standard Edition)

- URL: `https://www.xbox.com/en-US/games/store/grand-theft-auto-vi/9p3h4968grsm` (pattern `/en-US/games/store/<slug>/<12-char id>`); tab title "Buy Grand Theft Auto VI | XBOX".
- Hero (dark, blurred key art behind): cover art left; on the right:
  - H1 **"Grand Theft Auto VI"**
  - Meta line: **"Rockstar Games • Action & adventure • ★★★★★ 6.0K"** (star image alt "Rating of 4.9 stars")
  - Badge row: **"Optimized for XBOX Series X|S"** (X|S icon), **"Pre-order"** (calendar icon), **"13 Supported languages"** (globe icon)
  - Buy box (three controls in a row):
    1. Green button, two lines: **"PRE-ORDER"** / **"$79.99+"** (aria-label "Preorder Grand Theft Auto VI. $79.99")
    2. Grey dropdown button, two lines: **"CHOOSE EDITION"** / **"Grand Theft Auto VI"** with a chevron
    3. Grey **"..."** button (aria "Overflow, press for more options")
- **CHOOSE EDITION** dropdown (observed): a dark panel below the button listing two rows, each with a thumbnail, title and price:
  - **"Grand Theft Auto VI"** / **"$79.99+"** (highlighted = current)
  - **"Grand Theft Auto VI: Ultimate Edition"** / **"$99.99+"** (a link to the Ultimate product page)
  - Choosing the other row navigates to that edition's own page; there is no in-place variant swap.
- **"..."** overflow menu (observed): **"Add to wishlist"** (heart icon), **"Add to cart"** (cart icon), **"Redeem a code"** (grid icon).
- No quantity selector. No platform picker (only "Play with: XBOX Series X|S").
- Below the hero, an ESRB strip: rating icon "RP", link pill **"RATING PENDING LIKELY MATURE 17+"** (opens ESRB in new tab), text **"May contain content inappropriate for children. Visit ESRB.org for rating information."** Right column: **"Publishers of games you launch receive access to your XBOX profile information and associated data while you play. Learn more"**, **"+Offers in-app purchases."**, **"Parental control information. Learn more"**.
- Tabs: **DETAILS** | **REVIEWS** | **MORE**
- **Gallery**: carousel with Previous/Next; every tile reads **"This content is locked"** (media hidden while signed out).
- **In this bundle**: "Grand Theft Auto VI" (View game) and "Grand Theft Auto VI: Vintage Vice City Pack" (View add-on).
- **Description** (first lines are the pre-order bonus):
  > Purchase prior to 19 November 2026 23:59:59 to receive:
  > -The Vintage Vice City Pack
  > -One Month of GTA+
  > Receive a month of GTA+ with your pre-order; must be redeemed within 180 days after placing your pre-order. Subscription redemption is not available to child accounts with restrictions on age-restricted content. You will receive a pop-up notification on your console when your GTA+ subscription month is available to redeem. Open the Store, select your profile icon in the top left corner, and select "Offers & credits" to find and redeem this offer. Limited to one redemption per Platform Account.
  > Grand Theft Auto VI is a single-player experience.
  > Vice City, USA.
  > Jason and Lucia have always known the deck is stacked against them. But when an easy score goes wrong ... forced to rely on each other more than ever if they want to make it out alive.
  followed by the Rockstar licence paragraph ("Purchase grants a license to the digital product subject to the Terms of Service...") and a "Show more" toggle.
- Details: **Published by** Rockstar Games / **Developed by** Rockstar Games / **Release date** **11/18/2026** / **Play with** XBOX Series X|S / **Capabilities** Single player, Optimized for Xbox Series X|S.
- **Compare editions**: two cards side by side.
  - Card 1 tag **"THIS EDITION"**, "Grand Theft Auto VI", "$79.99+", **Games included**: Grand Theft Auto VI; **Add-ons included**: Grand Theft Auto VI: Vintage Vice City Pack; button **"RETURN TO TOP"**.
  - Card 2 "Grand Theft Auto VI: Ultimate Edition", "$99.99+", Games included: Grand Theft Auto VI; Add-ons included: Grand Theft Auto VI: Ultimate Edition Upgrade, Grand Theft Auto VI: Vintage Vice City Pack; link **"GO TO GAME"**.
- **Add-ons for this game**: tile "Grand Theft Auto VI: Ultimate Edition Upgrade" / **"$20.00"** / **"PRE-ORDER"** (id 9pn4llbr8rch).
- Floating bubble bottom-right: **"Need help? Let's chat"**; expanded: **"Can we help you?"** / **"Store Assistant is available 24/7."** / buttons **"Chat now"**, **"No thanks"**.

### Ultimate Edition page

- URL: `https://www.xbox.com/en-US/games/store/grand-theft-auto-vi-ultimate-edition/9nnzsnhlr63l`
- Identical layout. H1 **"Grand Theft Auto VI: Ultimate Edition"**; button **"PRE-ORDER" / "$99.99+"** (aria "Preorder Grand Theft Auto VI: Ultimate Edition. $99.99"); CHOOSE EDITION shows "Grand Theft Auto VI: Ultimate Edition".
- "In this bundle": Grand Theft Auto VI (View game), Grand Theft Auto VI: Ultimate Edition Upgrade ($20.00, PRE-ORDER), Grand Theft Auto VI: Vintage Vice City Pack (View add-on).
- Description adds: "This purchase includes the Ultimate Edition Upgrade with exclusive in-game bonuses for Grand Theft Auto VI ..." then a headed list **"ULTIMATE EDITION UPGRADE"** ('95 GROTTI CHEETAH, HAWK & LITTLE MORGAN REVOLVERS, PERSONALIZED WEAPON VARIANTS, VICE CITY STYLE, JASON'S SAFEHOUSE VEHICLES, GANADO RETRO BUILD, SHITZU SQUALO, '67 VAPID DOMINATOR BUGGY & GARAGE, GOODTIME GEAR, PTT YOUNGIN$ COMPOUND, CLASSIC CAR COLLECTION) and **"Special Destinations Only Open for Business with the Ultimate Edition"** (RIDEOUT CUSTOMS, SARA'S UNISEX SALON, STOCK 305, ELECTRIC FANG TATTOO, ONE-EYED WILLIE'S).
- Release date 11/18/2026; same ESRB and legal blocks.

## Step 3a - Add to cart (optional path)

- Click **"..."** -> **"Add to cart"**. Nothing pops up. The menu entry immediately changes to **"Open cart"** (href `/cart`) and the header cart icon shows a **"1"** badge.

## Step 3b - Cart

- URL: `https://www.xbox.com/en-US/cart` (tab title "Shopping cart | XBOX"). The cart body is a microsoft.com iframe inside the xbox.com shell.
- Headline **"Cart"**; top-right link **"Keep shopping"**.
- Line item (left column): cover thumbnail; title link **"Grand Theft Auto VI"**; **"Release date: 11/18/2026"**; ESRB icon + **"RATING PENDING LIKELY MATURE 17+"** / "May contain content inappropriate for children. Visit ESRB.org for rating information."; **"Digital"**; **"$79.99"**; **"Quantity: 1"** (plain text, no stepper); links **"Remove"** | **"Save for later"**; **"Buying or purchasing this digital item is a license. Learn more"**; **"†Contains in-app purchases"**.
- Summary card (right column): **"Subtotal (1 item)"** **"$79.99"** / **"Before applicable taxes"** / bright-green button **"Checkout"**.
- Second card: calendar icon + **"Pay over time options may be available for qualified customers at checkout for eligible purchases when checking out with a Microsoft account."**
- Below: **"Need help?"** / link **"Contact support"** / **"Cart: 8335415320"** (10-digit cart id).
- No promo-code field on the cart (Microsoft says "Add a promo code" appears at checkout after payment, and only with an account). No PayPal/Apple Pay express buttons.

## Step 4 - Checkout -> Microsoft account sign-in wall (observed)

Clicking **"Checkout"** in the cart, or clicking the product page's **"PRE-ORDER"** button directly, does the same thing: a full-page redirect to

`https://login.live.com/oauth20_authorize.srf?client_id=1f907974-e22b-4810-a9de-d9647380c97e&scope=xboxlive.signin+openid+profile+offline_access&redirect_uri=https://www.xbox.com/auth/msa?action=loggedIn&sandboxId=RETAIL&locale_hint=en-US&response_type=code&prompt=select_account&...`

Sign-in page (tab title "Sign in"), a dark card centered on a dark navy/purple abstract background:

- Microsoft logo
- **"Sign in"**
- **"Use your Microsoft account."**
- Field: **"Email or phone number"** (type=email, floating label, green underline focus)
- Link/button: **"Forgot your username?"**
- Green button: **"Next"**
- **"New to Microsoft?"** **"Create an account"** (chevron; aria "Choose an option to create a new account")
- Footer: Xbox logo, **"Help and feedback"**, **"Terms of use"**, **"Privacy and cookies"**, **"Use private browsing if this is not your device. Learn more"**

There is no "Continue as guest" option. After entering an email the next screen asks for the **Password** (or a passkey / Authenticator approval), then the browser returns to xbox.com and the checkout continues. I did not sign in.

**Password screen and "Stay signed in?" (not observed - typing an email was not allowed; medium confidence from Microsoft docs + general knowledge of the Microsoft account UI):**

- Password screen: same dark card, the email shown at the top with a back arrow, heading **"Enter password"**, field **"Password"**, link **"Forgot password?"**, link **"Other ways to sign in"** (passkey, Microsoft Authenticator, emailed code), green button **"Sign in"**.
- Then the interstitial **"Stay signed in?"** / "Do this to reduce the number of times you are asked to sign in." with checkbox **"Don't show this again"** and buttons **"No"** and **"Yes"**. Microsoft's Keep-me-signed-in docs confirm the prompt text, the "Yes" answer and the "Don't show this again" checkbox, and note the prompt is skipped for high-risk or shared-device sign-ins. Either answer returns the browser to `https://www.xbox.com/auth/msa?action=loggedIn...` and then to the product page or cart, where the purchase continues.

## Step 5 - Payment and confirm (documented by Microsoft, not observed - medium confidence)

Sources: Xbox Support "Making purchases on Xbox" and "Pre-order Xbox digital games in the Microsoft Store", Microsoft Support "How to buy from the Microsoft Store", "Microsoft Store promo codes", "Pre-orders for Microsoft Store", and the Microsoft Store Terms of Sale.

### 5a - Direct PRE-ORDER path (purchase dialog on xbox.com)

Xbox Support's steps for buying a game "on Xbox.com, in the Xbox app for PC, or on an Xbox console" are, verbatim:

> Select the Buy button (the price will be displayed on the button).
> Verify the payment method you want to use on the **Choose a way to pay** or **Confirm payment** screen.
> On the confirmation screen, select **Buy** again to complete the purchase.

and for pre-orders: "Games which are available for pre-order prior to their release can be purchased the same way as released games (you'll see the **Pre-order** option instead of the Buy button). With pre-ordered games, your chosen payment option is not charged until about 10 days before the game is released."

So after sign-in the flow is:

1. **PRE-ORDER $79.99+** on the product page opens the Microsoft Store purchase dialog over the page (no separate checkout URL is documented for games; whether it is a modal or an iframe was not observed).
2. **"Choose a way to pay" / "Confirm payment"** screen: cover, title, price, the account's saved payment methods, and **"Add a way to pay"**. Tax is added from the billing address of the selected method (Terms of Sale: "Taxes ... will be added to the amount of your purchase and shown on the check-out page").
3. **Confirmation screen**: total with tax and the purchase button again - **"Pre-order"** for this item ("Buy" for released games). Pressing it completes the pre-order. Exact wording of any charge-timing / Terms-of-Sale line beside the button was not verified; the policy is "not charged until about 10 days before the game is released".

### 5b - Cart path (Microsoft Store checkout page)

- Cart **Checkout** -> sign-in -> a single checkout page with numbered sections. Microsoft Support (promo codes): complete **"Step 1: Shipping"** and **"Step 2: Payment"**, then select **"Add a promo code"**, enter the code, select **"Apply code"**, then "Follow the remaining prompts to complete your purchase." Promo codes "cannot be applied in guest checkout".
- Xbox Support's xbox.com walkthrough (written for hardware) ends: "Verify the payment method you want to use on the **Payment** screen ... On the confirmation screen, select **Place order** to complete the purchase." For a digital-only cart the shipping section should be absent or trivially complete (inferred, not verified).
- Order summary: Subtotal / Estimated tax / Total, **"Add a promo code"**, **"Place order"**.

### 5c - Payment methods and the card form

- **"Add a way to pay"** offers three types (Xbox Support, verbatim list): **Credit or debit card** ("You'll be asked to provide the card number, the cardholder name, the billing address, the expiration date, and the CCV"), **eWallet** ("PayPal or Venmo ... you'll be taken to the account provider's website in a web browser"), **Gift card** ("enter the card's 25-character code ... added to your Microsoft account balance"). So the billing address is collected on the same card panel.
- Exact field labels were not observed; the expected labels are Card number, Name on card, Expiration date (MM/YY), CVV, Address line 1, Address line 2 (optional), City, State, ZIP code, Country/region. Microsoft validates new cards with a temporary $0 authorization.
- Account-level payment options (Xbox Support): "Credit cards, including prepaid credit cards; Debit cards (not available in all regions); PayPal (not available in all regions); Mobile operator billing (not available in all regions); Direct debit (Germany only)". The cart also says "Pay over time options may be available for qualified customers at checkout for eligible purchases when checking out with a Microsoft account." Display order inside the picker and pay-over-time eligibility for a digital pre-order are unverified.
- Account balance: "If your account balance is lower than the amount you authorized for pre-order billing, the remainder will be taken from your credit card." The balance must also cover tax ("$9.99 game ... $10.00 balance ... wouldn't be enough to cover the taxes").

### 5d - Charge timing and cancellation (exact Microsoft text)

- Microsoft Support: "If you use money in your Microsoft account, we'll charge you right away. If you use any other payment option, including payment backup, we may charge you up to 10 days before the release date."
- Xbox Support: "If you used account credit to pre-order your game, your balance will be taken immediately. If you used a credit card or split the payment between a credit card and account balance, you'll be charged around 10 days before the early access period or the release date". "After a charge on your account has failed for a pre-order, there will be another attempt at a charge a few days later. If that second attempt fails ... your pre-order will be canceled". A failed charge produces a message; in Order history the item gets **"Change how you pay"** -> **"Pick another way to pay"**.
- Cancel: "you can do this up to 10 days before the game launches by signing in to your Microsoft account and going to your order history page. After this time, you may be billed, and to cancel you'll need to request a refund." Order history cancel control: **"Cancel item"** (check the item, then **"Cancel item"** again). "If you cancel a pre-order after it's billed but before it's released, we'll process it as a refund."
- Terms of Sale: "We may offer an option to pre-order some Products before their availability date. To learn more about our pre-order policies, please see our Pre-Orders page." and "The Terms of Sale in force at the time you place your order will govern your purchase and serve as the purchase contract between us."
- Refund posture for digital items (xbox.com Web Purchase terms): "All purchases of Digital Products on the Service are final and non-refundable."

## Step 6 - Confirmation (not observed - low confidence)

- On-screen: a "Thanks for your purchase"-style panel with the item, amount, payment method, order number, a link to Order history, and an install / "Install to" option (pre-orders pre-download to the console and unlock at release).
- Email subject reported by users: **"Microsoft Store - Order Confirmation (Order #xxxxxxxxxx)"**; order numbers are believed to be 10 digits (same length as the cart id) but this was not verified. Orders appear at `https://account.microsoft.com/billing/orders` ("Payment & billing" > "Order history") with "Order details" / "Print" and, after 2-5 days, a "Tax invoice". Xbox Support: the list can be filtered by "In progress, Returned/Refunded, Digital, or Physical"; a successful purchase is listed as **"Completed"**; a pre-order's "release date and status" are under **"Details"**.
- When the pre-order is finally billed to a card, Xbox Support says "You'll receive an email to your billing account confirming that the remaining card payment was collected successfully".
- Pre-order bonus handling: Vintage Vice City Pack is bundled; the GTA+ month is redeemed later on the console under "Offers & credits". Xbox Support: "If you don't see an incentive right after you place your order, you can expect to receive it the same day that your pre-order is available."
- Install: the game shows in "My games & apps" on the console; if it does not, search the Store and use **Install** ("If you don't see the Install option, or if you see a price listed for the purchase, don't purchase the game").

---

## Look and feel

- **Header** (54px): left `Microsoft` logo (four-colour square + wordmark) | thin divider | `XBOX` sphere logo + wordmark; nav **Game Pass ▾ · Games ▾ · Devices ▾ · Play · More ▾**; right **All Microsoft ▾**, search magnifier, cart icon (with count badge), round avatar **"ME"** that acts as **Sign in**. On store/product/cart pages the header sits on the dark page background (`#1a1b1e`, white text); on the search page the header is white with dark text. Mega-menus under Games include "Games home", "Shop all console games", "Shop all PC games", "Cloud games", "XBOX Play Anywhere", "Free-to-Play games", "Optimized for XBOX Series X|S", "Optimized for handhelds", "Backward compatible games", "Sales & Specials", "Redeem Code". "More" holds Store, Community, Support, My XBOX (Profile, Rewards, Wish list), Developers.
- **Colours** (getComputedStyle on the product page): page background `#1a1b1e` (rgb 26,27,30); text `#ffffff`; PRE-ORDER button `#008746` (rgb 0,135,70) white text, 4px radius, 8px 16px padding, 14px Segoe UI; CHOOSE EDITION / "..." buttons `#484e58` (rgb 72,78,88) white text, 4px radius. Cart **Checkout** button is a brighter lime green with dark text (estimate ~`#9bf00b`, iframe not inspectable). Search-results "PRE-ORDER" ribbon is a dark slate blue-grey with white uppercase text; search page background white. Sign-in page: charcoal card (~`#1f1f1f`) on a dark navy/purple gradient, green "Next" button, green link text.
- **Typography**: body `"Segoe UI", SegoeUI, "Helvetica Neue", Helvetica, Arial, sans-serif`; product H1 `"Bahnschrift Light"` 40px weight 400; section headings ("Gallery", "Description", "Compare editions") white ~20-24px; uppercase small labels for buttons and tags ("PRE-ORDER", "CHOOSE EDITION", "THIS EDITION", "DETAILS"). Search-result tile titles are bold, dark, slightly larger, on white cards with a thin border.
- **Product tile** (search): white card, portrait cover art, bold title (2 lines max, truncated with "..."), price "$79.99+" left-aligned, full-width dark ribbon "PRE-ORDER" at the bottom edge.
- **Product page layout**: full-width dark hero with blurred key art; cover art (about 140x200) left, title/meta/badges/buy box right; then ESRB strip on a darker band; tab bar; then stacked full-width sections (Gallery carousel, In this bundle rail, Description + facts two-column, Play with / Capabilities lists, Compare editions cards, Add-ons rail); dark footer with link columns Browse / Resources / Microsoft Store / Rewards / For Developers, locale switcher "English (United States)", "Your Privacy Choices", "Consumer Health Privacy", and Microsoft corporate links.
- **Cart layout**: two columns on a dark background: line items left (title link underlined, small ESRB badge, "Digital", price, quantity, Remove | Save for later), summary card right (Subtotal, Before applicable taxes, Checkout), an info card, then "Need help?" and the cart id.

## Quirks

1. **Account wall, no guest**: both "Checkout" and "PRE-ORDER" go straight to login.live.com. Microsoft's guest checkout exists only for some physical items on microsoft.com; not for this.
2. **Direct-purchase button first**: the primary CTA buys immediately (after sign-in). "Add to cart" is tucked into the "..." menu with "Add to wishlist" and "Redeem a code".
3. **Silent add-to-cart**: no modal/toast; menu entry flips to "Open cart", header badge shows "1".
4. **Editions are separate products**: Standard `9p3h4968grsm`, Ultimate `9nnzsnhlr63l`; "CHOOSE EDITION" is a navigation dropdown. The $20.00 "Ultimate Edition Upgrade" add-on (`9pn4llbr8rch`) can be pre-ordered separately.
5. **"+" on prices** means "+Offers in-app purchases." (cart says "†Contains in-app purchases").
6. **Release date shown as 11/18/2026** on the product page and cart, while the description says purchase "prior to 19 November 2026 23:59:59" and Rockstar's official date is Nov 19, 2026.
7. **Cart is a cross-origin iframe** (microsoft.com) inside the xbox.com shell, with a visible 10-digit "Cart:" id; the guest cart persists by cookie.
8. **Charge timing**: account balance now; card/PayPal "up to 10 days before the release date"; cancel via Order history; failed auth cancels the pre-order after retries.
9. **Dark store pages, light search page**; gallery media "This content is locked" while signed out.
10. **Store Assistant chat bubble** ("Need help? Let's chat") on store pages.
11. **Pay-over-time notice** in cart, account-only. Promo codes account-only. Gift cards account-only.
12. **Digital only**: no shipping or pickup; tax from billing address; "All purchases of Digital Products on the Service are final and non-refundable."
13. **Two post-sign-in UIs**: PRE-ORDER -> purchase dialog ("Choose a way to pay" / "Confirm payment", press **Pre-order** again); cart Checkout -> checkout page ("Step 1: Shipping" / "Step 2: Payment", "Add a promo code", **Place order**). Promo codes only on the cart path.
14. **Press the button twice**: Microsoft's own wording is "On the confirmation screen, select Buy again to complete the purchase."
15. **Balance must cover tax**; a card takes the remainder of a split payment.

## Sources

Observed in browser:
- https://www.xbox.com/en-US/search/results?q=grand%20theft%20auto%20vi
- https://www.xbox.com/en-US/games/store/grand-theft-auto-vi/9p3h4968grsm
- https://www.xbox.com/en-US/games/store/grand-theft-auto-vi-ultimate-edition/9nnzsnhlr63l
- https://www.xbox.com/en-US/cart
- https://login.live.com/oauth20_authorize.srf?... (redirect from Checkout / PRE-ORDER; redirect_uri=https://www.xbox.com/auth/msa?action=loggedIn)
- Linked from the pages: https://www.xbox.com/en-US/games/store/grand-theft-auto-vi-ultimate-edition-upgrade/9pn4llbr8rch, https://www.xbox.com/en-US/games/store/grand-theft-auto-vi/9nl3wwnzlzzn, https://www.xbox.com/en-US/games/store/grand-theft-auto-vi-vintage-vice-city-pack/9plvssh8849x, https://www.microsoft.com/store/buy/cartcount

Microsoft help / legal:
- https://support.microsoft.com/accounts-billing/pre-orders-for-microsoft-store
- https://support.microsoft.com/help/4000643/microsoft-store-pre-orders
- https://support.microsoft.com/help/4000642 (Cancel an order or pre-order)
- https://support.microsoft.com/en-US/accounts-billing/guest-checkout
- https://support.microsoft.com/en-US/accounts-billing/how-to-buy-from-the-microsoft-store
- https://support.microsoft.com/en-US/accounts-billing/microsoft-store-promo-codes
- https://support.microsoft.com/en-us/account-billing/view-your-microsoft-store-order-history-aafefe88-3ec2-ce28-e0b6-eff1d5cc8170
- https://support.microsoft.com/en-US/accounts-billing/tax-invoices-breakdowns-and-registration-numbers-for-microsoft-store
- https://support.microsoft.com/en-us/accounts-billing/add-a-new-bank-or-credit-card-to-your-microsoft-account
- https://support.microsoft.com/en-us/accounts-billing/payment-billing-and-the-microsoft-store-app-help
- https://www.xbox.com/en-US/legal/web-purchase
- https://devdocs.xbox.com/publishing/game-publishing/concepts/availability/preorder-overview
- https://learn.microsoft.com/en-us/previous-versions/microsoft-store/payment-methods
- https://learn.microsoft.com/en-us/answers/questions/3868665/unable-to-checkout-from-the-microsoft-store-after

Follow-up (Xbox Support pages read in the browser; Microsoft docs):
- https://support.xbox.com/en-US/help/subscriptions-billing/buy-games-apps/making-purchases-on-xbox (Buy / Pre-order button, "Choose a way to pay" / "Confirm payment", "Add a way to pay" fields, xbox.com "Place order")
- https://support.xbox.com/en-US/help/subscriptions-billing/buy-games-apps/pre-order-faq (billing timing, "Change how you pay", cancel window, incentives)
- https://support.xbox.com/en-US/help/subscriptions-billing/billing-payment-updates/manage-payment-options-and-billing-address
- https://support.xbox.com/en-US/help/subscriptions-billing/billing-payment-updates/check-xbox-purchase-history
- https://support.xbox.com/en-US/help/subscriptions-billing/billing-payment-updates/use-paypal-with-microsoft-account
- https://support.xbox.com/en-US/help/subscriptions-billing/buy-games-apps/account-balance-purchase
- https://support.xbox.com/en-US/help/subscriptions-billing/buy-games-apps/buying-digital-game-faq
- https://support.xbox.com/en-US/help/account-profile/manage-account/sign-in
- https://www.microsoft.com/en-us/store/b/terms-of-sale (loaded in the browser)
- https://learn.microsoft.com/en-us/entra/fundamentals/how-to-manage-stay-signed-in-prompt ("Stay signed in?" prompt wording)
- https://www.microsoft.com/en-us/store/cart (microsoft.com view of the shared cart; body not exposed to the accessibility tree)

Guides / press:
- https://www.igeeksblog.com/how-to-pre-order-gta-6-on-ps5-and-xbox/
- https://www.purexbox.com/news/2025/06/gta-6-now-has-an-xbox-store-page-and-you-can-kind-of-pre-install-it
- https://www.purexbox.com/news/2026/04/heres-a-breakdown-of-the-new-prices-for-xbox-game-pass-as-of-april-2026
- https://news.xbox.com/en-us/2026/04/21/xbox-game-pass-update/
- https://www.gamespot.com/articles/you-can-now-pay-for-digital-xbox-games-with-venmo/1100-6516316/
- https://www.vice.com/en/article/xbox-users-gta-6-pre-orders-free/
- https://opencritic.com/news/33662/xbox-trick-helps-you-get-gta-6-cheaper
- https://tbreak.com/gta-6-preorder-date-november-release-2026/
- https://esports.gg/news/gaming/gta-6-pre-order/
- https://www.gtabase.com/articles/gta-6/gta-6-editions-guide-pre-order-bonus-special-editions-content?page=2
