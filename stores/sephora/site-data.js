// Reference-mode site structure for the Sephora clone, from sephora.com on 2026-10-13.
// See research/parity/sephora.json for which parts were fetched and which come from prior
// knowledge. Counts are the product counts the real department pages displayed; they describe
// the retailer's assortment, not this replica's inventory (which is limited to captured search cards).

// slug -> { title, parent?, subs: [[label, slug, count?]], quick: [label, path][], related: [label, path][] }
const q = (label, path) => [label, path]
export const DEPARTMENTS = {
  'makeup-cosmetics': { title: 'Makeup', intro: 'Find your signature look with foundation, concealer, mascara, lipstick and more from the brands you love.',
    subs: [['Face', 'face-makeup', 867], ['Cheek', 'cheek-makeup', 326], ['Lip', 'lips-makeup', 598], ['Mini Size', 'mini-makeup', 277], ['Vegan', 'vegan-makeup', 844], ['Eye', 'eye-makeup', 705], ['Makeup Palettes', 'makeup-palettes', 83], ['Value & Gift Sets', 'makeup-kits-makeup-sets', 251], ['Brushes & Applicators', 'makeup-brushes', 266], ['Accessories', 'makeup-tools', 261]],
    quick: ['New', 'Bestsellers', 'Value Sets', 'Mini Size', 'Jumbo Size', 'Clean', 'Vegan', 'Cruelty-Free'],
    related: [['Foundations', 'foundation-makeup'], ['Fragrance', 'fragrance'], ['Mascara', 'mascara'], ['Lip Makeup', 'lips-makeup'], ['Makeup Accessories', 'makeup-tools'], ['Face Makeup', 'face-makeup'], ['Eye Makeup Products', 'eye-makeup'], ['Clean Makeup: Natural & Organic Options', 'clean-makeup'], ['Luxury & Designer Beauty Products', 'luxury-beauty']] },
  skincare: { title: 'Skincare', intro: 'Cleansers, moisturizers, treatments and sunscreen for every skin type and concern.',
    subs: [['Moisturizers', 'moisturizing-cream-oils-mists'], ['Cleansers', 'cleanser'], ['Treatments', 'facial-treatments'], ['Masks', 'face-mask'], ['Eye Care', 'eye-treatment-dark-circle-treatment'], ['Sunscreen', 'sunscreen-sun-protection'], ['Lip Balms & Treatments', 'lip-treatments'], ['Mini Size', 'mini-skincare'], ['Value & Gift Sets', 'skin-care-sets-travel-value'], ['Vegan', 'vegan-skin-care'], ['High Tech Tools', 'skin-care-tools']],
    quick: ['New', 'Bestsellers', 'Value Sets', 'Mini Size', 'Jumbo Size', 'Clean', 'Vegan', 'Cruelty-Free', 'Sephora Collection', 'Korean Skincare'],
    related: [['Face Wash & Facial Cleanser', 'face-wash-facial-cleanser'], ['Moisturizer, Face Moisturizer & Skin Moisturizer', 'moisturizing-cream-oils-mists'], ['Cleansers', 'cleanser'], ["Men's Skin Care Products", 'men'], ['Face Serum & Face Treatments', 'face-serum'], ['Sunscreen', 'sunscreen-sun-protection'], ['Clean Skincare | Natural & Organic Options', 'clean-skin-care'], ['FSA Eligible Sunscreen, Acne, & Wellness Products', 'fsa-eligible-products'], ['Luxury & High End Skincare Products', 'luxury-skincare']] },
  'hair-products': { title: 'Hair', intro: 'Shampoo, conditioner, styling, treatments and hot tools for every hair type and texture.',
    subs: [['Shop by Concern', 'best-hair-products-by-hair-type', 1518], ['Hair Styling & Treatments', 'hair-products-treatments', 1278], ['Vegan', 'vegan-hair-care', 577], ['Mini Size', 'mini-hair-products', 391], ['Value & Gift Sets', 'hair-care-sets', 210], ['Shampoo & Conditioner', 'shampoo-conditioner', 629], ['Tools', 'hair-styling-tools', 196], ['Accessories', 'hair-clips-hair-bands', 114], ['Brushes & Combs', 'hair-brushes', 59]],
    quick: ['New', 'Bestsellers', 'Value Sets', 'Mini Size', 'Clean', 'Vegan'], related: [['Shampoo & Conditioner', 'shampoo-conditioner'], ['Hair Styling Tools', 'hair-styling-tools'], ['Hair Treatments', 'hair-products-treatments']] },
  fragrance: { title: 'Fragrance', intro: 'Perfume, cologne, body mists and home scents, from fresh and floral to warm and woody.', crumbParent: false,
    subs: [['Shop by Fragrance Family', 'fragrance-families-notes', 1742], ['Women', 'fragrances-for-women', 1571], ['Vegan', 'vegan-fragrance', 290], ['Unisex / Genderless', 'unisex-perfume-cologne', 495], ['Men', 'fragrances-for-men', 581], ['Value & Gift Sets', 'fragrance-value-sets-gifts', 342], ['Mini Size', 'mini-perfume', 541], ['Candles & Home Scents', 'home-fragrance', 58]],
    quick: ['New', 'Bestsellers', 'Value Sets', 'Mini Size', 'Clean', 'Vegan'], related: [["Women's Perfume", 'fragrances-for-women'], ["Men's Cologne", 'fragrances-for-men'], ['Perfume Gift Sets', 'fragrance-value-sets-gifts']] },
  'makeup-tools': { title: 'Tools & Brushes', intro: 'Brushes, sponges, applicators, hair tools and skincare devices.',
    subs: [['Brushes & Applicators', 'makeup-brushes'], ['Hair Tools', 'hair-styling-tools'], ['High Tech Tools', 'skin-care-tools'], ['Brushes & Combs', 'hair-brushes'], ['Accessories', 'hair-clips-hair-bands']],
    quick: ['New', 'Bestsellers', 'Value Sets'], related: [['Makeup Brushes', 'makeup-brushes'], ['Hair Styling Tools', 'hair-styling-tools']] },
  'bath-body': { title: 'Bath & Body', intro: 'Body moisturizers, cleansers, scrubs, sunscreen and wellness essentials.',
    subs: [['Body Moisturizers', 'body-moisturizers', 329], ['Shop by Concern', 'body-care-by-concern', 276], ['Body Care', 'body-care', 220], ['Mini Size', 'mini-bath-products', 79], ['Bath & Shower', 'bath-and-body-soap', 177], ['Wellness', 'wellness-products', 86], ['Value & Gift Sets', 'bath-gift-sets', 57], ['Sunscreen', 'sun-lotion', 126], ['Self Tanners', 'bronzer-self-tanner-bath-body', 39], ['Candles & Home Scents', 'home-scents-candles', 28]],
    quick: ['New', 'Bestsellers', 'Value Sets', 'Mini Size', 'Clean'], related: [['Body Lotion', 'body-moisturizers'], ['Body Wash', 'bath-and-body-soap'], ['Self Tanner', 'bronzer-self-tanner-bath-body']] },
  'travel-size-toiletries': { title: 'Mini Size', intro: 'Travel-size and mini versions of beauty favorites.',
    subs: [['Makeup', 'mini-makeup'], ['Skincare', 'mini-skincare'], ['Hair', 'mini-hair-products'], ['Fragrance', 'mini-perfume'], ['Bath & Body', 'mini-bath-products']], quick: ['New', 'Bestsellers'], related: [] },
  gifts: { title: 'Gifts', intro: 'Gift ideas for everyone on your list, plus value sets and gift cards.',
    subs: [['Gifts for Her', 'gifts-for-her'], ['Gifts for Him', 'gifts-for-men'], ['Value & Gift Sets', 'value-sets'], ['Gifts Under $25', 'gifts-under-25'], ['Gifts Under $50', 'gifts-under-50']], quick: ['Gift Cards', 'Value Sets'], related: [] },
}
// Second-level and soft-link categories reachable from the department pages.
const extra = { 'foundation-makeup': ['Foundation', 'makeup-cosmetics'], mascara: ['Mascara', 'makeup-cosmetics'], 'clean-makeup': ['Clean Makeup', 'makeup-cosmetics'], 'luxury-beauty': ['Luxury Beauty', null],
  'face-wash-facial-cleanser': ['Face Wash & Facial Cleanser', 'skincare'], men: ['Men', null], 'face-serum': ['Face Serums', 'skincare'], 'clean-skin-care': ['Clean Skincare', 'skincare'], 'fsa-eligible-products': ['FSA Eligible Products', 'skincare'], 'luxury-skincare': ['Luxury Skincare', 'skincare'],
  'value-sets': ['Value & Gift Sets', 'gifts'], 'gifts-for-her': ['Gifts for Her', 'gifts'], 'gifts-for-men': ['Gifts for Him', 'gifts'], 'gifts-under-25': ['Gifts Under $25', 'gifts'], 'gifts-under-50': ['Gifts Under $50', 'gifts'] }
