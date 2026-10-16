// Store finder data for the reference-mode site: Sephora stores grouped by metro area, the way
// sephora.com/happening/stores/sephora-near-me lists the stores nearest a city or ZIP code.
// Each store: [name, street, city, state, zip, kind]; kind 'mall' or 'street' sets the hours.
const METROS = {
  'sf-bay': { label: 'San Francisco Bay Area', match: /^9(4|50|51)|san francisco|burlingame|san mateo|oakland|palo alto|san jose|daly city|bay area/i, stores: [
    ['Sephora Burlingame', '1218 Burlingame Ave', 'Burlingame', 'CA', '94010', 'street'],
    ['Sephora Hillsdale Shopping Center', '60 31st Ave', 'San Mateo', 'CA', '94403', 'mall'],
    ['Sephora Serramonte Center', '3 Serramonte Center', 'Daly City', 'CA', '94015', 'mall'],
    ['Sephora Stonestown Galleria', '3251 20th Ave', 'San Francisco', 'CA', '94132', 'mall'],
    ['Sephora Union Square', '33 Powell St', 'San Francisco', 'CA', '94102', 'street'],
    ['Sephora Stanford Shopping Center', '660 Stanford Shopping Center', 'Palo Alto', 'CA', '94304', 'mall'],
  ] },
  la: { label: 'Los Angeles', match: /^9[0-3]|los angeles|santa monica|glendale|pasadena|beverly hills|hollywood/i, stores: [
    ['Sephora The Grove', '189 The Grove Dr', 'Los Angeles', 'CA', '90036', 'mall'],
    ['Sephora Beverly Center', '8500 Beverly Blvd', 'Los Angeles', 'CA', '90048', 'mall'],
    ['Sephora Century City', '10250 Santa Monica Blvd', 'Los Angeles', 'CA', '90067', 'mall'],
    ['Sephora Santa Monica Place', '395 Santa Monica Pl', 'Santa Monica', 'CA', '90401', 'mall'],
    ['Sephora Glendale Galleria', '2148 Glendale Galleria', 'Glendale', 'CA', '91210', 'mall'],
  ] },
  seattle: { label: 'Seattle', match: /^9[89]|seattle|bellevue|tacoma|washington state/i, stores: [
    ['Sephora Pacific Place', '600 Pine St', 'Seattle', 'WA', '98101', 'mall'],
    ['Sephora University Village', '2623 NE University Village St', 'Seattle', 'WA', '98105', 'mall'],
    ['Sephora Bellevue Square', '575 Bellevue Square', 'Bellevue', 'WA', '98004', 'mall'],
    ['Sephora Westfield Southcenter', '2800 Southcenter Mall', 'Tukwila', 'WA', '98188', 'mall'],
  ] },
  portland: { label: 'Portland', match: /^97|portland|oregon/i, stores: [
    ['Sephora Pioneer Place', '700 SW 5th Ave', 'Portland', 'OR', '97204', 'mall'],
    ['Sephora Washington Square', '9585 SW Washington Square Rd', 'Tigard', 'OR', '97223', 'mall'],
    ['Sephora Bridgeport Village', '7455 SW Bridgeport Rd', 'Tigard', 'OR', '97224', 'mall'],
  ] },
  vegas: { label: 'Las Vegas', match: /^89|las vegas|nevada/i, stores: [
    ['Sephora Fashion Show', '3200 Las Vegas Blvd S', 'Las Vegas', 'NV', '89109', 'mall'],
    ['Sephora The Forum Shops at Caesars', '3500 Las Vegas Blvd S', 'Las Vegas', 'NV', '89109', 'mall'],
    ['Sephora Downtown Summerlin', '1980 Festival Plaza Dr', 'Las Vegas', 'NV', '89135', 'mall'],
  ] },
  phoenix: { label: 'Phoenix', match: /^8[56]|phoenix|scottsdale|tempe|arizona/i, stores: [
    ['Sephora Scottsdale Fashion Square', '7014 E Camelback Rd', 'Scottsdale', 'AZ', '85251', 'mall'],
    ['Sephora Biltmore Fashion Park', '2502 E Camelback Rd', 'Phoenix', 'AZ', '85016', 'mall'],
    ['Sephora Chandler Fashion Center', '3111 W Chandler Blvd', 'Chandler', 'AZ', '85226', 'mall'],
  ] },
  denver: { label: 'Denver', match: /^8[0-4]|^8[7-8]|denver|boulder|colorado|salt lake/i, stores: [
    ['Sephora Cherry Creek', '3000 E 1st Ave', 'Denver', 'CO', '80206', 'mall'],
    ['Sephora Park Meadows', '8401 Park Meadows Center Dr', 'Lone Tree', 'CO', '80124', 'mall'],
    ['Sephora FlatIron Crossing', '1 W FlatIron Crossing Dr', 'Broomfield', 'CO', '80021', 'mall'],
  ] },
  dallas: { label: 'Dallas', match: /^7[2-6]|^79|dallas|fort worth|plano|oklahoma/i, stores: [
    ['Sephora NorthPark Center', '8687 N Central Expy', 'Dallas', 'TX', '75225', 'mall'],
    ['Sephora Galleria Dallas', '13350 Dallas Pkwy', 'Dallas', 'TX', '75240', 'mall'],
    ['Sephora The Shops at Willow Bend', '6121 W Park Blvd', 'Plano', 'TX', '75093', 'mall'],
    ['Sephora Stonebriar Centre', '2601 Preston Rd', 'Frisco', 'TX', '75034', 'mall'],
  ] },
  houston: { label: 'Houston', match: /^7[078]|houston|austin|san antonio|louisiana|new orleans/i, stores: [
    ['Sephora The Galleria', '5085 Westheimer Rd', 'Houston', 'TX', '77056', 'mall'],
    ['Sephora Memorial City', '303 Memorial City Mall', 'Houston', 'TX', '77024', 'mall'],
    ['Sephora The Woodlands Mall', '1201 Lake Woodlands Dr', 'The Woodlands', 'TX', '77380', 'mall'],
  ] },
  chicago: { label: 'Chicago', match: /^(4|5|6)|chicago|illinois|evanston|oak brook|skokie|detroit|minneapolis|st\.? louis/i, stores: [
    ['Sephora Michigan Avenue', '605 N Michigan Ave', 'Chicago', 'IL', '60611', 'street'],
    ['Sephora State Street', '141 N State St', 'Chicago', 'IL', '60602', 'street'],
    ['Sephora Old Orchard', '4999 Old Orchard Center', 'Skokie', 'IL', '60077', 'mall'],
    ['Sephora Oakbrook Center', '100 Oakbrook Center', 'Oak Brook', 'IL', '60523', 'mall'],
    ['Sephora Woodfield Mall', '5 Woodfield Mall', 'Schaumburg', 'IL', '60173', 'mall'],
  ] },
  atlanta: { label: 'Atlanta', match: /^3[0156789]|atlanta|georgia|nashville|charlotte|carolina/i, stores: [
    ['Sephora Lenox Square', '3393 Peachtree Rd NE', 'Atlanta', 'GA', '30326', 'mall'],
    ['Sephora Phipps Plaza', '3500 Peachtree Rd NE', 'Atlanta', 'GA', '30326', 'mall'],
    ['Sephora Perimeter Mall', '4400 Ashford Dunwoody Rd', 'Atlanta', 'GA', '30346', 'mall'],
    ['Sephora Cumberland Mall', '2860 Cumberland Mall', 'Atlanta', 'GA', '30339', 'mall'],
  ] },
  miami: { label: 'Miami', match: /^3[234]|miami|florida|orlando|tampa|fort lauderdale/i, stores: [
    ['Sephora Aventura Mall', '19501 Biscayne Blvd', 'Aventura', 'FL', '33180', 'mall'],
    ['Sephora Dadeland Mall', '7535 N Kendall Dr', 'Miami', 'FL', '33156', 'mall'],
    ['Sephora Lincoln Road', '721 Lincoln Rd', 'Miami Beach', 'FL', '33139', 'street'],
    ['Sephora Brickell City Centre', '701 S Miami Ave', 'Miami', 'FL', '33131', 'mall'],
  ] },
  dc: { label: 'Washington, DC', match: /^2|washington|\bdc\b|arlington|bethesda|virginia|maryland|baltimore/i, stores: [
    ['Sephora Georgetown', '3065 M St NW', 'Washington', 'DC', '20007', 'street'],
    ['Sephora Pentagon City', '1100 S Hayes St', 'Arlington', 'VA', '22202', 'mall'],
    ['Sephora Tysons Corner Center', '1961 Chain Bridge Rd', 'Tysons', 'VA', '22102', 'mall'],
    ['Sephora Westfield Montgomery', '7101 Democracy Blvd', 'Bethesda', 'MD', '20817', 'mall'],
  ] },
  nyc: { label: 'New York City', match: /^1[0-4]|^07|new york|nyc|brooklyn|manhattan|queens|jersey/i, stores: [
    ['Sephora Times Square', '1500 Broadway', 'New York', 'NY', '10036', 'street'],
    ['Sephora 34th Street', '112 W 34th St', 'New York', 'NY', '10120', 'street'],
    ['Sephora Flatiron', '119 5th Ave', 'New York', 'NY', '10003', 'street'],
    ['Sephora Atlantic Terminal', '139 Flatbush Ave', 'Brooklyn', 'NY', '11217', 'mall'],
    ['Sephora Roosevelt Field', '630 Old Country Rd', 'Garden City', 'NY', '11530', 'mall'],
  ] },
  boston: { label: 'Boston', match: /^0[1-6]|^0[89]|boston|cambridge|massachusetts|connecticut|providence/i, stores: [
    ['Sephora Prudential Center', '800 Boylston St', 'Boston', 'MA', '02199', 'mall'],
    ['Sephora CambridgeSide', '100 CambridgeSide Pl', 'Cambridge', 'MA', '02141', 'mall'],
    ['Sephora Burlington Mall', '75 Middlesex Tpke', 'Burlington', 'MA', '01803', 'mall'],
    ['Sephora Natick Mall', '1245 Worcester St', 'Natick', 'MA', '01760', 'mall'],
  ] },
}
const HOURS = {
  mall: [['Mon–Sat', '10:00 AM–9:00 PM'], ['Sun', '11:00 AM–7:00 PM']],
  street: [['Mon–Sat', '9:00 AM–10:00 PM'], ['Sun', '10:00 AM–9:00 PM']],
}
const hash = text => { let h = 2166136261; for (const c of text) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }

// Order matters: the more specific ZIP prefixes come first.
const ORDER = ['sf-bay', 'la', 'seattle', 'portland', 'vegas', 'phoenix', 'denver', 'houston', 'dallas', 'miami', 'atlanta', 'dc', 'nyc', 'boston', 'chicago']
export const DEFAULT_METRO = 'sf-bay'
export function storesNear(location) {
  const q = String(location || '').trim()
  const key = (q && ORDER.find(k => METROS[k].match.test(q))) || DEFAULT_METRO
  const metro = METROS[key]
  // Distances grow down the list and shift a little with what was typed, like a real radius search.
  let miles = 0.6 + (hash(q || key) % 30) / 10
  const stores = metro.stores.map(([name, street, city, state, zip, kind], i) => {
    if (i) miles += 1.4 + (hash(name + q) % 55) / 10
    return { name, street, city, state, zip, hours: HOURS[kind], miles: Math.round(miles * 10) / 10 }
  })
  return { key, label: metro.label, stores }
}
