// GameStop store shelf: the everyday assortment shown around the evidence-backed
// GTA VI listings in reference mode. Titles, brands, item-number format and URL
// shape follow gamestop.com (homepage and department captures, 2026-10-13).
// These rows are never added to the evidenced PRODUCTS array: they are ordinary
// merchandise, ordered as `kind: 'other'` lines, and are not part of the
// reference inventory reports.

const PLATFORMS = {
  ps5: ['PlayStation 5', 'playstation-5', 'PS5'],
  ps4: ['PlayStation 4', 'playstation-4', 'PS4'],
  xbox: ['Xbox Series X', 'xbox-series-x-s', 'Xbox Series X|S'],
  xboxone: ['Xbox One', 'xbox-one', 'Xbox One'],
  switch2: ['Nintendo Switch 2', 'nintendo-switch-2', 'Nintendo Switch 2'],
  switch: ['Nintendo Switch', 'nintendo-switch', 'Nintendo Switch'],
  retro: ['Retro', 'retro', 'Retro'],
}
const PLATFORM_WORDS = { ps5: 'ps5 playstation 5 sony', ps4: 'ps4 playstation 4 sony', xbox: 'xbox series x s xsx', xboxone: 'xbox one', switch2: 'nintendo switch 2 switch2', switch: 'nintendo switch', retro: 'retro classic', pc: 'pc computer windows' }

const hash = s => { let n = 2166136261; for (const c of String(s)) n = Math.imul(n ^ c.codePointAt(0), 16777619); return n >>> 0 }
const slugify = s => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/'/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Ratings scale with popularity (1 to 5); pre-orders are not yet rated.
function ratingFor(id, pop, preorder) {
  if (preorder) return { rating: 0, reviews: 0 }
  const h = hash(id)
  return { rating: Math.round((3.9 + (h % 100) / 100 * 1.0) * 10) / 10, reviews: Math.round([8, 40, 160, 640, 2400][Math.max(0, Math.min(4, pop - 1))] * (0.6 + (h >>> 8) % 100 / 100)) }
}

const PRICE_POINTS = [4.99, 7.99, 9.99, 12.99, 14.99, 19.99, 24.99, 29.99, 34.99, 39.99, 44.99, 49.99, 54.99, 59.99, 69.99, 79.99, 89.99, 99.99, 119.99, 129.99, 149.99, 169.99, 179.99, 199.99, 249.99, 299.99, 349.99]
const salePrice = was => [...PRICE_POINTS].reverse().find(x => x <= was * 0.8) ?? Math.round(was * 0.8) - 0.01
function finish(p) {
  // A "was" price equal to the list price marks a markdown: sell at a sale point.
  if (p.wasPrice && p.wasPrice <= p.price) {
    const sale = salePrice(p.wasPrice)
    for (const v of p.variants || []) if (v.price === p.price) v.price = sale
    p.price = sale
  }
  const { rating, reviews } = ratingFor(p.id, p.pop ?? 3, p.preorder)
  p.rating ??= rating
  p.reviews ??= reviews
  p.slug = p.title.split(' - ').map(slugify).join('---')
  p.kind = 'other'
  p.shelf = true
  p.condition ??= 'New'
  p.stock ??= 12
  p.fulfillment = ['shipping']
  p.offers ??= []
  p.platforms ??= []
  p.categoryName ??= p.category
  p.features ??= []
  p.keywords = [p.title, p.brand, p.family.replaceAll('-', ' '), p.department.replaceAll('-', ' ').replace('/', ' '), p.franchise || '', ...p.platforms.map(x => PLATFORM_WORDS[x] || x), p.kw || '', p.preorder ? 'pre-order preorder' : '', p.offers.includes('deals') ? 'deal sale' : '', p.condition === 'Pre-Owned' || p.variants?.some(v => v.options.Condition !== 'New') ? 'pre-owned used refurbished' : ''].join(' ').toLowerCase()
  delete p.kw
  return p
}

// ---------- video games ----------
const GENRE_WORDS = { RPG: 'role-playing', Platformer: 'platforming', Party: 'party', 'Action Adventure': 'action-adventure' }
const genreLine = (genre, publisher) => { const g = GENRE_WORDS[genre] || genre.toLowerCase(); return `${/^[aeiou]/i.test(g) ? 'An' : 'A'} ${g} game from ${publisher}.` }
function game(id, name, plat, price, publisher, esrb, genre, release, o = {}) {
  const [label, path, compat] = PLATFORMS[plat]
  const title = plat === 'retro' ? `${name} - ${o.system}` : `${name} - ${label}`
  const preorder = !!o.preorder
  const used = o.used
  const format = o.format || (['switch', 'switch2'].includes(plat) ? (o.keyCard ? 'Game-Key Card' : 'Game Card') : plat === 'retro' ? 'Cartridge' : 'Disc')
  const p = {
    id: String(id), title, brand: publisher, price, wasPrice: o.was || null, department: 'video-games', family: 'physical-game',
    category: path, categoryName: plat === 'retro' ? 'Retro Games' : label, urlPath: `video-games/${path}`,
    platforms: [plat], format: format === 'Disc' ? 'disc' : 'cartridge', esrb, genre, release: release || 'TBA', preorder, pop: o.pop ?? 3,
    offers: [...(o.offers || []), ...(o.was ? ['deals'] : []), ...(plat === 'retro' ? ['retro'] : [])], franchise: o.franchise,
    catalogType: 'game', catalogPlatform: plat, artType: 'game', badge: o.badge || null,
    condition: plat === 'retro' ? 'Pre-Owned' : 'New', stock: o.stock ?? (plat === 'retro' ? 3 : 12),
    specs: { 'Compatible Platforms': plat === 'retro' ? o.system : compat, Format: format, Genre: genre, Publisher: publisher, ...(o.players ? { 'Number of Players': o.players } : {}), ESRB: esrb },
    features: o.features || [`${name} for ${plat === 'retro' ? o.system : compat}.`, ...(genre ? [genreLine(genre, publisher)] : []), ...(format === 'Disc' ? ['Physical disc edition.'] : format === 'Game Card' ? ['Physical game card edition; the full game is on the cartridge.'] : []), ...(plat === 'retro' ? ['Pre-owned: tested and cleaned. Original packaging and manual may not be included.'] : []), ...(format === 'Game-Key Card' ? ['Game-Key Card: the cartridge contains a key to download the full game; an internet connection is required for the first download.'] : [])],
    kw: o.kw,
  }
  if (used && !preorder && plat !== 'retro') {
    p.options = { Condition: ['New', 'Pre-Owned'] }
    p.variants = [{ id: 'new', options: { Condition: 'New' }, price, stock: p.stock }, { id: 'preowned', options: { Condition: 'Pre-Owned' }, price: used, stock: 4 }]
  }
  return finish(p)
}