export const CATEGORIES = {}
for (const [slug, dept] of Object.entries(DEPARTMENTS)) CATEGORIES[slug] = { ...dept, slug, top: true }
for (const [parent, dept] of Object.entries(DEPARTMENTS)) for (const [label, slug, count] of dept.subs) {
  if (!CATEGORIES[slug]) CATEGORIES[slug] = { title: label, slug, parent, count }
}
for (const [slug, [title, parent]] of Object.entries(extra)) if (!CATEGORIES[slug]) CATEGORIES[slug] = { title, slug, parent }
// Nicer page titles for second-level categories whose tile label is short.
Object.assign(CATEGORIES['face-makeup'], { title: 'Face Makeup' }); Object.assign(CATEGORIES['lips-makeup'], { title: 'Lip Makeup' }); Object.assign(CATEGORIES['eye-makeup'], { title: 'Eye Makeup' }); Object.assign(CATEGORIES['cheek-makeup'], { title: 'Cheek Makeup' })
Object.assign(CATEGORIES['mini-makeup'], { title: 'Mini Makeup' }); Object.assign(CATEGORIES['mini-skincare'], { title: 'Mini Skincare' }); Object.assign(CATEGORIES['mini-hair-products'], { title: 'Mini Hair Products' }); Object.assign(CATEGORIES['mini-perfume'], { title: 'Mini Perfume' }); Object.assign(CATEGORIES['mini-bath-products'], { title: 'Mini Bath & Body' })

