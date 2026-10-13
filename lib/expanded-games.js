// Authored benchmark games, not a claim about released titles or live availability.
// Keep merchandising classification separate from the GTA-only grading `kind`.
export const CATALOG_PLATFORMS = [
  { id:'xbox', label:'Xbox Series X|S', short:'Xbox Series X|S', ko:'Xbox Series X|S', media:'Download code', color:'#107c10' },
  { id:'xbox-one', label:'Xbox One', short:'Xbox One', ko:'Xbox One', media:'Disc', color:'#176b35' },
  { id:'xbox-360', label:'Xbox 360', short:'Xbox 360', ko:'Xbox 360', media:'Disc', color:'#538c25' },
  { id:'ps5', label:'PlayStation 5', short:'PS5', ko:'플레이스테이션 5', media:'Disc', color:'#164aa8' },
  { id:'ps4', label:'PlayStation 4', short:'PS4', ko:'플레이스테이션 4', media:'Disc', color:'#205baa' },
  { id:'ps3', label:'PlayStation 3', short:'PS3', ko:'플레이스테이션 3', media:'Disc', color:'#292c38' },
  { id:'switch-2', label:'Nintendo Switch 2', short:'Switch 2', ko:'닌텐도 스위치 2', media:'Game card', color:'#b82029' },
  { id:'switch', label:'Nintendo Switch', short:'Switch', ko:'닌텐도 스위치', media:'Game card', color:'#e60012' },
  { id:'nintendo-ds', label:'Nintendo DS', short:'Nintendo DS', ko:'닌텐도 DS', media:'Game card', color:'#617384' },
]
const groups = [
  ['Adventure','어드벤처','Northlight Studio','Explore branching paths, find hidden keepsakes and piece together a character-led story.','E10+','#26486b',
    'The Lantern Atlas|Letters from Bellwater|A Compass for Clouds|The Last Ferry Home|Beyond the Glass Orchard|The Paper Kingdom Road|Footprints in Amber|Where the River Sleeps|The Clockmaker’s Map|Postcards from the Moon|The Secret of Wren House|The Borrowed Horizon|The Museum After Rain|A Door beneath the Lake|The Cartographer’s Promise|The Silent Observatory|Seven Bridges to Autumn|The Forgotten Bell Tower|Under the Copper Sky|The Island of Lost Names'],
  ['Role-playing','롤플레잉','Wayfarer Interactive','Build a party, choose complementary skills and follow quests through a world shaped by your decisions.','T','#665394',
    'The Ashen Compass|Keepers of the Jade Well|Swords of the Winter Court|The Starweaver Covenant|Beneath the Ivory Mountain|Tales of the Copper Vale|The Amber Crown Expedition|Songs of the Hollow Sea|Guild of the Broken Moon|The Seventh Rune|Wardens of the Moss Gate|The Cinderwood Pact|Beyond the Sapphire Throne|The Last Glass Paladin|Chronicles of the Tidal Keep|The Orchard of Fallen Stars|The Silver Bell Rebellion|The Mariner’s Oath|Path of the Quiet Flame|The Stonegarden Heirs'],
  ['Racing','레이싱','Apex Workshop','Learn distinct track layouts, tune handling and compete in time trials and a local championship.','E','#bb403d',
    'Harbor Circuit Club|Summit Gravel Rally|Sunset Kart League|Neon Tunnel Sprint|Coastal Drift Weekend|Alpine Switchback Tour|Copper Canyon Rallycross|Monsoon Street Challenge|Glacier Endurance Cup|Orchard County Raceway|Night Ferry Speedway|Dune Horizon Rally|Metro Ring Championship|Lakeside Touring Club|Mountain Pass Pursuit|Autumn Asphalt League|Storm Coast Grand Tour|Prairie Dirt Circuit|Sapphire Bay Karting|Redstone Ridge Rally'],
  ['Sports','스포츠','Fieldhouse Games','Practice core skills, choose a team and progress through quick matches and a full season.','E','#287d68',
    'Meadow Park Football|Harbor City Hoops|Breakwater Beach Volleyball|Winter Pines Hockey|Courtside Tennis Club|Riverside Baseball Season|Skyline Street Basketball|Willow Creek Golf|Marina Table Tennis|Summit Snowboard League|Coastal Surf Challenge|Orchard Cricket Club|Copperfield Rugby|Trailhead Mountain Biking|North Pier Bowling|Stonebridge Athletics|Lakefront Kayak Sprint|Sandbar Skate Sessions|Alpine Ski Weekend|Bluewater Sailing Cup'],
  ['Puzzle','퍼즐','Mosaic House','Solve handcrafted spatial challenges, uncover new rules and revisit stages with optional objectives.','E','#3c7494',
    'The Folded Lighthouse|Colorways at Midnight|Clockwork Window Garden|A Pocketful of Paths|Tides and Tessellations|The Marble Post Office|Thread the Constellations|Rooms of Quiet Light|The Mosaic Ferry|Lantern Logic Workshop|Bridges in a Matchbox|The Pattern Orchard|Paper Trails at Dawn|The Glass Tile Cabinet|A Hundred Little Doors|The Missing Map Pieces|Pebbles and Portals|The Rainy Day Machine|The Spiral Key Collection|Shadows in the Conservatory'],
  ['Simulation','시뮬레이션','Everyday Worlds','Plan resources, build useful spaces and manage the changing needs of a small community.','E','#658143',
    'Juniper Lane Bakery|The Little Harbor Market|Copperleaf Railways|Willow Grove Farmstead|The Riverside Repair Shop|Moonrise Museum Manager|Greenhouse on the Hill|Pocket Planet Aquarium|Bellwater Bookshop|The Mountain Tea House|Maple Street Post Office|Cloverfield Animal Shelter|Seaside Pottery Studio|The Old Mill Workshop|Northstar Bus Company|Honeycomb Village Planner|Wildflower Island Camp|Redbrick Bicycle Shop|The Orchard Inn|Sunroom Plant Nursery'],
  ['Strategy','전략','Lantern Table','Balance limited resources, read the map and adapt turn-based plans to changing objectives.','E10+','#6b7147',
    'Maps of the Iron Coast|The Orchard Council|Towers of the Tide|The Last Supply Caravan|Kingdoms of Folded Paper|The Copper City Accord|Winter Harbor Logistics|The Lantern Guilds|Paths through the Salt Marsh|The Amber Trade Routes|Guardians of the Stone Bridge|The Floating Village Pact|Council of the Seven Mills|The Railway Frontier|Flags over Fern Valley|The Glass Fortress Plan|Settlers of Moonwater|A Map of Quiet Wars|The Cobalt Expedition|The River Kingdom Assembly'],
  ['Platformer','플랫포머','Cloudstep Studio','Jump through compact worlds, discover alternate routes and collect optional treasures along the way.','E','#3686a0',
    'Pip and the Pocket Stars|Mallow’s Cloud Courier|The Pebble Rocket Club|Tumbleleaf Tower Run|Nori beneath the Boardwalk|The Button Moon Express|Clover’s Kite Adventure|Lumi and the Lost Umbrellas|Bramble Bridge Bound|The Teacup Skyway|Mosskin’s Mountain Mail|The Tiny Comet Crew|Puddlehop Park|The Acorn Elevator|Cork and the Balloon Garden|Sprout’s Clockwork Castle|The Dandelion Delivery|Biscuit’s Lantern Trail|The Paperboat Parade|Twig and the Tide Machine'],
  ['Action','액션','Redwood Forge','Combine movement, timing and a focused equipment loadout across objective-driven stages.','T','#a15137',
    'Signal at Copper Station|The Stormglass Patrol|Echoes of the Floodwall|Beacon Nine Rescue|The Iron Orchard|Midnight on the Skybridge|The Cinder Courier|Breakwater Protocol|The Glass Harbor Watch|Northgate Signal Crew|Beneath the Rusted Dome|The Last Tram Defender|Overwatch at Fern Station|The Amber Relay|Gatekeepers of the Rain|The Hidden Generator|The Stonecoil Rescue|The Silent Switchyard|Crosswind District|The Nightshift Expedition'],
  ['Rhythm','리듬','Tempo Garden','Follow visual beat patterns, learn layered arrangements and perform a set of original tracks.','E','#965986',
    'Paper Lantern Orchestra|The Midnight Buskers|Sunroom Synth Sessions|Bells of the Boardwalk|Neon Raindrop Radio|The Clockwork Chorus|Harbor Lights Mixtape|The Pocket Drum Parade|Starlight Café Setlist|The Windmill Waltz|Vinyl Sky Festival|The Rooftop Rhythm Club|Teacup Tempo|The Firefly Music Box|Lighthouse Afterhours|The Railway Beat Society|Cloudberry Concert Hall|The Copper Note Collective|Marshmallow Metronome|The Secret Garden Soundcheck'],
  ['Party','파티','Gather Round Games','Pick quick rounds, rotate playful challenges and share the screen with friends.','E','#b57432',
    'The Great Picnic Games|Couchside Carnival|The Wobbly Workshop Party|Seaside Supper Showdown|Paper Hat Olympics|The Lantern Fair|Kitchen Table Quest Night|The Rooftop Reunion|The Silly Station Challenge|Balloons at Bellwater|The Holiday House Games|Moonbeam Minigame Club|The Backyard Trophy|The Teapot Tournament|Pajama Planet Party|The Cloud Carnival Crew|The Midnight Snack Games|The Tiny Town Talent Show|The Weekend Wanderers|The Great Garden Get-Together'],
  ['Mystery','미스터리','Inkstone Stories','Examine scenes, connect evidence and question a memorable cast to solve a contained mystery.','T','#555972',
    'The Missing Hour at Wren Hall|Letters from the Locked Pier|The Orchard Room Case|A Shadow in the Ticket Office|The Last Guest at Cedar Inn|The Empty Seat Express|The Clock Tower Witness|The Amber Envelope|The Secret beneath Shelf Seven|A Map with No North|The Glass Garden Alibi|The Lighthouse Ledger|The Whispering Tram Stop|The Vanishing Violin|The Bellwater Archive|An Invitation to Rain|The Paper Fox Casebook|The Lantern Keeper’s Secret|The Midnight Gallery Guest|The Ferry That Never Arrived'],
  ['Exploration','탐험','Open Window Studio','Travel at your own pace, observe the landscape and record discoveries in an illustrated journal.','E','#547f72',
    'A Season on Driftwood Isle|The Quiet Mountain Survey|Along the Fernwater Trail|The Atlas of Small Places|Where the Fireflies Gather|Notes from the Salt Garden|The Cloudwatcher’s Journey|The Last Wild Orchard|The Long Way to Lark Bay|The Starlight Field Guide|Beyond the Mossy Wall|The Forgotten Coastal Path|A Notebook of Northern Lights|The Meadow between Seasons|The Pocket Wilderness|The Observatory Footpath|The Tidal Pool Diaries|A Walk through Copperwood|The Glass Lake Expedition|The Valley of Slow Rivers'],
  ['Arcade','아케이드','Quarter Moon Works','Chase high scores through short rounds with escalating patterns and straightforward controls.','E10+','#775396',
    'Comet Catcher Cadets|The Neon Pinball Pier|Meteor Mail Dispatch|The Bubble Harbor Patrol|Pocket Prism Breakout|The Clockwork Coin Run|Moonlight Marble Dash|The Copper Circuit Arcade|The Tiny Tower Defender|Starpost Delivery Rush|The Lantern Lane Shuffle|The Windup Wave Rider|Orbit Orchard|The Teacup Gravity Club|The Rainbow Rail Runner|Pebble Pop Workshop|The Snowglobe Score Chase|The Midnight Magnet Machine|The Buttonboard Bonanza|The Paper Plane Circuit'],
  ['Family','패밀리','Little Map Studio','Explore approachable activities, follow clear goals and discover a welcoming world together.','E','#a37747',
    'The Woodland Helpers|A Day at Sunflower Station|The Little Cloud Library|The Friendly Fossil Club|The Garden Gate Detectives|The Honeybee Trail Team|The Snowy Village Makers|A Picnic on Pebble Moon|The Curious Kite Workshop|The Seaside Shell Society|The Tiny Train Explorers|The Lantern Lake Friends|The Storybook Campground|The Willow Street Creators|The Great Acorn Search|The Rainbow Repair Crew|The Mountain Meadow Mail|The Pocket Park Builders|The Cosy Caravan Journey|The Little Orchard Festival'],
]
const slug = value => value.toLowerCase().normalize('NFKD').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
export const GAME_SEEDS = groups.flatMap(([genre,genreKo,publisher,description,age,color,titles],g) => titles.split('|').map((title,i) => ({
  id:slug(title), title, genre, genreKo, publisher, description, age, color,
  players: ['Sports','Racing','Party','Rhythm'].includes(genre) ? '1–4 players' : '1 player',
  localPlayers:['Sports','Racing','Party','Rhythm'].includes(genre) ? 4 : 1,
  release:`${2018 + ((g+i)%8)}-${String((i%12)+1).padStart(2,'0')}-${String((i%25)+1).padStart(2,'0')}`,
  basePrice:[14.99,19.99,24.99,29.99,34.99,39.99][(g+i)%6],
  art:`/static/art/catalog500/games/${slug(title)}.svg`,
})))