const T = '1 Player'
const GAMES = [
  // PlayStation 5
  game(447197, "Marvel's Wolverine", 'ps5', 69.99, 'Sony Interactive Entertainment', 'RP (Rating Pending)', 'Action', null, { preorder: true, pop: 5, franchise: 'Marvel', badge: 'Pre-Order', kw: 'insomniac marvel wolverine' }),
  game(448751, 'Halloween: The Game', 'ps5', 49.99, 'IllFonic', 'M (Mature 17+)', 'Horror', '09/08/2026', { pop: 3, offers: ['new'], kw: 'horror michael myers halloween' }),
  game(450918, 'Silent Hill: Townfall', 'ps5', 49.99, 'Konami', 'RP (Rating Pending)', 'Horror', null, { preorder: true, pop: 4, franchise: 'Silent Hill', kw: 'horror' }),
  game(448642, "Clive Barker's Hellraiser: Revival", 'ps5', 49.99, 'Saber Interactive', 'M (Mature 17+)', 'Horror', '10/02/2026', { pop: 3, offers: ['new'], kw: 'horror' }),
  game(429855, 'Silent Hill f', 'ps5', 69.99, 'Konami', 'M (Mature 17+)', 'Horror', '09/25/2025', { pop: 4, used: 49.99, was: 69.99, franchise: 'Silent Hill', kw: 'horror' }),
  game(427040, 'Ghost of Yotei', 'ps5', 69.99, 'Sony Interactive Entertainment', 'M (Mature 17+)', 'Action Adventure', '10/02/2025', { pop: 5, used: 54.99, kw: 'ghost of yotei sucker punch samurai' }),
  game(431990, 'Battlefield 6', 'ps5', 69.99, 'Electronic Arts', 'M (Mature 17+)', 'Shooter', '10/10/2025', { pop: 5, used: 44.99, was: 69.99, players: '1-64 Players', franchise: 'Battlefield', kw: 'fps shooter' }),
  game(432606, 'Call of Duty: Black Ops 7', 'ps5', 69.99, 'Activision', 'M (Mature 17+)', 'Shooter', '11/14/2025', { pop: 5, used: 49.99, franchise: 'Call of Duty', kw: 'cod fps shooter' }),
  game(450311, 'Call of Duty: Modern Warfare 4', 'ps5', 69.99, 'Activision', 'RP (Rating Pending)', 'Shooter', null, { preorder: true, pop: 5, franchise: 'Call of Duty', kw: 'cod mw4 fps shooter' }),
  game(449120, 'EA SPORTS FC 27', 'ps5', 69.99, 'Electronic Arts', 'E (Everyone)', 'Sports', '09/25/2026', { pop: 5, offers: ['new'], franchise: 'EA SPORTS FC', kw: 'soccer football fifa' }),
  game(424410, 'Madden NFL 26', 'ps5', 69.99, 'Electronic Arts', 'E (Everyone)', 'Sports', '08/14/2025', { pop: 4, used: 29.99, was: 69.99, kw: 'football nfl' }),
  game(426601, 'NBA 2K26', 'ps5', 69.99, '2K', 'E (Everyone)', 'Sports', '09/05/2025', { pop: 4, used: 34.99, kw: 'basketball nba' }),
  game(425180, 'Borderlands 4', 'ps5', 69.99, '2K', 'M (Mature 17+)', 'Shooter', '09/12/2025', { pop: 4, used: 39.99, was: 69.99, kw: 'looter shooter' }),
  game(347733, "Ghost of Tsushima Director's Cut", 'ps5', 69.99, 'Sony Interactive Entertainment', 'M (Mature 17+)', 'Action Adventure', '08/20/2021', { pop: 4, used: 24.99, was: 69.99, kw: 'samurai' }),
  game(406331, "Marvel's Spider-Man 2", 'ps5', 69.99, 'Sony Interactive Entertainment', 'T (Teen)', 'Action Adventure', '10/20/2023', { pop: 5, used: 29.99, was: 69.99, franchise: 'Marvel', kw: 'spiderman spider man insomniac' }),
  game(421733, 'Elden Ring Nightreign', 'ps5', 39.99, 'Bandai Namco Entertainment', 'M (Mature 17+)', 'RPG', '05/30/2025', { pop: 4, used: 29.99, kw: 'fromsoftware souls' }),
  game(420119, 'Death Stranding 2: On the Beach', 'ps5', 69.99, 'Sony Interactive Entertainment', 'M (Mature 17+)', 'Action Adventure', '06/26/2025', { pop: 4, used: 39.99, kw: 'kojima' }),
  game(433870, 'Resident Evil Requiem', 'ps5', 69.99, 'Capcom', 'M (Mature 17+)', 'Horror', '02/27/2026', { pop: 5, used: 49.99, franchise: 'Resident Evil', kw: 'horror re9 biohazard' }),
  game(412377, 'Monster Hunter Wilds', 'ps5', 69.99, 'Capcom', 'T (Teen)', 'RPG', '02/28/2025', { pop: 4, used: 24.99, was: 69.99, kw: 'mhw' }),
  game(413005, "Assassin's Creed Shadows", 'ps5', 69.99, 'Ubisoft', 'M (Mature 17+)', 'Action Adventure', '03/20/2025', { pop: 4, used: 24.99, was: 69.99, franchise: "Assassin's Creed", kw: 'assassins creed' }),
  game(414410, 'Split Fiction', 'ps5', 49.99, 'Electronic Arts', 'T (Teen)', 'Action Adventure', '03/06/2025', { pop: 4, used: 29.99, players: '2 Players', kw: 'co-op coop hazelight' }),
  game(406901, 'Astro Bot', 'ps5', 59.99, 'Sony Interactive Entertainment', 'E10+ (Everyone 10+)', 'Platformer', '09/06/2024', { pop: 4, used: 39.99, kw: 'astrobot platformer' }),
  game(346890, 'Grand Theft Auto V', 'ps5', 29.99, 'Rockstar Games', 'M (Mature 17+)', 'Action Adventure', '03/15/2022', { pop: 5, used: 18.99, kw: 'gta v gta5 rockstar los santos', features: ['Grand Theft Auto V and Grand Theft Auto Online for PlayStation 5.', 'Physical disc. A disc-compatible PlayStation 5 console is required.'] }),
  game(406004, 'Hogwarts Legacy', 'ps5', 29.99, 'Warner Bros. Games', 'T (Teen)', 'RPG', '02/10/2023', { pop: 4, used: 17.99, was: 59.99, franchise: 'Harry Potter', kw: 'harry potter wizard' }),
  game(400012, 'Final Fantasy VII Rebirth', 'ps5', 39.99, 'Square Enix', 'T (Teen)', 'RPG', '02/29/2024', { pop: 3, used: 24.99, franchise: 'Final Fantasy', kw: 'ff7 ffvii jrpg' }),
  game(405121, 'Stellar Blade', 'ps5', 49.99, 'Sony Interactive Entertainment', 'M (Mature 17+)', 'Action', '04/26/2024', { pop: 3, used: 29.99 }),
  game(363201, 'Gran Turismo 7', 'ps5', 39.99, 'Sony Interactive Entertainment', 'E (Everyone)', 'Racing', '03/04/2022', { pop: 3, used: 19.99, kw: 'gt7 racing' }),
  game(416320, '007 First Light', 'ps5', 69.99, 'IO Interactive', 'T (Teen)', 'Action Adventure', '03/27/2026', { pop: 4, used: 49.99, kw: 'james bond 007' }),
  game(435511, 'Nioh 3', 'ps5', 69.99, 'Koei Tecmo', 'M (Mature 17+)', 'RPG', '02/06/2026', { pop: 3, used: 49.99 }),
  game(415901, 'Kingdom Come: Deliverance II', 'ps5', 49.99, 'Deep Silver', 'M (Mature 17+)', 'RPG', '02/04/2025', { pop: 3, used: 34.99, was: 69.99 }),
  game(427777, 'Sonic Racing: CrossWorlds', 'ps5', 59.99, 'SEGA', 'E (Everyone)', 'Racing', '09/25/2025', { pop: 3, used: 39.99, franchise: 'Sonic the Hedgehog', kw: 'sonic kart' }),
  game(436010, 'LEGO Batman: Legacy of the Dark Knight', 'ps5', 69.99, 'Warner Bros. Games', 'E10+ (Everyone 10+)', 'Action Adventure', '05/29/2026', { pop: 4, used: 49.99, franchise: 'DC', kw: 'lego batman dc' }),
  game(399321, 'The Last of Us Part II Remastered', 'ps5', 49.99, 'Sony Interactive Entertainment', 'M (Mature 17+)', 'Action Adventure', '01/19/2024', { pop: 3, used: 24.99, kw: 'tlou naughty dog' }),
  game(441180, 'Street Fighter 6 Years 1-2 Fighters Edition', 'ps5', 49.99, 'Capcom', 'T (Teen)', 'Fighting', '06/05/2025', { pop: 3, used: 34.99, franchise: 'Street Fighter', kw: 'sf6 fighting' }),
  // PlayStation 4
  game(10171590, 'Red Dead Redemption 2', 'ps4', 19.99, 'Rockstar Games', 'M (Mature 17+)', 'Action Adventure', '10/26/2018', { pop: 4, used: 14.99, kw: 'rdr2 rockstar western' }),
  game(10153765, 'Minecraft', 'ps4', 19.99, 'Mojang', 'E10+ (Everyone 10+)', 'Sandbox', '09/04/2014', { pop: 4, used: 14.99, franchise: 'Minecraft' }),
  // Xbox Series X|S
  game(434905, 'Gears of War: E-Day', 'xbox', 69.99, 'Xbox Game Studios', 'RP (Rating Pending)', 'Shooter', null, { preorder: true, pop: 5, kw: 'gears' }),
  game(431991, 'Battlefield 6', 'xbox', 69.99, 'Electronic Arts', 'M (Mature 17+)', 'Shooter', '10/10/2025', { pop: 4, used: 44.99, was: 69.99, franchise: 'Battlefield', kw: 'fps shooter' }),
  game(432607, 'Call of Duty: Black Ops 7', 'xbox', 69.99, 'Activision', 'M (Mature 17+)', 'Shooter', '11/14/2025', { pop: 4, used: 49.99, franchise: 'Call of Duty', kw: 'cod fps shooter' }),
  game(450312, 'Call of Duty: Modern Warfare 4', 'xbox', 69.99, 'Activision', 'RP (Rating Pending)', 'Shooter', null, { preorder: true, pop: 4, franchise: 'Call of Duty', kw: 'cod mw4 fps shooter' }),
  game(449121, 'EA SPORTS FC 27', 'xbox', 69.99, 'Electronic Arts', 'E (Everyone)', 'Sports', '09/25/2026', { pop: 4, offers: ['new'], franchise: 'EA SPORTS FC', kw: 'soccer football fifa' }),
  game(424411, 'Madden NFL 26', 'xbox', 69.99, 'Electronic Arts', 'E (Everyone)', 'Sports', '08/14/2025', { pop: 3, used: 29.99, was: 69.99, kw: 'football nfl' }),
  game(426602, 'NBA 2K26', 'xbox', 69.99, '2K', 'E (Everyone)', 'Sports', '09/05/2025', { pop: 3, used: 34.99, kw: 'basketball nba' }),
  game(429910, 'Ninja Gaiden 4', 'xbox', 69.99, 'Xbox Game Studios', 'M (Mature 17+)', 'Action', '10/21/2025', { pop: 3, used: 44.99 }),
  game(430120, 'The Outer Worlds 2', 'xbox', 69.99, 'Xbox Game Studios', 'M (Mature 17+)', 'RPG', '10/29/2025', { pop: 3, used: 39.99, was: 69.99, kw: 'obsidian' }),
  game(407811, 'Indiana Jones and the Great Circle', 'xbox', 69.99, 'Bethesda Softworks', 'T (Teen)', 'Action Adventure', '12/09/2024', { pop: 3, used: 34.99 }),
  game(419006, 'DOOM: The Dark Ages', 'xbox', 69.99, 'Bethesda Softworks', 'M (Mature 17+)', 'Shooter', '05/15/2025', { pop: 3, used: 34.99, was: 69.99, kw: 'id software fps' }),
  game(433871, 'Resident Evil Requiem', 'xbox', 69.99, 'Capcom', 'M (Mature 17+)', 'Horror', '02/27/2026', { pop: 3, used: 49.99, franchise: 'Resident Evil', kw: 'horror re9' }),
  game(346891, 'Grand Theft Auto V', 'xbox', 29.99, 'Rockstar Games', 'M (Mature 17+)', 'Action Adventure', '03/15/2022', { pop: 4, used: 18.99, kw: 'gta v gta5 rockstar los santos', features: ['Grand Theft Auto V and Grand Theft Auto Online for Xbox Series X|S.', 'Physical disc. An Xbox Series X console with a disc drive is required.'] }),
  game(406005, 'Hogwarts Legacy', 'xbox', 29.99, 'Warner Bros. Games', 'T (Teen)', 'RPG', '02/10/2023', { pop: 3, used: 17.99, was: 59.99, franchise: 'Harry Potter', kw: 'harry potter wizard' }),
  game(448752, 'Halloween: The Game', 'xbox', 49.99, 'IllFonic', 'M (Mature 17+)', 'Horror', '09/08/2026', { pop: 2, offers: ['new'], kw: 'horror michael myers' }),
  // Xbox One
  game(10153766, 'Minecraft', 'xboxone', 19.99, 'Mojang', 'E10+ (Everyone 10+)', 'Sandbox', '09/05/2014', { pop: 3, used: 14.99, franchise: 'Minecraft' }),
  game(10171591, 'Red Dead Redemption 2', 'xboxone', 19.99, 'Rockstar Games', 'M (Mature 17+)', 'Action Adventure', '10/26/2018', { pop: 3, used: 14.99, kw: 'rdr2 rockstar western' }),
  // Nintendo Switch 2
  game(418750, 'Mario Kart World', 'switch2', 79.99, 'Nintendo', 'E (Everyone)', 'Racing', '06/05/2025', { pop: 5, used: 64.99, franchise: 'Super Mario', players: '1-24 Players', kw: 'mario kart' }),
  game(421266, 'Donkey Kong Bananza', 'switch2', 69.99, 'Nintendo', 'E10+ (Everyone 10+)', 'Platformer', '07/17/2025', { pop: 5, used: 54.99, franchise: 'Donkey Kong' }),
  game(428030, 'Pokemon Legends: Z-A - Nintendo Switch 2 Edition', 'switch2', 69.99, 'Nintendo', 'E10+ (Everyone 10+)', 'RPG', '10/16/2025', { pop: 5, used: 54.99, franchise: 'Pokemon', kw: 'pokemon pokémon legends za' }),
  game(430455, 'Kirby Air Riders', 'switch2', 69.99, 'Nintendo', 'E (Everyone)', 'Racing', '11/20/2025', { pop: 4, used: 49.99, franchise: 'Kirby' }),
  game(429876, 'Hyrule Warriors: Age of Imprisonment', 'switch2', 69.99, 'Nintendo', 'T (Teen)', 'Action', '11/06/2025', { pop: 4, used: 49.99, franchise: 'The Legend of Zelda', kw: 'zelda' }),
  game(431221, 'Metroid Prime 4: Beyond - Nintendo Switch 2 Edition', 'switch2', 79.99, 'Nintendo', 'T (Teen)', 'Action Adventure', '12/04/2025', { pop: 4, used: 59.99, franchise: 'Metroid' }),
  game(447657, 'Kingdom Hearts Collection I-III', 'switch2', 69.99, 'Square Enix', 'RP (Rating Pending)', 'RPG', null, { preorder: true, keyCard: true, pop: 4, franchise: 'Kingdom Hearts', kw: 'disney' }),
  game(447540, "Fire Emblem: Fortune's Weave", 'switch2', 69.99, 'Nintendo', 'RP (Rating Pending)', 'Strategy', null, { preorder: true, pop: 4, franchise: 'Fire Emblem' }),
  game(444517, "Bluey's Happy Snaps", 'switch2', 29.99, 'Wild Dog', 'E (Everyone)', 'Family', '04/24/2026', { pop: 3, franchise: 'Bluey', kw: 'kids' }),
  game(447962, 'Nintendo Switch Sports Resort', 'switch2', 59.99, 'Nintendo', 'RP (Rating Pending)', 'Sports', '10/22/2026', { preorder: true, pop: 5, kw: 'wii sports resort' }),
  game(433002, 'Pokemon Pokopia', 'switch2', 69.99, 'Nintendo', 'E (Everyone)', 'Simulation', '03/05/2026', { pop: 4, used: 54.99, franchise: 'Pokemon', kw: 'pokemon pokémon' }),
  game(433950, 'Mario Tennis Fever', 'switch2', 69.99, 'Nintendo', 'E (Everyone)', 'Sports', '02/12/2026', { pop: 3, used: 49.99, franchise: 'Super Mario' }),
  game(424380, 'Kirby and the Forgotten Land - Nintendo Switch 2 Edition + Star-Crossed World', 'switch2', 79.99, 'Nintendo', 'E10+ (Everyone 10+)', 'Platformer', '08/28/2025', { pop: 3, used: 59.99, franchise: 'Kirby' }),
  game(432201, 'Final Fantasy VII Remake Intergrade', 'switch2', 39.99, 'Square Enix', 'T (Teen)', 'RPG', '01/22/2026', { pop: 3, keyCard: true, used: 29.99, franchise: 'Final Fantasy', kw: 'ff7 ffvii' }),
  // Nintendo Switch
  game(10189433, 'Animal Crossing: New Horizons', 'switch', 59.99, 'Nintendo', 'E (Everyone)', 'Simulation', '03/20/2020', { pop: 5, used: 44.99, franchise: 'Animal Crossing' }),
  game(10160592, 'Mario Kart 8 Deluxe', 'switch', 59.99, 'Nintendo', 'E (Everyone)', 'Racing', '04/28/2017', { pop: 5, used: 44.99, franchise: 'Super Mario', kw: 'mario kart' }),
  game(10183919, 'The Legend of Zelda: Tears of the Kingdom', 'switch', 69.99, 'Nintendo', 'E10+ (Everyone 10+)', 'Action Adventure', '05/12/2023', { pop: 5, used: 49.99, franchise: 'The Legend of Zelda', kw: 'zelda totk' }),
  game(10209044, 'Super Mario Bros. Wonder', 'switch', 59.99, 'Nintendo', 'E (Everyone)', 'Platformer', '10/20/2023', { pop: 4, used: 44.99, franchise: 'Super Mario' }),
  game(10183015, 'Pokemon Scarlet', 'switch', 59.99, 'Nintendo', 'E (Everyone)', 'RPG', '11/18/2022', { pop: 4, used: 44.99, franchise: 'Pokemon', kw: 'pokemon pokémon' }),
  game(10166384, 'Super Smash Bros. Ultimate', 'switch', 59.99, 'Nintendo', 'E10+ (Everyone 10+)', 'Fighting', '12/07/2018', { pop: 4, used: 44.99, franchise: 'Super Smash Bros.' }),
  game(10163842, 'Minecraft', 'switch', 29.99, 'Mojang', 'E10+ (Everyone 10+)', 'Sandbox', '06/21/2018', { pop: 4, used: 22.99, franchise: 'Minecraft' }),
  game(402551, 'Super Mario Party Jamboree', 'switch', 59.99, 'Nintendo', 'E (Everyone)', 'Party', '10/17/2024', { pop: 4, used: 44.99, was: 59.99, franchise: 'Super Mario', kw: 'mario party' }),
  game(428031, 'Pokemon Legends: Z-A', 'switch', 59.99, 'Nintendo', 'E10+ (Everyone 10+)', 'RPG', '10/16/2025', { pop: 4, used: 44.99, franchise: 'Pokemon', kw: 'pokemon pokémon legends za' }),
  game(425560, 'Super Mario Galaxy + Super Mario Galaxy 2', 'switch', 69.99, 'Nintendo', 'E (Everyone)', 'Platformer', '10/02/2025', { pop: 4, used: 54.99, franchise: 'Super Mario' }),
  // Retro (pre-owned)
  game(10002164, 'Super Mario 64', 'retro', 44.99, 'Nintendo', 'E (Everyone)', 'Platformer', '09/29/1996', { system: 'Nintendo 64', pop: 3, franchise: 'Super Mario', kw: 'n64 nintendo 64' }),
  game(10002199, 'GoldenEye 007', 'retro', 34.99, 'Nintendo', 'T (Teen)', 'Shooter', '08/25/1997', { system: 'Nintendo 64', pop: 2, kw: 'n64 nintendo 64 bond' }),
  game(10002171, 'The Legend of Zelda: Ocarina of Time', 'retro', 49.99, 'Nintendo', 'E (Everyone)', 'Action Adventure', '11/23/1998', { system: 'Nintendo 64', pop: 3, franchise: 'The Legend of Zelda', kw: 'n64 nintendo 64 zelda' }),
  game(10031870, 'Pokemon Emerald Version', 'retro', 149.99, 'Nintendo', 'E (Everyone)', 'RPG', '05/01/2005', { system: 'Game Boy Advance', pop: 2, franchise: 'Pokemon', kw: 'gba game boy advance pokemon pokémon' }),
  game(10048123, 'Halo 3', 'retro', 9.99, 'Microsoft', 'M (Mature 17+)', 'Shooter', '09/25/2007', { system: 'Xbox 360', format: 'Disc', pop: 2, franchise: 'Halo', kw: 'xbox 360' }),
  game(10017422, 'Kingdom Hearts', 'retro', 19.99, 'Square Enix', 'E (Everyone)', 'RPG', '09/17/2002', { system: 'PlayStation 2', format: 'Disc', pop: 2, franchise: 'Kingdom Hearts', kw: 'ps2 playstation 2' }),
]