export const QUICK_LINKS = { New: '/beauty/new-beauty-products', Bestsellers: '/beauty/best-selling-beauty', 'Value Sets': '/shop/value-sets', 'Mini Size': '/shop/travel-size-toiletries', 'Jumbo Size': '/beauty/supersized-beauty-products', Clean: '/beauty/clean-beauty', Vegan: '/shop/vegan-makeup', 'Cruelty-Free': '/beauty/clean-beauty', 'Sephora Collection': '/brand/sephora-collection', 'Korean Skincare': '/shop/skincare', 'Gift Cards': '/beauty/giftcards' }

export const FILTERS = ['In Store', 'Fast Delivery', 'Your Beauty Preferences', 'Price Range', 'Brand', 'Rating', 'Shopping Preferences', 'New', 'Sale', 'Ingredient Preferences', 'Skin Concerns', 'Skin Type', 'Size', 'Formulation', 'Finish', 'Color Family']

// Main menu, left to right, as on sephora.com.
export const NAV = [
  ['New', '/beauty/new-beauty-products'], ['Brands', '/brands-list'], ['Makeup', '/shop/makeup-cosmetics', 'makeup-cosmetics'], ['Skincare', '/shop/skincare', 'skincare'], ['Hair', '/shop/hair-products', 'hair-products'],
  ['Fragrance', '/shop/fragrance', 'fragrance'], ['Tools & Brushes', '/shop/makeup-tools', 'makeup-tools'], ['Bath & Body', '/shop/bath-body', 'bath-body'], ['Mini Size', '/shop/travel-size-toiletries', 'travel-size-toiletries'],
  ['Gifts', '/shop/gifts', 'gifts'], ['Beauty Under $20', '/beauty/beauty-under-20'], ['Sale & Offers', '/sale'],
]

