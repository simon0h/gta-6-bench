// Information, policy and editorial pages. Headings follow the help.argos.co.uk / argos.co.uk pages
// captured on 2026-10-13; body copy is a short summary of each real section. Pages that replace
// off-site links (Sainsbury's corporate site, careers, partner services) say where the real page lives.
// Every service on these pages is described only: nothing here books, charges or links an account.

const SHOP = 'This benchmark shop shows the page structure only; no application, booking, payment or account link is made here.'

export const INFO = {
  '/help/delivery-and-collection-guide': { title: 'Delivery & Collection Guide', crumb: 'Delivery and collection', sections: [
    { id: 'argos-plus', h2: 'Get 12 months of delivery with Argos Plus', p: ['For £40, Argos Plus gives you 12 months of same day, next day and standard delivery at no extra cost on eligible online or app orders of £20 or more. Argos Plus cannot be used in store.'] },
    { h2: 'Our delivery and collection options', list: ['Click & Collect — free, from an Argos store or a Sainsbury’s collection point.', 'Fast Track same day delivery — £7.95.', 'Free Delivery — on small items when you spend £100 or more.', 'Standard delivery — prices shown at checkout.'] },
    { h2: 'Click & Collect', p: ['Collect from an Argos store or a Sainsbury’s collection point within 7 days. Collection is free and same day collection is available on many products. You can extend your collection date from your account, except for Tu clothing orders.'] },
    { id: 'small-things', h2: 'Home delivery for small things', p: ['Order before 1pm for same day delivery, subject to availability. Fast Track same day delivery costs £7.95 and arrives by 9pm. You get a 2-hour window and a notification when the driver is 30 minutes away.'] },
    { id: 'big-things', h2: 'Home delivery for big things', p: ['Large items such as sofas and beds are delivered by two people. Delivery slot prices are shown at checkout.'] },
    { h2: 'Home delivery for clothing', p: ['Next day delivery costs £3.95 for orders placed by 2pm Monday to Friday. Orders placed after 2pm Friday and before 2pm Sunday arrive or are ready on Monday. Bank holidays are excluded.'] },
    { h2: 'Installation and recycling', p: ['Available for dishwashers, washing machines, washer dryers and freestanding cookers. A recycling-only service starts at £14.99. Terms apply.'] },
  ], links: [['Track your order', '/order/tracking'], ['Find a store', '/stores'], ['Delivery & collection in this shop', '/help/delivery-collection']] },
  '/help/returns-product-support-and-repairs': { title: 'Returns, product support and repairs', crumb: 'Aftersales and returns', sections: [
    { h2: 'Returns, refunds and exchanges', p: ['Start a return, get product support or check how long your refund will take.'], links: [['Start a return', '/order/tracking?type=returns'], ['Product support', '/help/product-support']] },
    { id: 'how-to-return', h2: 'How to return your item', p: ['How you return an item depends on whether you collected it or had it delivered. Items bought from a Trusted Seller cannot be returned to an Argos store: post them back or the seller arranges a collection. Trusted Seller returns are accepted within 30 days of delivery.'] },
    { h2: "If you've changed your mind", p: ['Return change-of-mind items within 30 days of collection or delivery. Items must be unused, in their original packaging and in a resaleable condition. Some items, such as personalised goods, opened sealed software and certain hygiene products, cannot be returned. Refunds usually take up to 14 days after we receive the item. Collection charges are £3.95 for small items and £30 for large items; Tu clothing postage of £3.50 is deducted from the refund.'] },
    { h2: 'If your item is faulty or damaged', list: ['Within 30 days: faulty items are eligible for a refund. Some cosmetically damaged items may qualify for a partial refund.', '30 days to 12 months: a free repair or replacement. If that fails, or causes significant inconvenience, a refund is offered.', 'Spare parts are available from Argos Spares, and some manufacturer guarantees extend cover.'] },
    { h2: 'Extended Christmas returns', p: ['Items bought from 23 September 2026 to 25 December 2026 can be returned until 31 January 2027.'] },
    { h2: 'Your statutory rights to cancel', p: ['Online or phone orders can be cancelled within 14 calendar days of receipt without giving a reason. Returning the full order includes a refund of the standard delivery charge. Some products, such as sealed software, perishable goods and personalised items, are excluded.'] },
  ], links: [['Returns & cancellations in this shop', '/help/returns-cancellations'], ['Your orders', '/orders']] },
  '/help/gift-cards': { title: 'Gift cards', h1: "Send an Argos, Habitat, Sainsbury's or a Multi-brand Gift Card", crumb: 'Ways to pay', sections: [
    { h2: 'Shop all gift cards', cards: [['By Email', 'Argos eGift Cards are delivered instantly by email.'], ['By Post', 'Argos Gift Cards sent by post, from £1.50 postage.']] },
    { h2: 'Our other brands', cards: [['Sainsbury’s eGift Card', 'Spend in Sainsbury’s stores and online.'], ['Sainsbury’s Gift Card', 'A physical card for Sainsbury’s.'], ['Habitat Gift Card', 'Spend at Habitat stores and online.'], ['Multi-brand eGift Card', 'One card to spend across a range of brands.']] },
    { h2: 'Already got an Argos Gift Card or eGift Card?', p: ['Check your balance online or at any Argos store till, and use your card online, in the app or in store.'] },
    { h2: 'Argos for Business Gift Cards', p: ['Reward staff and customers with Argos gift cards bought in bulk through Argos for Business.'], links: [['Find out more', '/argos-for-business']] },
    { h2: 'Need more info? Here are some quick links...', list: ['How many Gift Cards or eGift Cards can I use online?', 'How can I check the balance on my Argos Gift Card or eGift Card?', 'How to claim eGift card rewards', 'What’s the difference between an eGift Card and a Gift Card?', 'Can I use my Argos Gift Card or eGift Card for items that I want delivered?'], links: [['eGift Card Rewards', '/features/egift-card-rewards'], ['Terms & Conditions', '/help/terms-and-conditions']] },
  ], note: 'Gift cards cannot be bought or redeemed in this benchmark shop.' },
  '/help/payment-types': { title: 'Payment types', crumb: 'Ways to pay', sections: [
    { h2: 'Ways to pay online', list: ['Argos Pay', 'Visa, Mastercard and American Express credit and debit cards', 'PayPal and PayPal Pay in 3', 'Klarna', 'Argos Gift Cards and eGift Cards'] },
    { id: 'paypal', h2: 'What’s PayPal?', p: ['PayPal lets you pay using the details saved in your PayPal account without entering your card number on Argos.'] },
    { id: 'price-match', h2: 'Do we price match with other brands?', p: ['Argos does not price match with other retailers.'] },
    { h2: 'Ways to pay in store', p: ['Cards, contactless, Argos Gift Cards and Argos Pay are accepted at store tills.'] },
  ], note: 'This shop accepts test card details only.' },
  '/help/argos-pay': { title: 'Argos Pay', h1: 'Buy what you love, pay at your pace.', crumb: 'Ways to pay', sections: [
    { h2: 'Say hello to flexible credit that suits you with Argos Pay', p: ['Apply once and use Argos Pay again at Argos or Habitat. You can check your eligibility without affecting your credit score.'] },
    { h2: 'Argos Card customer?', p: ['Argos Card accounts have moved to Argos Pay. Register before your first purchase.'] },
    { h2: 'What are my payment options?', list: ['Want to pay at your own pace? Pay nothing upfront with 0% interest for 3, 6 or 12 months, depending on spend.', 'Prefer fixed monthly payments? Instalment plans over 12, 24, 36 or 48 months, from £150 spend.', 'Looking for 0% interest? Interest-free fixed monthly payments over 12, 24, 36 or 48 months, subject to current offers.', 'Want more choice in how you pay? Flexible credit — pay a minimum each month, plus more when you can.'] },
    { h2: 'Why choose Argos Pay?', list: ['Apply once', 'Flexible ways to pay', 'Clear terms with no early repayment fees', 'Track spending in the Argos Pay app'] },
    { h2: 'How to apply for Argos Pay', p: ['Apply whilst you buy: choose Argos Pay at checkout, check eligibility, complete the application and pick a payment option. Or apply for future purchases before you shop.'] },
    { h2: 'Manage your account', p: ['Use the Argos Pay app or the Online Account Manager to check your balance, make payments and track spending.'] },
    { id: 'faq', h2: 'Frequently Asked Questions', list: ['How do I apply?', 'Will applying affect my credit score?', 'Where can I use Argos Pay?', 'How do I manage my account?', 'How do I make a payment?'] },
  ], note: SHOP },
  '/help/nectar': { title: 'Nectar at Argos', crumb: 'Ways to pay', sections: [
    { h2: 'How Nectar works at Argos', p: ['Collect Nectar points when you spend at Argos and link your Nectar card to your Argos account to collect online.'] },
    { h2: 'Before you get started, here’s how Nectar works at Argos...', p: ['Points are worth money off your shopping. Scan your card at the till in store.'] },
    { h2: 'How to link your Nectar account online', list: ['Sign in to your Argos account.', 'Choose to link your Nectar account.', 'Sign in to Nectar and confirm.', 'Collect points on eligible orders.'] },
    { h2: 'Shopping with Nectar in-store', p: ['Collect and spend points at an Argos store till or Pay At Browse terminal.'] },
    { h2: 'Explore more', p: ['Find other places to collect and spend Nectar points, and how to join Nectar.'] },
    { h2: 'Frequently asked questions', list: ['How do I link my accounts?', 'Is there a limit on points?', 'How do I collect points?', 'How do I get a Nectar card?', 'How do I check my balance?'] },
    { h2: 'Terms and conditions', p: ['Nectar terms and privacy policy apply. Argos may change the conversion process at any time.'] },
  ], note: SHOP, links: [['Nectar services in this shop', '/help/nectar-services']] },
  '/help/argos-care': { title: 'Argos Care', crumb: 'Insurance and Argos Care', sections: [
    { h2: 'Why not get that extra bit of cover with Argos Care?', p: ['Argos Care adds accidental damage cover and protection beyond the manufacturer’s guarantee. Accidental damage cover starts from the moment you buy, and you can collect Nectar points on Argos Care.'] },
    { id: 'electrical', h2: 'Argos Electrical Product Care', p: ['Covers accidental damage, and faults or breakdowns after the manufacturer’s guarantee ends, for electrical goods — parts and labour included.'] },
    { h2: 'Argos Monthly Care', p: ['Pay-monthly cover for accidental damage, faults and breakdowns, plus theft with force for mobiles. Excesses apply to some items.'] },
    { h2: 'Argos Replacement Care', p: ['A replacement or Argos vouchers if an item is accidentally damaged or breaks after the guarantee ends.'] },
    { h2: 'Argos Furniture Care', p: ['Covers Argos and Habitat furniture with technician repairs, stain-removal kits, or a replacement or vouchers.'] },
    { h2: 'Purchased jewellery or a watch?', p: ['Since February 2024 jewellery and watches are covered by Replacement Care.'] },
    { id: 'further-information', h2: 'Further Information', list: ['Buy as you shop: Argos Care options appear on the product page below the add to trolley button.', 'There’s still time to get protected: add Argos Care within 45 days of purchase in store with your receipt.', 'How to make a claim: the claim process depends on your policy.'] },
  ], note: 'Argos Care is not sold in this benchmark shop.' },
  '/help/terms-and-conditions': { title: 'Terms and Conditions', crumb: 'Terms and conditions', sections: [
    { h2: 'Terms and Conditions', p: ['Argos’s own terms for browsing the website and app and buying online or by Click & Collect.'], list: ['Who We Are and How to Contact Us', 'About These Terms (and How They May Change)', 'Using Our Website / App and Your Account', 'Ordering on Our Website / App', 'Title (Ownership) and Responsibility (Risk)', 'Prices, Payment and Pricing Errors', 'Delivery and Collection', 'Age-Restricted Products', 'Returns, Cancellations and Refunds', 'Product Information', 'Intellectual Property', 'External Links', 'Our Right to Suspend or Cancel Your Account', 'Our Responsibility to You', 'Complaints and Dispute Resolution', 'Other Important Terms'] },
    { h2: 'Schedules', list: ['Schedule 1 – Argos Care & Extended Warranties', 'Schedule 2 – Nectar Points (Argos)', 'Schedule 3 – Argos and Habitat Gift Cards / eGift Cards', 'Schedule 4 – Multi-Brand Gift Cards', 'Schedule 5 – Argos Plus (Delivery Pass)'] },
    { id: 'trusted-seller', h2: 'Trusted Seller Terms and Conditions', p: ['Separate terms for items bought from third-party Trusted Sellers on the Argos Marketplace, where the Trusted Seller — not Argos — is the seller. Nectar points can be collected but not spent on Trusted Seller products.'] },
  ] },
  '/help/accessibility-statement': { title: 'Accessibility Statement for Argos', crumb: 'Accessibility', sections: [
    { h2: 'Argos website accessibility', p: ['We want everyone to be able to use the Argos website, including customers who use assistive technology and customers with cognitive accessibility needs.'] },
    { h2: 'How the website was tested', p: ['Ongoing design reviews and automated testing, plus a manual audit of the home delivery journey by the Digital Accessibility Centre in August 2025.'] },
    { h2: 'Known issues', p: ['You should be able to complete a home delivery order despite minor issues. Workarounds are listed for:'], list: ['Screen readers', 'Keyboard only', 'Low vision, zoom and magnification', 'Voice activation', 'Concentrating, remembering and understanding information'] },
    { h2: 'Reporting an issue', p: ['Tell us the page, what you were trying to do and the assistive technology you use.'], links: [['Contact us', '/help/contact']] },
  ] },
  '/help/cookie-list': { title: 'List of cookies', crumb: 'Cookies', sections: [
    { h2: 'Cookies we use', list: ['Strictly necessary cookies — keep you signed in and remember your trolley.', 'Functional cookies — remember choices such as your postcode or store.', 'Performance cookies — help us understand how the site is used.', 'Marketing cookies — show relevant offers on other sites.'] },
    { h2: 'Cookies in this shop', p: ['This benchmark shop sets one session cookie to keep your trolley and sign-in state. It sets no tracking or marketing cookies.'] },
  ], links: [['Cookies policy', '/privacy-hub/cookie-policy']] },
  '/help/argos-spares': { title: 'Argos Spares', crumb: 'Product care', sections: [
    { h2: 'Spare parts and accessories', p: ['Argos Spares (argosspares.co.uk) sells genuine spare parts and accessories for products bought at Argos, from vacuum filters to remote controls. Search by your product’s catalogue number.'] },
  ], note: 'The real Argos Spares site is a separate website. Spares cannot be ordered in this benchmark shop.', links: [['Product support', '/help/product-support']] },
  '/help/furniture-recycling': { title: 'Furniture Recycling', crumb: 'Product care', sections: [
    { h2: 'Furniture recycling with Clearabee', p: ['Argos partners with Clearabee to collect and responsibly dispose of unwanted furniture when you buy a replacement. Bookings are made with Clearabee.'] },
  ], note: SHOP },
  '/events/safety-product-recalls': { title: 'Product recalls', h1: 'Product safety and recalls', crumb: 'Product care', sections: [
    { h2: 'Current product recalls', p: ['Argos lists products that have been recalled, with the catalogue numbers affected and what to do. Stop using an affected product and follow the instructions for a refund or repair.'] },
    { h2: 'Recalls in this shop', p: ['There are no product recalls for items in this benchmark shop.'] },
  ] },
  '/features/egift-card-rewards': { title: 'eGift Card Rewards', crumb: 'Payment & services', sections: [
    { h2: 'Get rewarded with an eGift Card', p: ['On selected promotions you receive an Argos eGift Card after buying qualifying products. The eGift Card arrives by email and can be spent on a future order.'] },
    { h2: 'How to claim', list: ['Buy a qualifying product during the promotion.', 'Wait for your order to be delivered or collected.', 'Your eGift Card reward is emailed to you.'] },
  ], note: 'There are no eGift Card reward promotions in this benchmark shop.' },
  '/pet-insurance': { title: 'Pet Insurance', h1: 'Argos Pet Insurance', crumb: 'Payment & services', sections: [
    { h2: 'About Argos Pet Insurance', p: ['Argos Pet Insurance (argospetinsurance.co.uk) offers cover for dogs and cats, including vet fees, with lifetime and time-limited policy options. Policies are arranged by a separate insurer.'] },
  ], note: SHOP },
  '/about-us': { title: 'About us', h1: 'About Argos', crumb: 'About Argos', sections: [
    { h2: 'Who we are', p: ['Argos is a UK general merchandise retailer, founded in 1973 and part of Sainsbury’s since 2016. Customers shop online, in the app, in Argos stores and at Argos stores and collection points inside Sainsbury’s supermarkets.'] },
    { id: 'brands', h2: 'Our brands', p: ['Argos sits alongside Sainsbury’s, Tu clothing, Habitat and Nectar in the Sainsbury’s group.'] },
  ], note: 'The real “About us” page is on the Sainsbury’s corporate website (about.sainsburys.co.uk).' },
  '/argos-for-business': { title: 'Argos for Business', crumb: 'About Argos', sections: [
    { h2: 'Gift cards and rewards for business', p: ['Argos for Business (argosforbusiness.co.uk) supplies Argos gift cards and eGift Cards in bulk for staff rewards, incentives and customer promotions.'] },
  ], note: SHOP },
  '/careers': { title: 'Careers', h1: 'Careers at Argos', crumb: 'About Argos', sections: [
    { h2: 'Work with us', p: ['Argos jobs — in stores, distribution, customer service and head office — are advertised on the Sainsbury’s group careers site (sainsburys.jobs).'] },
  ], note: 'Applications cannot be made in this benchmark shop.' },
  '/press-enquiries': { title: 'Press enquiries', crumb: 'About Argos', sections: [
    { h2: 'Media enquiries', p: ['Journalists contact the Sainsbury’s group press office for Argos news, which is published on the Sainsbury’s corporate website.'] },
  ] },
  '/modern-slavery-statement': { title: 'Modern Slavery Statement', crumb: 'About Argos', sections: [
    { h2: 'Standing up to modern slavery', p: ['Sainsbury’s publishes an annual Modern Slavery Statement covering Argos. It explains how the group assesses supply-chain risk, works with suppliers and trains colleagues to identify and prevent modern slavery.'] },
  ], note: 'The full statement is on the Sainsbury’s corporate website.' },
  '/privacy-hub': { title: 'Privacy hub', crumb: 'Privacy', sections: [
    { h2: 'Your privacy', p: ['The Sainsbury’s privacy hub explains how Argos and the other Sainsbury’s group brands use personal information, and how to exercise your rights.'], links: [['Privacy policy', '/privacy-hub/privacy-policy'], ['Cookies policy', '/privacy-hub/cookie-policy']] },
  ] },
  '/privacy-hub/privacy-policy': { title: 'Privacy policy', crumb: 'Privacy', sections: [
    { h2: 'How we use your information', p: ['Argos uses your details to process orders, deliveries and returns, manage your account, prevent fraud and, with your permission, send marketing. You can ask to access, correct or delete your information.'] },
    { h2: 'In this shop', p: ['This benchmark shop keeps your trolley, account and orders in a session on this server only.'] },
  ] },
  '/privacy-hub/cookie-policy': { title: 'Cookies policy', crumb: 'Privacy', sections: [
    { h2: 'How we use cookies', p: ['Cookies help the website work, remember your choices and measure how it is used. You can change your cookie preferences at any time.'], links: [['List of cookies', '/help/cookie-list']] },
  ] },
}