// ---------- general merchandise ----------
function item(id, title, department, family, urlPath, brand, price, o = {}) {
  const p = {
    id: String(id), title, brand, price, wasPrice: o.was || null, department, family,
    category: urlPath.split('/').at(-1), categoryName: o.categoryName || urlPath.split('/').at(-1).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), urlPath,
    platforms: o.platforms || [], release: o.release || '01/15/2025', preorder: !!o.preorder, pop: o.pop ?? 3,
    offers: [...(o.offers || []), ...(o.was ? ['deals'] : [])], franchise: o.franchise, connection: o.connection,
    catalogType: o.catalogType || (department === 'consoles-hardware' ? 'console' : ['gaming-accessories', 'pc-gaming'].includes(department) ? 'accessory' : 'other'),
    catalogPlatform: o.platforms?.[0] || null, artType: o.art, color: o.color, badge: o.badge || null, stock: o.stock,
    condition: o.condition, specs: o.specs || {}, features: o.features || Object.entries(o.specs || {}).map(([k, v]) => `${k}: ${v}.`), kw: o.kw,
  }
  if (o.variants) { p.options = o.options; p.variants = o.variants }
  if (o.grade) p.grade = o.grade
  return finish(p)
}
const cond = (newPrice, usedPrice, label = 'Pre-Owned', stock = 3) => ({ options: { Condition: ['New', label] }, variants: [{ id: 'new', options: { Condition: 'New' }, price: newPrice, stock: 8 }, { id: label === 'Refurbished' ? 'refurbished' : 'preowned', options: { Condition: label }, price: usedPrice, stock }] })
const sizes = (price, xl = price + 2) => ({ options: { Size: ['S', 'M', 'L', 'XL', '2XL'] }, variants: ['S', 'M', 'L', 'XL', '2XL'].map(s => ({ id: s.toLowerCase(), options: { Size: s }, price: ['XL', '2XL'].includes(s) ? xl : price, stock: s === '2XL' ? 2 : 5 })) })
const capacity = rows => ({ options: { Capacity: rows.map(r => r[0]) }, variants: rows.map(([c, price, stock = 5]) => ({ id: c.toLowerCase().replace(/\s+/g, ''), options: { Capacity: c }, price, stock })) })

const CH = 'consoles-hardware', GA = 'gaming-accessories', PC = 'pc-gaming', TC = 'toys-games/trading-cards', CO = 'collectibles', TG = 'toys-games'
const CONSOLES = [
  item(429100, 'Sony PlayStation 5 Pro Console 2TB', CH, 'home-console', 'consoles-hardware/playstation-5', 'Sony Interactive Entertainment', 749.99, { platforms: ['ps5'], pop: 4, specs: { Storage: '2TB SSD', Resolution: 'Up to 8K', 'Disc Drive': 'Sold separately', Includes: 'Console, DualSense wireless controller, HDMI and power cables' }, ...cond(749.99, 649.99, 'Refurbished', 2), kw: 'ps5 pro' }),
  item(415203, 'Sony PlayStation 5 Console - Disc Edition 1TB (Slim)', CH, 'home-console', 'consoles-hardware/playstation-5', 'Sony Interactive Entertainment', 549.99, { platforms: ['ps5'], pop: 5, specs: { Storage: '1TB SSD', 'Disc Drive': 'Ultra HD Blu-ray', Includes: 'Console, DualSense wireless controller, HDMI and power cables' }, ...cond(549.99, 449.99, 'Refurbished', 3), kw: 'ps5 slim disc' }),
  item(415204, 'Sony PlayStation 5 Console - Digital Edition 825GB (Slim)', CH, 'home-console', 'consoles-hardware/playstation-5', 'Sony Interactive Entertainment', 499.99, { platforms: ['ps5'], pop: 4, specs: { Storage: '825GB SSD', 'Disc Drive': 'None (digital only)', Includes: 'Console, DualSense wireless controller, HDMI and power cables' }, kw: 'ps5 slim digital' }),
  item(408870, 'Sony PlayStation Portal Remote Player', CH, 'handheld-console', 'consoles-hardware/playstation-5', 'Sony Interactive Entertainment', 199.99, { platforms: ['ps5'], pop: 4, specs: { Display: '8-inch LCD, 1080p 60fps', Connectivity: 'Wi-Fi remote play to a PS5 console', Battery: 'Rechargeable' } }),
  item(395990, 'Sony PlayStation VR2', CH, 'vr-headset', 'consoles-hardware/virtual-reality', 'Sony Interactive Entertainment', 399.99, { platforms: ['ps5'], pop: 3, was: 449.99, specs: { Display: 'OLED, 2000 x 2040 per eye', Tracking: 'Inside-out with eye tracking', Includes: 'Headset, Sense controllers, stereo headphones' }, kw: 'psvr2 vr virtual reality' }),
  item(418700, 'Nintendo Switch 2 Console', CH, 'home-console', 'consoles-hardware/nintendo-switch-2', 'Nintendo', 449.99, { platforms: ['switch2'], pop: 5, specs: { Display: '7.9-inch LCD, up to 120Hz', Storage: '256GB', Includes: 'Console, Joy-Con 2 (L)(R), Joy-Con 2 Grip, dock, AC adapter, USB-C cable, HDMI cable' }, kw: 'switch 2' }),
  item(450924, 'Nintendo Switch 2 and Mario Kart World Bundle', CH, 'home-console', 'consoles-hardware/nintendo-switch-2', 'Nintendo', 499.99, { platforms: ['switch2'], pop: 5, badge: 'Best Seller', specs: { Storage: '256GB', Includes: 'Nintendo Switch 2 console and a Mario Kart World download code' }, kw: 'switch 2 mario kart bundle' }),
  item(428200, 'Nintendo Switch 2 and Pokemon Legends: Z-A Bundle', CH, 'home-console', 'consoles-hardware/nintendo-switch-2', 'Nintendo', 499.99, { platforms: ['switch2'], pop: 4, specs: { Storage: '256GB', Includes: 'Nintendo Switch 2 console and a Pokemon Legends: Z-A - Nintendo Switch 2 Edition download code' }, kw: 'switch 2 pokemon pokémon bundle' }),
  item(10186931, 'Nintendo Switch OLED Model - White', CH, 'home-console', 'consoles-hardware/nintendo-switch', 'Nintendo', 399.99, { platforms: ['switch'], pop: 4, specs: { Display: '7-inch OLED', Storage: '64GB', Includes: 'Console, white Joy-Con, dock with LAN port' }, ...cond(399.99, 299.99, 'Pre-Owned', 3) }),
  item(10177802, 'Nintendo Switch Lite - Turquoise', CH, 'handheld-console', 'consoles-hardware/nintendo-switch', 'Nintendo', 229.99, { platforms: ['switch'], pop: 3, specs: { Display: '5.5-inch LCD', Storage: '32GB', Mode: 'Handheld only' }, ...cond(229.99, 159.99, 'Pre-Owned', 2) }),
  item(424810, 'Microsoft Xbox Series X 1TB Console - Carbon Black', CH, 'home-console', 'consoles-hardware/xbox-series-x-s', 'Microsoft', 649.99, { platforms: ['xbox'], pop: 4, specs: { Storage: '1TB SSD', Resolution: 'True 4K, up to 120 FPS', 'Disc Drive': '4K UHD Blu-ray' }, ...cond(649.99, 499.99, 'Refurbished', 2), kw: 'xsx' }),
  item(424811, 'Microsoft Xbox Series S 512GB Console - Robot White', CH, 'home-console', 'consoles-hardware/xbox-series-x-s', 'Microsoft', 399.99, { platforms: ['xbox'], pop: 3, specs: { Storage: '512GB SSD', Resolution: 'Up to 1440p, 120 FPS', 'Disc Drive': 'None (digital only)' }, ...cond(399.99, 299.99, 'Pre-Owned', 3) }),
  item(424812, 'Microsoft Xbox Series X 2TB Galaxy Black Special Edition Console', CH, 'home-console', 'consoles-hardware/xbox-series-x-s', 'Microsoft', 799.99, { platforms: ['xbox'], pop: 2, stock: 0, specs: { Storage: '2TB SSD', 'Disc Drive': '4K UHD Blu-ray', Finish: 'Galaxy Black' } }),
  item(429300, 'ASUS ROG Xbox Ally Handheld Gaming Console', CH, 'handheld-console', 'consoles-hardware/xbox-series-x-s', 'ASUS', 599.99, { platforms: ['xbox', 'pc'], pop: 4, specs: { Display: '7-inch FHD 120Hz', Processor: 'AMD Ryzen Z2 A', Storage: '512GB SSD', 'Operating System': 'Windows 11 with Xbox full screen experience' }, kw: 'rog ally handheld pc' }),
  item(429301, 'ASUS ROG Xbox Ally X Handheld Gaming Console', CH, 'handheld-console', 'consoles-hardware/xbox-series-x-s', 'ASUS', 999.99, { platforms: ['xbox', 'pc'], pop: 3, specs: { Display: '7-inch FHD 120Hz', Processor: 'AMD Ryzen AI Z2 Extreme', Memory: '24GB LPDDR5X', Storage: '1TB SSD' }, kw: 'rog ally x handheld pc' }),
  item(411051, 'Meta Quest 3S 128GB All-in-One VR Headset', CH, 'vr-headset', 'consoles-hardware/virtual-reality', 'Meta', 299.99, { pop: 4, specs: { Storage: '128GB', Display: 'Fast-switch LCD', Includes: 'Headset, Touch Plus controllers, charger' }, kw: 'oculus vr virtual reality' }),
  item(400460, 'Meta Quest 3 512GB All-in-One VR Headset', CH, 'vr-headset', 'consoles-hardware/virtual-reality', 'Meta', 499.99, { pop: 3, specs: { Storage: '512GB', Display: '4K+ Infinite Display', Includes: 'Headset, Touch Plus controllers, charger' }, kw: 'oculus vr virtual reality' }),
  item(410221, 'Atari 2600+ Console', CH, 'retro-console', 'consoles-hardware/retro-consoles', 'Atari', 129.99, { pop: 2, offers: ['retro'], was: 149.99, specs: { Compatibility: 'Atari 2600 and 7800 cartridges', Output: 'HDMI 720p', Includes: 'CX40+ joystick and 10-in-1 game cartridge' } }),
  item(410222, 'Atari 7800+ Console', CH, 'retro-console', 'consoles-hardware/retro-consoles', 'Atari', 129.99, { pop: 2, offers: ['retro'], specs: { Compatibility: 'Atari 2600 and 7800 cartridges', Output: 'HDMI 720p', Includes: 'Wireless CX78+ gamepad and Bentley Bear\'s Crystal Quest cartridge' } }),
  item(10179890, 'Nintendo 64 System - Charcoal Gray (Pre-Owned)', CH, 'retro-console', 'consoles-hardware/retro-consoles', 'Nintendo', 149.99, { pop: 2, offers: ['retro'], condition: 'Pre-Owned', stock: 2, specs: { Includes: 'Console, controller, AC adapter and AV cable', Condition: 'Tested and cleaned' }, kw: 'n64 nintendo 64' }),
  item(10183200, 'amiibo Link (Tears of the Kingdom) - The Legend of Zelda Series', CH, 'amiibo', 'consoles-hardware/nintendo-switch/nintendo-switch-amiibo', 'Nintendo', 29.99, { platforms: ['switch', 'switch2'], pop: 3, franchise: 'The Legend of Zelda', art: 'figure', specs: { Series: 'The Legend of Zelda', Compatibility: 'Nintendo Switch and Nintendo Switch 2' }, kw: 'amiibo zelda figure' }),
  item(10183201, 'amiibo Zelda (Tears of the Kingdom) - The Legend of Zelda Series', CH, 'amiibo', 'consoles-hardware/nintendo-switch/nintendo-switch-amiibo', 'Nintendo', 29.99, { platforms: ['switch', 'switch2'], pop: 2, franchise: 'The Legend of Zelda', art: 'figure', specs: { Series: 'The Legend of Zelda', Compatibility: 'Nintendo Switch and Nintendo Switch 2' }, kw: 'amiibo zelda figure' }),
  item(10160250, 'amiibo Mario - Super Smash Bros. Series', CH, 'amiibo', 'consoles-hardware/nintendo-switch/nintendo-switch-amiibo', 'Nintendo', 15.99, { platforms: ['switch', 'switch2'], pop: 2, franchise: 'Super Mario', art: 'figure', specs: { Series: 'Super Smash Bros.', Compatibility: 'Nintendo Switch and Nintendo Switch 2' }, kw: 'amiibo figure' }),
]

