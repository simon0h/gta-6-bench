// Nike.com (en-US) site structure captured with WebFetch on 2026-10-13 from
// https://www.nike.com/ and linked pages. Local paths mirror the real URL paths;
// off-site corporate links (about.nike.com, jobs.nike.com, ...) become local pages.
// This is navigation structure only: it adds no products, prices or stock.

const g = (label, path, links) => ({ label, path, links })

export const MENUS = [
  { label: 'Men', path: '/men', groups: [
    g('New & Featured', '/w/new-mens-3n82yznik1', [['New Arrivals', '/w/new-mens-3n82yznik1'], ['Best Sellers', '/w/mens-best-76m50znik1'], ['Latest Drops', '/w/new-upcoming-drops-k0gk'], ['Hybrid RN', '/training/hybrid'], ['Nike Sportswear', '/w/mens-lifestyle-13jrmznik1'], ['SNKRS Launch Calendar', '/launch'], ['Shop All Sale', '/w/mens-sale-3yaepznik1']]),
    g('Shoes', '/w/mens-shoes-nik1zy7ok', [['All Shoes', '/w/mens-shoes-nik1zy7ok'], ['Basketball', '/w/mens-basketball-shoes-3glsmznik1zy7ok'], ['Jordan', '/w/mens-jordan-shoes-37eefznik1zy7ok'], ['Running', '/w/mens-running-shoes-37v7jznik1zy7ok'], ['Sportswear', '/w/mens-lifestyle-shoes-13jrmznik1zy7ok'], ['Training & Gym', '/w/mens-training-gym-shoes-58jtoznik1zy7ok'], ['Custom Shoes', '/w/mens-nike-by-you-shoes-6ealhznik1zy7ok']]),
    g('Clothing', '/w/mens-clothing-6ymx6znik1', [['All Clothing', '/w/mens-clothing-6ymx6znik1'], ['Fleece', '/w/mens-fleece-4xh6qznik1'], ['Hoodies & Sweatshirts', '/w/mens-hoodies-and-pullovers-6riveznik1'], ['Jackets & Vests', '/w/mens-jackets-vests-50r7yznik1'], ['Pants', '/w/mens-pants-and-tights-2kq19znik1'], ['Shorts', '/w/mens-shorts-38fphznik1'], ['Tops & Graphic Tees', '/w/mens-tops-t-shirts-9om13znik1']]),
    g('Accessories', '/w/mens-accessories-equipment-awwpwznik1', [['All Accessories', '/w/mens-accessories-equipment-awwpwznik1'], ['Bags & Backpacks', '/w/mens-bags-and-backpacks-9xy71znik1'], ['Hats & Headwear', '/w/mens-hats-visors-and-headbands-52r49znik1'], ['Socks', '/w/mens-socks-7ny3qznik1'], ['Sunglasses', '/w/sunglasses-arlyp']]),
  ] },
  { label: 'Women', path: '/women', groups: [
    g('New & Featured', '/w/new-womens-3n82yz5e1x6', [['New Arrivals', '/w/new-womens-3n82yz5e1x6'], ['Best Sellers', '/w/womens-best-5e1x6z76m50'], ['Hybrid RN', '/training/hybrid'], ['Nike Sportswear', '/w/womens-lifestyle-13jrmz5e1x6'], ['SNKRS Launch Calendar', '/launch'], ['Shop All Sale', '/w/womens-sale-3yaepz5e1x6']]),
    g('Shoes', '/w/womens-shoes-5e1x6zy7ok', [['All Shoes', '/w/womens-shoes-5e1x6zy7ok'], ['Basketball', '/w/womens-basketball-shoes-3glsmz5e1x6zy7ok'], ['Jordan', '/w/womens-jordan-shoes-37eefz5e1x6zy7ok'], ['Running', '/w/womens-running-shoes-37v7jz5e1x6zy7ok'], ['Sportswear', '/w/womens-lifestyle-shoes-13jrmz5e1x6zy7ok'], ['Training & Gym', '/w/womens-training-gym-shoes-58jtoz5e1x6zy7ok'], ['Custom Shoes', '/w/womens-nike-by-you-shoes-5e1x6z6ealhzy7ok']]),
    g('Clothing', '/w/womens-clothing-5e1x6z6ymx6', [['All Clothing', '/w/womens-clothing-5e1x6z6ymx6'], ['Bras', '/w/womens-sports-bras-40qgmz5e1x6'], ['Fleece', '/w/womens-fleece-4xh6qz5e1x6'], ['Hoodies & Sweatshirts', '/w/womens-hoodies-and-pullovers-5e1x6z6rive'], ['Jackets & Vests', '/w/womens-jackets-vests-50r7yz5e1x6'], ['Leggings', '/w/womens-tights-leggings-29sh2z5e1x6'], ['Matching Sets', '/w/womens-matching-sets-clothing-2lukpz5e1x6z6ymx6'], ['Pants', '/w/womens-pants-and-tights-2kq19z5e1x6'], ['Shorts', '/w/womens-shorts-38fphz5e1x6'], ['Tops & Graphics Tees', '/w/womens-tops-t-shirts-5e1x6z9om13']]),
    g('Accessories', '/w/womens-accessories-equipment-5e1x6zawwpw', [['All Accessories', '/w/womens-accessories-equipment-5e1x6zawwpw'], ['Bags & Backpacks', '/w/womens-bags-and-backpacks-5e1x6z9xy71'], ['Hats & Headwear', '/w/womens-hats-visors-and-headbands-52r49z5e1x6'], ['Socks', '/w/womens-socks-5e1x6z7ny3q'], ['Sunglasses', '/w/sunglasses-arlyp']]),
    g('Shop by Color', '/w/womens-matching-sets-clothing-2lukpz5e1x6z6ymx6', [['Dark Neutrals', '/w/womens-color-shop-brown-4elb3z5e1x6'], ['Purple Pulse', '/w/womens-color-shop-purple-5e1x6z9g6re'], ['Spruce Greens', '/w/womens-color-shop-green-5e1x6z9cm3q'], ['Very Berry', '/w/womens-color-shop-navy-5e1x6z9cd0e'], ['Warm Neutrals', '/w/womens-color-shop-new-neutrals-5e1x6z98ed2']]),
  ] },
  { label: 'Kids', path: '/kids', groups: [
    g('New & Featured', '/w/new-kids-3n82yzv4dh', [['New Arrivals', '/w/new-kids-3n82yzv4dh'], ['Best Sellers', '/w/kids-best-76m50zv4dh'], ['Nike Sportswear', '/w/kids-lifestyle-13jrmzv4dh'], ['Nike x LEGO®', '/w/nike-lego-collection-58jr'], ['Teens Collection', '/teens'], ['Shop All Sale', '/w/kids-sale-3yaepzv4dh']]),
    g('Shoes', '/w/kids-shoes-v4dhzy7ok', [['All Shoes', '/w/kids-shoes-v4dhzy7ok'], ['Big Kids (7-12 yrs)', '/w/big-kids-shoes-agibjzv4dhzy7ok'], ['Little Kids (3-7 yrs)', '/w/little-kids-shoes-6dacezv4dhzy7ok'], ['Baby & Toddler (0-3 yrs)', '/w/baby-toddler-kids-shoes-2j488zv4dhzy7ok'], ['Basketball', '/w/kids-basketball-shoes-3glsmzv4dhzy7ok'], ['Jordan', '/w/kids-jordan-shoes-37eefzv4dhzy7ok'], ['Running', '/w/kids-running-shoes-37v7jzv4dhzy7ok'], ['Sportswear', '/w/kids-lifestyle-shoes-13jrmzv4dhzy7ok']]),
    g('Clothing', '/w/kids-clothing-6ymx6zv4dh', [['All Clothing', '/w/kids-clothing-6ymx6zv4dh'], ['Big Kids (7-12 yrs)', '/w/big-kids-clothing-6ymx6zagibjzv4dh'], ['Little Kids (3-7 yrs)', '/w/little-kids-clothing-6dacez6ymx6zv4dh'], ['Baby & Toddler (0-3 yrs)', '/w/baby-toddler-kids-clothing-2j488z6ymx6zv4dh'], ['Bras & Tights', '/w/kids-bras-tights-88mejzv4dh'], ['Fleece', '/w/kids-fleece-4xh6qzv4dh'], ['Hoodies & Sweatshirts', '/w/kids-hoodies-and-pullovers-6rivezv4dh'], ['Jackets & Vests', '/w/kids-jackets-vests-50r7yzv4dh'], ['Pants', '/w/kids-pants-and-tights-2kq19zv4dh'], ['Shorts', '/w/kids-shorts-38fphzv4dh'], ['Tops & Graphics Tees', '/w/kids-tops-t-shirts-9om13zv4dh']]),
    g('Accessories', '/w/kids-accessories-equipment-awwpwzv4dh', [['All Accessories', '/w/kids-accessories-equipment-awwpwzv4dh'], ['Bags & Backpacks', '/w/kids-bags-and-backpacks-9xy71zv4dh'], ['Hats & Headwear', '/w/kids-hats-visors-and-headbands-52r49zv4dh'], ['Socks', '/w/kids-socks-7ny3qzv4dh']]),
    g('Shop By Sport', '/w/kids-basketball-3glsmzv4dh', [['Basketball', '/w/kids-basketball-3glsmzv4dh'], ['Gymnastics', '/w/gymnastics-dance-inspired-2obuy'], ['Fan Gear', '/w/kids-fan-gear-b170ozv4dh'], ['Football', '/w/kids-football-3hj8mzv4dh'], ['Running', '/w/kids-running-37v7jzv4dh'], ['Soccer', '/w/kids-soccer-1gdj0zv4dh']]),
  ] },
  { label: 'Jordan', path: '/jordan', groups: [
    g('New & Featured', '/w/new-jordan-37eefz3n82y', [['New Arrivals', '/w/new-jordan-37eefz3n82y'], ['Best Sellers', '/w/best-jordan-37eefz76m50'], ['Heat Check', '/w/jordan-heat-check-1n7xt'], ['Jordan Brand x Space Jam Collection', '/w/jordan-brand-x-space-jam-collection-9b8qk'], ['Shop All Sale', '/w/sale-jordan-37eefz3yaep']]),
    g('Men', '/w/mens-jordan-37eefznik1', [['Shop All', '/w/mens-jordan-37eefznik1'], ['Shoes', '/w/mens-jordan-shoes-37eefznik1zy7ok'], ['AJ1', '/w/mens-jordan-1-shoes-4fokyznik1zy7ok'], ['Clothing', '/w/mens-jordan-clothing-37eefz6ymx6znik1'], ['Accessories', '/w/jordan-accessories-equipment-37eefzawwpw']]),
    g('Women', '/w/womens-jordan-37eefz5e1x6', [['Shop All', '/w/womens-jordan-37eefz5e1x6'], ['Shoes', '/w/womens-jordan-shoes-37eefz5e1x6zy7ok'], ['AJ1', '/w/womens-jordan-1-shoes-4fokyz5e1x6zy7ok'], ['Clothing', '/w/womens-jordan-clothing-37eefz5e1x6z6ymx6'], ['Accessories', '/w/jordan-accessories-equipment-37eefzawwpw']]),
    g('Kids', '/w/kids-jordan-37eefzv4dh', [['Shop All', '/w/kids-jordan-37eefzv4dh'], ['Shoes', '/w/kids-jordan-shoes-37eefzv4dhzy7ok'], ['AJ1', '/w/jordan-1-shoes-1onraz3aqegz4fokyzy7ok'], ['Clothing', '/w/kids-jordan-clothing-37eefz6ymx6zv4dh'], ['Accessories', '/w/kids-jordan-accessories-equipment-37eefzawwpwzv4dh']]),
    g('Sport', '/w/jordan-basketball-37eefz3glsm', [['Basketball', '/w/jordan-basketball-37eefz3glsm'], ['Golf', '/w/jordan-golf-23q9wz37eef'], ['Cleats', '/w/jordan-cleats-spikes-37eefz5ufbh']]),
  ] },
  { label: 'NikeSKIMS', path: '/nikeskims', groups: [
    g('All Shoes', '/w/nikeskims-shoes-b2asdzy7ok', [['NikeSKIMS Rift', '/w/nikeskims-shoes-b2asdzy7ok']]),
    g('All Clothing', '/w/nikeskims-b2asd', [['Bras', '/w/nikeskims-sports-bras-40qgmzb2asd'], ['Jackets', '/w/nikeskims-jackets-vests-50r7yzb2asd'], ['Leggings', '/w/nikeskims-tights-leggings-29sh2zb2asd'], ['Shorts', '/w/nikeskims-shorts-38fphzb2asd'], ['Tops and Tanks', '/w/nikeskims-tops-t-shirts-9om13zb2asd'], ['Accessories', '/w/nikeskims-accessories-equipment-awwpwzb2asd']]),
    g('Shop by Color', '/w/nikeskims-b2asd', [['Carob Brown', '/w/nikeskims-brown-557pqzb2asd'], ['Citrine', '/w/nikeskims-yellow-ayp69zb2asd'], ['Ivory', '/w/nikeskims-white-4g797zb2asd'], ['Obsidian', '/w/nikeskims-black-90poyzb2asd']]),
    g('Shop by Material', '/w/nikeskims-b2asd', [['Airy', '/w/nikeskims-nikeskims-airy-5c1qqzb2asd'], ['Matte', '/w/nikeskims-nikeskims-matte-5s3enzb2asd'], ['Performance Cotton Blend', '/w/nikeskims-performance-cotton-blend-93ehs'], ['Satin Shine', '/w/nikeskims-nikeskims-satin-shine-97fc5zb2asd'], ['Seamless', '/w/nikeskims-nikeskims-seamless-6lh4szb2asd'], ['Stretch Knit 2.0', '/w/nikeskims-nikeskims-stretch-knit-21jwlzb2asd'], ['Stretch Nylon', '/w/nikeskims-stretch-nylon-7sut9'], ['Studio Stretch', '/w/nikeskims-studio-stretch-admbq'], ['Weightless', '/w/nikeskims-nikeskims-weightless-4csx8zb2asd']]),
    g('NikeSKIMS Guides', '/w/nikeskims-b2asd', [['NikeSKIMS Lookbook', '/nikeskims-lookbook'], ['NikeSKIMS Bra Guide', '/nikeskims-bra-guide'], ['NikeSKIMS Fabric Guide', '/nikeskims-collection-guide']]),
  ] },
  { label: 'Sport', path: '/gear-up', groups: [
    g('Basketball', '/basketball', [['Shoes', '/w/basketball-shoes-3glsmzy7ok'], ['Apparel', '/w/basketball-clothing-3glsmz6ymx6'], ['Equipment', '/w/basketball-accessories-equipment-3glsmzawwpw'], ['Kobe', '/kobe'], ['Jordan', '/w/jordan-basketball-37eefz3glsm']]),
    g('Court', '/court', [['Tennis', '/w/tennis-ed1q'], ['Pickleball', '/w/pickleball-273vc'], ['Tennis Shoes', '/w/tennis-shoes-ed1qzy7ok'], ['Tennis Apparel', '/w/tennis-clothing-6ymx6zed1q']]),
    g('Soccer', '/soccer', [['Cleats', '/w/soccer-shoes-1gdj0zy7ok'], ['Indoor Footwear', '/w/indoor-court-soccer-shoes-1gdj0z8yh10zy7ok'], ['Apparel', '/w/soccer-clothing-1gdj0z6ymx6'], ['Equipment', '/w/soccer-accessories-equipment-1gdj0zawwpw']]),
    g('Training', '/training', [['Prime', '/w/prime-7frqv'], ['Train', '/w/training-gym-58jto'], ['Hybrid', '/w/hybrid-training-8wvhh'], ['Strength', '/w/strength-training-45gbi'], ['Studio', '/w/yoga-pilates-59fco'], ['Recover', '/w/recover-5vfyy']]),
    g('Running', '/running', [['Road', '/w/road-running-shoes-37v7jz8kwewzy7ok'], ['Race', '/w/road-racing-shoes-9gdhkzy7ok'], ['Trail', '/w/acg-running-37v7jz93bsd'], ['Track & Field', '/w/track-field-shoes-7nem3zy7ok'], ['Apparel', '/w/running-clothing-37v7jz6ymx6'], ['Running Shoe Finder', '/running-shoe-finder']]),
    g('Golf', '/golf', [['Shoes', '/w/golf-shoes-23q9wzy7ok'], ['Apparel', '/w/golf-clothing-23q9wz6ymx6'], ['Equipment', '/w/golf-accessories-equipment-23q9wzawwpw']]),
    g('More Sports', '/gear-up', [['Baseball', '/baseball'], ['Cheer', '/w/cheerleading-1cyjk'], ['Football', '/us-football'], ['Gymnastics', '/w/gymnastics-dance-inspired-2obuy'], ['Lacrosse', '/w/lacrosse-4nvmr'], ['Skateboarding', '/w/skateboarding-8mfrf'], ['Softball', '/w/womens-softball-2dlpvz5e1x6'], ['Sportswear', '/sportswear'], ['Swimming', '/w/surf-swimming-3c2dj'], ['Volleyball', '/w/volleyball-tc2u'], ['Wrestling', '/w/wrestling-52dy6']]),
    g('Team and League Gear', '/LockerRoom', [['Locker Room', '/LockerRoom'], ['NBA Gear', '/w/nba-1vofi'], ['NFL Gear', '/w/nfl-9bklc'], ['MLB Gear', '/w/mlb-b0g9x'], ['WNBA Gear', '/w/wnba-6ef6n'], ['NCAA Gear', '/w/basketball-college-teams-2wq2gz3glsm'], ['NWSL Gear', '/w/national-womens-soccer-league-5yy3b'], ['Soccer Club Gear', '/w/soccer-clubs-6fu9q'], ['Federations Gear', '/w/national-team-soccer-1gdj0zav9de']]),
    g('All Conditions Gear', '/acg', [['Trail Run', '/w/acg-trail-running-75jcnz93bsd'], ['Hike', '/w/acg-hiking-90dwjz93bsd'], ['Explore', '/w/acg-explore-1v964z93bsd']]),
  ] },
  { label: 'Sportswear', path: '/sportswear', groups: [] },
]

