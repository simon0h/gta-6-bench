// Line icons for Chewy's round category tiles ("Shop all pets, friends & more",
// "Explore popular categories" and the circles on /b/ landing pages). Each tile
// gets a drawing of its animal or product type; anything unmatched keeps the paw.
import { paw } from './reference-layout.js'

const D = {
  dog: '<path d="M20 22c-6-2-11 3-10 11 1 5 4 7 7 6M44 22c6-2 11 3 10 11-1 5-4 7-7 6"/><path d="M20 22c3-4 7-6 12-6s9 2 12 6c3 5 4 12 2 18-2 8-8 12-14 12s-12-4-14-12c-2-6-1-13 2-18Z"/><circle cx="26" cy="32" r="2" class="f"/><circle cx="38" cy="32" r="2" class="f"/><ellipse cx="32" cy="41" rx="4" ry="3" class="f"/><path d="M32 44v3M28 49c2 1 6 1 8 0"/>',
  cat: '<path d="M16 12 28 21q4-1 8 0l12-9-2 19c4 5 4 13 0 18-4 5-9 7-14 7s-10-2-14-7c-4-5-4-13 0-18Z"/><ellipse cx="25" cy="37" rx="2" ry="3" class="f"/><ellipse cx="39" cy="37" rx="2" ry="3" class="f"/><path d="M30 44h4l-2 2.5Z" class="f"/><path d="M6 43l13 2M7 50l12-2M58 43l-13 2M57 50l-12-2"/>',
  horse: '<path d="M38 8l-3 8c-9 3-16 10-20 18l-6 10c-2 4 0 8 4 8s8-2 10-6l7-3c3 6 3 12 1 17h20c3-12 3-25-2-36-2-5-5-10-8-12Z"/><circle cx="31" cy="27" r="2" class="f"/><path d="M42 12c5 6 8 14 8 24M13 50h2"/>',
  bird: '<path d="M12 46c0-14 10-24 22-24 8 0 14 5 15 11l7 2-7 3c-2 9-10 15-20 15h-7l-9 7 3-9c-2-1-4-3-4-5Z"/><circle cx="41" cy="30" r="2" class="f"/><path d="M22 42c7 0 13-4 15-10M28 52v6M34 52v6M20 58h22"/>',
  fish: '<path d="M8 32c8-12 20-16 32-12 6 2 10 6 12 12-2 6-6 10-12 12-12 4-24 0-32-12Z"/><path d="M52 32l8-9v18Z"/><circle cx="18" cy="30" r="2" class="f"/><path d="M28 22c4 4 4 16 0 20"/>',
  turtle: '<path d="M12 42c0-13 9-21 19-21s19 8 19 21Z"/><path d="M8 42h46M22 42l4-12h10l4 12"/><path d="M50 37c3-3 9-2 9 2s-5 5-9 3M17 42l-3 8M27 42v8M37 42v8M46 42l3 8"/>',
  snake: '<path d="M10 52c4-6 14-6 22-3s16 2 16-5-12-8-16-12-2-12 6-13c6-1 10 2 10 5"/><path d="M48 24l6 1M54 25l3-2M54 25l3 2"/><circle cx="45" cy="21" r="1.6" class="f"/>',
  hen: '<path d="M16 44c0-10 7-16 14-18 0-6 3-10 8-10 4 0 6 3 6 6l6 2-6 2c0 4-2 6-2 8 8 2 12 8 12 14 0 7-8 11-19 11S16 53 16 44Z"/><path d="M36 15c1-3 4-3 5 0 1-3 4-2 4 1"/><circle cx="41" cy="22" r="1.8" class="f"/><path d="M27 44c5 5 13 5 17 0M30 58v5M38 58v5"/>',
  cow: '<path d="M22 18h20c2 0 4 2 4 4l-2 16H20l-2-16c0-2 2-4 4-4Z"/><rect x="20" y="36" width="24" height="18" rx="9"/><circle cx="28" cy="45" r="1.8" class="f"/><circle cx="36" cy="45" r="1.8" class="f"/><path d="M22 18c-5 0-8-4-8-9M42 18c5 0 8-4 8-9M19 23l-10 2 2 5 9-2M45 23l10 2-2 5-9-2"/><circle cx="27" cy="28" r="2" class="f"/><circle cx="37" cy="28" r="2" class="f"/>',
  rabbit: '<path d="M26 27c-4-8-5-19-1-21 5 0 7 11 5 20M38 26c-2-9 0-20 5-20 4 2 3 13-1 21"/><circle cx="32" cy="41" r="15"/><circle cx="26" cy="38" r="1.8" class="f"/><circle cx="38" cy="38" r="1.8" class="f"/><path d="M30 45h4l-2 2.5Z" class="f"/><path d="M32 48v2M28 51c2 1 6 1 8 0"/>',
  heart: '<path d="M32 52S10 38 10 24c0-7 5-12 11-12 5 0 9 3 11 7 2-4 6-7 11-7 6 0 11 5 11 12 0 14-22 28-22 28Z"/>',
  bowl: '<circle cx="22" cy="27" r="4"/><circle cx="32" cy="23" r="4"/><circle cx="42" cy="27" r="4"/><circle cx="28" cy="30" r="3"/><circle cx="37" cy="30" r="3"/><path d="M8 34h48c0 12-10 20-24 20S8 46 8 34Z"/><path d="M20 58h24"/>',
  bone: '<path d="M18 26c-5-5-13 1-8 6-5 5 3 11 8 6h28c5 5 13-1 8-6 5-5-3-11-8-6Z"/>',
  ball: '<circle cx="32" cy="32" r="20"/><path d="M18 18c7 8 7 20 0 28M46 18c-7 8-7 20 0 28"/>',
  collar: '<ellipse cx="32" cy="24" rx="20" ry="11"/><ellipse cx="32" cy="24" rx="14" ry="6"/><path d="M32 35v4"/><circle cx="32" cy="46" r="7"/><path d="M29 46h6"/>',
  pill: '<path d="M20 44 40 24c4-4 10-4 14 0s4 10 0 14L34 58c-4 4-10 4-14 0s-4-10 0-14Z"/><path d="M30 34l10 10"/>',
  bottle: '<rect x="23" y="8" width="18" height="9" rx="2"/><path d="M22 17h20c3 0 5 2 5 5v30c0 3-2 5-5 5H22c-3 0-5-2-5-5V22c0-3 2-5 5-5Z"/><rect x="17" y="28" width="30" height="16"/><path d="M32 31v10M27 36h10"/>',
  bed: '<ellipse cx="32" cy="40" rx="25" ry="13"/><ellipse cx="32" cy="37" rx="15" ry="6"/><path d="M7 40v4c0 7 11 12 25 12s25-5 25-12v-4"/>',
  cage: '<path d="M26 14v-4h12v4"/><rect x="10" y="14" width="44" height="38" rx="3"/><path d="M19 14v38M28 14v38M36 14v38M45 14v38M10 26h44M6 56h52"/>',
  tank: '<rect x="8" y="12" width="48" height="38" rx="2"/><path d="M8 20c4-2 8-2 12 0s8 2 12 0 8-2 12 0 8 2 12 0M4 56h56"/><path d="M22 36c4-5 10-6 14-3 3 2 3 5 0 7-4 3-10 2-14-4Zm14-3 6-4v11Z"/><path d="M48 50V36M48 44c-3-2-4-5-4-8"/>',
  feeder: '<path d="M32 4v6M14 22l18-12 18 12Z"/><rect x="22" y="22" width="20" height="26" rx="2"/><path d="M26 30h12M26 38h12M14 50h36M24 50l-2 6M40 50l2 6"/>',
  brush: '<path d="M10 54 27 37"/><path d="M27 37l9-9c4-4 10-4 14 0s4 10 0 14l-9 9Z"/><path d="M33 43l-3 3M38 48l-3 3M43 38l3-3M38 33l3-3"/>',
  litter: '<path d="M6 30h52l-5 22H11Z"/><path d="M10 30c4-4 8-4 12 0s8 4 12 0 8-4 12 0 8 4 12 0"/><path d="M40 6l-6 16M30 20h12l-2 6h-8Z"/>',
  tag: '<path d="M10 30V14c0-2 2-4 4-4h16l24 24-20 20Z"/><circle cx="20" cy="20" r="3"/><path d="M27 41l12-12"/><circle cx="28" cy="32" r="2"/><circle cx="38" cy="40" r="2"/>',
  tree: '<path d="M22 56V18M44 56V34"/><rect x="12" y="12" width="20" height="7" rx="2"/><rect x="34" y="27" width="20" height="7" rx="2"/><rect x="8" y="54" width="48" height="5" rx="2"/><path d="M22 26h0M22 34l-4 2M22 42l4 2"/>',
  bulb: '<path d="M24 40c-6-4-8-10-8-14 0-9 7-16 16-16s16 7 16 16c0 4-2 10-8 14v6H24Z"/><path d="M26 52h12M28 57h8M32 46V32l-4-4M32 32l4-4"/>',
  egg: '<path d="M32 8c10 0 18 16 18 28s-8 20-18 20-18-8-18-20S22 8 32 8Z"/><path d="M22 40c4 3 8-3 12 0s8 3 12 0"/>',
}