const ACC = [
  // controllers
  item(10195290, 'Sony DualSense Wireless Controller for PlayStation 5 - Midnight Black', GA, 'controller', 'gaming-accessories/controllers', 'Sony Interactive Entertainment', 74.99, { platforms: ['ps5'], connection: 'Wireless', pop: 5, ...cond(74.99, 54.99, 'Refurbished', 4), specs: { Connectivity: 'Bluetooth, USB-C', Features: 'Haptic feedback, adaptive triggers, built-in microphone', Color: 'Midnight Black' }, kw: 'ps5 controller dualsense' }),
  item(10195291, 'Sony DualSense Wireless Controller for PlayStation 5 - White', GA, 'controller', 'gaming-accessories/controllers', 'Sony Interactive Entertainment', 74.99, { platforms: ['ps5'], connection: 'Wireless', pop: 5, ...cond(74.99, 54.99, 'Refurbished', 4), specs: { Connectivity: 'Bluetooth, USB-C', Features: 'Haptic feedback, adaptive triggers, built-in microphone', Color: 'White' }, kw: 'ps5 controller dualsense' }),
  item(10200711, 'Sony DualSense Wireless Controller for PlayStation 5 - Cobalt Blue', GA, 'controller', 'gaming-accessories/controllers', 'Sony Interactive Entertainment', 79.99, { platforms: ['ps5'], connection: 'Wireless', pop: 3, was: 79.99, specs: { Connectivity: 'Bluetooth, USB-C', Color: 'Cobalt Blue' }, kw: 'ps5 controller dualsense blue' }),
  item(10200712, 'Sony DualSense Wireless Controller for PlayStation 5 - Galactic Purple', GA, 'controller', 'gaming-accessories/controllers', 'Sony Interactive Entertainment', 79.99, { platforms: ['ps5'], connection: 'Wireless', pop: 3, specs: { Connectivity: 'Bluetooth, USB-C', Color: 'Galactic Purple' }, kw: 'ps5 controller dualsense purple' }),
  item(10213901, 'Sony DualSense Edge Wireless Controller for PlayStation 5', GA, 'controller', 'gaming-accessories/controllers', 'Sony Interactive Entertainment', 199.99, { platforms: ['ps5'], connection: 'Wireless', pop: 4, specs: { Connectivity: 'Bluetooth, USB-C', Features: 'Swappable stick modules, back buttons, trigger stops', Includes: 'Carrying case and braided USB cable' }, kw: 'ps5 pro controller' }),
  item(10200401, 'Microsoft Xbox Wireless Controller - Carbon Black', GA, 'controller', 'gaming-accessories/controllers', 'Microsoft', 64.99, { platforms: ['xbox', 'xboxone', 'pc'], connection: 'Wireless', pop: 5, ...cond(64.99, 44.99, 'Refurbished', 4), specs: { Connectivity: 'Xbox Wireless, Bluetooth, USB-C', Power: '2 AA batteries', Color: 'Carbon Black' }, kw: 'xbox controller' }),
  item(10200402, 'Microsoft Xbox Wireless Controller - Robot White', GA, 'controller', 'gaming-accessories/controllers', 'Microsoft', 64.99, { platforms: ['xbox', 'xboxone', 'pc'], connection: 'Wireless', pop: 4, specs: { Connectivity: 'Xbox Wireless, Bluetooth, USB-C', Color: 'Robot White' }, kw: 'xbox controller' }),
  item(10200409, 'Microsoft Xbox Wireless Controller - Pulse Red', GA, 'controller', 'gaming-accessories/controllers', 'Microsoft', 69.99, { platforms: ['xbox', 'xboxone', 'pc'], connection: 'Wireless', pop: 3, specs: { Connectivity: 'Xbox Wireless, Bluetooth, USB-C', Color: 'Pulse Red' }, kw: 'xbox controller red' }),
  item(10182490, 'Microsoft Xbox Elite Wireless Controller Series 2', GA, 'controller', 'gaming-accessories/controllers', 'Microsoft', 179.99, { platforms: ['xbox', 'xboxone', 'pc'], connection: 'Wireless', pop: 3, was: 199.99, specs: { Connectivity: 'Xbox Wireless, Bluetooth, USB-C', Battery: 'Up to 40 hours rechargeable', Includes: 'Carrying case, charging dock, swappable components' }, kw: 'xbox elite pro controller' }),
  item(418721, 'Nintendo Switch 2 Pro Controller', GA, 'controller', 'gaming-accessories/controllers', 'Nintendo', 84.99, { platforms: ['switch2'], connection: 'Wireless', pop: 4, specs: { Compatibility: 'Nintendo Switch 2', Features: 'GL/GR buttons, HD rumble, audio jack', Connectivity: 'Bluetooth, USB-C' }, kw: 'switch 2 pro controller' }),
  item(418722, 'Nintendo Switch 2 Joy-Con 2 Pair', GA, 'controller', 'gaming-accessories/controllers', 'Nintendo', 94.99, { platforms: ['switch2'], connection: 'Wireless', pop: 4, specs: { Compatibility: 'Nintendo Switch 2', Features: 'Mouse controls, HD rumble 2', Color: 'Light Blue / Light Red' }, kw: 'joycon joy con' }),
  item(10142034, 'Nintendo Switch Pro Controller', GA, 'controller', 'gaming-accessories/controllers', 'Nintendo', 74.99, { platforms: ['switch', 'switch2'], connection: 'Wireless', pop: 3, ...cond(74.99, 49.99), specs: { Compatibility: 'Nintendo Switch and Nintendo Switch 2', Battery: 'Up to 40 hours' } }),
  item(10200130, 'PowerA Enhanced Wired Controller for Xbox Series X|S - Black', GA, 'controller', 'gaming-accessories/controllers', 'PowerA', 34.99, { platforms: ['xbox', 'xboxone', 'pc'], connection: 'Wired', pop: 3, was: 39.99, specs: { Connectivity: '10 ft detachable USB-C cable', Features: 'Two mappable advanced gaming buttons' }, kw: 'xbox wired controller' }),
  item(421940, 'PowerA Advantage Wired Controller for Nintendo Switch 2', GA, 'controller', 'gaming-accessories/controllers', 'PowerA', 39.99, { platforms: ['switch2', 'switch'], connection: 'Wired', pop: 2, specs: { Connectivity: '10 ft USB-C cable', Features: 'Mappable back buttons, Hall-effect sticks' } }),
  item(406220, 'Turtle Beach Stealth Ultra Wireless Controller for Xbox Series X|S', GA, 'controller', 'gaming-accessories/controllers', 'Turtle Beach', 199.99, { platforms: ['xbox', 'xboxone', 'pc'], connection: 'Wireless', pop: 2, was: 199.99, specs: { Features: 'Built-in display, Hall-effect sticks, charging dock', Connectivity: 'Wireless, Bluetooth' } }),
  item(424901, '8BitDo Ultimate 2 Wireless Controller - Black', GA, 'controller', 'gaming-accessories/controllers', '8BitDo', 59.99, { platforms: ['switch', 'pc'], connection: 'Wireless', pop: 3, specs: { Connectivity: '2.4G, Bluetooth, USB-C', Features: 'TMR joysticks, charging dock' } }),
  item(406510, 'Backbone One Mobile Gaming Controller for iPhone and Android (USB-C) - PlayStation Edition', GA, 'controller', 'gaming-accessories/controllers', 'Backbone', 99.99, { platforms: [], connection: 'Wired', pop: 3, was: 99.99, specs: { Compatibility: 'USB-C iPhone 15 and newer, Android', Features: 'Pass-through charging, 3.5mm jack' }, kw: 'mobile phone controller' }),
  // audio
  item(405830, 'Sony PULSE Elite Wireless Headset for PlayStation 5', GA, 'gaming-headset', 'gaming-accessories/gaming-headsets', 'Sony Interactive Entertainment', 149.99, { platforms: ['ps5', 'pc'], connection: 'Wireless', pop: 4, specs: { Connectivity: 'PlayStation Link, Bluetooth', Battery: 'Up to 30 hours', Microphone: 'Retractable, AI-enhanced noise rejection' }, kw: 'headset headphones' }),
  item(405831, 'Sony PULSE Explore Wireless Earbuds', GA, 'gaming-headset', 'gaming-accessories/gaming-headsets', 'Sony Interactive Entertainment', 199.99, { platforms: ['ps5', 'pc'], connection: 'Wireless', pop: 2, was: 199.99, specs: { Connectivity: 'PlayStation Link, Bluetooth', Battery: 'Up to 5 hours (15 with case)' }, kw: 'earbuds headphones' }),
  item(403322, 'Turtle Beach Stealth 600 Gen 3 Wireless Multiplatform Gaming Headset - Black', GA, 'gaming-headset', 'gaming-accessories/gaming-headsets', 'Turtle Beach', 99.99, { platforms: ['ps5', 'xbox', 'switch', 'pc'], connection: 'Wireless', pop: 4, was: 119.99, specs: { Connectivity: '2.4GHz USB-C, Bluetooth', Battery: 'Up to 80 hours' }, kw: 'headset headphones' }),
  item(10177011, 'Turtle Beach Recon 70 Wired Gaming Headset - Black', GA, 'gaming-headset', 'gaming-accessories/gaming-headsets', 'Turtle Beach', 29.99, { platforms: ['ps5', 'xbox', 'switch', 'pc'], connection: 'Wired', pop: 4, was: 39.99, specs: { Connectivity: '3.5mm', Microphone: 'Flip-to-mute' }, kw: 'headset headphones cheap' }),
  item(402100, 'SteelSeries Arctis Nova 7 Wireless Multi-Platform Gaming Headset', GA, 'gaming-headset', 'gaming-accessories/gaming-headsets', 'SteelSeries', 179.99, { platforms: ['ps5', 'switch', 'pc'], connection: 'Wireless', pop: 3, specs: { Connectivity: '2.4GHz USB-C, Bluetooth', Battery: 'Up to 54 hours' }, kw: 'headset headphones' }),
  item(10208850, 'SteelSeries Arctis Nova Pro Wireless Gaming Headset for Xbox', GA, 'gaming-headset', 'gaming-accessories/gaming-headsets', 'SteelSeries', 349.99, { platforms: ['xbox', 'pc'], connection: 'Wireless', pop: 2, specs: { Features: 'Active noise cancellation, hot-swappable batteries, base station' }, kw: 'headset headphones' }),
  item(10207761, 'Razer BlackShark V2 X Wired Gaming Headset', GA, 'gaming-headset', 'gaming-accessories/gaming-headsets', 'Razer', 59.99, { platforms: ['ps5', 'xbox', 'switch', 'pc'], connection: 'Wired', pop: 3, was: 59.99, specs: { Connectivity: '3.5mm', Drivers: '50mm TriForce' }, kw: 'headset headphones' }),
  item(415520, 'Logitech G PRO X 2 LIGHTSPEED Wireless Gaming Headset', GA, 'gaming-headset', 'gaming-accessories/gaming-headsets', 'Logitech G', 249.99, { platforms: ['ps5', 'pc'], connection: 'Wireless', pop: 2, specs: { Drivers: '50mm graphene', Battery: 'Up to 50 hours' }, kw: 'headset headphones' }),
  item(406611, 'HyperX Cloud III Wireless Gaming Headset - Black/Red', GA, 'gaming-headset', 'gaming-accessories/gaming-headsets', 'HyperX', 169.99, { platforms: ['ps5', 'pc'], connection: 'Wireless', pop: 3, was: 169.99, specs: { Battery: 'Up to 120 hours', Connectivity: '2.4GHz USB-C/USB-A dongle' }, kw: 'headset headphones' }),
  item(10196301, 'Microsoft Xbox Wireless Headset', GA, 'gaming-headset', 'gaming-accessories/gaming-headsets', 'Microsoft', 109.99, { platforms: ['xbox', 'pc'], connection: 'Wireless', pop: 3, specs: { Connectivity: 'Xbox Wireless, Bluetooth', Features: 'Dolby Atmos, auto-mute' }, kw: 'headset headphones' }),
  // charging and cables
  item(10194050, 'Sony DualSense Charging Station', GA, 'charging-dock', 'gaming-accessories/chargers-cables', 'Sony Interactive Entertainment', 39.99, { platforms: ['ps5'], pop: 4, specs: { Capacity: 'Charges two DualSense controllers', Power: 'AC adapter included' }, kw: 'charger dock' }),
  item(10196622, 'PowerA Dual Charging Station for DualSense Wireless Controllers', GA, 'charging-dock', 'gaming-accessories/chargers-cables', 'PowerA', 29.99, { platforms: ['ps5'], pop: 3, was: 29.99, specs: { Capacity: 'Two controllers', Connection: 'Click-in adapters' }, kw: 'charger dock' }),
  item(10194410, 'Microsoft Xbox Rechargeable Battery + USB-C Cable', GA, 'charging-cable', 'gaming-accessories/chargers-cables', 'Microsoft', 24.99, { platforms: ['xbox', 'xboxone'], pop: 4, specs: { Includes: 'Rechargeable battery pack and 9 ft USB-C cable', Battery: 'Up to 30 hours' }, kw: 'battery charge kit' }),
  item(10194601, 'PowerA Charging Base for Xbox Wireless Controllers', GA, 'charging-dock', 'gaming-accessories/chargers-cables', 'PowerA', 39.99, { platforms: ['xbox', 'xboxone'], pop: 2, specs: { Includes: 'Charging base and two rechargeable battery packs' }, kw: 'charger dock' }),
  item(418730, 'Nintendo Switch 2 AC Adapter', GA, 'charging-cable', 'gaming-accessories/chargers-cables', 'Nintendo', 34.99, { platforms: ['switch2'], pop: 2, specs: { Output: '60W USB-C', Compatibility: 'Nintendo Switch 2 and dock' }, kw: 'charger power' }),
  item(10197730, 'Atrix Ultra High Speed HDMI 2.1 Cable 6 ft', GA, 'hdmi-cable', 'gaming-accessories/chargers-cables', 'Atrix', 19.99, { platforms: ['ps5', 'xbox', 'switch2'], connection: 'Wired', pop: 3, offers: ['exclusive'], specs: { Length: '6 ft', Bandwidth: '48Gbps, 4K 120Hz / 8K 60Hz' }, kw: 'hdmi cable' }),
  item(10197735, 'Atrix USB-C to USB-C Braided Charging Cable 10 ft', GA, 'charging-cable', 'gaming-accessories/chargers-cables', 'Atrix', 14.99, { platforms: ['ps5', 'xbox', 'switch2'], connection: 'Wired', pop: 3, offers: ['exclusive'], specs: { Length: '10 ft', Connector: 'USB-C to USB-C' }, kw: 'usb cable charger' }),
  item(10197740, 'Atrix Controller Charging Dock for Xbox Series X|S', GA, 'charging-dock', 'gaming-accessories/chargers-cables', 'Atrix', 24.99, { platforms: ['xbox'], pop: 2, offers: ['exclusive'], was: 29.99, specs: { Includes: 'Dock and two 1200mAh battery packs' }, kw: 'charger dock' }),
  // memory
  item(10187001, 'Seagate Storage Expansion Card for Xbox Series X|S', GA, 'internal-storage', 'gaming-accessories/memory', 'Seagate', 179.99, { platforms: ['xbox'], pop: 4, ...capacity([['1TB', 179.99], ['2TB', 299.99, 3]]), specs: { Interface: 'Xbox Velocity Architecture expansion slot', Compatibility: 'Xbox Series X and Xbox Series S' }, kw: 'memory ssd storage' }),
  item(10208330, 'WD_BLACK SN850P NVMe SSD for PS5 Consoles with Heatsink', GA, 'internal-storage', 'gaming-accessories/memory', 'Western Digital', 199.99, { platforms: ['ps5'], pop: 3, ...capacity([['1TB', 119.99], ['2TB', 199.99], ['4TB', 379.99, 2]]), specs: { Interface: 'PCIe Gen4 NVMe M.2 2280', Speed: 'Up to 7,300 MB/s read' }, kw: 'memory ssd storage nvme' }),
  item(10202561, 'Samsung 990 PRO 2TB PCIe 4.0 NVMe SSD with Heatsink', GA, 'internal-storage', 'gaming-accessories/memory', 'Samsung', 189.99, { platforms: ['ps5', 'pc'], pop: 3, was: 219.99, specs: { Capacity: '2TB', Speed: 'Up to 7,450 MB/s read' }, kw: 'memory ssd storage nvme' }),
  item(418740, 'SanDisk microSD Express Card for Nintendo Switch 2', GA, 'internal-storage', 'gaming-accessories/memory', 'SanDisk', 59.99, { platforms: ['switch2'], pop: 4, ...capacity([['128GB', 44.99], ['256GB', 59.99]]), specs: { Format: 'microSD Express', Compatibility: 'Nintendo Switch 2' }, kw: 'memory card micro sd' }),
  item(10191120, 'Seagate Game Drive for PlayStation 2TB External Hard Drive', GA, 'internal-storage', 'gaming-accessories/memory', 'Seagate', 89.99, { platforms: ['ps5', 'ps4'], pop: 2, specs: { Capacity: '2TB', Interface: 'USB 3.2 Gen 1' }, kw: 'memory external hard drive storage' }),
  // cases and stands
  item(418760, 'Nintendo Switch 2 All-In-One Carrying Case', GA, 'carrying-case', 'gaming-accessories/cases-stands', 'Nintendo', 84.99, { platforms: ['switch2'], pop: 3, specs: { Includes: 'Carrying case with screen protector, holds console, dock and accessories' }, kw: 'case travel' }),
  item(418761, 'PowerA Slim Case for Nintendo Switch 2 - Black', GA, 'carrying-case', 'gaming-accessories/cases-stands', 'PowerA', 24.99, { platforms: ['switch2'], pop: 3, specs: { Storage: 'Holds console and 9 game cards', Material: 'Molded hard shell' }, kw: 'case travel' }),
  item(418762, 'RDS Industries Game Traveler Deluxe Travel Case for Nintendo Switch 2', GA, 'carrying-case', 'gaming-accessories/cases-stands', 'RDS Industries', 29.99, { platforms: ['switch2'], pop: 2, specs: { Storage: 'Console, 12 game cards and accessories' }, kw: 'case travel' }),
  item(10195560, 'Sony Vertical Stand for PlayStation 5 Console', GA, 'console-stand', 'gaming-accessories/cases-stands', 'Sony Interactive Entertainment', 29.99, { platforms: ['ps5'], pop: 3, specs: { Compatibility: 'PS5 Slim and PS5 Pro consoles' }, kw: 'stand vertical' }),
  item(10196501, 'Atrix Dual Fan Cooling Stand for PlayStation 5 Slim', GA, 'console-stand', 'gaming-accessories/cases-stands', 'Atrix', 34.99, { platforms: ['ps5'], pop: 2, offers: ['exclusive'], specs: { Features: 'Two cooling fans, two-controller charging, headset hook' }, kw: 'stand cooling fan' }),
  // racing wheels
  item(10188220, 'Logitech G29 Driving Force Racing Wheel for PlayStation 5, PlayStation 4 and PC', GA, 'racing-wheel', 'gaming-accessories/racing-wheels', 'Logitech G', 249.99, { platforms: ['ps5', 'ps4', 'pc'], connection: 'Wired', pop: 4, was: 299.99, specs: { Includes: 'Steering wheel and three-pedal set', Feedback: 'Dual-motor force feedback' }, kw: 'wheel pedals racing' }),
  item(10183680, 'Logitech G923 TRUEFORCE Racing Wheel and Pedals for Xbox Series X|S and PC', GA, 'racing-wheel', 'gaming-accessories/racing-wheels', 'Logitech G', 349.99, { platforms: ['xbox', 'xboxone', 'pc'], connection: 'Wired', pop: 2, specs: { Feedback: 'TRUEFORCE high-definition force feedback', Includes: 'Wheel and progressive brake pedals' }, kw: 'wheel pedals racing' }),
  item(10187711, 'Thrustmaster T248 Racing Wheel and Magnetic Pedals for PlayStation 5, PlayStation 4 and PC', GA, 'racing-wheel', 'gaming-accessories/racing-wheels', 'Thrustmaster', 399.99, { platforms: ['ps5', 'ps4', 'pc'], connection: 'Wired', pop: 2, specs: { Feedback: 'Hybrid force feedback', Display: 'Interactive racing display' }, kw: 'wheel pedals racing' }),
  item(10188221, 'Logitech G Driving Force Shifter', GA, 'racing-wheel', 'gaming-accessories/racing-wheels', 'Logitech G', 59.99, { platforms: ['ps5', 'xbox', 'pc'], connection: 'Wired', pop: 2, specs: { Compatibility: 'Logitech G29 and G923 wheels', Pattern: '6-speed with push-down reverse' }, kw: 'shifter racing' }),
]