export const HELP_MENU = [
  ['Order Status', '/orders/details'], ['Shipping & Delivery', '/help/a/shipping-delivery'], ['Returns', '/help/a/returns-policy'],
  ['Order Cancellation', '/help/a/change-cancel-order'], ['Size Charts', '/help/a/size-charts'], ['Contact Us', '/help#contact'],
  ['Membership', '/membership'], ['Promotions & Discounts', '/promo-code'], ['Product Advice', '/product-advice'], ['Send Us Feedback', '/site-feedback'],
]

export const POPULAR_SEARCHES = ['peg plus 2', 'haaland', 'basketball shoes', 'jordan', 'air force 1', 'shoes', 'soccer cleats', 'socks']

export const FOOTER = [
  { heading: 'Resources', links: [['Gift Cards', '/gift-cards'], ['Corporate Sales', '/corporate-sales'], ['Find a Store', '/retail'], ['Membership', '/membership'], ['Product News', '/product-news'], ['Magazine', '/magazine'], ['Site Feedback', '/site-feedback']] },
  { heading: 'Help', links: [['Get Help', '/help'], ['Order Status', '/orders/details'], ['Shipping and Delivery', '/help/a/shipping-delivery'], ['Returns', '/help/a/returns-policy'], ['Order Cancellation', '/help/a/change-cancel-order'], ['Payment Options', '/help/a/payment-options'], ['Gift Card Balance', '/orders/gift-card-lookup'], ['Contact Us', '/help#contact']] },
  { heading: 'Company', links: [['About Nike', '/about-nike'], ['News', '/news'], ['Careers', '/careers'], ['Investors', '/investors'], ['Purpose', '/purpose'], ['Sustainability', '/sustainability'], ['Accessibility', '/accessibility']] },
  { heading: 'Promotions & Discounts', links: [['Student', '/help/a/student-discount'], ['Military', '/help/a/military-discount'], ['Teacher', '/help/a/teacher-discount'], ['First Responders & Medical Professionals', '/help/a/first-responder-discount'], ['Birthday', '/help/a/birthday-terms-promo']] },
  { heading: 'Guides', links: [['Nike Air', '/air'], ['Nike Air Force 1', '/air-force-1'], ['Nike Air Max', '/air-max'], ['Nike FlyEase', '/flyease'], ['Nike Flyknit', '/flyknit'], ['Nike Free', '/free'], ['Nike React', '/react'], ['Nike Vaporfly', '/running/vaporfly'], ['Nike ZoomX', '/zoomx'], ['Space Hippie', '/space-hippie']] },
]

