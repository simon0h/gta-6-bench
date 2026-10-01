# GTA 6 pre-order flows: cross-retailer comparison

Researched 2026-09-29/30 from the live sites (built-in browser) plus each retailer's help pages and third-party guides.
Per-retailer detail lives in `research/<slug>.json` (structured) and `research/<slug>.md` (walkthrough). Bold rows are the ten cloned.

| Retailer | Country | Currency | Pre-order live | Formats | Platforms | Editions and prices | Guest checkout | Account required | Checkout steps | Payment methods (first few) | When charged | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **GameStop** | US | USD | yes | code-in-box | PS5, Xbox Series X|S | Standard $79.99 | yes | no | Sign in or check out as guest → Checkout page - Shipping section → Checkout page - Payment section and Place Order | Visa, MasterCard, American Express, Discover | Temporary authorization at order | high |
| **Target** | US | USD | yes | code-in-box | PS5, Xbox Series X|S | Standard $79.99 | no | yes | Sign in → Shipping address → Payment → Review & place order | Target Circle™ Card, Visa®, Mastercard®, American Express®, Discover®/Novus®, Target PCard, foreign-bank credit cards, Apple Pay®, Cash App Pay | Authorization hold when the order is placed and again 7 days | high |
| **Best Buy** | US | USD | yes | code-in-box | PS5, Xbox Series X|S | Standard $79.99 | yes | no | Contact info → Shipping address → Shipping details → Pickup details → Payment method | Visa, Mastercard, American Express, Discover | Preauthorization at order time | high |
| **Walmart** | US | USD | yes | code-in-box | PS5, Xbox Series X|S | Standard $79.99 | no | yes | Identify → Sign in → Create your Walmart account → Checkout page → Delivery address → Contact → Payment method → Walmart+ plan → Review + Place order | Credit cards, Debit cards, PayPal, Pay by bank | when shipped | medium |
| **Amazon (US)** | US | USD | yes | code-in-box | PS5, Xbox Series X|S | Standard $79.99 | no | yes | Sign in or create account → Select a delivery address → Select a payment method → Review items and shipping | Visa, Amazon Store Card, Amazon Secured Card, MasterCard/EuroCard | when shipped | medium |
| **PlayStation Store** | US | USD | yes | digital | PS5 | Standard $79.99, Ultimate $99.99 | no | yes | Sign in → Checkout drawer → Add Payment Method → Confirmation | Visa, Mastercard, American Express, Discover | at order | medium-high |
| **Xbox Store (Microsoft Store) - xbox.com** | US | USD | yes | digital | Xbox Series X|S | Standard $79.99, Ultimate $99.99 | no | yes | Sign in → Payment → Review | Credit or debit card - Visa, Mastercard, American Express, Discover, PayPal, Venmo, Gift card / Microsoft account balance | Digital pre-order: charged immediately if paid with Microsof | medium |
| **Rockstar Store** | US | USD | yes | code-in-box, digital | PS5, Xbox Series X|S | Standard $79.99, Ultimate $99.99 | yes | no | Shipping Address → Shipping Method → Payment | Credit/debit/prepaid/gift cards, PayPal, Google Pay, Apple Pay | when shipped, per Xsolla's physical pre-order help page | high |
| **GAME (UK)** | UK | GBP | yes | code-in-box | PS5, Xbox Series X|S | Standard £69.99 | yes | no | Sign in or register → Delivery → Payment | Apple Pay, Gift Cards, Maestro, Mastercard | Authorisation | medium |
| **JB Hi-Fi** | AU | AUD | yes | code-in-box | PS5, Xbox Series X|S | Standard A$129 | yes | no | Customer and Shipping Information → Shipping → Payment | Visa, Mastercard, American Express, UnionPay | at order | high |
| Smyths Toys Superstores | UK | GBP | yes | code-in-box | PS5, Xbox Series X|S | Standard £67.99 | yes | no | Delivery method → Your details → Payment → Review & place order | Visa, Mastercard, Maestro, PayPal | Card: pre-authorised 2-7 days before the item becomes availa | medium |
| EB Games (Australia) | AU | AUD | yes | code-in-box | PS5, Xbox Series X|S | Standard A$129.95 | yes | no | Sign in → Delivery or Click & Collect → Payment | Visa, Mastercard, American Express, PayPal | deposit | medium |

## The ten cloned, and why

All twelve candidates have GTA VI live for pre-order. The ten below give the widest spread of flow shapes; GameStop, Target and Best Buy were required.