const RULES = [
  [/deal/i, 'tag'], [/litter/i, 'litter'], [/insect/i, 'turtle'],
  [/flea|tick|deworm|pharmac|medic|health|heartworm|prescription/i, 'pill'], [/vitamin|supplement/i, 'bottle'],
  [/treat/i, 'bone'], [/toy/i, 'ball'], [/collar|harness|leash|tack/i, 'collar'], [/\bbeds?\b|blanket/i, 'bed'],
  [/crate|kennel|cage|enclosure|habitat|coop|\bpens?\b/i, 'cage'], [/aquarium|tank|terrarium/i, 'tank'],
  [/feeder|waterer/i, 'feeder'], [/groom/i, 'brush'], [/tree|condo|scratch/i, 'tree'], [/heat|light/i, 'bulb'],
  [/\begg|nesting/i, 'egg'], [/food|feed|seed|suet/i, 'bowl'], [/perch/i, 'bird'],
  [/\bdogs?\b|puppy/i, 'dog'], [/\bcats?\b|kitten/i, 'cat'], [/horse/i, 'horse'],
  [/bird|parrot|parakeet|cockatiel|duck|waterfowl/i, 'bird'], [/fish|koi|pond/i, 'fish'], [/snake/i, 'snake'],
  [/reptile|dragon|turtle|lizard/i, 'turtle'], [/chick/i, 'hen'], [/small|rabbit|guinea|hamster|ferret|\brat\b/i, 'rabbit'],
  [/livestock|cattle|goat|pig|sheep|llama|alpaca/i, 'cow'], [/parent/i, 'heart'],
]

export function tileIcon(label, size = 54) {
  const key = RULES.find(([re]) => re.test(label))?.[1]
  if (!key) return paw(size)
  return `<svg class="cw-icon" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${D[key].replaceAll(' class="f"', ' fill="currentColor" stroke="none"')}</svg>`
}
