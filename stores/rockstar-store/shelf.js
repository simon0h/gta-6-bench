// Store assortment ("shelf") for the default reference catalog: the PC games, in-game currency and official merchandise
// the real store.rockstargames.com sells around Grand Theft Auto VI. Product names follow the store's own naming
// ("Black Grand Theft Auto VI Logo Tee", "Rockstar Baseball Cap: Blue and Pink", "Megalodon Shark Cash Card") as seen on
// the store and in press coverage of its catalogue (talkesport.com / beebom.com GTA VI merch lists, rockstarintel.com
// Red Dead Redemption 2 merch list, gta.wiki Rockstar Store). Prices are USD list prices; SKUs follow the store's
// numeric "NNNNNN-US" pattern.
//
// This array is deliberately separate from the evidence-backed PRODUCTS array in data.js: applyCatalogPolicy and the
// reference inventory reports keep describing only the Grand Theft Auto VI rows. Every line bought from here is
// recorded as { kind: 'other' }.

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
let serial = 360100
const sku = () => `${serial++}-US`
const slug = s => s.toLowerCase().replace(/[’'’]/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const hash = s => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7)
const COLORS = { Black: '#1d1d1f', Blue: '#4fa3d9', Pink: '#f28cb8', White: '#f4f2ec', Grey: '#8c8f93', Red: '#a92729', Navy: '#1f2f4d', Green: '#3f6b4a', Yellow: '#dcb837', Cream: '#efe6cf', Brown: '#6b4a32', Camo: '#5d6146', Teal: '#2a8c8c', Orange: '#e07a3f', Purple: '#6a4f9b' }
const colorOf = title => COLORS[Object.keys(COLORS).find(c => new RegExp(`\\b${c}\\b`).test(title))] || '#1d1d1f'

// Sizes: a deterministic stock pattern so a few sizes read as sold out, like the real size pickers.
function sizes(title, price, labels = SIZES) {
  const h = hash(title)
  return labels.map((label, i) => ({ id: slug(label), label, price, stock: (h >> i) % 7 === 0 && i > 2 ? 0 : 4 + ((h >>> (i * 2)) % 9) }))
}

const items = []
const add = p => { items.push(p); return p }

function merch(category, title, price, { col = [], shape, blurb, material, care, dims, sized = false, sizeLabels, optionLabel, variants, color, badge, isNew = false, best = false, keywords = '', note, freeShipping, inventory, included, contents } = {}) {
  const id = slug(title)
  return add({
    id, sku: sku(), title, price, kind: 'other', section: 'Gear', category, shelf: true,
    path: `/merchandise/buy-${id}`, sale: 'direct', delivery: 'physical', badge: badge || null,
    collections: [category, ...col, ...(isNew ? ['new-arrivals'] : []), ...(best ? ['best-sellers'] : [])],
    shape, color: color || colorOf(title), blurb, material, care, dimensions: dims, note, freeShipping, included, contents,
    ...(sized ? { optionLabel: 'Size', variants: sizes(title, price, sizeLabels) } : variants ? { optionLabel, variants } : {}),
    inventory: inventory ?? 30,
    keywords: `${title} ${category} merchandise ${col.join(' ')} ${keywords}`,
  })
}

// ---------------- Games (PC, Rockstar Games Launcher) ----------------
const GAME_BLURB = {
  'gta-v': 'Experience Rockstar Games’ critically acclaimed open world game, Grand Theft Auto V, plus Grand Theft Auto Online. The PC purchase includes both GTAV Enhanced and GTAV Legacy.',
}
function game(id, title, price, { slugPath = `buy-${id}`, col = [], genre = 'Action adventure', storage, blurb, editions, released, best = false, isNew = false, keywords = '', rating = 'M' } = {}) {
  return add({
    id, sku: sku(), title, price, kind: 'other', section: 'Games', category: 'full-game', shelf: true, catalogType: 'game', catalogPlatform: 'pc',
    path: `/game/${slugPath}`, titleSlug: slugPath, sale: 'direct', delivery: 'digital', chips: ['PC'], genre, storage, released, esrb: rating,
    blurb: blurb || GAME_BLURB[id], collections: ['games', ...col, ...(best ? ['best-sellers'] : []), ...(isNew ? ['new-arrivals'] : [])],
    ...(editions ? { optionLabel: 'Edition', variants: editions.map(([label, p]) => ({ id: slug(label), label, price: p, stock: 99 })) } : {}),
    inventory: 99, keywords: `${title} pc game rockstar games launcher ${col.join(' ')} ${keywords}`,
  })
}
game('gta-v', 'Grand Theft Auto V', 29.99, { col: ['gta'], storage: '105 GB', best: true, released: '2015-04-14', keywords: 'gta v gta5 gtav gta 5 five online enhanced legacy los santos' })
game('red-dead-redemption-2', 'Red Dead Redemption 2', 59.99, { col: ['rdr'], genre: 'Western action adventure', storage: '150 GB', best: true, released: '2019-11-05', editions: [['Red Dead Redemption 2', 59.99], ['Red Dead Redemption 2: Ultimate Edition', 99.99]], blurb: 'America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. Winner of over 175 Game of the Year Awards. Includes Red Dead Online.', keywords: 'rdr2 rdr arthur morgan western ultimate edition' })
game('red-dead-redemption', 'Red Dead Redemption', 49.99, { col: ['rdr'], genre: 'Western action adventure', storage: '12 GB', released: '2024-10-29', blurb: 'Experience the epic open world story of John Marston, a former outlaw forced to hunt down the members of his old gang, along with the Undead Nightmare expansion, now on PC.', keywords: 'rdr john marston undead nightmare western' })
game('red-dead-online', 'Red Dead Online', 19.99, { col: ['rdr'], genre: 'Online western', storage: '120 GB', released: '2020-12-01', blurb: 'Step into the vast, living world of Red Dead Online. Standalone purchase; existing Red Dead Redemption 2 owners already have access.', keywords: 'rdo online western frontier pursuits' })
game('gta-trilogy-de', 'Grand Theft Auto: The Trilogy – The Definitive Edition', 59.99, { slugPath: 'buy-grand-theft-auto-the-trilogy-the-definitive-edition', col: ['gta'], storage: '45 GB', released: '2021-11-11', blurb: 'Three iconic cities, three epic stories: Grand Theft Auto III, Grand Theft Auto: Vice City and Grand Theft Auto: San Andreas, updated for a new generation.', keywords: 'gta trilogy definitive edition gta iii vice city san andreas' })
game('gta-trilogy', 'Grand Theft Auto: The Trilogy', 19.99, { slugPath: 'buy-grand-theft-auto-the-trilogy', col: ['gta'], storage: '9 GB', released: '2008-01-04', blurb: 'The original versions of Grand Theft Auto III, Grand Theft Auto: Vice City and Grand Theft Auto: San Andreas.', keywords: 'gta trilogy classic gta iii vice city san andreas' })
game('gta-iv', 'Grand Theft Auto IV: Complete Edition', 19.99, { slugPath: 'buy-grand-theft-auto-iv', col: ['gta'], storage: '22 GB', released: '2020-03-24', blurb: 'Niko Bellic’s American dream in Liberty City, with both episodic expansions, The Lost and Damned and The Ballad of Gay Tony.', keywords: 'gta iv gta4 gta 4 liberty city niko bellic episodes' })
game('la-noire', 'L.A. Noire', 19.99, { col: ['rockstar'], genre: 'Detective adventure', storage: '16 GB', released: '2011-11-08', blurb: 'Amid the post-war boom of Hollywood’s Golden Age, LAPD detective Cole Phelps is thrown into a dark world of corruption, murder and conspiracy.', keywords: 'la noire l.a. noire cole phelps detective' })
game('la-noire-vr', 'L.A. Noire: The VR Case Files', 29.99, { slugPath: 'buy-la-noire-the-vr-case-files', col: ['rockstar'], genre: 'VR detective adventure', storage: '30 GB', released: '2017-12-15', blurb: 'Seven distinct cases from Rockstar Games’ acclaimed detective thriller, rebuilt for virtual reality. Requires a compatible VR headset.', keywords: 'la noire vr case files virtual reality' })
game('bully', 'Bully: Scholarship Edition', 14.99, { slugPath: 'buy-bully-scholarship-edition', col: ['rockstar'], storage: '4.7 GB', released: '2008-10-21', rating: 'T', blurb: 'As mischievous schoolboy Jimmy Hopkins, stand up to bullies, get picked on by teachers, play pranks and navigate the social hierarchy at Bullworth Academy.', keywords: 'bully scholarship edition jimmy hopkins bullworth' })
game('max-payne-3', 'Max Payne 3', 19.99, { col: ['rockstar'], genre: 'Third-person shooter', storage: '35 GB', released: '2012-05-29', blurb: 'Years after the events of the original games, Max Payne takes a job in São Paulo, Brazil, and fights to uncover the truth as everything goes wrong.', keywords: 'max payne 3 sao paulo shooter' })
game('gta-san-andreas', 'Grand Theft Auto: San Andreas', 14.99, { slugPath: 'buy-grand-theft-auto-san-andreas', col: ['gta'], storage: '4.7 GB', released: '2005-06-07', blurb: 'Five years ago Carl Johnson escaped from the pressures of life in Los Santos, San Andreas. Now it’s the early 90s and he has to go home.', keywords: 'gta sa san andreas cj grove street' })

// ---------------- Game add-ons (PC currency) ----------------
function addon(id, title, price, { col, shape = 'currency', blurb, value, keywords = '', best = false } = {}) {
  return add({
    id, sku: sku(), title, price, kind: 'other', section: 'Add-Ons', category: 'currency', shelf: true, catalogType: 'other',
    path: `/game/buy-${id}`, sale: 'direct', delivery: 'digital', chips: ['PC'], shape, value,
    collections: ['add-ons', ...col, ...(best ? ['best-sellers'] : [])], inventory: 99, blurb,
    keywords: `${title} pc add-ons currency ${keywords}`,
  })
}
const SHARK_NOTE = 'GTA$ for Grand Theft Auto Online on PC. Requires Grand Theft Auto V for PC and a Rockstar Games account. Currency is assigned to the signed-in account.'
for (const [name, value, price, best] of [['Megalodon', 'GTA$10,000,000', 99.99], ['Whale', 'GTA$4,250,000', 49.99], ['Great White', 'GTA$1,500,000', 19.99, true], ['Bull', 'GTA$600,000', 9.99, true], ['Tiger', 'GTA$250,000', 4.99]])
  addon(`${slug(name)}-shark-cash-card`, `${name} Shark Cash Card (PC)`, price, { col: ['gta', 'shark-cards'], value, best, blurb: `${value} for Grand Theft Auto Online. ${SHARK_NOTE}`, keywords: 'shark card shark cash card gta online gta$ gta v money' })
const GOLD_NOTE = 'Gold Bars for Red Dead Online on PC. Requires Red Dead Redemption 2 or Red Dead Online for PC and a Rockstar Games account.'
for (const [n, price, best] of [[350, 99.99], [245, 79.99], [150, 49.99, true], [55, 19.99], [25, 9.99]])
  addon(`${n}-gold-bars`, `${n} Gold Bars (PC)`, price, { col: ['rdr', 'gold-bars'], value: `${n} Gold Bars`, best, blurb: `${n} Gold Bars. ${GOLD_NOTE}`, keywords: 'gold bars red dead online rdo rdr2 currency' })
addon('gta-online-criminal-enterprise-starter-pack', 'Grand Theft Auto Online: Criminal Enterprise Starter Pack (PC)', 9.99, { col: ['gta'], shape: 'pack', blurb: 'Properties, vehicles, weapons and clothing worth over GTA$10,000,000 in Grand Theft Auto Online, plus a GTA$1,000,000 bonus. Requires Grand Theft Auto V for PC.', keywords: 'starter pack gta online criminal enterprise' })

// ---------------- Apparel ----------------
const TEE = { shape: 'tee', material: '100% cotton', care: 'Machine wash cold inside out with like colors. Tumble dry low. Do not iron the print.', sized: true }
const GTAVI = ['gta', 'gtavi']
const tee = (title, price, col, blurb, extra = {}) => merch('apparel', title, price, { ...TEE, col, blurb, ...extra })
for (const c of ['Black', 'Blue', 'Pink']) {
  tee(`${c} Grand Theft Auto VI Logo Tee`, 29.99, GTAVI, `${c} cotton tee with the Grand Theft Auto VI logo printed across the chest. Unisex fit.`, { isNew: true, best: c === 'Black', keywords: 'gta 6 gta vi logo' })
  tee(`${c} Grand Theft Auto VI Goodtime State Tee`, 29.99, GTAVI, `${c} cotton tee with a Leonida “Goodtime State” graphic. Unisex fit.`, { isNew: true, keywords: 'gta 6 leonida goodtime state' })
  tee(`${c} Grand Theft Auto VI Women's Cropped Baby Logo Tee`, 29.99, GTAVI, `${c} cropped baby tee with a small Grand Theft Auto VI logo. Women’s fit; size up for a looser fit.`, { isNew: true, sizeLabels: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], keywords: 'gta 6 womens crop' })
  tee(`${c} Rockstar Games Logo Tee`, 29.99, ['rockstar'], `${c} cotton tee with the Rockstar Games logo printed on the chest. Unisex fit.`, { isNew: true, best: c === 'Black' })
}
tee('White Grand Theft Auto VI Macca the Gator Tee', 29.99, GTAVI, 'White cotton tee featuring Macca the Gator, the star of Leonida’s hit TV show. Unisex fit.', { isNew: true, best: true, keywords: 'gta 6 macca gator' })
tee('Grand Theft Auto VI Vice City Long Sleeve Tee', 39.99, GTAVI, 'Black long sleeve tee with a Vice City skyline print down the sleeve and a small chest logo.', { isNew: true, keywords: 'gta 6 vice city' })
tee('Grand Theft Auto VI Leonida Keys Pocket Tee', 34.99, GTAVI, 'Cream pocket tee with a Leonida Keys sunset graphic on the back.', { isNew: true, color: COLORS.Cream, keywords: 'gta 6 leonida keys' })
tee('Grand Theft Auto VI Jason and Lucia Key Art Tee', 34.99, GTAVI, 'Black tee printed with the Jason and Lucia key art from the Grand Theft Auto VI cover.', { isNew: true, keywords: 'gta 6 jason lucia cover' })
merch('apparel', 'Black Grand Theft Auto VI Logo Hoodie', 69.99, { col: GTAVI, shape: 'hoodie', sized: true, isNew: true, material: '80% cotton, 20% polyester fleece', care: 'Machine wash cold. Tumble dry low.', blurb: 'Heavyweight black pullover hoodie with an embroidered Grand Theft Auto VI logo.', keywords: 'gta 6 hoodie sweatshirt' })
merch('apparel', 'Pink Grand Theft Auto VI Logo Hoodie', 69.99, { col: GTAVI, shape: 'hoodie', sized: true, isNew: true, material: '80% cotton, 20% polyester fleece', care: 'Machine wash cold. Tumble dry low.', blurb: 'Pink pullover hoodie with an embroidered Grand Theft Auto VI logo.', keywords: 'gta 6 hoodie sweatshirt' })
merch('apparel', 'Grand Theft Auto VI Vice City Crewneck', 64.99, { col: GTAVI, shape: 'crewneck', sized: true, isNew: true, color: COLORS.Blue, material: 'Cotton-blend fleece', care: 'Machine wash cold. Tumble dry low.', blurb: 'Sky blue crewneck sweatshirt with a pastel Vice City wordmark.', keywords: 'gta 6 sweatshirt' })
for (const combo of ['Blue and Pink', 'Pink and Blue', 'Black and Pink']) {
  merch('apparel', `Grand Theft Auto VI Baseball Cap: ${combo}`, 29.99, { col: [...GTAVI, 'headwear'], shape: 'cap', isNew: true, color: colorOf(combo), material: 'Cotton twill', dims: 'Adjustable strap; one size fits most', blurb: `${combo} six-panel baseball cap with an embroidered Grand Theft Auto VI logo.`, keywords: 'gta 6 hat cap headwear' })
  merch('apparel', `Rockstar Baseball Cap: ${combo}`, 29.99, { col: ['rockstar', 'headwear'], shape: 'cap', isNew: true, color: colorOf(combo), material: 'Cotton twill', dims: 'Adjustable strap; one size fits most', blurb: `${combo} six-panel baseball cap with an embroidered Rockstar logo.`, keywords: 'hat cap headwear' })
}
merch('apparel', 'Rockstar Baseball Cap: Navy and White', 29.99, { col: ['rockstar', 'headwear'], shape: 'cap', best: true, color: COLORS.Navy, material: 'Cotton with stretch', variants: [{ id: 's-m', label: 'S–M', price: 29.99, stock: 8 }, { id: 'l-xl', label: 'L–XL', price: 29.99, stock: 6 }], optionLabel: 'Size', blurb: 'Navy stretch-fitted cotton cap with a white Rockstar logo.', keywords: 'hat cap headwear' })
merch('apparel', 'Grand Theft Auto VI New Era Snapback', 39.99, { col: [...GTAVI, 'headwear'], shape: 'cap', isNew: true, color: COLORS.Teal, material: 'Wool blend', dims: 'Snap closure; one size', blurb: 'Teal New Era 9FIFTY snapback with a Leonida Keys side patch.', keywords: 'gta 6 hat new era' })
merch('apparel', 'Rockstar New Era Snapback', 34.99, { col: ['rockstar', 'headwear'], shape: 'cap', material: 'Cotton twill', dims: 'Snap closure; one size', blurb: 'Black New Era snapback with an embroidered Rockstar logo.', keywords: 'hat new era' })
merch('apparel', 'Rockstar Reflective 5 Panel Hat', 34.99, { col: ['rockstar', 'headwear'], shape: 'cap', color: COLORS.Grey, material: 'Synthetic woven fabric', blurb: 'A gray five-panel cap with reflective details.', keywords: 'hat' })
for (const c of ['Black', 'Yellow']) merch('apparel', `${c} Rockstar Cuffed Beanie`, 24.99, { col: ['rockstar', 'headwear'], shape: 'cap', material: 'Acrylic knit', dims: 'One size', blurb: `${c} cuffed knit beanie with a woven Rockstar label.`, keywords: 'beanie hat winter' })
merch('apparel', 'Camo Merryweather Security Hat', 29.99, { col: ['gta', 'headwear'], shape: 'cap', color: COLORS.Camo, material: 'Cotton twill', blurb: 'Camouflage cap with the Merryweather Security emblem from Grand Theft Auto V.', keywords: 'gta v merryweather hat' })

// GTA V and Online
for (const [title, blurb, color] of [
  ['Grand Theft Auto V Logo Tee', 'Black tee with the Grand Theft Auto V logo.'],
  ['Grand Theft Auto V Los Santos Customs Tee', 'Charcoal tee with the Los Santos Customs garage logo.', COLORS.Grey],
  ['Black Merryweather Tee', 'Black tee with the Merryweather Security emblem.'],
  ['Grand Theft Auto Online Diamond Casino & Resort Tee', 'Black tee with the gold Diamond Casino & Resort crest.'],
  ['Grand Theft Auto Online Cayo Perico Heist Tee', 'Navy tee with a Cayo Perico island map print.', COLORS.Navy],
  ['Grand Theft Auto Online Los Santos Tuners Tee', 'White tee with the LS Car Meet graphic.', COLORS.White],
  ['Grand Theft Auto V Vinewood Sign Tee', 'White tee with the Vinewood hills sign.', COLORS.White],
  ['Grand Theft Auto V Burger Shot Tee', 'Red tee with the Burger Shot logo from Los Santos.', COLORS.Red],
  ['Grand Theft Auto V Cluckin’ Bell Tee', 'Yellow tee with the Cluckin’ Bell logo.', COLORS.Yellow],
  ['Grand Theft Auto V Sprunk Tee', 'Green tee with the Sprunk soda logo.', COLORS.Green],
  ['Grand Theft Auto V eCola Tee', 'Red tee with the eCola logo.', COLORS.Red],
  ['Grand Theft Auto V Pißwasser Tee', 'White tee with the Pißwasser beer label.', COLORS.White],
  ['Grand Theft Auto V Up-n-Atom Tee', 'Navy tee with the Up-n-Atom Burger diner logo.', COLORS.Navy],
  ['Grand Theft Auto V Chop Tee', 'Black tee with a portrait of Franklin’s dog, Chop.'],
  ['Black Rockstar Camo Tee', 'Black tee with a camouflage-filled Rockstar logo.'],
]) tee(title, 29.99, title.includes('Rockstar') ? ['rockstar'] : ['gta'], blurb, { color: color || COLORS.Black, keywords: 'gta v gta 5 gta online' })
merch('apparel', 'Merryweather Polo', 44.99, { col: ['gta'], shape: 'tee', sized: true, color: COLORS.Black, material: 'Cotton piqué', care: 'Machine wash cold.', blurb: 'Black piqué polo with an embroidered Merryweather Security emblem.', keywords: 'gta v' })
merch('apparel', 'Grand Theft Auto V Hoodie', 74.99, { col: ['gta'], shape: 'hoodie', sized: true, best: true, material: 'Cotton-blend fleece', care: 'Machine wash cold. Tumble dry low.', blurb: 'Black hooded sweatshirt with a Grand Theft Auto V chest print.', keywords: 'gta v gta 5' })
merch('apparel', 'The Diamond Casino & Resort Hoodie', 74.99, { col: ['gta'], shape: 'hoodie', sized: true, material: 'Cotton-blend fleece', care: 'Machine wash cold. Tumble dry low.', blurb: 'Black zip hoodie with a gold Diamond Casino & Resort crest.', keywords: 'gta online casino' })
merch('apparel', 'Los Santos Customs Work Jacket', 99.99, { col: ['gta'], shape: 'hoodie', sized: true, color: COLORS.Navy, material: 'Cotton canvas', care: 'Machine wash cold. Line dry.', blurb: 'Navy canvas work jacket with a Los Santos Customs back patch.', keywords: 'gta v jacket' })

// Classic titles
for (const [title, col, blurb, color] of [
  ['Grand Theft Auto: Vice City Screenshot Tee', ['gta'], 'White heavyweight tee with a pastel Vice City screenshot print.', COLORS.White],
  ['Grand Theft Auto: San Andreas Screenshot Tee', ['gta'], 'Black tee with a San Andreas screenshot print.'],
  ['Grand Theft Auto III Screenshot Tee', ['gta'], 'Black tee with a Liberty City screenshot print.'],
  ['Grand Theft Auto: San Andreas Grove Street Tee', ['gta'], 'Green tee with a Grove Street Families graphic.', COLORS.Green],
  ['Grand Theft Auto: Vice City Malibu Club Tee', ['gta'], 'Pink tee with the Malibu Club neon sign.', COLORS.Pink],
  ['Grand Theft Auto: Vice City Kaufman Cabs Tee', ['gta'], 'Yellow tee with the Kaufman Cabs logo.', COLORS.Yellow],
  ['Grand Theft Auto IV Liberty City Tee', ['gta'], 'Grey tee with the Liberty City skyline.', COLORS.Grey],
  ['Max Payne 3 Screenshot Tee', ['rockstar', 'max-payne'], 'Black tee with a Max Payne 3 screenshot print.'],
  ['Max Payne Logo Tee', ['rockstar', 'max-payne'], 'Black tee with the Max Payne logo.'],
  ['L.A. Noire LAPD Badge Tee', ['rockstar'], 'Navy tee with a 1947 LAPD badge graphic.', COLORS.Navy],
  ['Bully Bullworth Academy Tee', ['rockstar'], 'Navy tee with the Bullworth Academy crest.', COLORS.Navy],
  ['Midnight Club Los Angeles Screenshot Tee', ['rockstar'], 'Black tee with a Los Angeles racing print.'],
  ['Manhunt Screenshot Tee', ['rockstar'], 'Black tee with a Manhunt screen print.'],
  ['The Warriors Coney Island Tee', ['rockstar'], 'Brown tee with The Warriors vest graphic.', COLORS.Brown],
]) tee(title, 39.99, col, blurb, { color: color || COLORS.Black })
merch('apparel', 'Bully Bullworth Academy Varsity Jacket', 129.99, { col: ['rockstar'], shape: 'hoodie', sized: true, color: COLORS.Navy, material: 'Wool body, faux-leather sleeves', care: 'Spot clean only.', blurb: 'Navy and white varsity jacket with chenille Bullworth Academy patches.', keywords: 'bully jacket' })

// Red Dead
for (const [title, blurb, color] of [
  ['Red Dead Redemption 2 Arthur Morgan Tee', 'Black tee with a portrait of Arthur Morgan.'],
  ['Black Red Dead Redemption 2 Logo Tee', 'Black tee with the Red Dead Redemption 2 logo.'],
  ['Red Red Dead Redemption 2 Logo Tee', 'Red tee with the Red Dead Redemption 2 logo.', COLORS.Red],
  ['Red Dead Redemption 2 Wanted Poster Tee', 'Cream tee with an Arthur Morgan wanted poster.', COLORS.Cream],
  ['Red Dead Redemption 2 Van der Linde Gang Tee', 'Black tee with the Van der Linde gang portrait.'],
  ['Red Dead Redemption 2 Saint Denis Tee', 'Grey tee with a Saint Denis street scene engraving.', COLORS.Grey],
  ['Red Dead Redemption 2 Wildlife Tee', 'Brown tee with a legendary animal engraving.', COLORS.Brown],
  ['Red Dead Online Frontier Pursuits Tee', 'Black tee with the Frontier Pursuits role emblems.'],
  ['Red Dead Redemption John Marston Tee', 'Black tee with a John Marston portrait.'],
  ['Red Dead Redemption Undead Nightmare Tee', 'Green tee with Undead Nightmare artwork.', COLORS.Green],
]) tee(title, 29.99, ['rdr'], blurb, { color: color || COLORS.Black, keywords: 'red dead rdr2 rdr' })
merch('apparel', 'Red Dead Redemption 2 Logo Hoodie', 69.99, { col: ['rdr'], shape: 'hoodie', sized: true, best: true, color: COLORS.Black, material: 'Cotton-blend fleece', care: 'Machine wash cold. Tumble dry low.', blurb: 'Black pullover hoodie with the Red Dead Redemption 2 logo.', keywords: 'rdr2' })
merch('apparel', 'Red Dead Redemption 2 Flannel Shirt', 64.99, { col: ['rdr'], shape: 'tee', sized: true, color: COLORS.Red, material: 'Brushed cotton flannel', care: 'Machine wash cold.', blurb: 'Red and black plaid flannel shirt with an embroidered RDR2 cuff detail.', keywords: 'rdr2 shirt' })
merch('apparel', 'Red Dead Redemption 2 Bandana', 14.99, { col: ['rdr'], shape: 'textile', color: COLORS.Red, material: 'Cotton', dims: '22 × 22 inches', blurb: 'Red paisley bandana with a hidden RDR2 logo in the print.', keywords: 'rdr2 bandana' })
merch('apparel', 'Red Dead Redemption 2 Wool Cap', 34.99, { col: ['rdr', 'headwear'], shape: 'cap', color: COLORS.Brown, material: 'Wool blend', blurb: 'Brown wool cap with a leather RDR2 patch.', keywords: 'rdr2 hat' })

// Rockstar Games
merch('apparel', 'Rockstar Varsity Crewneck', 69.99, { col: ['rockstar'], shape: 'crewneck', sized: true, best: true, material: 'Cotton-blend fleece', care: 'Machine wash cold. Tumble dry low.', blurb: 'Black crewneck with a collegiate Rockstar chest design.' })
for (const c of ['Black', 'Grey']) merch('apparel', `${c} Rockstar Games Logo Hoodie`, 64.99, { col: ['rockstar'], shape: 'hoodie', sized: true, material: 'Cotton-blend fleece', care: 'Machine wash cold. Tumble dry low.', blurb: `${c} pullover hoodie with the Rockstar Games logo.` })
merch('apparel', 'Rockstar Games Linocut Tee', 29.99, { col: ['rockstar'], ...TEE, blurb: 'Black tee with a hand-cut linocut Rockstar logo print.' })
merch('apparel', 'Rockstar Games Long Sleeve Tee', 34.99, { col: ['rockstar'], ...TEE, color: COLORS.White, blurb: 'White long sleeve tee with sleeve-print Rockstar wordmarks.' })
merch('apparel', 'Rockstar Games Coach Jacket', 89.99, { col: ['rockstar'], shape: 'hoodie', sized: true, material: 'Nylon shell, mesh lining', care: 'Machine wash cold. Line dry.', blurb: 'Black snap-front coach jacket with a large Rockstar logo on the back.' })
merch('apparel', 'Rockstar Games Track Jacket', 84.99, { col: ['rockstar'], shape: 'hoodie', sized: true, color: COLORS.Navy, material: 'Polyester tricot', care: 'Machine wash cold.', blurb: 'Navy zip track jacket with yellow side stripes.' })
merch('apparel', 'Rockstar Games Crew Socks (2-Pack)', 19.99, { col: ['rockstar'], shape: 'textile', material: 'Cotton blend', variants: [{ id: 's-m', label: 'S–M', price: 19.99, stock: 12 }, { id: 'l-xl', label: 'L–XL', price: 19.99, stock: 9 }], optionLabel: 'Size', blurb: 'Two pairs of black and yellow crew socks with a knitted Rockstar logo.', keywords: 'socks' })

// ---------------- Accessories ----------------
const ACC = (title, price, col, shape, blurb, extra = {}) => merch('accessories', title, price, { col, shape, blurb, ...extra })
ACC('Blue and Pink Grand Theft Auto VI Canvas Tote', 39.99, GTAVI, 'bag', 'Heavyweight canvas tote with a two-tone Grand Theft Auto VI print.', { isNew: true, material: 'Cotton canvas', dims: '16 × 15 × 4 inches', keywords: 'gta 6 bag' })
ACC('Pink and Blue Grand Theft Auto VI Canvas Tote', 39.99, GTAVI, 'bag', 'Heavyweight canvas tote with a two-tone Grand Theft Auto VI print.', { isNew: true, material: 'Cotton canvas', dims: '16 × 15 × 4 inches', keywords: 'gta 6 bag' })
ACC('Grand Theft Auto VI Keychain', 14.99, GTAVI, 'keychain', 'Enamel Grand Theft Auto VI logo keychain on a metal split ring.', { isNew: true, best: true, material: 'Zinc alloy and enamel', keywords: 'gta 6' })
ACC('Grand Theft Auto VI – Vice City Money Clip', 24.99, GTAVI, 'keychain', 'Brushed steel money clip engraved with the Vice City wordmark.', { isNew: true, material: 'Stainless steel', keywords: 'gta 6' })
ACC('Grand Theft Auto VI – Vice City Zippo Lighter', 39.99, GTAVI, 'lighter', 'Genuine Zippo windproof lighter with a Vice City color print. Ships unfilled.', { isNew: true, material: 'Brass with chrome finish', note: 'Adults 21+. Ships without fuel.', keywords: 'gta 6 zippo' })
ACC('Grand Theft Auto VI Leonida Keys Crossbody Bag', 44.99, GTAVI, 'bag', 'Compact nylon crossbody bag with a Leonida Keys woven label.', { isNew: true, color: COLORS.Teal, material: 'Nylon', dims: '9 × 6 × 2 inches', keywords: 'gta 6 bag' })
ACC('Grand Theft Auto VI Beach Towel', 39.99, GTAVI, 'textile', 'Oversized cotton beach towel with a Vice City sunset print.', { isNew: true, color: COLORS.Pink, material: 'Cotton velour', dims: '35 × 70 inches', keywords: 'gta 6 towel' })
ACC('Grand Theft Auto VI Chunkee Shot Glass', 12.99, GTAVI, 'cup', 'Heavy-base shot glass with the Chunkee logo from Leonida.', { isNew: true, material: 'Glass', keywords: 'gta 6' })
ACC('Grand Theft Auto VI Vice City Swizzle Spoon Set', 14.99, GTAVI, 'utensil', 'Set of four cocktail swizzle spoons with Vice City charms.', { isNew: true, material: 'Stainless steel', keywords: 'gta 6' })
ACC('Grand Theft Auto VI Macca Magnetic Mirror', 14.99, GTAVI, 'mirror', 'Round magnetic mirror featuring Macca the Gator.', { isNew: true, material: 'Glass and steel', keywords: 'gta 6 macca' })
ACC('Grand Theft Auto VI Can Cooler', 9.99, GTAVI, 'cup', 'Neoprene can cooler with a Leonida “Goodtime State” print.', { isNew: true, material: 'Neoprene', keywords: 'gta 6 koozie' })
ACC('Rockstar Logo Baggu', 24.99, ['rockstar'], 'bag', 'A reusable black shopping bag with logo print.', { material: 'Nylon', care: 'Machine wash cold; line dry.' })
ACC('Rockstar Logo Water Bottle', 29.99, ['rockstar'], 'bottle', 'Black reusable bottle with white logo.', { best: true, material: 'Stainless steel', dims: '20 fl oz' })
ACC('Rockstar Varsity Water Bottle', 29.99, ['rockstar'], 'bottle', 'A yellow reusable bottle with collegiate lettering.', { color: COLORS.Yellow, material: 'Stainless steel', dims: '20 fl oz' })
ACC('Rockstar Games Backpack', 59.99, ['rockstar'], 'bag', 'Black roll-top backpack with a padded 15-inch laptop sleeve.', { material: 'Recycled polyester', dims: '18 × 12 × 6 inches' })
ACC('Rockstar Games Duffel Bag', 69.99, ['rockstar'], 'bag', 'Black weekender duffel with a yellow Rockstar logo.', { material: 'Polyester', dims: '22 × 11 × 11 inches' })
ACC('Rockstar Games Lanyard', 9.99, ['rockstar'], 'leash', 'Black and yellow woven lanyard with a metal clip.', { material: 'Polyester' })
ACC('Rockstar Games Phone Grip', 12.99, ['rockstar'], 'keychain', 'Collapsible phone grip and stand with a Rockstar logo.', { material: 'Plastic' })
ACC('Rockstar Games Bifold Wallet', 34.99, ['rockstar'], 'bag', 'Black leather bifold wallet with a debossed Rockstar logo.', { material: 'Leather', dims: '4.5 × 3.5 inches' })
ACC('Rockstar Games Umbrella', 29.99, ['rockstar'], 'object', 'Black compact umbrella with an all-over Rockstar logo pattern.', { material: 'Polyester canopy' })
ACC('Rockstar Red and Black Logo Keychain', 9.99, ['rockstar'], 'keychain', 'Red and black logo keychain with a metal split ring.', { best: true, material: 'Rubber and metal' })
ACC('Linocut Rockstar Games Logo Keychain', 7.99, ['rockstar'], 'keychain', 'Wooden keychain with a linocut-style Rockstar logo.', { material: 'Wood and metal' })
ACC('Vintage Rockstar Games Mousepad', 12.99, ['rockstar'], 'mat', 'Mousepad with a vintage Rockstar Games logo.', { material: 'Rubber base, cloth top', dims: '9 × 7.5 inches' })
ACC('Rockstar Games Ceramic Mug', 19.99, ['rockstar'], 'cup', 'Black ceramic mug with a yellow Rockstar logo.', { material: 'Ceramic', dims: '12 fl oz' })
ACC('Merryweather Heat Changing Mug', 19.99, ['gta'], 'cup', 'Heat-changing mug that reveals the Merryweather Security emblem.', { material: 'Ceramic', dims: '11 fl oz', keywords: 'gta v' })
ACC('Grand Theft Auto V Chrome Zippo', 39.99, ['gta'], 'lighter', 'Chrome Zippo lighter engraved with the Grand Theft Auto V logo. Ships unfilled.', { material: 'Brass with chrome finish', note: 'Adults 21+. Ships without fuel.', keywords: 'gta v zippo' })
ACC('Grand Theft Auto V Gold Bar USB Drive', 29.99, ['gta'], 'object', '32 GB USB flash drive shaped like a gold bar.', { material: 'Zinc alloy', color: COLORS.Yellow, keywords: 'gta v usb' })
ACC('Grand Theft Auto Online Diamond Casino Playing Cards', 12.99, ['gta'], 'object', 'Deck of 54 playing cards with Diamond Casino & Resort backs.', { material: 'Linen-finish card stock', keywords: 'gta online casino cards' })
ACC('Grand Theft Auto Online Diamond Casino Poker Chip Set', 49.99, ['gta'], 'object', '300 clay-composite poker chips with Diamond Casino branding in an aluminum case.', { material: 'Clay composite, aluminum case', keywords: 'gta online casino' })
ACC('Chop Leash and Collar', 39.99, ['gta'], 'leash', 'Matching green collar and leash inspired by Chop.', { color: COLORS.Green, material: 'Nylon webbing', optionLabel: 'Fit', variants: [{ id: 'medium', label: 'Medium', price: 39.99, stock: 6 }, { id: 'large', label: 'Large', price: 39.99, stock: 4 }], keywords: 'gta v dog pet' })
ACC('Red Dead Redemption 2 Black Ceramic Mug', 24.99, ['rdr'], 'cup', 'Black enamel-look ceramic mug with the RDR2 logo.', { material: 'Ceramic', dims: '12 fl oz', keywords: 'rdr2' })
ACC('Red Dead Redemption 2 Red Ceramic Mug', 24.99, ['rdr'], 'cup', 'Red enamel-look ceramic mug with the RDR2 logo.', { color: COLORS.Red, material: 'Ceramic', dims: '12 fl oz', keywords: 'rdr2' })
ACC('Red Dead Redemption 2 Outlaws Deskpad', 29.99, ['rdr'], 'mat', 'Large desk pad with an outlaws engraving.', { material: 'Rubber base, cloth top', dims: '31 × 12 inches', keywords: 'rdr2 desk mat' })
ACC('Red Dead Redemption 2 Wildlife Deskpad', 29.99, ['rdr'], 'mat', 'Large desk pad with a wildlife engraving.', { material: 'Rubber base, cloth top', dims: '31 × 12 inches', keywords: 'rdr2 desk mat' })
ACC('Red Dead Redemption 2 Tote', 17.99, ['rdr'], 'bag', 'Natural canvas tote with the RDR2 logo.', { color: COLORS.Cream, material: 'Cotton canvas', keywords: 'rdr2 bag' })
ACC('Red Dead Redemption 2 Logo Keychain', 7.99, ['rdr'], 'keychain', 'Red Dead Redemption 2 logo keychain.', { color: COLORS.Red, material: 'Metal', keywords: 'rdr2' })
ACC('Red Dead Redemption 2 Brass Zippo Lighter', 44.99, ['rdr'], 'lighter', 'Solid brass Zippo engraved with a Red Dead Redemption 2 design. Ships unfilled.', { color: COLORS.Yellow, material: 'Solid brass', note: 'Adults 21+. Ships without fuel.', keywords: 'rdr2 zippo' })
ACC('Red Dead Redemption 2 Leather iPhone Case', 49.99, ['rdr'], 'bag', 'Tooled leather folio case for iPhone with an RDR2 emblem.', { color: COLORS.Brown, material: 'Leather', keywords: 'rdr2 phone case' })
ACC('Red Dead Redemption 2 Leather iPad Case', 79.99, ['rdr'], 'bag', 'Tooled leather folio for 11-inch iPad with an RDR2 emblem.', { color: COLORS.Brown, material: 'Leather', keywords: 'rdr2 tablet case' })
ACC('Red Dead Redemption 2 Leather Valet Tray', 59.99, ['rdr'], 'tray', 'Snap-corner leather valet tray debossed with the RDR2 logo.', { color: COLORS.Brown, material: 'Leather', dims: '8 × 8 inches', keywords: 'rdr2' })
ACC('Red Dead Redemption 2 Ornate Bottle Opener', 19.99, ['rdr'], 'utensil', 'Ornate cast-metal bottle opener with an RDR2 crest.', { material: 'Cast zinc', keywords: 'rdr2' })
ACC('Red Dead Redemption 2 Collapsible Shot Glass', 14.99, ['rdr'], 'cup', 'Collapsible stainless shot glass with a Rockstar logo lid.', { material: 'Stainless steel', keywords: 'rdr2' })
ACC('Red Dead Redemption 2 Engraved Matchbox Slipcase', 19.99, ['rdr'], 'object', 'Engraved brass slipcase for a standard matchbox.', { color: COLORS.Yellow, material: 'Brass', keywords: 'rdr2' })
ACC('Red Dead Redemption 2 Dynamite USB Charger', 34.99, ['rdr'], 'object', '5,000 mAh portable USB charger shaped like a bundle of dynamite.', { color: COLORS.Red, material: 'Plastic', keywords: 'rdr2 power bank' })
ACC('Red Dead Redemption 2 Pendleton Wool Blanket', 199.99, ['rdr'], 'textile', 'Premium Pendleton jacquard wool blanket with a frontier pattern.', { color: COLORS.Red, material: 'Pure virgin wool', dims: '64 × 80 inches', care: 'Dry clean only.', keywords: 'rdr2 pendleton' })

// ---------------- Collectibles ----------------
const COL = (title, price, col, shape, blurb, extra = {}) => merch('collectibles', title, price, { col, shape, blurb, ...extra })
COL('Grand Theft Auto VI: The Goodtime State – Vice City Collection', 399.99, GTAVI, 'box', 'A premium Collector’s Box featuring all the essentials for a good time, inspired by Leonida’s hit TV show, Macca the Gator.', {
  badge: 'COMING SOON', isNew: true, freeShipping: false, inventory: 3, dims: '19 × 13.5 × 12.5 inches', material: 'Mixed collectible materials',
  note: 'Grand Theft Auto VI game sold separately. Ages 18+. Excluded from free shipping.', care: 'Adult collectible, ages 18+. Contains small parts. Fragile; handle with care.',
  contents: 'A collector box inspired by Vice City and Macca the Gator, with eleven included pieces.',
  included: ['Macca the Gator figurine', 'Oakley Frogskins sunglasses', 'Leonida Keys crossbody bag', 'New Era snapback hat', 'Macca magnetic mirror', 'Chunkee shot glass', 'Vice City swizzle spoon', 'Vice City keychain', 'Leonida Keys enamel pins in a tin', 'Leonida Keys stickers in a stash bag', 'Two-sided souvenir poster and Leonida map'],
  keywords: 'gta 6 collector box collectors edition',
})
COL('Grand Theft Auto VI: The Album (CD)', 14.99, GTAVI, 'media', 'Music from the world of Grand Theft Auto VI on compact disc.', { badge: 'COMING SOON', isNew: true, material: 'Audio CD', keywords: 'gta 6 soundtrack album music cd' })
COL('Grand Theft Auto VI: The Album (2LP Vinyl)', 39.99, GTAVI, 'media', 'Music from the world of Grand Theft Auto VI on two 12-inch vinyl records.', { badge: 'COMING SOON', isNew: true, material: '180g vinyl', keywords: 'gta 6 soundtrack album music vinyl lp' })
COL('Grand Theft Auto VI and Rockstar Games Sticker Collection', 9.99, [...GTAVI, 'rockstar'], 'stickers', 'Sheet of die-cut vinyl stickers with Grand Theft Auto VI and Rockstar Games logos.', { isNew: true, best: true, material: 'Vinyl', keywords: 'gta 6 stickers' })
COL('Grand Theft Auto VI and Rockstar Games Holographic Sticker Collection', 4.99, [...GTAVI, 'rockstar'], 'stickers', 'Holographic die-cut sticker set.', { isNew: true, material: 'Holographic vinyl', keywords: 'gta 6 stickers' })
COL('Grand Theft Auto VI Leonida Keys Enamel Pins', 24.99, GTAVI, 'pins', 'Four Leonida Keys enamel pins in a collectible tin.', { isNew: true, color: COLORS.Teal, material: 'Enamel and metal', keywords: 'gta 6 pins' })
COL('Grand Theft Auto VI Macca the Gator Figurine', 39.99, GTAVI, 'figure', 'Hand-painted resin figurine of Macca the Gator.', { isNew: true, color: COLORS.Green, material: 'Polyresin', dims: '6 inches tall', keywords: 'gta 6 macca figure' })
COL('Grand Theft Auto VI Macca the Gator Plush', 29.99, GTAVI, 'figure', 'Soft plush Macca the Gator.', { isNew: true, color: COLORS.Green, material: 'Polyester plush', dims: '12 inches', keywords: 'gta 6 macca plush toy' })
COL('Grand Theft Auto VI Leonida Map Poster', 24.99, GTAVI, 'print', 'Two-sided souvenir poster with a map of Leonida.', { isNew: true, material: 'Paper', dims: '24 × 36 inches', keywords: 'gta 6 map poster' })
COL('Grand Theft Auto VI Jason and Lucia Key Art Poster', 24.99, GTAVI, 'print', 'Key art poster of Jason and Lucia.', { isNew: true, material: 'Paper', dims: '24 × 36 inches', keywords: 'gta 6 poster' })
COL('The Loneliest Robot Greeting Card', 3.99, [...GTAVI, 'rockstar'], 'cards', 'A folded greeting card featuring The Loneliest Robot from Vice City’s favorite TV show. Blank inside.', { isNew: true, material: 'Printed paper', dims: 'Folded greeting card with envelope' })
COL('Grand Theft Auto Trilogy Enamel Pins Set 1', 19.99, ['gta'], 'pins', 'Enamel pins inspired by Grand Theft Auto III, Vice City and San Andreas.', { color: COLORS.Yellow, material: 'Enamel and metal' })
COL('Grand Theft Auto Trilogy Enamel Pins Set 2', 19.99, ['gta'], 'pins', 'A second set of trilogy enamel pins.', { color: COLORS.Pink, material: 'Enamel and metal' })
COL('GTAIII Anniversary Limited-Edition 8-Ball Lithograph', 59.99, ['gta'], 'print', 'Numbered limited-edition lithograph celebrating Grand Theft Auto III.', { material: 'Archival paper', dims: '18 × 24 inches', keywords: 'gta 3 iii' })
COL('Grand Theft Auto V Los Santos Map Poster', 19.99, ['gta'], 'print', 'Poster of the Los Santos and Blaine County map.', { material: 'Paper', dims: '24 × 36 inches', keywords: 'gta v map' })
COL('The Art of Grand Theft Auto V', 39.99, ['gta'], 'book', 'Hardcover art book with concept art and illustrations from Grand Theft Auto V.', { material: 'Hardcover book', keywords: 'gta v book' })
COL('The Music of Grand Theft Auto V Vinyl Box Set', 79.99, ['gta'], 'media', 'Vinyl box set of the score and original music from Grand Theft Auto V.', { material: 'Vinyl', keywords: 'gta v soundtrack lp' })
COL('Grand Theft Auto V Chop Plush', 24.99, ['gta'], 'figure', 'Plush of Franklin’s dog, Chop.', { color: COLORS.Brown, material: 'Polyester plush', keywords: 'gta v chop plush toy' })
COL('Grand Theft Auto Online Diamond Casino Lucky Wheel Magnet', 7.99, ['gta'], 'object', 'Die-cut magnet of the Lucky Wheel.', { material: 'Printed magnet', keywords: 'gta online casino' })
COL('Red Dead Redemption Enamel Pins', 19.99, ['rdr'], 'pins', 'Red Dead inspired enamel pin set.', { color: COLORS.Red, material: 'Enamel and metal' })
COL('Red Dead Redemption 2 Glass Candle by Joya', 59.99, ['rdr'], 'candle', 'Black wax candle in a tall patterned black glass.', { best: true, material: 'Wax and glass', care: 'Never leave a burning candle unattended.' })
COL('Red Dead Redemption 2 Barrel Candle', 39.99, ['rdr'], 'candle', 'Scented candle in a miniature wooden barrel.', { color: COLORS.Brown, material: 'Wax and wood', care: 'Never leave a burning candle unattended.' })
COL('Red Dead Redemption 2 Dynamite Stick Candle', 29.99, ['rdr'], 'candle', 'Set of three dynamite-stick candles.', { color: COLORS.Red, material: 'Wax', care: 'Never leave a burning candle unattended.' })
COL('Red Dead Redemption 2 Vintage Glass Decoupage Tray', 49.99, ['rdr'], 'tray', 'Vintage gun-store catalog artwork under handblown glass.', { material: 'Handblown glass', dims: '4 × 6 inches' })
COL('Rockstar Logo Glass Decoupage Tray', 49.99, ['rockstar', 'rdr'], 'tray', 'Rockstar logo under handblown glass.', { material: 'Handblown glass', dims: '4 × 6 inches' })
COL('Red Dead Redemption 2 Fire-Branded Domino Set', 49.99, ['rdr'], 'object', 'Fire-branded wooden domino set in a sliding box.', { color: COLORS.Brown, material: 'Wood', keywords: 'rdr2 game' })
COL('Metal Earth Red Dead Redemption 2 Sawed-Off Shotgun', 24.99, ['rdr'], 'object', 'Metal Earth 3D metal model kit.', { material: 'Laser-cut steel', keywords: 'rdr2 model kit' })
COL('Metal Earth Red Dead Redemption 2 Maxim Gun', 24.99, ['rdr'], 'object', 'Metal Earth 3D metal model kit.', { material: 'Laser-cut steel', keywords: 'rdr2 model kit' })
COL('Metal Earth Red Dead Redemption 2 Locomotive', 29.99, ['rdr'], 'object', 'Metal Earth 3D metal model kit.', { material: 'Laser-cut steel', keywords: 'rdr2 model kit train' })
COL('Red Dead Redemption 2 Magnet Set', 12.99, ['rdr'], 'object', 'Set of four Red Dead Redemption 2 magnets.', { material: 'Printed magnet' })
COL('Red Dead Redemption 2 Map Poster', 19.99, ['rdr'], 'print', 'Poster of the Red Dead Redemption 2 world map.', { material: 'Paper', dims: '24 × 36 inches', keywords: 'rdr2 map' })
COL('Red Dead Redemption 2 Arthur Morgan Wanted Poster Print', 24.99, ['rdr'], 'print', 'Aged-paper print of an Arthur Morgan wanted poster.', { material: 'Archival paper', dims: '12 × 18 inches', keywords: 'rdr2 wanted' })
COL('The Music of Red Dead Redemption 2: Original Score (Vinyl)', 49.99, ['rdr'], 'media', 'The original score of Red Dead Redemption 2 on vinyl.', { material: 'Vinyl', keywords: 'rdr2 soundtrack lp' })
COL('Red Dead Redemption 2 Collector’s Box', 99.99, ['rdr'], 'box', 'Collector’s box with a map, bandana, coin, pins and more. Game not included.', { color: COLORS.Brown, material: 'Mixed collectible materials', keywords: 'rdr2 collector box' })
COL('Red Dead Redemption 2 Pocket Watch', 39.99, ['rdr'], 'object', 'Engraved brass pocket watch with chain.', { color: COLORS.Yellow, material: 'Brass', keywords: 'rdr2' })
COL('Max Payne 3 Poster', 19.99, ['rockstar', 'max-payne'], 'print', 'Max Payne 3 key art poster.', { material: 'Paper', dims: '24 × 36 inches' })
COL('L.A. Noire Detective Badge Replica', 34.99, ['rockstar'], 'object', 'Die-cast replica of Cole Phelps’ LAPD detective badge in a display case.', { color: COLORS.Yellow, material: 'Die-cast metal', keywords: 'la noire' })
COL('Bully Bullworth Academy Patch Set', 12.99, ['rockstar'], 'pins', 'Set of three embroidered Bullworth Academy patches.', { color: COLORS.Navy, material: 'Embroidered twill', keywords: 'bully' })
COL('Rockstar Games Holiday Ornament', 14.99, ['rockstar'], 'object', 'Glass ornament with a gold Rockstar logo.', { color: COLORS.Red, material: 'Glass' })
COL('Rockstar Games Enamel Pin', 9.99, ['rockstar'], 'pins', 'Yellow Rockstar logo enamel pin.', { color: COLORS.Yellow, material: 'Enamel and metal' })
COL('Rockstar Games Sticker Sheet', 6.99, ['rockstar'], 'stickers', 'Classic Rockstar Games logo sticker sheet.', { material: 'Vinyl' })

// "New Arrivals" order on the real store is newest first; keep authoring order as arrival order for GTA VI items.
items.forEach((p, i) => { p.arrival = i })
export const SHELF = items
export const SHELF_DEPARTMENTS = [['full-game', 'Games'], ['currency', 'Game Add-Ons'], ['apparel', 'Apparel'], ['accessories', 'Accessories'], ['collectibles', 'Collectibles']]

// Real store URLs for the two items whose live paths were captured in the research.
for (const [title, id, path] of [['The Loneliest Robot Greeting Card', 'buy-loneliest-robot-greeting-card', '/merchandise/buy-loneliest-robot-greeting-card'], ['Grand Theft Auto VI: The Goodtime State – Vice City Collection', 'gtavi-goodtime-state-vice-city-collection', '/merchandise/gtavi-goodtime-state-vice-city-collection']]) Object.assign(items.find(p => p.title === title), { id, path })