// Promotional landings (events, lists, features). Product grids only show catalogue items that match.
export const LANDINGS = {
  '/events/big-event': { title: 'The Big Red Event', intro: 'Big savings across tech, home, toys and more — for a limited time.', tiles: ['technology', 'home-and-furniture', 'toys', 'appliances', 'gaming', 'health-and-beauty'] },
  '/events/christmas-gifts': { title: 'Christmas Gifts', intro: 'Find gifts for everyone on your list, from stocking fillers to the big present.', tiles: ['toys', 'technology', 'gaming', 'jewellery-and-watches', 'health-and-beauty', 'home-and-furniture'] },
  '/events/toys-offers': { title: 'Toy Offers', intro: 'Offers on toys, games and gifts for kids.', tiles: ['toys', 'baby-and-nursery'] },
  '/events/garden-diy-offers': { title: 'Garden & DIY Offers', intro: 'Offers across garden furniture, storage and outdoor cooking.', tiles: ['garden-and-diy'] },
  '/events/voucher-discount-codes': { title: 'Voucher Codes and Offers', intro: 'Find our hottest codes now. Enter a valid promotional code at checkout to apply it to your order.', tiles: ['technology', 'toys', 'home-and-furniture', 'appliances'], empty: 'There are no voucher codes running in this benchmark shop.' },
  '/list/shop-top-100-deals': { title: 'Shop our top 100 deals', intro: 'Our top 100 deals, updated regularly.', tiles: ['technology', 'appliances', 'home-and-furniture', 'toys'] },
  '/amazing-deals': { title: 'A-mazing deals', intro: 'A-mazing deals across the store.', tiles: ['technology', 'home-and-furniture', 'toys'] },
  '/list/3-for-20-on-selected-toys': { title: 'Toys 3 for £20', intro: 'Mix and match selected toys.', tiles: ['toys'] },
  '/list/shop-the-traitors': { title: 'Shop the Traitors', intro: 'Get the look and play the game.', tiles: ['toys', 'clothing'] },
  '/sd/1-to-2-years-toys': { title: '1 to 2 years toys', intro: 'Toys for toddlers aged 1 to 2 years.', tiles: ['toys'] },
  '/sd/gold-jewellery': { title: 'Gold Jewellery', intro: 'Gold rings, chains, earrings and more.', tiles: ['jewellery-and-watches'] },
}