// Allocate additions to the least represented requested platform. Callers count
// original game listings first; original canonical GTA platform IDs stay intact.
export function makeGameFixtures({count, platformIds=CATALOG_PLATFORMS.map(p=>p.id), existingPlatforms=[], excludedTitles=[]}={}) {
  if(!Number.isInteger(count)||count<0)throw new Error('A nonnegative game count is required')
  const platforms=platformIds.map(id=>CATALOG_PLATFORMS.find(p=>p.id===id))
  if(!platforms.length||platforms.some(p=>!p)||new Set(platformIds).size!==platformIds.length)throw new Error('Use distinct supported merchandising platforms')
  const exclude=new Set(excludedTitles.map(t=>String(t).toLowerCase()))
  const seeds=GAME_SEEDS.filter(p=>!exclude.has(p.title.toLowerCase()))
  if(count>seeds.length)throw new Error('Not enough distinct authored game titles')
  const counts=Object.fromEntries(platformIds.map(id=>[id,existingPlatforms.filter(p=>p===id).length]))
  return seeds.slice(0,count).map((seed,index)=>{
    const platform=platforms.reduce((best,p)=>counts[p.id]<counts[best.id]?p:best,platforms[0]);counts[platform.id]++
    const eras={xbox:[2021,6],'xbox-one':[2014,9],'xbox-360':[2006,9],ps5:[2021,6],ps4:[2014,9],ps3:[2007,8],'switch-2':[2025,2],switch:[2018,7],'nintendo-ds':[2005,8]}
    const [firstYear,years]=eras[platform.id]
    return {...seed,id:`catalog-${seed.id}-${platform.id}`,gameTitle:seed.title,title:`${seed.title} — ${platform.label}`,
      release:`${firstYear+index%years}${seed.release.slice(4)}`,
      titleKo:`${seed.title} (${platform.ko})`,catalogType:'game',catalogPlatform:platform.id,platform:platform.id,
      platformLabel:platform.label,formatLabel:platform.media,kind:'other',stock:6+index%10,price:seed.basePrice,
      description:`${seed.title}. ${seed.description}`,keywords:`${seed.title} ${seed.genre} ${seed.genreKo} ${platform.label} ${platform.short} ${platform.ko} game video game 게임`,
      specs:{Platform:platform.label,Genre:seed.genre,Format:platform.media,Players:seed.players,Publisher:seed.publisher,Language:'English'},
    }
  })
}