export const LEGAL = [['Terms of Sale', '/terms-of-sale'], ['Terms of Use', '/terms-of-use'], ['Nike Privacy Policy', '/privacy-policy'], ['Your Privacy Choices', '/guest/settings/do-not-share-my-data'], ['CA Supply Chains Act', '/ca-supply-chains-act']]

// Results counts observed on the real category pages are not reproduced: this
// clone has no captured products for them. Filter groups mirror the real pages.
export const FILTERS = [
  ['Gender', ['Men', 'Women', 'Unisex']],
  ['Sale & Offers', ['Sale']],
  ['Shop by Price', ['$0 - $25', '$25 - $50', '$50 - $100', '$100 - $150', 'Over $150']],
  ['Color', ['Black', 'Blue', 'Brown', 'Green', 'Grey', 'Orange', 'Pink', 'Purple', 'Red', 'White', 'Yellow', 'Multi-Color']],
  ['Size', ['M 6 / W 7.5', 'M 7 / W 8.5', 'M 8 / W 9.5', 'M 9 / W 10.5', 'M 10 / W 11.5', 'M 11 / W 12.5', 'M 12 / W 13.5', 'M 13 / W 14.5']],
  ['Brand', ['Nike Sportswear', 'Jordan', 'Kobe', 'Nike By You', 'Converse', 'NikeLab', 'ACG']],
  ['Sports', ['Lifestyle', 'Running', 'Training & Gym', 'Basketball', 'Football', 'Soccer', 'Golf', 'Skateboarding', 'Tennis']],
  ['Shoe Height', ['Low Top', 'Mid Top', 'High Top']],
  ['Width', ['Regular', 'Wide', 'Extra Wide']],
]
