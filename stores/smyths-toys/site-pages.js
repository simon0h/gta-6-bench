// Help, policy and company pages for the Smyths Toys clone. Headings follow the real pages captured
// on 2026-10-13 (www.smythstoys.com/uk/en-gb/...); body copy is a short summary of the real text, not
// a verbatim copy. Pages that live off-site on the real site (careers.smythstoys.com) are local here.

const p = (...lines) => lines.map(l => `<p>${l}</p>`).join('')
const ul = (...items) => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`
const table = (head, rows) => `<div class="st-table-wrap"><table class="st-table"><thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`

// The help sidebar mirrors the link list on the real Terms & Policies page.
export const HELP_NAV = [['Help Center', '/help'], ['Shipping & Delivery', '/shipping-and-delivery'], ['Returns', '/returns'], ['Click & Collect', '/click-and-collect'], ['Pre-Order', '/pre-order'], ['Stock Availability', '/stock-availability'], ['Gift Cards', '/gift-card-info'], ['Terms & Policies', '/terms-and-policies'], ['About Us', '/about-us'], ['Contact Us', '/contact-us']]

// Real Help Centre topic tiles (label, path, short description).
export const HELP_TOPICS = [
  ['Shipping and delivery', '/shipping-and-delivery', 'Delivery options, charges and timeframes'],
  ['Click & Collect', '/click-and-collect', 'Free collection from your local store within 2 hours'],
  ['Returns', '/returns', 'Ways to return, refunds and faulty items'],
  ['Gift cards', '/gift-card-info', 'Balances, spending and expiry'],
  ['Terms and policies', '/terms-and-policies', 'Terms & Conditions, privacy and cookies'],
  ['Stock availability', '/stock-availability', 'Checking stock online and in store'],
  ['Pre-order', '/pre-order', 'Payment, Price Promise and release dates'],
  ['Careers', '/careers', 'Retail, Head Office and Distribution Centre roles'],
  ['Product Advisory Information', '/product-information', 'Product safety recalls and notices'],
  ['Payment Information', '/payment-information', 'Accepted payment methods and PayPal Pay in 3'],
  ['About us', '/about-us', 'Who we are and company information'],
  ['Contact us', '/contact-us', 'Send our Customer Care team a message'],
]

export const PAGES = {
  '/shipping-and-delivery': {
    title: 'Shipping & Delivery Information', h1: 'Shipping & Delivery', help: true,
    intro: p('We deliver to addresses across the UK. Delivery charges depend on your order value and the service you choose, and are always shown at checkout before you pay.'),
    sections: [
      ['Standard Delivery Charges:', table(['Order value', 'Charge'], [['Orders over £20', 'FREE'], ['Orders £10 – £20', '£2.99'], ['Orders under £10', '£4.99']]) + p('Standard delivery usually arrives within 1–2 working days. Large, bulky items are excluded and are charged separately.')],
      ['Express Delivery Charges:', table(['Order value', 'Charge'], [['Orders over £20', '£1.99'], ['Orders £10 – £20', '£5.99'], ['Orders under £10', '£7.99']]) + p('Order by 10pm for next working day delivery. Not available to the Islands, Scottish Highlands or Northern Ireland.')],
      ['Saturday Delivery Charges:', table(['Order value', 'Charge'], [['Orders over £20', '£2.99'], ['Orders £10 – £20', '£6.99'], ['Orders under £10', '£8.99']]) + p('Order by 10pm on Friday. Not available to the Islands, Scottish Highlands or Northern Ireland.')],
      ['Sunday Delivery Charges:', table(['Order value', 'Charge'], [['Orders over £20', '£2.99'], ['Orders £10 – £20', '£6.99'], ['Orders under £10', '£8.99']]) + p('Order by 10pm on Saturday. The same regional limits as Saturday delivery apply.')],
      ['Physical Gift Cards Delivery Charges:', p('Physical gift cards are sent by standard service in 2–6 working days: £0.99 on orders up to £20 and free above that.')],
      ['24/7 InPost Lockers and Shops', p('Choose an InPost Locker or Shop at checkout and collect your parcel at a time that suits you. You will receive a collection code by email and text once your parcel arrives; parcels are held for a limited time before being returned.')],
      ['Delivery Information', ul('<strong>Large, Bulky Items</strong> – items typically over 30kg or oversized are delivered in 3–6 working days; the charge is shown at checkout.', '<strong>Delivery Failure</strong> – if nobody is available, the courier will leave a card with instructions.', '<strong>Stock Outs</strong> – if an item becomes unavailable we will let you know and refund it.', '<strong>Split Delivery</strong> – some orders arrive in more than one parcel.', '<strong>Delivery direct from supplier</strong> – selected items are shipped by the supplier.')],
      ['Shipping & Delivery FAQs', ul('What delivery options are available?', 'How much will my delivery costs be?', 'Where do you deliver to?', 'How can I get my order to arrive faster?') + p('See the charges above, or <a href="{base}/contact-us">contact us</a> if your question is not answered here.')],
    ],
  },
  '/returns': {
    title: 'Returns Information', h1: 'Returns', help: true,
    intro: p('Changed your mind or received a faulty item? Here is how returns work for online and in-store orders. Your statutory rights are not affected.'),
    sections: [
      ['Ways you can return', ul('<strong>In store</strong> – bring the item and your receipt or order confirmation email to any Smyths Toys Superstore.', '<strong>By post</strong> – online home delivery orders can be returned with a returns label created from My Orders and dropped at a DHL Service Point (parcels up to 20kg).') + p('Click & Collect and in-store purchases must be returned to a store. For large, bulky items, please contact Customer Care.')],
      ['Christmas Returns Policy', p('Items bought from 1 September 2026 can be returned until 31 January 2027.')],
      ['Online Orders', ''],
      ['Cooling Off Period', p('You can cancel an online order within 14 days of receiving it.')],
      ['Unwanted items', p('We offer an extra 14 days for unwanted items that are unused, in a resaleable condition and in their original packaging, with a valid order confirmation email.')],
      ['Refunds on unwanted items', p('Refunds are made to the original payment method. You should be notified of your refund within 10 working days of us receiving the return.')],
      ['Damaged or Faulty Items', p('Faulty items may be repaired, replaced, refunded or exchanged for a gift card. Exchanges or refunds are offered within 30 days.')],
      ['In-store Orders', p('Unwanted and faulty items bought in store can be returned to any store with proof of purchase.')],
      ['All Other Information', ''],
      ['Video Games, Nursery Products & Trading Card Games.', p('Video games, consoles, nursery products, digital downloads and trading card games are excluded from unwanted-item refunds and exchanges. Your statutory rights still apply.')],
      ['Pre-Order Cancellation', p('Pre-orders can be cancelled from your Smyths Toys account before they are dispatched or collected. Orders that include exclusive early content cannot be cancelled once that content is received.')],
      ['Returning Incorrect Items', p('If you received the wrong item, please <a href="{base}/contact-us">contact us</a> and we will put it right.')],
    ],
  },
  '/click-and-collect': {
    title: 'Click & Collect', h1: 'Click & Collect', help: true,
    intro: p('Click & Collect is FREE. Order online and collect from your chosen Smyths Toys Superstore, usually within 2 hours.'),
    sections: [
      ['How does Click & Collect work?', ul('Choose Click & Collect and select your store at checkout.', 'You will receive an order confirmation email, then a “Ready for Collection” email with a barcode. Please wait for this second email before travelling.', 'Bring the Ready for Collection email, the card used to pay and photo ID.', 'Orders are held for 2 days from the order date and are then cancelled.') + p('Ready times can be affected by store opening hours, order volumes and the time you order.')],
      ['Click & Collect Price Promise', p('If the price of your item drops before you collect it, you will pay the lower price. In-store-only discounts cannot be applied.')],
      ['Will I be charged if I do not collect my Click & Collect order within 2 days?', p('A £2 non-collection fee applies. It does not apply to pre-orders or partially fulfilled orders.')],
      ['Will I be charged if my Click & Collect order was cancelled for other reasons?', p('No. The non-collection fee only applies when an order that is ready is not collected in time.')],
      ['Are Click & Collect orders discreetly packaged?', p('Items are packed in clear packaging so that they can be checked at collection.')],
    ],
  },
  '/pre-order': {
    title: 'Pre-order', h1: 'Pre-Order', help: true,
    intro: p('Pre-order lets you order an item now and receive it as soon as it is released or back in stock.'),
    sections: [
      ['Paying for a pre-order', p('There is no upfront payment or deposit online for credit or debit card pre-orders. Your card is pre-authorised 2–7 days before the item becomes available and payment is taken when it is dispatched or collected. If the pre-authorisation fails we will email you to re-enter your card details within 24 hours.') + p('Pre-orders paid with PayPal are charged in full at checkout.')],
      ['Pre-order Price Promise', p('If our price drops before your pre-order is dispatched or collected, you will automatically pay the lower price. A money-off voucher and the Price Promise cannot be used together.')],
      ['Confirmation and release dates', p('You will receive email confirmations; the contract is formed when the item is dispatched or collected. Release dates can change for reasons outside our control.')],
      ['Cancelling a pre-order', p('You can cancel or update payment details for a pre-order from your Smyths Toys account. Orders that include exclusive early content cannot be cancelled once that content has been received.')],
    ],
  },
  '/stock-availability': {
    title: 'Stock Availability Information', h1: 'Stock Availability', help: true,
    intro: p('Want to know if an item is in stock at your local store or online? Product pages on our website are kept up to date with availability for Home Delivery and Click & Collect.'),
    sections: [
      ['Home Delivery', p('If Home Delivery is shown as available on the product page, the item can be ordered for delivery.')],
      ['Click & Collect', p('Choose a store on the product page to see whether it can be collected. Use the <a href="{base}/storefinder">Store finder</a> to find your nearest store.')],
      ['Pre-Order', p('Items that are not yet released can be pre-ordered where the product page shows a Pre-order button.')],
      ['Please note', p('Stock shown as available may occasionally be unavailable in store. In this demo store, live branch stock has not been captured and is never shown as verified.')],
    ],
  },
  '/gift-card-info': {
    title: 'Gift Card Information', h1: 'Gift Cards', help: true,
    intro: p('Smyths Toys gift cards come as e-Gift Cards sent by email or physical cards sent by post, and can be used online and in store. <a href="{base}/giftcardtype">Buy a gift card</a>.'),
    sections: [
      ['Where can I check the balance on my Gift Card?', p('Use the balance checker on our <a href="{base}/giftcardtype">Gift cards</a> page, or ask in any store.')],
      ['How can I spend my Smyths Gift Card?', p('GBP gift cards can be used in any UK store or on the UK website. Gift cards cannot be used online for pre-orders, e-Gift Cards, electronic downloads or 16+/18+ video games.')],
      ['How do I use my Gift Card to buy online?', p('At checkout, choose the gift card option and enter the 16-digit card number and 8-digit PIN. The PIN is under the scratch panel on physical cards and in the e-Gift Card email.')],
      ['Can I use more than one Gift Card to pay for one order?', p('Yes, up to three gift cards can be used on one online order.')],
      ['When does my Smyths Gift Card expire?', p('Smyths Toys e-Gift Cards and physical gift cards do not expire.')],
    ],
  },
  '/payment-information': {
    title: 'Payment Information', h1: 'Payment Information', help: true,
    sections: [
      ['Which payment methods do you accept?', ul('<strong>Cash</strong> – in store, at the discretion of each store', '<strong>Visa</strong>', '<strong>Mastercard</strong>', '<strong>American Express</strong> – online orders only', '<strong>Google Pay</strong>', '<strong>Apple Pay</strong>', '<strong>PayPal</strong>')],
      ['PayPal FAQs', ul('Do you offer PayPal as a payment option?', 'What is PayPal Pay in 3?', 'How long will my PayPal Pay in 3 plan last?', 'What purchase amounts qualify for PayPal Pay in 3?', 'Can I use PayPal for pre-order items?') + p('PayPal Pay in 3 lets you spread the cost of eligible orders into three interest-free payments, subject to PayPal\'s approval. PayPal is not available for pre-order items.')],
      ['Gift Cards', p('Smyths Toys e-Gift Cards and physical gift cards are accepted. See <a href="{base}/gift-card-info">Gift card information</a>.')],
      ['Exclusions and Terms & Conditions', p('We do not accept the following payment methods either online or in-store: cheques, postal orders, purchase orders and international debit cards.')],
    ],
  },
  '/product-information': {
    title: 'Product Information', h1: 'Product Information', help: true,
    intro: p('Product safety recalls, notices and advisories. If you own an affected product, please stop using it and return it to any Smyths Toys Superstore.'),
    sections: [
      ['Product Advisory Information - 2026', ul('Product Safety Recall - Dig Products', 'Product Safety Recall - Joie Serina Swivel Baby Swing Elephant Duo (226495)', 'Product Safety Recall - Stretcherz toys (253497, 217895, 233497)')],
      ['Product Advisory Information - 2025', ul('Product Notice - miniuno Recliniie (230037 & 231007)', 'Product Notice - Joie Serina Swivel (226495)', 'Product Recall - Fantasma Magic Set Deluxe Top Hat 150+ Magic Tricks (198567)')],
      ['Product Advisory Information - 2024', ul('Product Recall - Vertex 24V UTV Electric Ride On (236175)', 'Product Recall - Fisher-Price® Baby Biceps Gift Set (189897)', 'Product Recall - S Drives Pro Electric Scooter (217740)', 'Product Recall - CoComelon Learning JJ Doll (197783)')],
      ['Product Advisory Information - 2023', ul('Product Recall - POP GIRL Color Tin (206793)', 'Product Recall - Robo Alive Baby Shark (172690, 172691, 172692)', 'Product Recall - L.O.L. Surprise! Beauty Tin (203094)', 'Product Recall - Jumping Ball (124625)')],
    ],
  },
  '/terms-and-policies': {
    title: 'Terms & Policies', h1: 'Terms & Policies', help: true,
    intro: p('Our terms, policies and statements in one place.'),
    sections: [['Policies', `<ul class="st-linklist">${[['Terms & Conditions', '/terms-and-conditions'], ['Privacy Policy', '/privacy-policy'], ['Cookies Policy', '/cookies-policy'], ['Modern Slavery Act Transparency Statement', '/transparency-statement'], ['Recycling', '/terms-and-conditions#weee'], ['Returns Policy', '/returns'], ['Payment Information', '/payment-information'], ['Product Information', '/product-information'], ['Tax Strategy', '/tax-strategy'], ['Gender Pay Gap', '/gender-pay-gap']].map(([t, u]) => `<li><a href="{base}${u}">${t}</a></li>`).join('')}</ul>`]],
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions', h1: 'Terms & Conditions', help: true,
    intro: p('These terms apply to the Smyths Toys UK website and app, operated by Smyths Toys HQ UC. By using the website you agree to them; we may update them by changing this page.'),
    sections: [
      ['Terms and Conditions of our Website', p('Covers access to website content and copyright, your account, website errors and website access.')],
      ['Terms and Conditions of Sale', p('A contract for an online sale is formed when your order is dispatched or collected.')],
      ['Purchasing of age restricted products', p('Age-restricted products may only be bought by customers who meet the age requirement.')],
      ['Price and Promotions', p('If a pricing error is found we will contact you before processing your order.')],
      ['Contract cancellation / Right of withdrawal', p('You have 14 days to cancel an online order. Use <a href="{base}/guest-lookup">Manage my order</a> or My Orders.')],
      ['Returns', p('See our <a href="{base}/returns">Returns policy</a>.')],
      ['Recycling', '<p id="weee">We offer a take-back service for waste electrical and electronic equipment (WEEE) when you buy a similar new item.</p>'],
      ['Data Protection', p('See our <a href="{base}/privacy-policy">Privacy policy</a>.')],
    ],
  },
  '/privacy-policy': {
    title: 'Privacy Policy Information', h1: 'Privacy Policy', help: true,
    intro: p('Smyths Toys HQ Unlimited Company, trading as Smyths Toys Superstores, explains how it collects, uses and protects personal data from store visits, website use, accounts, orders and marketing.'),
    sections: [
      ['Introduction', ''], ['Purpose of this privacy policy', p('Explains how we collect and process your personal data.')],
      ['Controller', p('Smyths Toys HQ Unlimited Company is the controller responsible for your personal data.')],
      ['Contact details', p('Questions about this policy or requests to exercise your rights can be sent to privacy@smythstoys.com.')],
      ['The data we collect about you', p('Identity, contact, financial, transaction, technical, usage and marketing data.')],
      ['How we use your personal data', p('To perform our contract with you, for our legitimate interests, to meet legal obligations and, where required, with your consent.')],
      ['Your legal rights', p('You can request access, correction, erasure, restriction, objection or transfer of your data.')],
    ],
  },
  '/cookies-policy': {
    title: 'Cookies Policy', h1: 'Cookies Policy', help: true,
    intro: p('We use cookies and similar technologies to keep the site running, understand how it is used, personalise your experience and show advertising.'),
    sections: [
      ['What are cookies?', p('Small text files placed on your device when you visit a website.')],
      ['What cookies do Smyths Toys use?', p('Session and persistent cookies, first-party and third-party cookies (for example from Google, Facebook and YouTube).')],
      ['The different types of cookies', ul('Mandatory Cookies', 'Functional Cookies', 'Analytical Cookies', 'Targeting Cookies')],
      ['Managing Cookies', p('You can withdraw consent for optional cookies using Cookie preferences, or change your browser settings. Disabling all cookies will stop items being added to the basket.')],
    ],
  },
  '/accessibility': {
    title: 'Accessibility', h1: 'Accessibility', help: true,
    intro: p('Smyths Toys Superstores aims to make this website usable for everyone and follows relevant accessibility standards.'),
    sections: [['Need help?', p('If you have difficulty using any part of our website, please <a href="{base}/contact-us">contact us</a> and let us know.')]],
  },
  '/transparency-statement': {
    title: 'Transparency Statement', h1: 'Modern Slavery Act 2015', help: true,
    sections: [['Anti- slavery and human trafficking statement for financial year 2025', p('Smyths Toys Superstores, a specialist toy retailer with over 125 stores in the UK, publishes this statement under the Modern Slavery Act 2015.') + p('Suppliers are vetted through signed anti-slavery assurances, third-party ethical audits and contract terms. Recent improvements include better IT traceability, extra checks at higher-risk manufacturing sites and a larger compliance team, supported by a whistleblowing policy and annual buyer training.') + p('Signed by Anthony Smyth, Managing Director, 30 June 2026.')]],
  },
  '/tax-strategy': {
    title: 'Tax Strategy', h1: 'Tax Strategy', help: true,
    sections: [
      ['Introduction', p('Smyths Toys Group pays many kinds of tax and sees this as part of its contribution to the communities where it operates.')],
      ['Group Tax Policy', p('Set by the Board and overseen by the Director of Corporate Services: pay the correct tax on time, be open with tax authorities and take professional advice where rules are unclear.')],
      ['Approach to Tax Risk & Governance', p('The group keeps a low tolerance for tax risk, uses internal audit and UK Senior Accounting Officer procedures, and does not tolerate tax evasion.')],
    ],
  },
  '/gender-pay-gap': {
    title: 'Gender Pay Gap', h1: 'Gender Pay Gap', help: true,
    intro: p('Smyths Toys UK Ltd publishes its gender pay gap report each year as required by UK regulations. The full figures are published on the real site; this demo store does not reproduce them.'),
    sections: [],
  },
  '/about-us': {
    title: 'About Us', h1: 'About Us', help: true,
    sections: [
      ['The best toys are at Smyths Toys!', p('Smyths Toys Superstores is the fastest growing toy retailer, with over 300 stores across Europe and more than 120 in the UK and Ireland.')],
      ['Largest range of toys', p('From toys and games to baby, outdoor and gaming, we stock one of the largest ranges around.')],
      ['Stores Nationwide', p('Our stores are open seven days a week, all year round, and accept all major credit cards. <a href="{base}/storefinder">Find your nearest store</a>.')],
      ['Company Information', ul('Smyths Toys HQ UC, a company incorporated and registered in Ireland (company number 501390), operates this website.', 'Smyths Toys UK Ltd, a company incorporated and registered in England and Wales.', 'Smyths Toys NI Ltd, a company incorporated and registered in NI.')],
    ],
  },
  '/careers': {
    title: 'Careers', h1: 'Jobs and Careers at Smyths Toys Superstores', help: true,
    intro: p('On the real site, careers live at careers.smythstoys.com. This page summarises it locally.'),
    sections: [
      ['Careers at Smyths Toys Superstores', p('For people who enjoy fast-moving work and want broad retail and business experience while taking charge of their own progress.')],
      ['Our Core Business Areas', ul('<strong>Retail</strong> – store-based roles', '<strong>Head Office</strong> – buying, finance, marketing, IT and HR', '<strong>Distribution Centres</strong> – including a graduate programme')],
      ['Our People', p('Colleagues describe a sociable, open culture with the freedom to shape their roles and investment in their development.')],
      ['Benefits', ul('Pension scheme', 'Income protection and life assurance', 'Staff discount', 'Maternity and paternity leave', 'Length of service awards and life event gifts', 'Christmas bonus')],
    ],
  },
  '/in-store-events': {
    title: 'In-Store Events', h1: 'In-Store Events',
    intro: p('Giveaways, character visits and community events at Smyths Toys Superstores.'),
    sections: [
      ['Catalogue Launch Giveaway!', p('Pick up our new catalogue for a chance to win one of five £1,000 gift cards.')],
      ['FREE LEGO® GIVEAWAY AT ALL SMYTHS TOYS SUPERSTORES!', p('A free LEGO pack giveaway on 24 October, while stocks last.')],
      ['Crazy Aaron Is Coming To Smyths Toys Thurrock!', p('Meet Crazy Aaron at our Thurrock store.')],
      ['Get Cooking Play-Doh Tour at Selected Smyths Toys Superstores!', p('Play-Doh cooking fun at selected stores.')],
      ['MR X Appeal 2026', p('Donate a gift to help children at Christmas.')],
      ['Autism & Sensory Friendly Shopping Hours', p('Calmer shopping hours with reduced lighting and noise in our stores.')],
    ],
  },
  '/charity-partners': {
    title: 'Charity Partners', h1: 'Smyths Toys Charity Partners',
    sections: [['Ray of Sunshine', p('We are proud to partner with Rays of Sunshine, which has supplied sensory bags to dozens of UK hospitals and community settings since 2019.') + p('Our partnership funds boxes of fidget toys for young patients, and Smyths Toys has donated £50,000 towards ward wish projects and play resources on children\'s wards.')]],
  },
  '/buying-guides': {
    title: 'Buying Guides', h1: 'Buying Guides',
    intro: p('Expert advice to help you choose. The full guides are on the real site; topics are listed here with links to the matching departments.'),
    sections: [
      ['Baby', `<ul class="st-linklist">${[['Car Seat Guide', '/baby/car-seats-and-bases/c/SM060202'], ['Pushchair guide', '/baby/pushchairs-and-strollers/c/SM060205'], ['Baby monitor guide', '/baby/baby-monitors-and-safety/c/SM060208'], ['Newborn essentials', '/baby/baby-essentials/c/baby-essentials'], ['Travelling with baby', '/baby/c/SM0602'], ['Playtime & baby’s development guide', '/baby/baby-toys/c/SM060216']].map(([t, u]) => `<li><a href="{base}${u}">${t}</a></li>`).join('')}</ul>`],
      ['Outdoor', `<ul class="st-linklist"><li><a href="{base}/outdoor/bikes/c/SM060301">Bike Buying Guide</a></li></ul>`],
    ],
  },
}