const PCG = [
  item(10204420, 'Logitech G502 X PLUS Wireless Gaming Mouse - Black', PC, 'mouse', 'pc-gaming/pc-gaming-accessories', 'Logitech G', 159.99, { platforms: ['pc'], connection: 'Wireless', pop: 3, was: 179.99, specs: { Sensor: 'HERO 25K', Connectivity: 'LIGHTSPEED wireless', Lighting: 'LIGHTSYNC RGB' } }),
  item(10208091, 'Logitech G PRO X SUPERLIGHT 2 Wireless Gaming Mouse - White', PC, 'mouse', 'pc-gaming/pc-gaming-accessories', 'Logitech G', 159.99, { platforms: ['pc'], connection: 'Wireless', pop: 3, specs: { Weight: '60 g', Sensor: 'HERO 2' } }),
  item(10204990, 'Razer DeathAdder V3 Pro Wireless Gaming Mouse - Black', PC, 'mouse', 'pc-gaming/pc-gaming-accessories', 'Razer', 149.99, { platforms: ['pc'], connection: 'Wireless', pop: 2, specs: { Weight: '63 g', Sensor: 'Focus Pro 30K optical' } }),
  item(10206602, 'Razer Huntsman Mini 60% Optical Gaming Keyboard', PC, 'keyboard', 'pc-gaming/pc-gaming-accessories', 'Razer', 119.99, { platforms: ['pc'], connection: 'Wired', pop: 3, was: 119.99, specs: { Layout: '60%', Switches: 'Razer Clicky Optical' } }),
  item(10207731, 'SteelSeries Apex Pro TKL Wireless Gaming Keyboard', PC, 'keyboard', 'pc-gaming/pc-gaming-accessories', 'SteelSeries', 249.99, { platforms: ['pc'], connection: 'Wireless', pop: 2, specs: { Layout: 'Tenkeyless', Switches: 'OmniPoint 2.0 adjustable' } }),
  item(10191560, 'Corsair K70 RGB PRO Mechanical Gaming Keyboard - Cherry MX Red', PC, 'keyboard', 'pc-gaming/pc-gaming-accessories', 'Corsair', 159.99, { platforms: ['pc'], connection: 'Wired', pop: 2, specs: { Layout: 'Full-size', Switches: 'Cherry MX Red' } }),
  item(10177830, 'HyperX Alloy Origins Core Mechanical Gaming Keyboard', PC, 'keyboard', 'pc-gaming/pc-gaming-accessories', 'HyperX', 89.99, { platforms: ['pc'], connection: 'Wired', pop: 3, was: 99.99, specs: { Layout: 'Tenkeyless', Switches: 'HyperX Red linear' } }),
  item(10183301, 'SteelSeries QcK Large Gaming Mouse Pad', PC, 'mouse-pad', 'pc-gaming/pc-gaming-accessories', 'SteelSeries', 14.99, { platforms: ['pc'], pop: 3, specs: { Size: '450 x 400 x 2 mm', Material: 'Micro-woven cloth' }, kw: 'mousepad mat' }),
  item(10183302, 'Razer Gigantus V2 XXL Gaming Mouse Mat', PC, 'mouse-pad', 'pc-gaming/pc-gaming-accessories', 'Razer', 29.99, { platforms: ['pc'], pop: 2, specs: { Size: '940 x 410 x 4 mm', Material: 'Textured micro-weave cloth' }, kw: 'mousepad mat desk' }),
  item(10207140, 'Samsung Odyssey G5 27-in QHD 165Hz Curved Gaming Monitor', PC, 'monitor', 'pc-gaming/monitors', 'Samsung', 249.99, { platforms: ['pc', 'ps5', 'xbox'], pop: 3, was: 299.99, specs: { Size: '27 in', Resolution: '2560 x 1440', 'Refresh Rate': '165Hz', Panel: 'VA, 1000R curve' } }),
  item(10208011, 'LG UltraGear 27-in QHD 180Hz IPS Gaming Monitor', PC, 'monitor', 'pc-gaming/monitors', 'LG', 299.99, { platforms: ['pc', 'ps5', 'xbox'], pop: 2, specs: { Size: '27 in', Resolution: '2560 x 1440', 'Refresh Rate': '180Hz', Panel: 'IPS, 1ms GtG' } }),
  item(10189901, 'AOC 24G2 24-in Full HD 144Hz IPS Gaming Monitor', PC, 'monitor', 'pc-gaming/monitors', 'AOC', 149.99, { platforms: ['pc', 'ps5', 'xbox'], pop: 3, was: 179.99, specs: { Size: '23.8 in', Resolution: '1920 x 1080', 'Refresh Rate': '144Hz' } }),
  item(10175330, 'Logitech C920s HD Pro Webcam', PC, 'webcam', 'pc-gaming/streaming', 'Logitech', 69.99, { platforms: ['pc'], connection: 'Wired', pop: 3, specs: { Resolution: '1080p 30fps', Features: 'Privacy shutter, stereo microphones' } }),
  item(10208421, 'Elgato Facecam MK.2 Premium Full HD Webcam', PC, 'webcam', 'pc-gaming/streaming', 'Elgato', 149.99, { platforms: ['pc'], connection: 'Wired', pop: 2, specs: { Resolution: '1080p 60fps', Features: 'HDR, pan-tilt-zoom' } }),
  item(10187420, 'Elgato Stream Deck MK.2', PC, 'stream-deck', 'pc-gaming/streaming', 'Elgato', 149.99, { platforms: ['pc'], connection: 'Wired', pop: 3, specs: { Keys: '15 customizable LCD keys', Connectivity: 'USB-C' }, kw: 'streaming controller' }),
  item(10209960, 'Elgato HD60 X External Capture Card', PC, 'capture-card', 'pc-gaming/streaming', 'Elgato', 159.99, { platforms: ['pc', 'ps5', 'xbox', 'switch2'], connection: 'Wired', pop: 2, specs: { Capture: '1080p60 HDR10, 4K60 passthrough', Connectivity: 'USB 3.0' }, kw: 'capture streaming' }),
  item(10195101, 'HyperX QuadCast S USB Gaming Microphone - Black', PC, 'microphone', 'pc-gaming/streaming', 'HyperX', 129.99, { platforms: ['pc', 'ps5'], connection: 'Wired', pop: 3, was: 159.99, specs: { Patterns: 'Stereo, omni, cardioid, bidirectional', Lighting: 'RGB' }, kw: 'mic streaming' }),
  item(10197770, 'Elgato Wave:3 Premium USB Condenser Microphone', PC, 'microphone', 'pc-gaming/streaming', 'Elgato', 149.99, { platforms: ['pc'], connection: 'Wired', pop: 2, specs: { Pattern: 'Cardioid', Features: 'Clipguard anti-distortion' }, kw: 'mic streaming' }),
  item(10191400, 'RESPAWN 110 Racing Style Gaming Chair - Black', PC, 'gaming-chair', 'pc-gaming/gaming-chairs', 'RESPAWN', 199.99, { pop: 2, was: 229.99, specs: { Recline: '135 degrees', Features: 'Footrest, lumbar and headrest pillows', Assembly: 'Required' }, kw: 'chair' }),
  item(10191401, 'RESPAWN 110 Pro Racing Style Gaming Chair - Red', PC, 'gaming-chair', 'pc-gaming/gaming-chairs', 'RESPAWN', 249.99, { pop: 1, specs: { Recline: '155 degrees', Features: 'Footrest, 4D armrests', Assembly: 'Required' }, kw: 'chair' }),
  item(10211490, 'ASUS ROG Strix G16 16-in Gaming Laptop Intel Core i7 RTX 4060 16GB RAM 1TB SSD', PC, 'laptop', 'pc-gaming/gaming-laptops', 'ASUS', 1399.99, { platforms: ['pc'], pop: 2, was: 1599.99, specs: { Display: '16-in FHD+ 165Hz', Processor: 'Intel Core i7-13650HX', Graphics: 'NVIDIA GeForce RTX 4060 8GB', Memory: '16GB DDR5', Storage: '1TB SSD' }, kw: 'laptop notebook computer' }),
  item(10211611, 'MSI Katana 15 15.6-in Gaming Laptop Intel Core i7 RTX 4050 16GB RAM 512GB SSD', PC, 'laptop', 'pc-gaming/gaming-laptops', 'MSI', 999.99, { platforms: ['pc'], pop: 2, specs: { Display: '15.6-in FHD 144Hz', Graphics: 'NVIDIA GeForce RTX 4050 6GB', Memory: '16GB DDR5', Storage: '512GB SSD' }, kw: 'laptop notebook computer' }),
]

