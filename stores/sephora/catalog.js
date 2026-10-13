import { applyCatalogPolicy } from '../../lib/catalog-policy.js'
import { beautyAssortment } from './assortment.js'
// Deterministic original beauty catalog. Brands below are fictional collections;
// original photographs illustrate formats and never claim authentic branded packaging.
export const clean = value => typeof value === 'string' ? value.trim() : ''
// Preserve a PDP selection through related actions without accepting extra or repeated options.
export function selectionOptions(product, input) {
  const options = { ...product.defaultOptions }
  for (const [key, value] of Object.entries(input)) {
    if (!key.startsWith('option_')) continue
    const label = key.slice(7)
    if (!Object.hasOwn(product.options, label) || typeof value !== 'string' || !product.options[label].includes(value)) return null
    options[label] = value
  }
  return options
}
export const slugify = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const departments = ['Makeup', 'Skincare', 'Hair', 'Fragrance', 'Bath & Body', 'Sets']
export const brands = [
  { name: 'Color Study', text: 'Color, texture and everyday expression for eyes, lips and cheeks.' },
  { name: 'Studio Form', text: 'Build your base with considered complexion products and finishing tools.' },
  { name: 'Daily Theory', text: 'Simple textures to make your morning and evening routines your own.' },
  { name: 'Strand Ritual', text: 'Wash-day essentials, finishing care and tools for your hair routine.' },
  { name: 'Scent Archive', text: 'Explore floral, woody and citrus notes, from a first spritz to a discovery set.' },
  { name: 'Body Edit', text: 'Comforting textures for the shower, the sink and the moments in between.' },
].map(brand => ({ ...brand, slug: slugify(brand.name) }))
const art = {
  tube: 'M56 32h48v72H56z M60 21h40v11H60z', jar: 'M43 57h74v44H43z M40 44h80v13H40z',
  dropper: 'M56 45h48v59H56z M69 20h22v25H69z M75 9h10v11H75z', lipstick: 'M64 66h32v38H64z M69 61V28l22-10v43z',
  pump: 'M55 40h50v65H55z M71 23h18v17H71z M74 15h39v8H74z', perfume: 'M47 50h66v52H47z M67 30h26v20H67z M61 19h38v11H61z',
  pencil: 'M72 28h16v78H72z M72 28l8-19 8 19z', palette: 'M24 41h112v57H24z M35 53h22v28H35z M68 53h22v28H68z M101 53h22v28H101z',
  spray: 'M55 44h50v60H55z M70 24h20v20H70z M72 14h32v10H72z', packet: 'M44 17h72v89H44z M50 24h60v10H50z',
  brush: 'M43 59h8v46h-8z M35 27h24v32H35z M80 51h8v54h-8z M73 25h22v26H73z M112 49h7v56h-7z M107 22h17v27h-17z',
  dryer: 'M33 30h67l22 16v27l-22 6H74l6 29H58L46 69H33z', set: 'M24 61h112v43H24z M35 30h21v31H35z M69 17h22v44H69z M102 37h20v24h-20z',
}
function p(id, title, category, type, brand, price, photo, shape, description, extra = {}) {
  return { id, title, category, type, brand, brandSlug: slugify(brand), price, photo, art: art[shape], color: '#dcb1ac', description, detail: description,
    size: 'Standard', formulation: 'Cream', finish: '', scent: '', skin: [], hair: [], preferences: [], stock: 10, rating: 4.4, reviews: 68, options: {}, use: 'Apply a small amount as part of your usual beauty routine.', material: 'See the format and size information below.', keywords: '', ...extra }
}
export const products = [
  p('lip-color', 'Soft matte lip color', 'Makeup', 'Lipstick', 'Color Study', 19.99, 'lipstick-rosewood', 'lipstick', 'A smooth everyday lip color with a soft matte finish.', { size: '0.12 oz / 3.5 g', formulation: 'Stick', finish: 'Matte', use: 'Apply directly to lips, starting at the center and working outward.', material: 'Solid lip color in a twist-up tube.', options: { Shade: ['Rosewood', 'Nude pink', 'Berry'] }, shades: { Rosewood: ['Rose', 'Neutral rose', '#a55862'], 'Nude pink': ['Pink', 'Warm pink', '#dba7a0'], Berry: ['Berry', 'Cool berry', '#83214b'] } }),
  p('mascara', 'Lengthening mascara', 'Makeup', 'Mascara', 'Color Study', 16, 'mascara', 'tube', 'A slim brush for defined, separated lashes.', { size: '0.27 oz / 8 mL', formulation: 'Liquid', finish: 'Natural', colorName: 'Black', use: 'Sweep from the roots of your upper lashes toward the tips.', material: 'Liquid mascara with a slim brush applicator.' }),
  p('foundation', 'Soft-focus liquid foundation', 'Makeup', 'Foundation', 'Studio Form', 36, 'foundation-light-neutral', 'pump', 'Buildable color for an even-looking base with a natural finish.', { size: '1 oz / 30 mL', formulation: 'Liquid', finish: 'Natural', coverage: 'Medium', skin: ['Normal', 'Combination'], material: 'Liquid complexion color in a pump bottle.', use: 'Blend a small amount over moisturized skin with fingers or a brush.', options: { Shade: ['Light neutral', 'Medium warm', 'Deep neutral'], Size: ['Standard · 30 mL', 'Mini · 10 mL'] }, shades: { 'Light neutral': ['Light', 'Neutral', '#e8c6aa'], 'Medium warm': ['Medium', 'Warm golden', '#b47e52'], 'Deep neutral': ['Deep', 'Neutral', '#634334'] } }),
  p('concealer', 'Flexible finish concealer', 'Makeup', 'Concealer', 'Studio Form', 24, 'concealer-light-beige', 'tube', 'A creamy liquid concealer for targeted, buildable coverage.', { size: '0.20 oz / 6 mL', formulation: 'Liquid', finish: 'Natural', coverage: 'Medium', material: 'Liquid color with a doe-foot applicator.', options: { Shade: ['Light beige', 'Medium golden', 'Deep cocoa'] }, shades: { 'Light beige': ['Light', 'Neutral beige', '#e3bd9c'], 'Medium golden': ['Medium', 'Warm golden', '#b68155'], 'Deep cocoa': ['Deep', 'Neutral brown', '#694631'] } }),
  p('blush', 'Cloud powder blush', 'Makeup', 'Blush', 'Color Study', 22, 'blush-rose', 'palette', 'Soft pressed color for cheeks with a satin finish.', { size: '0.18 oz / 5 g', formulation: 'Powder', finish: 'Satin', material: 'Pressed cheek powder in a compact.', options: { Shade: ['Soft rose', 'Warm peach'] }, shades: { 'Soft rose': ['Rose', 'Cool rose', '#bf7986'], 'Warm peach': ['Peach', 'Warm peach', '#de9d7b'] } }),
  p('brow-pencil', 'Fine line brow pencil', 'Makeup', 'Brow Pencil', 'Color Study', 18, 'brow-pencil-brown', 'pencil', 'A precise brow pencil with a brush for soft definition.', { size: '0.003 oz / 0.09 g', formulation: 'Pencil', finish: 'Matte', material: 'Retractable brow color with a spoolie.', options: { Shade: ['Brown', 'Soft black'] }, shades: { Brown: ['Brown', 'Neutral brown', '#70533c'], 'Soft black': ['Black', 'Neutral', '#282321'] }, use: 'Use short strokes through the brows, then brush to blend.' }),
  p('eyeshadow-palette', 'Everyday neutrals eye palette', 'Makeup', 'Eyeshadow', 'Color Study', 34, 'eyeshadow', 'palette', 'An everyday selection of neutral tones with matte and shimmer finishes.', { size: '1 palette', formulation: 'Powder', finish: 'Shimmer', material: 'Pressed powder eye colors in a palette.', use: 'Blend a lighter tone over the lid and add a deeper tone for definition.' }),
  p('lip-gloss', 'Glass shine lip gloss', 'Makeup', 'Lip Gloss', 'Color Study', 20, 'lip-gloss', 'tube', 'A cushiony gloss with a reflective finish.', { size: '0.17 oz / 5 mL', formulation: 'Liquid', finish: 'Glossy', material: 'Liquid gloss with a wand applicator.', preferences: ['Sheer color'] }),
  p('lip-oil', 'Soft tint lip oil', 'Makeup', 'Lip Oil', 'Color Study', 23, 'lip-oil-rose', 'tube', 'A lightweight lip oil with a sheer tint and glossy finish.', { size: '0.20 oz / 6 mL', formulation: 'Oil', finish: 'Glossy', material: 'Tinted lip oil in a wand tube.', options: { Shade: ['Rose tint', 'Clear'] }, shades: { 'Rose tint': ['Rose', 'Neutral rose', '#cf8c92'], Clear: ['Clear', 'Untinted', '#e8dacc'] }, preferences: ['Sheer color'] }),
  p('lip-liner', 'Shape and blend lip liner', 'Makeup', 'Lip Liner', 'Color Study', 14, 'lip-liner-rose', 'pencil', 'A soft pencil to outline and blend your lip color.', { size: '0.04 oz / 1.1 g', formulation: 'Pencil', finish: 'Matte', material: 'Sharpenable lip pencil.', options: { Shade: ['Rose', 'Cocoa'] }, shades: { Rose: ['Rose', 'Neutral rose', '#b47178'], Cocoa: ['Brown', 'Warm brown', '#805244'] }, use: 'Trace your natural lip line and blend inward.' }),
  p('eyeliner', 'Precision liquid eyeliner', 'Makeup', 'Eyeliner', 'Color Study', 17, 'eyeliner-black', 'pencil', 'A fine-tipped liner for controlled definition.', { size: '0.02 oz / 0.6 mL', formulation: 'Liquid', finish: 'Matte', colorName: 'Black', material: 'Black liquid eyeliner with a precision tip.', use: 'Draw short strokes along the upper lash line.' }),
  p('primer', 'Smooth canvas primer', 'Makeup', 'Primer', 'Studio Form', 28, 'primer-white-tube', 'tube', 'A lightweight layer to start your makeup routine.', { size: '1 oz / 30 mL', formulation: 'Gel', finish: 'Natural', skin: ['Normal', 'Combination'], material: 'Clear gel in a squeeze tube.', use: 'Smooth a thin layer over clean, moisturized skin before makeup.' }),
  p('setting-powder', 'Air finish loose powder', 'Makeup', 'Setting Powder', 'Studio Form', 30, 'setting-powder-translucent', 'jar', 'A finely milled translucent powder with a soft matte finish.', { size: '0.7 oz / 20 g', formulation: 'Powder', finish: 'Matte', material: 'Loose powder in a sifter jar.', use: 'Tap a small amount into the lid and apply lightly with a brush.', options: { Size: ['Standard · 20 g', 'Mini · 5 g'] } }),
  p('setting-spray', 'Fine mist setting spray', 'Makeup', 'Setting Spray', 'Studio Form', 26, 'setting-spray-clear', 'spray', 'A fine, clear mist to finish your makeup routine.', { size: '3.4 oz / 100 mL', formulation: 'Mist', finish: 'Natural', material: 'Clear setting mist in a spray bottle.', use: 'Close eyes and mist from a comfortable distance after applying makeup.' }),
  p('brush-set', 'Everyday makeup brush set', 'Makeup', 'Brushes', 'Studio Form', 42, 'makeup-brush-set', 'brush', 'A compact set of brushes for complexion and eye makeup.', { size: '1 brush set', formulation: 'Tool', finish: '', material: 'Synthetic brush fibers with reusable handles.', use: 'Use the larger brush for face powder and smaller brushes for detail. Wash regularly and air dry.' }),
  p('moisturizer', 'Daily face moisturizer', 'Skincare', 'Moisturizer', 'Daily Theory', 29.99, 'moisturizer', 'jar', 'A lightweight moisturizer for your daily skincare routine.', { size: '1.7 oz / 50 mL', skin: ['Normal', 'Dry'], preferences: ['Fragrance-free'], material: 'Face cream in a jar.', options: { Size: ['Standard · 50 mL', 'Mini · 15 mL'] }, use: 'Smooth a small amount over clean skin morning or evening.' }),
  p('serum', 'Hydrating face serum', 'Skincare', 'Serum', 'Daily Theory', 32, 'serum', 'dropper', 'A lightweight daily serum with a smooth, non-sticky texture.', { size: '1 oz / 30 mL', formulation: 'Serum', skin: ['Normal', 'Dry', 'Combination'], preferences: ['Fragrance-free'], material: 'Liquid facial serum in a dropper bottle.', use: 'Pat a few drops onto clean skin before moisturizer.' }),
  p('gel-cleanser', 'Fresh start gel cleanser', 'Skincare', 'Cleanser', 'Daily Theory', 21, 'cleanser', 'pump', 'A rinse-off cleanser with a lightweight gel texture.', { size: '5 oz / 150 mL', formulation: 'Gel', skin: ['Normal', 'Combination', 'Oily'], material: 'Gel cleanser in a pump bottle.', use: 'Massage onto damp skin and rinse with water.', options: { Size: ['Standard · 150 mL', 'Mini · 40 mL'] } }),
  p('cleansing-balm', 'Melt away cleansing balm', 'Skincare', 'Cleansing Balm', 'Daily Theory', 27, 'cleansing-balm-white', 'jar', 'A soft balm that becomes an oil-like texture as you massage.', { size: '2.5 oz / 75 g', formulation: 'Balm', skin: ['Normal', 'Dry'], material: 'Solid cleansing balm in a jar.', use: 'Massage onto dry skin, add water to emulsify, then rinse.' }),
  p('toner', 'Daily moisture toner', 'Skincare', 'Toner', 'Daily Theory', 22, 'toner-aqua', 'tube', 'A light liquid layer for your daily skincare routine.', { size: '5 oz / 150 mL', formulation: 'Liquid', skin: ['Normal', 'Dry', 'Combination'], material: 'Facial toner in a pour-top bottle.', use: 'Press a small amount into clean skin with your palms.' }),
  p('eye-cream', 'Soft touch eye cream', 'Skincare', 'Eye Cream', 'Daily Theory', 26, 'eye-cream-white', 'jar', 'A small-format cream for the skin around your eyes.', { size: '0.5 oz / 15 mL', skin: ['Normal', 'Dry'], preferences: ['Fragrance-free'], material: 'Eye-area cream in a small jar.', use: 'Gently tap a small amount around the orbital area, avoiding direct contact with eyes.' }),
  p('lip-mask', 'Overnight lip comfort mask', 'Skincare', 'Lip Mask', 'Daily Theory', 18, 'lip-mask-pink', 'jar', 'A rich balm texture for an evening lip-care ritual.', { size: '0.35 oz / 10 g', formulation: 'Balm', skin: ['Normal', 'Dry'], material: 'Lip balm in a small reusable-format jar.', use: 'Apply a thin layer to clean lips before bed.' }),
  p('sunscreen', 'Daily face sunscreen SPF 30', 'Skincare', 'Sunscreen', 'Daily Theory', 28, 'sunscreen', 'tube', 'A lightweight facial sunscreen for daily routines.', { size: '1.7 oz / 50 mL', formulation: 'Lotion', skin: ['Normal', 'Combination'], material: 'Face sunscreen lotion in a squeeze tube.', use: 'Follow the directions on the product label, including reapplication guidance.' }),
  p('sheet-mask', 'A quiet moment sheet mask', 'Skincare', 'Sheet Mask', 'Daily Theory', 7, 'sheet-mask-pink', 'packet', 'A single-use facial sheet mask for a quiet moment in your routine.', { size: '1 sheet', formulation: 'Sheet', skin: ['Normal', 'Dry'], material: 'Serum-soaked facial sheet in a sealed sachet.', use: 'Unfold onto clean skin, leave for the label-directed time, then remove.' }),
  p('hair-mask', 'Moisture hair mask', 'Hair', 'Hair Mask', 'Strand Ritual', 28, 'hair-mask-lavender', 'jar', 'A rich rinse-out mask for a weekly hair-care routine.', { size: '8 oz / 237 mL', hair: ['Dry', 'Curly', 'Coily'], material: 'Rinse-out hair treatment in a jar.', use: 'Work through damp mid-lengths and ends, then rinse after the time indicated on the label.' }),
  p('shampoo', 'Daily balance shampoo', 'Hair', 'Shampoo', 'Strand Ritual', 24, 'shampoo', 'pump', 'An everyday lathering shampoo for your wash routine.', { size: '8.5 oz / 250 mL', formulation: 'Liquid', hair: ['Normal', 'Straight', 'Wavy'], material: 'Liquid shampoo in a bottle.', use: 'Massage onto wet scalp and hair, then rinse.', options: { Size: ['Standard · 250 mL', 'Mini · 60 mL'] } }),
  p('conditioner', 'Soft finish conditioner', 'Hair', 'Conditioner', 'Strand Ritual', 24, 'conditioner-lavender', 'tube', 'A creamy rinse-out conditioner for soft-feeling lengths.', { size: '8.5 oz / 250 mL', hair: ['Dry', 'Wavy', 'Curly'], material: 'Cream conditioner in a squeeze tube.', use: 'Apply to mid-lengths and ends after shampooing, then rinse.' }),
  p('leave-in-spray', 'Easy day leave-in spray', 'Hair', 'Leave-In Conditioner', 'Strand Ritual', 22, 'leave-in-lavender', 'spray', 'A light leave-in mist to help make everyday styling easier.', { size: '5 oz / 150 mL', formulation: 'Mist', hair: ['Straight', 'Wavy', 'Curly'], material: 'Leave-in conditioner in a spray bottle.', use: 'Mist onto damp lengths and comb through before styling.' }),
  p('hair-oil', 'Finishing touch hair oil', 'Hair', 'Hair Oil', 'Strand Ritual', 30, 'hair-oil-amber', 'dropper', 'A smooth finishing oil for the mid-lengths and ends.', { size: '1.7 oz / 50 mL', formulation: 'Oil', hair: ['Dry', 'Curly', 'Coily'], material: 'Hair oil in a dropper bottle.', use: 'Warm a few drops between palms and smooth through lengths.' }),
  p('hair-dryer', 'Compact styling hair dryer', 'Hair', 'Hair Dryer', 'Strand Ritual', 89, 'hairdryer', 'dryer', 'A compact everyday dryer with adjustable airflow.', { size: '1 dryer', formulation: 'Tool', hair: ['Straight', 'Wavy', 'Curly', 'Coily'], material: 'Plastic housing with a US power cord and removable nozzle.', use: 'Towel-dry hair first. Keep the dryer moving and follow included electrical safety instructions.' }),
  p('fragrance', 'Fresh floral fragrance', 'Fragrance', 'Eau de Parfum', 'Scent Archive', 59.99, 'perfume', 'perfume', 'A fresh floral scent in a compact glass bottle.', { size: '1.7 oz / 50 mL', formulation: 'Spray', scent: 'Floral', material: 'Fragrance spray in a glass bottle.', notes: 'Petal, soft musk, pear', use: 'Spray lightly onto pulse points; avoid eyes and irritated skin.', options: { Size: ['Standard · 50 mL', 'Mini · 10 mL'] } }),
  p('woody-perfume', 'Quiet woods eau de parfum', 'Fragrance', 'Eau de Parfum', 'Scent Archive', 68, 'perfume-woody-amber', 'perfume', 'A warm woody composition for an understated scent ritual.', { size: '1.7 oz / 50 mL', formulation: 'Spray', scent: 'Woody', notes: 'Cedar, amber, soft spice', material: 'Fragrance spray in a glass bottle.', use: 'Spray lightly onto pulse points.', options: { Size: ['Standard · 50 mL', 'Mini · 10 mL'] } }),
  p('citrus-fragrance', 'Bright morning eau de toilette', 'Fragrance', 'Eau de Toilette', 'Scent Archive', 48, 'perfume-citrus-yellow', 'perfume', 'An airy citrus fragrance with a fresh, bright character.', { size: '1.7 oz / 50 mL', formulation: 'Spray', scent: 'Citrus', notes: 'Bergamot, neroli, light woods', material: 'Fragrance spray in a glass bottle.', use: 'Spray lightly onto pulse points.' }),
  p('body-mist', 'Soft cloud body mist', 'Fragrance', 'Body Mist', 'Scent Archive', 26, 'body-mist-pink', 'spray', 'A gentle floral scent in a casual all-over mist format.', { size: '3.4 oz / 100 mL', formulation: 'Mist', scent: 'Floral', notes: 'Jasmine, pear, soft musk', material: 'Scented body mist in a spray bottle.', use: 'Mist lightly over the body, avoiding face and eyes.' }),
  p('body-wash', 'Gentle body cleanser', 'Bath & Body', 'Body Wash', 'Body Edit', 18, 'citrus-bodywash', 'pump', 'A softly scented body cleanser for your shower routine.', { size: '10 oz / 300 mL', formulation: 'Gel', scent: 'Citrus', material: 'Liquid body cleanser in a pump bottle.', use: 'Lather onto wet skin and rinse thoroughly.' }),
  p('body-lotion', 'Everyday comfort body lotion', 'Bath & Body', 'Body Lotion', 'Body Edit', 24, 'body-lotion-cream', 'pump', 'A smooth body lotion for an everyday moisture routine.', { size: '8 oz / 237 mL', formulation: 'Lotion', skin: ['Normal', 'Dry'], preferences: ['Fragrance-free'], material: 'Cream-colored body lotion in a pump bottle.', use: 'Massage onto clean skin after bathing.' }),
  p('hand-cream', 'Soft hands cream', 'Bath & Body', 'Hand Cream', 'Body Edit', 12, 'hand-cream-white', 'tube', 'A bag-friendly hand cream with a soft finish.', { size: '1 oz / 30 mL', skin: ['Normal', 'Dry'], preferences: ['Fragrance-free'], material: 'Hand cream in a squeeze tube.', use: 'Massage a small amount into hands as needed.', mini: true }),
  p('body-scrub', 'Amber sugar body scrub', 'Bath & Body', 'Body Scrub', 'Body Edit', 30, 'body-scrub-amber', 'jar', 'A sugar-textured body polish with a warm scent.', { size: '8 oz / 225 g', formulation: 'Scrub', scent: 'Warm', material: 'Sugar body scrub in a wide-mouth jar.', use: 'Massage gently onto wet body skin and rinse. Avoid freshly shaved or irritated skin.' }),
  p('mini-set', 'Mini skincare discovery set', 'Sets', 'Skincare Set', 'Daily Theory', 25, 'mini-skincare-set', 'set', 'Three travel-size skincare essentials in a reusable pouch.', { size: '3 minis + pouch', formulation: 'Set', mini: true, gift: true, skin: ['Normal', 'Dry'], material: 'Gel cleanser 30 mL, facial serum 10 mL, moisturizer 15 mL and a reusable pouch.', use: 'Start with cleanser, follow with serum, then finish with moisturizer.' }),
  p('fragrance-discovery', 'Scent wardrobe discovery kit', 'Sets', 'Fragrance Set', 'Scent Archive', 28, 'fragrance-discovery-vials', 'set', 'Four fragrance vials to explore a different mood each day.', { size: '4 × 2 mL vials', formulation: 'Set', mini: true, gift: true, material: 'Four 2 mL spray vials: Fresh Floral, Quiet Woods, Bright Morning and Soft Cloud.', use: 'Try one scent at a time on a pulse point and allow it to settle.' }),
  ...beautyAssortment(p, slugify),
].map((product, index) => ({ ...product, rating: product.id === 'lip-color' ? 4.3 : Number((4.1 + (index % 8) * .1).toFixed(1)), reviews: 31 + index * 17, badge: index % 4 === 0 ? 'New' : '', newRank: 40 - index, featuredRank: index, offer: product.price <= 28, gift: product.gift || ['fragrance', 'brush-set', 'eyeshadow-palette', 'hand-cream'].includes(product.id), keywords: `${product.keywords} ${product.title} ${product.category} ${product.type} ${product.brand} ${product.formulation} ${product.finish} ${product.scent} ${product.preferences.join(' ')} beauty` }))
const miniPrices = { foundation: 16, 'setting-powder': 14, moisturizer: 12, 'gel-cleanser': 9, shampoo: 10, fragrance: 22, 'woody-perfume': 25 }
const exactShadePhotos = {
  'lip-color': { Rosewood: 'lipstick-rosewood', 'Nude pink': 'lipstick-nude-pink', Berry: 'lipstick-berry' },
  foundation: { 'Light neutral': 'foundation-light-neutral', 'Medium warm': 'foundation-medium-warm', 'Deep neutral': 'foundation-deep-neutral' },
  concealer: { 'Light beige': 'concealer-light-beige', 'Medium golden': 'concealer-medium-golden', 'Deep cocoa': 'concealer-deep-cocoa' },
  blush: { 'Soft rose': 'blush-rose', 'Warm peach': 'blush-warm-peach' },
  'brow-pencil': { Brown: 'brow-pencil-brown', 'Soft black': 'brow-pencil-soft-black' },
  'lip-liner': { Rose: 'lip-liner-rose', Cocoa: 'lip-liner-cocoa' },
  'lip-oil': { 'Rose tint': 'lip-oil-rose', Clear: 'lip-oil-clear' },
}
const miniFoundationPhotos = { 'Light neutral': 'mini-foundation-light', 'Medium warm': 'mini-foundation-medium', 'Deep neutral': 'mini-foundation-deep' }
function selectionPhoto(product, options) {
  // A standard package is never used as a photograph of a mini format.
  if (options.Size?.startsWith('Mini')) return product.id === 'foundation' ? miniFoundationPhotos[options.Shade] : product.id === 'moisturizer' ? 'mini-moisturizer-white' : null
  return options.Shade ? exactShadePhotos[product.id]?.[options.Shade] || null : product.photo
}
for (const product of products) {
  if (!Object.keys(product.options).length) continue
  const combos = Object.entries(product.options).reduce((list, [key, values]) => list.flatMap(previous => values.map(value => ({ ...previous, [key]: value }))), [{}])
  product.variants = combos.map((options, index) => ({ id: `${product.id}-${index + 1}`, options, price: options.Size?.startsWith('Mini') ? miniPrices[product.id] : product.price, stock: (product.id === 'foundation' && options.Shade === 'Deep neutral' && options.Size.startsWith('Mini')) || (product.id === 'lip-oil' && options.Shade === 'Clear') ? 0 : 5 + index % 4,
    photo: selectionPhoto(product, options),
    color: product.shades?.[options.Shade]?.[2] || product.color,
  }))
  product.defaultOptions = { ...product.variants.find(variant => variant.stock > 0).options }
}
export function candidates(product) {
  return product.variants?.map(variant => ({ ...product, ...variant, id: product.id, variantId: variant.id, stock: Math.min(product.stock, variant.stock), options: variant.options })) || [{ ...product, options: {} }]
}
export function queryParams(input = {}) {
  input = { ...input, q: input.keyword ?? input.q }
  return Object.fromEntries(['q', 'category', 'brand', 'type', 'size', 'finish', 'shade', 'preference', 'skin', 'hair', 'coverage', 'scent', 'formulation', 'price', 'stock', 'rating', 'collection', 'sort', 'page'].map(key => [key, clean(input[key])]).filter(([, value]) => value))
}
const aliases = { 'lip glosses': 'lip gloss', 'lip oils': 'lip oil', 'face wash': 'cleanser', 'face cream': 'moisturizer', 'perfumes': 'fragrance', 'travel size': 'mini', 'travel-size': 'mini', 'make up': 'makeup', 'bath and body': 'bath & body', 'shampoos': 'shampoo', 'sun cream': 'sunscreen', 'gift sets': 'set' }
export function matchingCandidates(product, q = {}) {
  return candidates(product).filter(variant => {
    const isMini = product.mini || variant.options.Size?.startsWith('Mini')
    if ((q.collection === 'mini' || q.size === 'Mini') && !isMini) return false
    if (q.size === 'Standard' && isMini) return false
    if (q.shade && product.shades?.[variant.options.Shade]?.[0] !== q.shade) return false
    if ((q.price === '50' || q.collection === 'under-50') && variant.price >= 50) return false
    if (q.price === '25' && variant.price >= 25) return false
    if (q.price === '25-50' && (variant.price < 25 || variant.price >= 50)) return false
    if (q.price === '50+' && variant.price < 50) return false
    if (q.stock === 'in-stock' && variant.stock < 1) return false
    if (q.stock === 'out-of-stock' && variant.stock > 0) return false
    return true
  })
}
export function filterCatalog(raw = {}) {
  const q = queryParams(raw), input = (q.q || '').toLowerCase(), words = (aliases[input] || input).split(/\s+/).filter(Boolean)
  if (/gta|grand\s*theft\s*auto/i.test(input)) return []
  let list = products.filter(product => {
    const mini = product.mini || product.variants?.some(v => v.options.Size?.startsWith('Mini'))
    const haystack = `${product.keywords} ${product.skin.join(' ')} ${product.hair.join(' ')} ${mini ? 'mini travel' : ''} ${product.gift ? 'gift' : ''}`.toLowerCase()
    if (!words.every(word => haystack.includes(word))) return false
    if (q.category && !(q.category === 'Mini Size' ? mini : product.category === q.category)) return false
    if (q.brand && ![product.brand, product.brandSlug].includes(q.brand)) return false
    for (const key of ['type', 'finish', 'coverage', 'scent', 'formulation']) if (q[key] && product[key] !== q[key]) return false
    for (const key of ['skin', 'hair']) if (q[key] && !product[key].includes(q[key])) return false
    if (q.preference && !product.preferences.includes(q.preference)) return false
    if (q.rating && product.rating < Number(q.rating)) return false
    if (q.collection === 'new' && product.badge !== 'New') return false
    if (q.collection === 'offers' && !product.offer) return false
    if (q.collection === 'gifts' && !product.gift) return false
    return matchingCandidates(product, q).length > 0
  })
  const sorts = { 'price-asc': (a, b) => Math.min(...matchingCandidates(a, q).map(v => v.price)) - Math.min(...matchingCandidates(b, q).map(v => v.price)), 'price-desc': (a, b) => Math.max(...matchingCandidates(b, q).map(v => v.price)) - Math.max(...matchingCandidates(a, q).map(v => v.price)), rating: (a, b) => b.rating - a.rating, new: (a, b) => b.newRank - a.newRank }
  return list.sort(sorts[q.sort] || ((a, b) => a.featuredRank - b.featuredRank))
}
export const categorySlug = category => category === 'Bath & Body' ? 'bath-body' : slugify(category)
export const categories = Object.fromEntries(departments.map(category => [categorySlug(category), { title: category, query: { category }, description: { Makeup: 'Find your color. Explore complexion, eye and lip essentials in finishes that feel like you.', Skincare: 'Make room for a daily ritual with cleansers, textures and layers to explore.', Hair: 'From wash day to the finishing touch, discover care and tools for your routine.', Fragrance: 'Find your next scent story in floral, woody and citrus notes.', 'Bath & Body': 'Turn everyday moments into small rituals with washes, creams and body care.', Sets: 'Discover something new with thoughtfully paired beauty minis.' }[category] }]))

// No legacy authored item has verified purchase evidence in reference mode.
applyCatalogPolicy('sephora', products, {})
