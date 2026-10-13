// Original ImageGen product photographs, covers and room inspiration in three-column CSS sprite sheets.
// No client script, network service, raster editing or third-party asset is used.
import { esc } from './html.js'

const SHEETS = {
  'recipe-editorial-v2': ['recipe-white-bean-skillet','recipe-carrot-soup','recipe-apple-crumble','recipe-herb-focaccia','recipe-tomato-orzo','recipe-cinnamon-coffee'],
  'retail-small-details': ['catnip-mouse-gray','horse-mitt-blue','chicken-feed-pellets','ankle-socks-white','lip-oil-clear','mini-moisturizer-white'],
  electronics: ['controller','headphones','keyboard','mouse','monitor','smartphone'],
  kitchen: ['dutch-oven','frying-pan','mug','stand-mixer','kettle','toaster'],
  groceries: ['milk','bread','apples','noodles','water','coffee'],
  fashion: ['sneakers','tshirt','hoodie','jeans','backpack','cap'],
  home: ['armchair','lamp','desk','shelf','cushion','basket'],
  beauty: ['lipstick','moisturizer','serum','perfume','hairdryer','shampoo'],
  pets: ['dog-food','cat-food','pet-bed','pet-bowl','pet-ball','leash'],
  toys: ['building-bricks','teddy','bicycle','board-game','figure','crayons'],
  'tech-extra': ['earbuds','speaker','webcam','usb-hub','ssd','smart-plug'],
  'home-extra': ['bed','bath-towels','storage-bins','hangers','chef-knife','tote'],
  'gaming-hardware': ['controller-black','gaming-headset','ps5-console','xbox-console','handheld-console','gaming-chair'],
  'footwear-extra': ['running-shoes-black','basketball-shoes','slides','football-cleats','training-shorts','socks'],
  'beauty-extra': ['foundation','mascara','eyeshadow','cleanser','sunscreen','lip-gloss'],
  'pets-extra': ['cat-litter','scratching-post','cat-tree','pet-carrier','dog-harness','rope-toy'],
  'kitchen-extra': ['blender','espresso-machine','cutting-board','bakeware','glassware','flatware'],
  'pantry-extra': ['oatmeal','peanut-butter','cookies','pasta','cereal','olive-oil'],
  'cleaning-extra': ['paper-towels','laundry-detergent','trash-bags','napkins','dish-soap','cleaning-wipes'],
  'computing-extra': ['laptop','tablet','television','mouse-black','router','printer'],
  'home-tech-extra': ['soundbar','streaming-player','hdmi-cable','security-camera-white','video-doorbell','thermostat'],
  'appliance-camera-extra': ['microwave','drip-coffee-maker','stick-vacuum-blue','air-purifier','mirrorless-camera','action-camera'],
  'devices-extra': ['smartwatch-black','earbuds-white','speaker-green','keyboard-white-compact','portable-ssd','desk-lamp-white'],
  'daily-appliances': ["desk-fan-white", "robot-vacuum-white", "powerbank-black", "laptop-stand", "charging-dock-black", "digital-scale-dark"],
  'fresh-pantry': ["eggs", "canned-tuna", "rice", "greek-yogurt", "bananas", "salad-greens"],
  'bath-stationery-v2': ["foaming-cleanser", "citrus-bodywash", "toilet-paper", "floor-mop", "gel-pens", "notebooks"],
  'outdoor-fitness': ["tent-green", "camping-chair-khaki", "lantern-cream", "yoga-mat-blue", "dumbbells-purple", "resistance-bands"],
  'toys-extra': ["rc-car-red", "doll-pink", "dinosaur-green", "toy-train", "plush-rabbit", "scooter-blue"],
  'baby-extra': ["diaper-pants", "baby-wipes", "baby-bottle", "feeding-plate-peach", "stroller-gray", "crib-wood"],
  'retail-matches': ['wet-cat-food','ceramic-lamp','canvas-sneakers','steel-pot','fabric-basket-gray','headphones-cream'],
  'original-books-music': ['book-lantern-keeper','book-orchard-house','book-weeknight-table','book-watercolor','book-national-parks','vinyl-blue-hour'],
  'catalog-matches': ['brick-city-bus','brick-botanical','cap-navy','mug-set-cream','bedding-white','analog-watch'],
  'original-games-cards-v2': ['game-starfall-expedition','game-apex-rally','game-pocket-garden','mythic-skybound-booster','mythic-ember-deck','mythic-tide-deck'],
  'furniture-deep': ['dining-chair-oak','dining-table-oak','wardrobe-white','rug-ivory','bookcase-oak','chest-drawers-white'],
  'gaming-peripherals': ['vr-headset-white','racing-wheel-pedals','handheld-case-black','keyboard-mouse-bundle','controller-dock-white','disc-wallet-black'],
  'kitchen-deep-v2': ['dinner-plates-white','serving-bowl-white','teapot-white','loaf-pan-dark','food-processor-steel','rolling-pin-wood'],
  'kitchen-tools': ['wood-utensils-three','baking-dish-cream','linen-napkins-beige','whisk-steel','colander-steel','measuring-spoons-steel'],
  'specialty-cookware': ['saucepan-steel','saute-pan-steel','grill-pan-black','roasting-pan-steel','wok-black','probe-thermometer'],
  'cutlery-baking': ['paring-knife-black','bread-knife-black','santoku-black','honing-steel-black','sheet-pan-aluminum','muffin-pan-six'],
  'ws-finish-v2': ['pie-dish-cream','kitchen-towels-three','skillet-brushed-steel','dutch-oven-sage','saucepan-brushed-steel','dutch-oven-sage-open'],
  'sportswear-deep': ['sports-bra-black','leggings-black','joggers-gray','duffel-black','windbreaker-blue','sport-bottle-black'],
  'pet-supplies-deep': ['dog-treats','litter-tray-teal','cat-teaser-wand','aquarium-black','bird-seed','small-pet-habitat'],
  'pet-care': ['cat-bed-sage','cat-tree-two-level','dog-collar-red','pet-fountain-white','slicker-brush-black','pet-shampoo-blue'],
  'pet-utility': ['dog-crate-black','training-pads-blue','waste-bags-green','puzzle-feeder-teal','cooling-mat-blue','grooming-glove-gray'],
  'bird-fish': ['bird-feeder-green','bird-perch-wood','bird-foraging-toy','fish-flakes-jar','aquarium-filter-black','aquarium-net-green'],
  'small-pets-reptiles': ['timothy-hay-bag','rabbit-pellets-bag','paper-bedding-white','terrarium-glass','reptile-hide-gray','heat-lamp-black'],
  'beauty-tools-v2': ['concealer-light-beige','blush-rose','brow-pencil-brown','nail-polish-rose','makeup-brush-set','conditioner-lavender'],
  'retail-hardware-matches-v2': ['kettle-black-plastic','sofa-gray-two-seat','xbox-controller-black','ps5-digital-console','card-binder-black','card-binder-red'],
  'digital-fiction': ['digital-starfall-expedition','digital-apex-rally','digital-pocket-garden','digital-lanterns-of-aster','digital-neon-circuit','digital-harbor-builder'],
  'digital-published': ['digital-astro-bot','digital-gran-turismo-7','digital-helldivers-2','digital-minecraft','digital-fortnite','digital-roblox'],
  'digital-xbox': ['digital-forza-horizon-5','digital-halo-infinite','digital-sea-of-thieves','digital-flight-simulator-2024','digital-grounded','digital-ori-wisps'],
  'korean-matches-v2': ['handheld-case-navy','keyboard-tkl-white','mouse-gray','digital-scale-white','feeding-plate-mint','yoga-mat-lavender'],
  'room-inspiration': ['room-kitchen','room-bedroom','room-living','room-office','room-kids','room-bathroom'],
  'furniture-everyday': ['sofa-gray-three-seat','planter-stoneware-white','coffee-table-oak','bedside-cabinet-white','shoe-cabinet-white','floor-mirror-oak'],
  'furniture-matched': ['desk-white-four-leg','dining-chair-beech','utility-cart-white','curtains-beige-pair','office-chair-black','bath-mat-white'],
  'ikea-finish': ['shelf-three-white','shelf-three-oak','shelf-three-dark','reading-lamp-green','duvet-cover-white','desk-oak-four-leg'],
  'sport-kids-equipment': ['kids-trainers-blue','basketball-orange','soccer-ball','sport-cap-white','tennis-skirt-black','swimsuit-black'],
  'training-garments-v2': ['running-tank-black','technical-top-navy','compression-top-black','running-vest-black','bike-shorts-black','headband-white'],
  'sport-gallery': ['crossbody-black','crossbody-black-back','crossbody-black-open','kids-tracksuit-blue','kids-tracksuit-blue-back','kids-tracksuit-blue-detail'],
  'running-footwear': ['court-sneaker-white','cushion-runner-black','cushion-runner-white','support-runner-gray','racing-shoe-orange','trail-shoe-green'],
  'sport-finish-v2': ['gym-trainer-black','tennis-shoe-white','retro-sneaker-navy','training-shorts-gray','warmup-pants-navy','windbreaker-black'],
  'beauty-detail-v2': ['lip-liner-rose','eyeliner-black','setting-powder-translucent','setting-spray-clear','cleansing-balm-white','sheet-mask-pink'],
  'beauty-body-kits': ['hair-mask-lavender','body-lotion-cream','hand-cream-white','body-scrub-amber','mini-skincare-set','fragrance-discovery-vials'],
  'beauty-shades': ['lipstick-rosewood','lipstick-nude-pink','lipstick-berry','foundation-light-neutral','foundation-medium-warm','foundation-deep-neutral'],
  'beauty-shade-extras': ['concealer-medium-golden','concealer-deep-cocoa','blush-warm-peach','brow-pencil-soft-black','lip-liner-cocoa','lip-oil-rose'],
  'beauty-care': ['primer-white-tube','toner-aqua','eye-cream-white','lip-mask-pink','leave-in-lavender','hair-oil-amber'],
  'fragrance-mini-v2': ['perfume-woody-amber','perfume-citrus-yellow','body-mist-pink','mini-foundation-light','mini-foundation-medium','mini-foundation-deep'],
  'rockstar-merch-v2': ['rockstar-tee-white','rockstar-crewneck-black','rockstar-cap-navy','rockstar-snapback-black','rockstar-pin-set','rockstar-keychain-red'],
  'digital-rockstar': ['digital-rockstar-gta-v','digital-rockstar-rdr2','digital-rockstar-rdr','digital-rockstar-la-noire','digital-rockstar-bully','digital-rockstar-gta-iv'],
  'rockstar-collectibles-v2': ['rockstar-collector-box','rockstar-glass-candle','rockstar-glass-tray','rockstar-collector-detail','rockstar-candle-detail','rockstar-tray-detail'],
}
// This original sheet has unequal row heights; retain native image proportions
// and crop each row in CSS rather than resampling or including its neighbour.
const SHEET_ROWS = { 'rockstar-collectibles-v2': [480, 544], 'recipe-editorial-v2': [484, 540] }
export const PHOTO_KEYS = Object.values(SHEETS).flat()
export function photoStyle(key) {
  for (const [sheet, keys] of Object.entries(SHEETS)) {
    const index = keys.indexOf(key)
    if (index < 0) continue
    const rowHeight = SHEET_ROWS[sheet]?.[index < 3 ? 0 : 1]
    if (rowHeight) return `background-image:url('/static/art/depth/products-${sheet}.png');background-size:300% ${1024 / rowHeight * 100}%;background-position:${[0,50,100][index%3]}% ${index<3?0:100}%;background-repeat:no-repeat;background-color:#fff;aspect-ratio:512/${rowHeight};height:auto;display:block;min-width:0;`
    return `background-image:url('/static/art/depth/products-${sheet}.png');background-size:300% 200%;background-position:${[0,50,100][index%3]}% ${index<3?0:100}%;background-repeat:no-repeat;background-color:#fff;aspect-ratio:1;display:block;min-width:0;`
  }
  return ''
}
export function productPhoto(key, title = '', className = '') {
  const style = photoStyle(key)
  return style ? `<span class="product-photo ${esc(className)}" role="img" aria-label="${esc(title)}" style="${style}"></span>` : ''
}