const CARDS = [
  item(447301, 'Pokemon Trading Card Game: Mega Evolution - Perfect Order Elite Trainer Box', TC, 'tcg-booster', 'toys-games/trading-cards', 'The Pokemon Company', 59.99, { pop: 5, preorder: true, release: '11/14/2026', franchise: 'Pokemon', art: 'card', specs: { Contents: '9 booster packs, 65 card sleeves, 45 Energy cards, dice and condition markers' }, kw: 'pokemon pokémon tcg etb elite trainer box cards' }),
  item(447302, 'Pokemon Trading Card Game: Mega Evolution - Perfect Order Booster Bundle', TC, 'tcg-booster', 'toys-games/trading-cards', 'The Pokemon Company', 32.99, { pop: 4, preorder: true, release: '11/14/2026', franchise: 'Pokemon', art: 'card', specs: { Contents: '6 booster packs' }, kw: 'pokemon pokémon tcg cards' }),
  item(445530, 'Pokemon Trading Card Game: Mega Evolution - Chaos Rising Elite Trainer Box', TC, 'tcg-booster', 'toys-games/trading-cards', 'The Pokemon Company', 59.99, { pop: 5, franchise: 'Pokemon', art: 'card', release: '09/19/2026', offers: ['new'], specs: { Contents: '9 booster packs, 65 card sleeves, 45 Energy cards' }, kw: 'pokemon pokémon tcg etb elite trainer box cards' }),
  item(445531, 'Pokemon Trading Card Game: Mega Evolution - Chaos Rising Booster Pack', TC, 'tcg-booster', 'toys-games/trading-cards', 'The Pokemon Company', 4.99, { pop: 5, franchise: 'Pokemon', art: 'card', release: '09/19/2026', specs: { Contents: '10 cards per pack' }, kw: 'pokemon pokémon tcg cards pack' }),
  item(443300, 'Pokemon Trading Card Game: Mega Evolution - Pitch Black Booster Bundle', TC, 'tcg-booster', 'toys-games/trading-cards', 'The Pokemon Company', 32.99, { pop: 4, franchise: 'Pokemon', art: 'card', release: '07/18/2026', specs: { Contents: '6 booster packs' }, kw: 'pokemon pokémon tcg cards' }),
  item(441910, 'Pokemon Trading Card Game: Mega Evolution - Delta Reign Elite Trainer Box', TC, 'tcg-booster', 'toys-games/trading-cards', 'The Pokemon Company', 59.99, { pop: 4, franchise: 'Pokemon', art: 'card', release: '05/22/2026', stock: 0, specs: { Contents: '9 booster packs, 65 card sleeves, 45 Energy cards' }, kw: 'pokemon pokémon tcg etb elite trainer box cards' }),
  item(446100, 'Pokemon Trading Card Game: 30th Celebration Premium Collection', TC, 'tcg-booster', 'toys-games/trading-cards', 'The Pokemon Company', 49.99, { pop: 5, preorder: true, release: '11/28/2026', franchise: 'Pokemon', art: 'card', specs: { Contents: '8 booster packs, foil promo card, oversize card' }, kw: 'pokemon pokémon tcg 30th anniversary cards' }),
  item(427800, 'Pokemon Trading Card Game: Mega Evolution Elite Trainer Box - Mega Lucario', TC, 'tcg-booster', 'toys-games/trading-cards', 'The Pokemon Company', 59.99, { pop: 4, franchise: 'Pokemon', art: 'card', release: '09/26/2025', specs: { Contents: '9 booster packs, 65 card sleeves, 45 Energy cards' }, kw: 'pokemon pokémon tcg etb cards' }),
  item(430011, 'Pokemon Trading Card Game: Mega Evolution - Phantasmal Flames Booster Bundle', TC, 'tcg-booster', 'toys-games/trading-cards', 'The Pokemon Company', 32.99, { pop: 3, franchise: 'Pokemon', art: 'card', release: '11/14/2025', specs: { Contents: '6 booster packs' }, kw: 'pokemon pokémon tcg cards' }),
  item(10208990, 'Pokemon Trading Card Game: Battle Academy 2024', TC, 'tcg-deck', 'toys-games/trading-cards', 'The Pokemon Company', 24.99, { pop: 3, franchise: 'Pokemon', art: 'card', specs: { Contents: '3 ready-to-play 60-card decks, game board, rulebook' }, kw: 'pokemon pokémon tcg deck beginner' }),
  item(426610, 'One Piece Card Game: Premium Booster Pack', TC, 'tcg-booster', 'toys-games/trading-cards', 'Bandai', 5.99, { pop: 4, franchise: 'One Piece', art: 'card', specs: { Contents: '12 cards per pack' }, kw: 'one piece tcg cards anime' }),
  item(426611, 'One Piece Card Game: Starter Deck - Monkey.D.Luffy', TC, 'tcg-deck', 'toys-games/trading-cards', 'Bandai', 14.99, { pop: 3, franchise: 'One Piece', art: 'card', specs: { Contents: '51-card constructed deck, playmat, rule sheet' }, kw: 'one piece tcg deck anime' }),
  item(422901, 'Magic: The Gathering - Edge of Eternities Play Booster Box', TC, 'tcg-booster', 'toys-games/trading-cards', 'Wizards of the Coast', 164.99, { pop: 3, franchise: 'Magic: The Gathering', art: 'card', specs: { Contents: '30 Play Boosters' }, kw: 'mtg magic cards' }),
  item(427450, "Magic: The Gathering - Marvel's Spider-Man Bundle", TC, 'tcg-booster', 'toys-games/trading-cards', 'Wizards of the Coast', 59.99, { pop: 3, franchise: 'Magic: The Gathering', art: 'card', was: 64.99, specs: { Contents: '9 Play Boosters, 30 basic lands, storage box' }, kw: 'mtg magic cards marvel spiderman spider-man' }),
  item(422950, 'Magic: The Gathering - Final Fantasy Commander Deck', TC, 'tcg-deck', 'toys-games/trading-cards', 'Wizards of the Coast', 69.99, { pop: 3, franchise: 'Magic: The Gathering', art: 'card', specs: { Contents: '100-card ready-to-play Commander deck' }, kw: 'mtg magic cards final fantasy' }),
  item(10210440, "Yu-Gi-Oh! Trading Card Game: 25th Anniversary Tin - Dueling Mirrors", TC, 'tcg-booster', 'toys-games/trading-cards', 'Konami', 24.99, { pop: 3, franchise: 'Yu-Gi-Oh!', art: 'card', specs: { Contents: '3 Mega Packs and 3 Prismatic Ultimate Rare cards' }, kw: 'yugioh yu-gi-oh cards' }),
  item(421301, 'Yu-Gi-Oh! Trading Card Game: Structure Deck - Blue-Eyes White Destiny', TC, 'tcg-deck', 'toys-games/trading-cards', 'Konami', 12.99, { pop: 2, franchise: 'Yu-Gi-Oh!', art: 'card', specs: { Contents: '44-card deck' }, kw: 'yugioh yu-gi-oh cards deck' }),
  item(428005, "Disney Lorcana Trading Card Game: Fabled Illumineer's Trove", TC, 'tcg-booster', 'toys-games/trading-cards', 'Ravensburger', 59.99, { pop: 2, franchise: 'Disney Lorcana', art: 'card', specs: { Contents: '8 booster packs, dice, lore tracker, storage box' }, kw: 'lorcana disney cards' }),
  item(423700, '2025 Topps Series 2 Baseball Value Box', TC, 'sports-card-box', 'toys-games/trading-cards/sports-trading-cards', 'Topps', 24.99, { pop: 3, franchise: 'MLB', art: 'card', specs: { Contents: '7 packs plus 1 exclusive pack' }, kw: 'baseball mlb sports cards' }),
  item(429920, '2025 Panini Prizm Football Blaster Box', TC, 'sports-card-box', 'toys-games/trading-cards/sports-trading-cards', 'Panini', 49.99, { pop: 4, franchise: 'NFL', art: 'card', specs: { Contents: '6 packs, 4 cards per pack' }, kw: 'football nfl sports cards' }),
  item(431600, '2025-26 Panini Donruss Basketball Blaster Box', TC, 'sports-card-box', 'toys-games/trading-cards/sports-trading-cards', 'Panini', 34.99, { pop: 3, franchise: 'NBA', art: 'card', specs: { Contents: '6 packs, 8 cards per pack' }, kw: 'basketball nba sports cards' }),
  item(426700, '2025 Topps Chrome UEFA Club Competitions Value Box', TC, 'sports-card-box', 'toys-games/trading-cards/sports-trading-cards', 'Topps', 29.99, { pop: 2, franchise: 'Soccer', art: 'card', specs: { Contents: '4 packs' }, kw: 'soccer football uefa sports cards' }),
  item(440080, 'Pokemon Charizard ex 199/165 Scarlet & Violet 151 Special Illustration Rare - PSA 10', TC, 'graded-card', 'graded-trading-cards', 'PSA', 499.99, { pop: 2, franchise: 'Pokemon', grade: '10', art: 'card', stock: 1, specs: { Grade: 'PSA 10 Gem Mint', Set: 'Scarlet & Violet 151' }, kw: 'pokemon pokémon graded slab psa' }),
  item(440081, 'Pokemon Umbreon VMAX 215/203 Evolving Skies Alternate Art - PSA 9', TC, 'graded-card', 'graded-trading-cards', 'PSA', 1199.99, { pop: 1, franchise: 'Pokemon', grade: '9', art: 'card', stock: 1, specs: { Grade: 'PSA 9 Mint', Set: 'Evolving Skies' }, kw: 'pokemon pokémon graded slab psa' }),
  item(440082, 'Pokemon Pikachu 160/159 Crown Zenith Galarian Gallery - PSA 10', TC, 'graded-card', 'graded-trading-cards', 'PSA', 129.99, { pop: 2, franchise: 'Pokemon', grade: '10', art: 'card', stock: 1, specs: { Grade: 'PSA 10 Gem Mint', Set: 'Crown Zenith' }, kw: 'pokemon pokémon graded slab psa' }),
  item(10191781, 'Ultra PRO Eclipse Matte Standard Sleeves 100 Count - Jet Black', TC, 'card-sleeves', 'toys-games/trading-cards/supplies', 'Ultra PRO', 11.99, { pop: 3, specs: { Fits: 'Standard 66 x 91 mm', Count: '100' }, kw: 'sleeves supplies' }),
  item(10191782, 'Dragon Shield Matte Standard Size Sleeves 100 Count - Black', TC, 'card-sleeves', 'toys-games/trading-cards/supplies', 'Dragon Shield', 12.99, { pop: 3, specs: { Fits: 'Standard 63.5 x 88 mm', Count: '100' }, kw: 'sleeves supplies' }),
  item(10200880, 'Ultra PRO Pokemon 9-Pocket Zippered PRO-Binder', TC, 'card-binder', 'toys-games/trading-cards/supplies', 'Ultra PRO', 29.99, { pop: 3, franchise: 'Pokemon', specs: { Capacity: '360 cards', Closure: 'Zipper' }, kw: 'binder portfolio supplies pokemon' }),
  item(10191790, 'Ultra PRO 35pt One-Touch Magnetic Card Holder', TC, 'card-sleeves', 'toys-games/trading-cards/supplies', 'Ultra PRO', 3.99, { pop: 3, specs: { Fits: '35pt standard cards', Features: 'UV protection' }, kw: 'magnetic holder supplies' }),
  item(10191795, 'Ultra PRO 3x4 Toploaders 25 Count', TC, 'card-sleeves', 'toys-games/trading-cards/supplies', 'Ultra PRO', 4.99, { pop: 3, specs: { Fits: 'Standard trading cards', Count: '25' }, kw: 'toploader supplies' }),
]