export const FOOTER = [
  ['About Sephora', [['About Sephora', '/beauty/about-us'], ['Newsroom', '/beauty/newsroom'], ['Careers', '/beauty/careers'], ['Sephora Accelerate', '/beauty/sephora-accelerate'], ['Supply Chain Transparency', '/beauty/supply-chain-transparency'], ['Affiliates', '/beauty/affiliates'], ['Sephora Events', '/happening/events'], ['Gift Cards', '/beauty/giftcards'], ['Sephora Global Sites', '/beauty/international-websites']]],
  ['My Sephora', [['Beauty Insider', '/profile/BeautyInsider'], ['Sephora Credit Card', '/beauty/credit-card'], ['Community Profile', '/community/profile'], ['Order Status', '/profile/MyAccount/Orders'], ['Purchase History', '/purchase-history'], ['Account Settings', '/profile/MyAccount'], ['Beauty Advisor Recommendations', '/in-store-services'], ['Beauty Offers', '/beauty/beauty-offers'], ['Quiz & Buying Guides', '/beauty/quizzes-buying-guides'], ['Rewards Bazaar', '/rewards'], ['Lists', '/profile/Lists'], ['Book a Reservation', '/happening/reservations']]],
  ['Help', [['Customer Service', '/beauty/customer-service'], ['Returns & Exchanges', '/beauty/returns-exchanges'], ['Delivery and Pickup Options', '/beauty/delivery-pickup-options'], ['Shipping', '/beauty/shipping-information'], ['Billing', '/beauty/billing'], ['International Shipments', '/beauty/international-shipments'], ['Beauty Services FAQ', '/beauty/beauty-services-faq'], ["Sephora at Kohl's", '/beauty/sephora-at-kohls-faq'], ['Accessibility', '/beauty/accessibility']]],
]
export const LEGAL = [['Privacy Policy', '/beauty/privacy-policy'], ['Terms of Use', '/beauty/terms-of-use'], ['Accessibility', '/beauty/accessibility'], ['Sitemap', '/sitemap/departments'], ['Your Privacy Choices', '/beauty/your-privacy-choices']]

// Customer service topic groups (from /beauty/customer-service "All Topics").
export const HELP_TOPICS = [
  ['Shopping Sephora.com', [['Accessibility', 'accessibility'], ['International Websites', 'international-websites'], ['Beauty Services FAQs', 'beauty-services-faq'], ["Sephora at Kohl's", 'sephora-at-kohls-faq']]],
  ['Orders & Returns', [['Payment Methods', 'payment-methods'], ['Sephora Credit Card FAQs', 'credit-card'], ['Gift Cards & eGift Cards FAQs', 'faqs-gift-cards'], ['Billing, Canceling & Modifying Orders', 'billing'], ['Shipping Information (US)', 'shipping-information'], ['Returns & Exchanges', 'returns-exchanges'], ['Delivery and Pickup Options', 'delivery-pickup-options'], ['International Shipments', 'international-shipments']]],
  ['My Account Help', [['Account Registration, Sign In & Password', 'registration-sign-in'], ['Order Status & History', 'order-status']]],
  ['Beauty Insider', [['Beauty Insider FAQs', 'loyalty-program']]],
  ['About Sephora', [['About Sephora', 'about-us'], ['Contact Us', 'contact-us'], ['Terms of Use', 'terms-of-use'], ['Privacy Policy', 'privacy-policy'], ['Sephora Affiliates', 'affiliates']]],
]