export const FEATURES = {
  '/features/advice-and-inspiration': { title: 'Advice and inspiration', intro: 'Buying guides, ideas and how-tos to help you choose.', guides: [['Gaming', 'Upcoming games, consoles and set-up ideas.', '/features/gaming'], ['Technology', 'How to choose a TV, laptop or headphones.', '/browse/technology/c:29949/'], ['Home & Furniture', 'Room ideas, storage and furniture buying guides.', '/browse/home-and-furniture/c:29351/'], ['Appliances', 'How to choose a vacuum, washing machine or air fryer.', '/browse/appliances/c:787124/'], ['Toys', 'Gift ideas by age and interest.', '/browse/toys/c:30299/'], ['Baby & Nursery', 'Pushchair, car seat and nursery guides.', '/browse/baby-and-nursery/c:29000/']] },
  '/features/gaming': { title: 'Upcoming Games', intro: 'The biggest new releases and pre-orders, plus consoles and accessories.', guides: [['Pre-order Games', 'Reserve upcoming releases.', '/browse/technology/video-games-and-consoles/pre-order-games/c:29997/'], ['PlayStation', 'PS5 consoles and games.', '/browse/technology/video-games-and-consoles/playstation/c:812419/'], ['XBOX', 'Xbox Series consoles and games.', '/browse/technology/video-games-and-consoles/xbox/c:812424/'], ['Nintendo', 'Nintendo Switch 2 consoles and games.', '/browse/technology/video-games-and-consoles/nintendo/c:30291/']], showGames: true },
}