const COLL = [
  item(450693, 'Hasbro Star Wars The Black Series Clone Commander Jesse Premium Electronic Helmet Replica GameStop Exclusive', CO, 'replica', 'collectibles/replicas', 'Hasbro', 149.99, { pop: 3, offers: ['exclusive'], franchise: 'Star Wars', art: 'figure', specs: { Scale: '1:1 wearable', Features: 'Lights and sound effects' }, kw: 'helmet star wars' }),
  item(10196011, 'Hasbro Star Wars The Black Series Darth Vader Premium Electronic Helmet', CO, 'replica', 'collectibles/replicas', 'Hasbro', 149.99, { pop: 2, franchise: 'Star Wars', art: 'figure', was: 169.99, specs: { Scale: '1:1 wearable', Features: 'Breathing sound effects' }, kw: 'helmet star wars' }),
  item(441200, 'Funko Pop! Games: Street Fighter 6 - Ryu Vinyl Figure', CO, 'funko-pop', 'collectibles/funko', 'Funko', 12.99, { pop: 3, franchise: 'Street Fighter', art: 'figure', offers: ['new'], specs: { Height: '4.25 in', Material: 'Vinyl' }, kw: 'funko pop' }),
  item(441201, 'Funko Pop! Games: Street Fighter 6 - Chun-Li Vinyl Figure', CO, 'funko-pop', 'collectibles/funko', 'Funko', 12.99, { pop: 3, franchise: 'Street Fighter', art: 'figure', offers: ['new'], specs: { Height: '4.25 in', Material: 'Vinyl' }, kw: 'funko pop' }),
  item(441202, 'Funko Pop! Games: Street Fighter 6 - Ken Vinyl Figure GameStop Exclusive', CO, 'funko-pop', 'collectibles/funko', 'Funko', 14.99, { pop: 3, franchise: 'Street Fighter', art: 'figure', offers: ['exclusive', 'new'], specs: { Height: '4.25 in', Material: 'Vinyl' }, kw: 'funko pop' }),
  item(10203310, "Funko Pop! Games: Five Nights at Freddy's - Freddy Fazbear Vinyl Figure", CO, 'funko-pop', 'collectibles/funko', 'Funko', 11.99, { pop: 3, franchise: "Five Nights at Freddy's", art: 'figure', specs: { Height: '4 in', Material: 'Vinyl' }, kw: 'funko pop fnaf' }),
  item(10208712, 'Funko Pop! Games: Sonic the Hedgehog - Shadow Vinyl Figure', CO, 'funko-pop', 'collectibles/funko', 'Funko', 12.99, { pop: 3, franchise: 'Sonic the Hedgehog', art: 'figure', specs: { Height: '4 in', Material: 'Vinyl' }, kw: 'funko pop sonic' }),
  item(10210550, 'Funko Pop! Marvel: Deadpool & Wolverine - Wolverine Vinyl Figure', CO, 'funko-pop', 'collectibles/funko', 'Funko', 12.99, { pop: 3, franchise: 'Marvel', art: 'figure', specs: { Height: '4 in', Material: 'Vinyl' }, kw: 'funko pop marvel' }),
  item(10199020, 'Funko Pop! Star Wars: The Mandalorian - Grogu Vinyl Bobblehead', CO, 'funko-pop', 'collectibles/funko', 'Funko', 12.99, { pop: 4, franchise: 'Star Wars', art: 'figure', specs: { Height: '3.5 in', Material: 'Vinyl' }, kw: 'funko pop star wars baby yoda' }),
  item(10211800, 'Funko Pop! Movies: A Minecraft Movie - Steve Vinyl Figure', CO, 'funko-pop', 'collectibles/funko', 'Funko', 12.99, { pop: 3, franchise: 'Minecraft', art: 'figure', was: 12.99, specs: { Height: '4 in', Material: 'Vinyl' }, kw: 'funko pop minecraft' }),
  item(10209930, 'Funko Pop! Animation: Dragon Ball Z - Super Saiyan Goku Vinyl Figure', CO, 'funko-pop', 'collectibles/funko', 'Funko', 12.99, { pop: 3, franchise: 'Dragon Ball', art: 'figure', specs: { Height: '4 in', Material: 'Vinyl' }, kw: 'funko pop dragon ball anime' }),
  item(10210112, 'Funko Pop! Television: Stranger Things - Eleven Vinyl Figure', CO, 'funko-pop', 'collectibles/funko', 'Funko', 12.99, { pop: 2, franchise: 'Stranger Things', art: 'figure', specs: { Height: '4 in', Material: 'Vinyl' }, kw: 'funko pop netflix' }),
  item(443010, 'Hasbro Marvel Legends Series Wolverine 6-in Action Figure', CO, 'figure', 'collectibles/figures', 'Hasbro', 24.99, { pop: 3, franchise: 'Marvel', art: 'figure', specs: { Scale: '6 in', Includes: 'Figure and accessories' }, kw: 'action figure marvel x-men' }),
  item(10207301, 'McFarlane Toys DC Multiverse Batman 7-in Action Figure', CO, 'figure', 'collectibles/figures', 'McFarlane Toys', 24.99, { pop: 2, franchise: 'DC', art: 'figure', was: 24.99, specs: { Scale: '7 in', Articulation: '22 points' }, kw: 'action figure dc' }),
  item(10202230, 'Bandai Tamashii Nations S.H.Figuarts Dragon Ball Z Super Saiyan Son Goku Legendary Super Saiyan Action Figure', CO, 'figure', 'collectibles/figures', 'Bandai', 69.99, { pop: 2, franchise: 'Dragon Ball', art: 'figure', specs: { Scale: '5.5 in', Includes: 'Interchangeable hands and faces' }, kw: 'action figure anime dragon ball' }),
  item(441205, 'Jada Toys Street Fighter II Ryu 6-in Action Figure', CO, 'figure', 'collectibles/figures', 'Jada Toys', 24.99, { pop: 2, franchise: 'Street Fighter', art: 'figure', specs: { Scale: '6 in', Includes: 'Hadouken effect and alternate hands' }, kw: 'action figure' }),
  item(10208720, 'Banpresto One Piece DXF The Grandline Series Monkey D. Luffy Figure', CO, 'figure', 'collectibles/figures', 'Banpresto', 29.99, { pop: 3, franchise: 'One Piece', art: 'figure', specs: { Height: '6.3 in', Material: 'PVC' }, kw: 'anime figure one piece' }),
  item(10204051, 'Good Smile Company Nendoroid Hatsune Miku Figure', CO, 'figure', 'collectibles/figures', 'Good Smile Company', 54.99, { pop: 2, franchise: 'Hatsune Miku', art: 'figure', specs: { Height: '3.9 in', Includes: 'Face plates and accessories' }, kw: 'anime figure nendoroid' }),
  item(10200600, 'First 4 Figures Sonic the Hedgehog Super Sonic PVC Statue', CO, 'statue', 'collectibles/statues', 'First 4 Figures', 89.99, { pop: 2, franchise: 'Sonic the Hedgehog', art: 'figure', specs: { Height: '9 in', Material: 'PVC' }, kw: 'statue sonic' }),
  item(10206540, 'Iron Studios Marvel Spider-Man 1/10 Art Scale Statue', CO, 'statue', 'collectibles/statues', 'Iron Studios', 179.99, { pop: 1, franchise: 'Marvel', art: 'figure', specs: { Scale: '1:10', Material: 'Polystone' }, kw: 'statue marvel spiderman' }),
  item(10197420, 'The Legend of Zelda Hylian Shield Wall Replica', CO, 'replica', 'collectibles/replicas', 'Numskull', 79.99, { pop: 2, franchise: 'The Legend of Zelda', art: 'figure', specs: { Size: '24 in', Material: 'Polyresin' }, kw: 'zelda replica shield' }),
  item(10210001, "Pokemon Collector's Box: Kanto Region", CO, 'collectors-box', 'collectibles/collectors-boxes', 'The Pokemon Company', 34.99, { pop: 2, franchise: 'Pokemon', art: 'figure', offers: ['exclusive'], specs: { Contents: 'Exclusive figure, pin, sticker sheet and art print' }, kw: 'pokemon pokémon collectors box mystery' }),
]