// Information pages under /beauty/<slug>: [h1, intro, [heading, text][]]. Summaries of the real pages.
export const INFO = {
  'order-status': ['Order Status & History', 'Track Sephora.com orders from Order History in your account, or with the tracking link in your shipping confirmation email.', [
    ['Tracking an Order', 'Signed-in clients can see recent orders and tracking links under My Account › Orders. Guest orders can be looked up with the order number and the email address used at checkout. Delivery is usually estimated a few business days after an order ships.'],
    ['Order Statuses:', 'Orders move from Order Placed to Processing, Shipped, Partially Shipped and Delivered. Returned and canceled items appear on the order once they are processed.'],
    ['Canceling or Modifying an Order', 'Orders generally cannot be changed once placed, but most orders can be canceled shortly after purchase from Order Details.'],
    ['Partially Canceled Orders', 'If an item goes out of stock, it is removed and the rest of the order ships. Beauty Insider points, rewards, samples and shipping fees are adjusted for canceled items.'],
  ]],
  'returns-exchanges': ['Returns & Exchanges', 'Sephora accepts returns of new or gently used products with proof of purchase.', [
    ['Returns Policy', 'New or gently used products can be returned for a full refund to the original form of payment within 30 days of purchase. Proof of purchase is required. Sephora may decline returns it considers abusive and may request a government-issued ID.'],
    ['Sephora.com Purchases', 'Sephora.com orders can be returned at no cost by mail with a prepaid label or at a Sephora store.'],
    ['Online Purchase Return Procedures', '1. Sephora.com Returns by Mail: start a return from your order and use the prepaid label; mailed returns can take up to 30 days to process. 2. Sephora.com Returns to Store Location: bring the items and your packing slip or order number to a Sephora store.'],
    ['Gift Returns', 'Gifts with a gift receipt can be returned for store credit or online credit.'],
    ['Sephora In-store Purchases, Buy Online and Pick Up Orders, Same-Day Delivery Orders', 'In-store returns generally go back to the original card. PayPal, gift card and online credit payments are refunded as store credit.'],
    ['Sephora TikTok Shop Orders', 'TikTok Shop orders follow TikTok Shop return procedures.'],
    ["Sephora at Kohl's Returns", "Purchases made at Sephora at Kohl's must be returned to Kohl's."],
    ['Canadian Returns', 'Orders shipped to Canada follow the Sephora Canada return policy.'],
  ]],
  'shipping-information': ['Shipping Information (US)', 'Beauty Insiders get free standard shipping with no minimum purchase.', [
    ['Frequently Asked Questions', 'Orders ship Monday through Friday, excluding federal holidays, and usually leave the warehouse within one to two business days.'],
    ['Shipping Costs & Delivery Times', 'Standard (1–3 business days): free for Beauty Insiders; guests free on orders of $50 or more, otherwise $6.95. 2-Day Guaranteed: $12.95. 1-Day Guaranteed: $16.95.'],
    ['Hawaii & Alaska', 'USPS Priority Mail is used for Hawaii and Alaska addresses.'],
    ['Puerto Rico', 'Orders to Puerto Rico ship by USPS Priority Mail.'],
    ['PO Box', 'PO Box orders ship by USPS Priority Mail and are not eligible for expedited shipping.'],
    ['APO/FPO/DPO Military Addresses', 'Military orders ship by USPS Priority Mail, are not eligible for expedited shipping and may take up to 21 days.'],
    ['Parcel Forwarding Services', 'Sephora does not ship to parcel forwarding services.'],
    ['International Shipping', 'Sephora.com ships to the US and Canada; see Sephora Global Sites for other countries.'],
    ['Multiple Shipping Addresses', 'Each order ships to one address.'],
    ['Restricted Hazardous Items', 'Some aerosols and fragrances can only ship by ground.'],
    ['Business Days & Holidays', 'Orders are not processed or delivered on federal holidays.'],
    ['Multiple Shipments', 'Items may arrive in more than one package.'],
    ['Tracking Orders', 'A tracking link is emailed when your order ships and appears in Order History.'],
    ['Gift Cards', 'Physical gift cards ship free by USPS First Class Mail and usually arrive in 3–5 business days.'],
  ]],
  'about-us': ['About Sephora', 'Sephora is a prestige beauty retailer that aims to make beauty shopping welcoming for everyone. It operates more than 2,700 stores in 35 countries and is part of LVMH.', [
    ['Commitment to Diversity and Inclusion', 'Sephora pledged to dedicate 15% of its assortment to Black-owned brands and works to make its stores more inclusive.'],
    ['The Racial Bias in Retail Study Commissioned by Sephora', 'Sephora commissioned a study on racial bias in retail and published its findings and action plan.'],
    ['Best-in-Class Omnichannel Experience', 'Sephora.com, the Sephora app, Color iQ shade matching and the Beauty Insider Community connect online and in-store shopping.'],
    ['Beauty Insider Benefits', 'The free Beauty Insider loyalty program earns points on every purchase that can be redeemed in the Rewards Bazaar.'],
    ['Distribution Centers', 'Sephora operates five distribution centers in the United States.'],
    ["Sephora at Kohl's", "Sephora shops inside Kohl's stores bring prestige beauty to more communities."],
    ['Sephora Executives', 'Sephora Americas is led by an executive team based in San Francisco.'],
  ]],
  'contact-us': ['Contact Customer Service', 'Our Beauty Advisors are here to help with orders, products, stores and more.', [
    ['Call Us', '1-877-SEPHORA (1-877-737-4672), US and Canada. Monday–Friday 5am–9pm PT; Saturday–Sunday 6am–9pm PT. TTY is available through the Accessibility page.'],
    ['Chat with Us', 'Live chat is available during the same hours as phone support.'],
    ['About Sephora', 'Press and vendor inquiries are handled by Sephora corporate.'],
  ]],
  billing: ['Billing, Canceling & Modifying Orders', 'How charges, authorizations and order changes work.', [['Billing', 'Your card is authorized when you place an order and charged when it ships.'], ['Canceling an Order', 'Most orders can be canceled shortly after purchase from Order Details.'], ['Modifying an Order', 'Orders cannot be modified once placed.']]],
  'payment-methods': ['Payment Methods', 'Ways to pay on Sephora.com.', [['Accepted Payment Methods', 'Major credit and debit cards, the Sephora Credit Card, PayPal, Venmo, Apple Pay, Klarna, Afterpay, Sephora gift cards and online credit.']]],
  'delivery-pickup-options': ['Delivery and Pickup Options', 'Choose how you get your beauty.', [['Get It Shipped', 'Standard and expedited shipping to your address.'], ['Buy Online & Pick Up', 'Order online and pick up in a Sephora store, often the same day.'], ['Same-Day Delivery', 'Fast delivery from a nearby store in eligible areas.'], ['Auto-Replenish', 'Subscribe to favorites and get them delivered on a schedule.']]],
  'international-shipments': ['International Shipments', 'Sephora.com ships to addresses in the United States and Canada.', [['Shipping Outside the US', 'For other countries, shop the local Sephora site listed under Sephora Global Sites.']]],
  'international-websites': ['International Websites', 'Sephora operates local sites and stores around the world.', [['Sephora Global Sites', 'Sephora has sites for Canada, Mexico, Brazil, France, the UK, the Middle East, Southeast Asia, Australia and more.']]],
  'beauty-services-faq': ['Beauty Services FAQs', 'Book makeup, skincare and brow services in Sephora stores.', [['Booking a Service', 'Reserve services from Services & Events. Some services are complimentary with a minimum purchase.'], ['Cancellations', 'Cancel or reschedule from your reservation confirmation.']]],
  'sephora-at-kohls-faq': ["Sephora at Kohl's", "Sephora at Kohl's brings a curated Sephora assortment to Kohl's stores.", [["Shopping Sephora at Kohl's", "Purchases at Sephora at Kohl's are rung up and returned at Kohl's."], ['Beauty Insider', "Beauty Insider members can earn points at Sephora at Kohl's by linking their accounts."]]],
  accessibility: ['Accessibility', 'Sephora is committed to making its website, apps and stores accessible to everyone.', [['Our Commitment', 'Sephora works to conform with WCAG guidelines.'], ['Contact Us', 'Call 1-877-737-4672 for accessibility help; TTY is available.']]],
  'privacy-policy': ['Privacy Policy', 'How Sephora collects, uses and shares personal information.', [['Information We Collect', 'Information you provide, information collected automatically and information from partners.'], ['How We Use Information', 'To provide services, personalize your experience, and for marketing and security.'], ['Your Choices', 'Manage marketing and data preferences from Your Privacy Choices.']]],
  'terms-of-use': ['Terms of Use', 'The terms that apply when you use Sephora sites and apps.', [['Acceptance of Terms', 'By using the site you agree to these terms.'], ['Purchases', 'Prices and availability are subject to change.']]],
  'your-privacy-choices': ['Your Privacy Choices', 'Opt out of the sale or sharing of personal information and targeted advertising.', [['Do Not Sell or Share My Personal Information', 'Submit a request to opt out of the sale or sharing of your personal information.'], ['Other Requests', 'Request access to or deletion of your personal information.']]],
  newsroom: ['Newsroom', 'Sephora news, announcements and press materials. (The real Newsroom is a separate Sephora site; this page summarizes it.)', [['Latest News', 'Brand launches, store openings, Beauty Insider updates and corporate announcements.'], ['Media Contacts', 'Press inquiries go to the Sephora communications team.']]],
  careers: ['Careers', 'Jobs at Sephora stores, distribution centers and offices. (The real careers site is separate; this page summarizes it.)', [['Work at Sephora', 'Roles include Beauty Advisor, Operations, Distribution and Corporate teams.'], ['Benefits', 'Employee discount, product perks, training and education.']]],
  'sephora-accelerate': ['Sephora Accelerate', 'Sephora Accelerate is a brand incubator program that supports founders of color with mentoring, education and funding.', [['The Program', 'Founders join a cohort for workshops, mentorship and a chance to launch at Sephora.']]],
  'supply-chain-transparency': ['Supply Chain Transparency', "Sephora's disclosures on responsible sourcing and the California Transparency in Supply Chains Act.", [['Our Approach', 'Suppliers must comply with the Sephora and LVMH codes of conduct, which prohibit forced and child labor.']]],
  affiliates: ['Sephora Affiliates', 'Earn commission by sharing Sephora products through the Sephora affiliate program.', [['How It Works', 'Approved creators and publishers share links and earn commission on qualifying purchases.']]],
  'credit-card': ['Sephora Credit Card', 'The Sephora Credit Card and Sephora Visa Credit Card, issued by Comenity Capital Bank.', [['Card Benefits', 'Earn Credit Card Rewards on Sephora purchases and get a discount on your first purchase when approved.'], ['Managing Your Account', 'Pay your bill and manage your card through Comenity.']]],
  mobile: ['Get the App', 'Shop, earn and redeem Beauty Insider points, book services and scan products in store with the Sephora app.', [['App Features', 'Personalized recommendations, order tracking, Virtual Artist try-on and Buy Online & Pick Up.']]],
  'quizzes-buying-guides': ['Quiz & Buying Guides', 'Find your match with Sephora quizzes and buying guides.', [['Quizzes', 'Foundation finder, fragrance finder and skincare routine quizzes.'], ['Buying Guides', 'Guides to the best foundations, moisturizers, mascaras and more.']]],
  'faqs-gift-cards': ['Gift Cards & eGift Cards FAQs', 'Sephora gift cards have no fees and no expiration date.', [['Using Gift Cards', "Use gift cards in Sephora stores, on Sephora.com and at Sephora at Kohl's."], ['Checking a Balance', 'Check a balance with the 16-digit card number and PIN on the Gift Cards page or by phone.']]],
  'registration-sign-in': ['Account Registration, Sign In & Password', 'Create an account, sign in and reset your password.', [['Creating an Account', 'Joining Beauty Insider creates your Sephora.com account.'], ['Forgot Password', 'Use Forgot password on the sign-in page to get a reset email.']]],
  'loyalty-program': ['Beauty Insider FAQs', 'Answers about points, tiers and rewards.', [['Earning Points', 'Earn 1 point per $1 spent; VIB and Rouge members earn more during events.'], ['Tiers', 'Insider is free; VIB after $350 and Rouge after $1,000 spent in a calendar year.']]],
  'beauty-under-20': ['Beauty Under $20', 'Affordable picks across makeup, skincare, hair and fragrance.', [['Shop by Category', 'Browse Makeup, Skincare, Hair, Fragrance and Mini Size for items under $20.']]],
  'best-selling-beauty': ['Bestsellers', 'The most-loved products at Sephora right now.', [['Shop Bestsellers', 'Browse bestselling makeup, skincare, hair and fragrance.']]],
  'supersized-beauty-products': ['Jumbo Size', 'Value and jumbo sizes of beauty favorites.', [['Shop Jumbo Size', 'Larger sizes for better value.']]],
  'clean-beauty': ['Clean at Sephora', 'Products formulated without a list of ingredients Sephora restricts.', [['What Clean Means', 'Clean at Sephora products are made without parabens, sulfates (SLS and SLES), phthalates and more.']]],
  'ai-beauty-chat': ['AI Beauty Chat', 'Ask Sephora’s AI beauty assistant for product suggestions and routines.', [['How it works', 'Tell the assistant about your skin, hair or the look you want and get product picks from across Sephora.']]],
}