1. **GameStop** (US): guest allowed, single-page checkout, "Pre-Order" CTA, Pro membership upsells, cart quantity picker, 16-digit order number.
2. **Target** (US): no guest checkout at all, drawer add-to-cart, fulfillment tabs (Pickup / Delivery / Shipping), accordion checkout ending in "Place your order".
3. **Best Buy** (US): guest allowed via "Continue as Guest", redirect-to-cart, Pickup/Shipping toggle, sub-stepped single page, BBY01- order numbers.
4. **Walmart** (US): identity gate with one "Phone number or email" field and no guest option, "Added to cart!" interstitial page, card-style checkout with "Place order for $79.99", Walmart+ plan upsell inside checkout.
5. **Amazon** (US): sign-in wall, in-place add-to-cart, address → payment → review pages, "Place your order", 3-7-7 order numbers.
6. **PlayStation Store** (US, digital): PSN sign-in required, edition cards on one concept page, cart/checkout drawer with wallet-first payment and "Pre-Order & Pay", charged immediately.
7. **Xbox Store** (US, digital): Microsoft account required, edition picker, purchase dialog with "Pre-order" pressed twice, charged ~10 days before launch.
8. **Rockstar Store** (US): six listings (code-in-box and digital, standard and ultimate), age gate, guest modal, no cart step, Xsolla Pay Station checkout (address locked after step 1).
9. **GAME** (UK, GBP): "I'm Old Enough" age gate, "Add to bag", email-first sign-in-or-guest, delivery options incl. Click & Collect and Next Day by Evri/DPD, "Pay now", PayPal blocked on pre-orders.
10. **JB Hi-Fi** (AU, AUD): Shopify-style three-step checkout (Customer and Shipping Information → Shipping → Payment), guest by default, paid in full at order, Click & Collect.

Excluded:
- **Smyths Toys** (UK): lowest-confidence research (12 open gaps) and a flow shape already covered by GAME (UK physical retailer, Click & Collect vs Home Delivery, guest checkout).
- **EB Games** (AU): GameStop-owned; its flow (Sign in / Guest → Delivery or Click & Collect → Payment) overlaps GameStop and JB Hi-Fi, and its research is medium confidence with no confirmation page details.

## Shared components (what every flow has)

- A header search box that finds the game for "gta 6" / "grand theft auto vi" and a results grid with the game next to distractors (GTA VI controller, soundtrack, GTA V).
- A product page per platform (or an edition picker) with price, release date line, a pre-order CTA, and pre-order bonus text (Vintage Vice City Pack, one month of GTA+).
- An add-to-cart acknowledgement (modal, drawer, toast, interstitial page, or redirect to cart).
- A cart or order summary with subtotal, shipping, estimated tax, total.
- An auth gate (guest button, sign-in, or hard account wall), then address, delivery method, payment (card number / expiry / CVV, plus PayPal and store-specific wallets), a review or combined final step, a place-order button, and a confirmation page with an order number in the retailer's own format.
- Charge-timing copy for pre-orders (authorization now, charge at ship; or charged immediately for digital).

## Per-store differences that matter for an agent

- **Auth**: GameStop, Best Buy, Rockstar, GAME, JB Hi-Fi allow guests. Target, Walmart, Amazon, PlayStation, Xbox require an account (test account: tester@example.com / Password123!).
- **Where the platform is chosen**: separate listings (GameStop, Target, Best Buy, Walmart, Amazon, GAME, JB Hi-Fi) vs an in-page selector (Rockstar, Xbox edition picker, PlayStation edition cards).
- **Cart step**: none at Rockstar (direct to checkout) and PlayStation (drawer); interstitial page at Walmart; drawer at Target and PlayStation; modal at GameStop, GAME, JB Hi-Fi; redirect to cart at Best Buy and Walmart; in-place at Amazon.
- **Fulfillment**: ship only (GameStop, Amazon, Rockstar, Walmart for this item), ship or pickup (Target, Best Buy, GAME, JB Hi-Fi), digital (PlayStation, Xbox, Rockstar digital editions link out to the platform stores).
- **Place-order label**: Place Order / Place your order / Place order for $79.99 / Pay now / Pre-Order & Pay / Pre-order / Confirm Purchase.
- **Upsells in the way**: GameStop Pro, Target Circle Card, My Best Buy membership and protection, Walmart+ plan card inside checkout, Amazon Prime, PS Plus / GTA+, Xbox Game Pass.

## Open gaps builders resolved by assumption

Most checkout forms sit behind sign-in walls or bot checks, so exact field labels for Target, Walmart, Amazon, PlayStation, Xbox and Rockstar's payment step come from help pages and general knowledge (marked low confidence in the JSON). Each clone marks those choices with `// ASSUMPTION:` comments. Order-number formats for GAME and JB Hi-Fi were not published and are plausible guesses.