const TOYS = [
  item(424700, 'LEGO Super Mario Mario Kart - Mario & Standard Kart 72037', TG, 'building-set', 'toys-games/building-construction-sets', 'LEGO', 169.99, { pop: 4, franchise: 'Super Mario', specs: { Pieces: '1,972', Age: '18+' }, kw: 'lego mario kart' }),
  item(10208401, 'LEGO Star Wars Millennium Falcon 75375', TG, 'building-set', 'toys-games/building-construction-sets', 'LEGO', 84.99, { pop: 3, franchise: 'Star Wars', specs: { Pieces: '921', Age: '18+' }, kw: 'lego star wars' }),
  item(10205550, 'LEGO Icons PAC-MAN Arcade 10323', TG, 'building-set', 'toys-games/building-construction-sets', 'LEGO', 269.99, { pop: 2, offers: ['retro'], was: 269.99, specs: { Pieces: '2,651', Age: '18+' }, kw: 'lego pacman pac-man arcade' }),
  item(10210630, "LEGO Animal Crossing Nook's Cranny & Rosie's House 77050", TG, 'building-set', 'toys-games/building-construction-sets', 'LEGO', 74.99, { pop: 3, franchise: 'Animal Crossing', specs: { Pieces: '535', Age: '7+' }, kw: 'lego animal crossing nintendo' }),
  item(427010, 'LEGO The Legend of Zelda Great Deku Tree 2-in-1 77092', TG, 'building-set', 'toys-games/building-construction-sets', 'LEGO', 299.99, { pop: 3, franchise: 'The Legend of Zelda', specs: { Pieces: '2,500', Age: '18+' }, kw: 'lego zelda nintendo' }),
  item(10202880, 'CATAN Board Game (Base Game)', TG, 'board-game', 'toys-games/board-games', 'CATAN Studio', 54.99, { pop: 3, specs: { Players: '3-4', Playtime: '60-120 minutes', Age: '10+' }, kw: 'settlers of catan board game' }),
  item(10202881, 'Ticket to Ride Board Game', TG, 'board-game', 'toys-games/board-games', 'Days of Wonder', 54.99, { pop: 2, was: 54.99, specs: { Players: '2-5', Playtime: '30-60 minutes', Age: '8+' }, kw: 'board game trains' }),
  item(10203770, 'Monopoly: The Legend of Zelda Edition', TG, 'board-game', 'toys-games/board-games', 'USAopoly', 44.99, { pop: 2, franchise: 'The Legend of Zelda', specs: { Players: '2-6', Age: '8+' }, kw: 'monopoly board game zelda' }),
  item(10196120, 'Exploding Kittens Card Game', TG, 'card-game', 'toys-games/card-games', 'Exploding Kittens', 19.99, { pop: 3, specs: { Players: '2-5', Playtime: '15 minutes', Age: '7+' }, kw: 'card game party' }),
  item(10209640, "UNO Show 'em No Mercy Card Game", TG, 'card-game', 'toys-games/card-games', 'Mattel', 12.99, { pop: 4, specs: { Players: '2-6', Cards: '168', Age: '7+' }, kw: 'uno card game' }),
  item(10196981, 'The Legend of Zelda Breath of the Wild 1000-Piece Puzzle', TG, 'puzzle', 'toys-games/puzzles', 'USAopoly', 19.99, { pop: 2, franchise: 'The Legend of Zelda', specs: { Pieces: '1,000', Size: '19 x 27 in' }, kw: 'jigsaw puzzle zelda' }),
  item(10205330, 'Super Mario 1000-Piece Jigsaw Puzzle', TG, 'puzzle', 'toys-games/puzzles', 'USAopoly', 19.99, { pop: 2, franchise: 'Super Mario', was: 22.99, specs: { Pieces: '1,000' }, kw: 'jigsaw puzzle mario' }),
  item(10208110, 'Nerf Elite 2.0 Commander RD-6 Blaster', TG, 'blaster', 'toys-games/nerf', 'Hasbro', 19.99, { pop: 2, specs: { Includes: 'Blaster and 12 Nerf Elite darts', Age: '8+' }, kw: 'nerf blaster' }),
  item(10208111, 'Nerf Fortnite Pump SG Blaster', TG, 'blaster', 'toys-games/nerf', 'Hasbro', 29.99, { pop: 2, franchise: 'Fortnite', specs: { Includes: 'Blaster and 4 Mega darts', Age: '8+' }, kw: 'nerf blaster fortnite' }),
  item(10209420, 'Pokemon 8-in Pikachu Plush', TG, 'plush', 'toys-games/stuffed-animals-plush', 'Jazwares', 14.99, { pop: 4, franchise: 'Pokemon', specs: { Height: '8 in', Material: 'Polyester' }, kw: 'pokemon pokémon plush stuffed animal pikachu' }),
  item(10209421, 'Pokemon 12-in Snorlax Plush', TG, 'plush', 'toys-games/stuffed-animals-plush', 'Jazwares', 24.99, { pop: 3, franchise: 'Pokemon', specs: { Height: '12 in', Material: 'Polyester' }, kw: 'pokemon pokémon plush stuffed animal' }),
  item(10209990, 'Squishmallows 12-in Cam the Cat Plush', TG, 'plush', 'toys-games/stuffed-animals-plush', 'Squishmallows', 14.99, { pop: 3, specs: { Height: '12 in', Material: 'Polyester spandex' }, kw: 'squishmallow plush stuffed animal' }),
  item(10204301, 'Sonic the Hedgehog 13-in Plush', TG, 'plush', 'toys-games/stuffed-animals-plush', 'Jakks Pacific', 19.99, { pop: 3, franchise: 'Sonic the Hedgehog', specs: { Height: '13 in' }, kw: 'sonic plush stuffed animal' }),
  item(10210870, "Five Nights at Freddy's Freddy Fazbear Plush", TG, 'plush', 'toys-games/stuffed-animals-plush', 'Funko', 14.99, { pop: 3, franchise: "Five Nights at Freddy's", specs: { Height: '7 in' }, kw: 'fnaf plush stuffed animal' }),
  item(10208890, 'Pokemon Battle Figure Multi-Pack', TG, 'action-figure', 'toys-games/playsets', 'Jazwares', 24.99, { pop: 2, franchise: 'Pokemon', art: 'figure', specs: { Includes: '8 figures, 2 in each' }, kw: 'pokemon pokémon figures toy' }),
  item(10209012, 'Pokemon Mystery Blind Box Figure', TG, 'blind-box', 'toys-games/blind-bags', 'Jazwares', 7.99, { pop: 3, franchise: 'Pokemon', art: 'figure', specs: { Includes: 'One random 2-in figure' }, kw: 'pokemon pokémon blind bag mystery' }),
]

const CLOTHING = [
  item(10209700, 'Pokemon Pikachu Face Unisex Hoodie', 'clothing', 'hoodie', 'clothing/hoodies-sweatshirts', 'Pokemon', 49.99, { pop: 3, franchise: 'Pokemon', ...sizes(49.99, 52.99), specs: { Material: '60% cotton, 40% polyester', Fit: 'Unisex' }, kw: 'pokemon pokémon hoodie sweatshirt apparel' }),
  item(10209701, 'Super Mario Retro Logo Unisex T-Shirt', 'clothing', 'tshirt', 'clothing/t-shirts', 'Nintendo', 24.99, { pop: 3, franchise: 'Super Mario', ...sizes(24.99, 26.99), specs: { Material: '100% cotton', Fit: 'Unisex' }, kw: 'mario tee t-shirt graphic apparel' }),
  item(10209702, 'PlayStation Shapes Unisex T-Shirt - Black', 'clothing', 'tshirt', 'clothing/t-shirts', 'PlayStation', 22.99, { pop: 3, ...sizes(22.99, 24.99), specs: { Material: '100% cotton', Fit: 'Unisex' }, kw: 'playstation tee t-shirt graphic apparel' }),
  item(10209703, 'Xbox Logo Unisex Hoodie - Black', 'clothing', 'hoodie', 'clothing/hoodies-sweatshirts', 'Xbox', 49.99, { pop: 2, ...sizes(49.99, 52.99), specs: { Material: '60% cotton, 40% polyester' }, kw: 'xbox hoodie apparel' }),
  item(10209704, 'Halo Master Chief Unisex T-Shirt', 'clothing', 'tshirt', 'clothing/t-shirts', 'Halo', 24.99, { pop: 2, franchise: 'Halo', ...sizes(24.99, 26.99), specs: { Material: '100% cotton' }, kw: 'halo tee t-shirt graphic apparel' }),
  item(441210, 'Street Fighter Ryu Hadouken Unisex T-Shirt GameStop Exclusive', 'clothing', 'tshirt', 'clothing/t-shirts', 'Street Fighter', 24.99, { pop: 2, franchise: 'Street Fighter', offers: ['exclusive'], ...sizes(24.99, 26.99), specs: { Material: '100% cotton' }, kw: 'tee t-shirt graphic apparel' }),
  item(10209705, "Five Nights at Freddy's Security Breach Unisex T-Shirt", 'clothing', 'tshirt', 'clothing/t-shirts', "Five Nights at Freddy's", 22.99, { pop: 2, franchise: "Five Nights at Freddy's", was: 24.99, ...sizes(22.99, 24.99), specs: { Material: '100% cotton' }, kw: 'fnaf tee t-shirt graphic apparel' }),
  item(10209710, 'The Legend of Zelda Hylian Crest Snapback Hat', 'clothing', 'hat', 'clothing/accessories', 'Nintendo', 24.99, { pop: 2, franchise: 'The Legend of Zelda', specs: { Fit: 'Adjustable snapback', Material: 'Acrylic and wool blend' }, kw: 'zelda hat cap apparel' }),
]

const HOME = [
  item(10196700, 'Paladone PlayStation Icons Light', 'home', 'lamp', 'home/lighting', 'Paladone', 24.99, { pop: 3, specs: { Modes: 'Music reactive, phase, static', Power: 'USB or 3 x AAA batteries' }, kw: 'lamp light lighting playstation' }),
  item(10196701, 'Paladone Xbox Icons Light', 'home', 'lamp', 'home/lighting', 'Paladone', 24.99, { pop: 2, specs: { Modes: 'Music reactive, phase, static', Power: 'USB or batteries' }, kw: 'lamp light lighting xbox' }),
  item(10196702, 'Paladone Super Mario Question Block Light', 'home', 'lamp', 'home/lighting', 'Paladone', 29.99, { pop: 3, franchise: 'Super Mario', was: 29.99, specs: { Features: 'Plays coin sound when tapped', Power: 'USB or batteries' }, kw: 'lamp light lighting mario' }),
  item(10196703, 'Minecraft Torch Light', 'home', 'lamp', 'home/lighting', 'Thinkgeek', 19.99, { pop: 2, franchise: 'Minecraft', specs: { Height: '10 in', Mount: 'Freestanding or wall mount' }, kw: 'lamp light lighting minecraft' }),
  item(10196710, 'Pokemon Pikachu 3D Sculpted Ceramic Mug 20 oz', 'home', 'mug', 'home/kitchen', 'Silver Buffalo', 19.99, { pop: 3, franchise: 'Pokemon', specs: { Capacity: '20 oz', Material: 'Ceramic' }, kw: 'mug cup pokemon pokémon' }),
  item(10196711, 'Xbox Controller Ceramic Mug 16 oz', 'home', 'mug', 'home/kitchen', 'Paladone', 14.99, { pop: 2, specs: { Capacity: '16 oz', Material: 'Ceramic' }, kw: 'mug cup xbox' }),
  item(10196720, 'Pokemon Poke Ball 50 x 60 in Throw Blanket', 'home', 'blanket', 'home/bedding', 'Pokemon', 29.99, { pop: 2, franchise: 'Pokemon', specs: { Size: '50 x 60 in', Material: 'Polyester fleece' }, kw: 'blanket throw pokemon pokémon' }),
  item(10196730, 'Super Mario Kart Poster 22 x 34 in', 'home', 'poster', 'home/wall-art', 'Trends International', 9.99, { pop: 2, franchise: 'Super Mario', specs: { Size: '22.375 x 34 in' }, kw: 'poster wall art mario kart' }),
]

const ELECTRONICS = [
  item(10210800, 'Apple AirPods Pro 2 with MagSafe USB-C Charging Case', 'electronics', 'earbuds', 'electronics/headphones', 'Apple', 249.99, { pop: 3, category: 'electronics', was: 249.99, specs: { Features: 'Active Noise Cancellation, Adaptive Audio', Battery: 'Up to 6 hours (30 with case)' }, kw: 'airpods earbuds headphones' }),
  item(10208150, 'JBL Flip 6 Portable Waterproof Bluetooth Speaker - Black', 'electronics', 'speaker', 'electronics/speakers', 'JBL', 129.99, { pop: 2, specs: { Battery: 'Up to 12 hours', Rating: 'IP67' }, kw: 'speaker bluetooth' }),
  item(10208820, 'Apple iPhone 14 128GB Unlocked - Midnight (Pre-Owned)', 'electronics', 'phone', 'electronics/pre-owned-tech', 'Apple', 329.99, { pop: 2, condition: 'Pre-Owned', stock: 3, specs: { Storage: '128GB', Carrier: 'Unlocked', Condition: 'Pre-Owned, tested' }, kw: 'iphone phone cell smartphone' }),
  item(10208821, 'Samsung Galaxy S23 128GB Unlocked - Phantom Black (Pre-Owned)', 'electronics', 'phone', 'electronics/pre-owned-tech', 'Samsung', 299.99, { pop: 2, condition: 'Pre-Owned', stock: 3, specs: { Storage: '128GB', Carrier: 'Unlocked', Condition: 'Pre-Owned, tested' }, kw: 'galaxy phone cell smartphone android' }),
  item(10208822, 'Apple iPad (9th Generation) 64GB Wi-Fi - Space Gray (Pre-Owned)', 'electronics', 'tablet', 'electronics/pre-owned-tech', 'Apple', 199.99, { pop: 2, condition: 'Pre-Owned', stock: 2, specs: { Display: '10.2-in Retina', Storage: '64GB', Condition: 'Pre-Owned, tested' }, kw: 'ipad tablet' }),
  item(10210300, 'Anker 737 Power Bank 24,000mAh 140W', 'electronics', 'power-bank', 'electronics/power', 'Anker', 89.99, { pop: 2, was: 109.99, specs: { Capacity: '24,000mAh', Output: '140W USB-C' }, kw: 'battery charger portable power bank' }),
]

for (const p of [...ELECTRONICS]) p.category = 'electronics'

// Best-selling order for default "Best Matches" lists.
export const SHELF = [...GAMES, ...CONSOLES, ...ACC, ...PCG, ...CARDS, ...COLL, ...TOYS, ...CLOTHING, ...HOME, ...ELECTRONICS]
  .sort((a, b) => (b.pop - a.pop) || (b.reviews - a.reviews) || a.id.localeCompare(b.id))

const seen = new Set()
for (const p of SHELF) { if (seen.has(p.id)) throw new Error(`Duplicate GameStop shelf item ${p.id}`); seen.add(p.id) }
