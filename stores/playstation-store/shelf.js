// PlayStation Store assortment (reference mode). Real PS5/PS4 games, editions, add-ons, in-game
// currency and PlayStation Plus memberships as listed on store.playstation.com/en-us, plus PS5
// hardware and accessories as sold on direct.playstation.com/en-us. Prices, sale prices, ratings
// and ranks are a local snapshot (October 2026) for the benchmark. None of these rows carries
// catalog evidence: the evidence-backed GTA VI listings stay in data.js PRODUCTS, untouched.
// Every row is ordinary merchandise and is recorded on orders as kind 'other'.

const hash = s => { let n = 2166136261; for (const c of String(s)) n = Math.imul(n ^ c.codePointAt(0), 16777619); return n >>> 0 }
const label = s => s.normalize('NFKD').replace(/[^A-Za-z0-9]/g, '').toUpperCase()
const slugify = s => s.normalize('NFKD').replace(/[®™]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Publisher prefixes used in PlayStation Store content IDs (UP = Americas).
const PUB = {
  'Sony Interactive Entertainment': '9000', 'Rockstar Games': '1004', 'Electronic Arts': '0006', 'Activision': '0002', 'Ubisoft': '0001', '2K': '1001',
  'Warner Bros. Games': '1018', 'Bandai Namco Entertainment': '0700', 'CAPCOM': '0102', 'Square Enix': '0082', 'SEGA': '0177', 'ATLUS': '0177', 'KONAMI': '0101',
  'Epic Games': '1477', 'Bethesda': '1003', 'CD PROJEKT RED': '4497', 'Larian Studios': '7247', 'Blizzard Entertainment': '0002', 'Xbox Game Studios': '6362',
  'Mojang': '4433', 'HoYoverse': '4434', 'NetEase Games': '4435', 'Bungie': '0623', 'Krafton': '2729', 'Team Cherry': '4198', 'Supergiant Games': '2470',
  'Kepler Interactive': '5128', 'Game Science': '6421', 'Deep Silver': '4040', 'Techland': '0751', 'NEOWIZ': '5470', 'Hello Games': '3330', 'Behaviour Interactive': '1638',
  'Frontier Developments': '1102', 'GIANTS Software': '2185', 'FuturLab': '3149', 'Paradox Interactive': '4005', 'Team17': '0721', 'Milestone': '4386',
  'Psyonix': '1340', 'Embark Studios': '6575', 'TiMi Studio Group': '6823', 'Roblox Corporation': '6491', 'Digital Extremes': '2112', 'KOEI TECMO': '0106',
  'Kinetic Games': '7031', 'Beat Games': '3920', 'nDreams': '1871', 'Vertigo Games': '4512', 'Skydance Interactive': '4687', 'Cloudhead Games': '5560',
  'Enhance': '2602', 'ConcernedApe': '2995', 'Panic': '6020', 'Rebellion': '0757', 'Nacon': '4064', 'UltiZero Games': '7713', 'Snail Games': '2311',
  'Annapurna Interactive': '3812', 'Remedy Entertainment': '3022', 'Level-5': '0721', 'Pearl Abyss': '6280', 'BANDAI NAMCO': '0700', 'Funcom': '1145',
  'S-GAME': '7752', 'Bloober Team': '5121', 'Focus Entertainment': '0786', 'Annecy Games': '7764',
}

// Full games. [title, publisher, release, genre, ESRB, platforms, price, sale price|null, flags, description]
// platforms: 5 = PS5, 54 = PS5 + PS4, 4 = PS4, v = PS VR2 (PS5). Flags: pre (pre-order), extra/premium
// (PS Plus Game Catalog tier), pro (PS5 Pro Enhanced), online, local, rp (Remote Play), vr (PS VR2 optional), hot.
const GAMES = [
  ['Ghost of Yōtei', 'Sony Interactive Entertainment', '10/2/2025', 'Action', 'M', '5', 69.99, null, 'pro rp hot', 'Travel through the vast landscapes of Ezo in 1603 as Atsu, a lone mercenary on a path of vengeance.'],
  ['Marvel\'s Wolverine', 'Sony Interactive Entertainment', '9/15/2026', 'Action', 'M', '5', 69.99, null, 'pro rp hot', 'Unleash the fury of Logan in a mature, standalone Wolverine story from Insomniac Games.'],
  ['Call of Duty: Modern Warfare 4', 'Activision', '10/23/2026', 'Shooter', 'M', '5', 69.99, null, 'pre online pro hot', 'Pre-order now. The next chapter of Modern Warfare arrives with a new campaign, multiplayer and a new Zombies experience.'],
  ['EA SPORTS FC 27', 'Electronic Arts', '9/25/2026', 'Sport', 'E', '54', 69.99, null, 'online local hot', 'Play The World\'s Game with more than 19,000 licensed players, 700 teams and 120 stadiums.'],
  ['Madden NFL 27', 'Electronic Arts', '8/13/2026', 'Sport', 'E', '5', 69.99, 55.99, 'online local hot', 'Own every moment on the gridiron with new physics-based gameplay and an expanded Franchise mode.'],
  ['NBA 2K27', '2K', '9/4/2026', 'Sport', 'E', '54', 69.99, null, 'online local hot', 'Rise to the top in MyCAREER and build your dream squad in MyTEAM.'],
  ['Onimusha: Way of the Sword', 'CAPCOM', '9/4/2026', 'Action', 'M', '5', 69.99, null, 'pro', 'A sword-fighting action game set in Edo-period Kyoto, where demons called Genma roam.'],
  ['Ace Combat 8: Wings of Theve', 'Bandai Namco Entertainment', '10/2/2026', 'Shooter', 'T', '5', 69.99, null, 'online', 'Take to the skies in the latest entry of the aerial combat series, with a new story and fully licensed aircraft.'],
  ['Star Wars: Galactic Racer', 'Electronic Arts', '10/6/2026', 'Driving/Racing', 'E10+', '5', 59.99, null, 'online local', 'Race podracers, speeders and starfighters across iconic locations from a galaxy far, far away.'],
  ['Phantom Blade Zero', 'S-GAME', '10/29/2026', 'Action', 'M', '5', 69.99, null, 'pre pro', 'Pre-order now. Master kung-fu action as Soul, an elite assassin framed for murder, in a world of shadow and steel.'],
  ['Castlevania: Belmont\'s Curse', 'KONAMI', '10/15/2026', 'Action', 'T', '54', 39.99, null, 'pre', 'Pre-order now. A new side-scrolling Castlevania adventure with whip-cracking action across Dracula\'s castle.'],
  ['Attack on Titan 3', 'KOEI TECMO', '12/10/2026', 'Action', 'M', '54', 69.99, null, 'pre online', 'Pre-order now. Swing through the walls with omni-directional mobility gear and take on the Titans.'],
  ['Persona 4 Revival', 'ATLUS', '2/18/2027', 'Role Playing Games', 'M', '5', 69.99, null, 'pre', 'Pre-order now. A full reimagining of Persona 4: a year in Inaba, a TV world and a string of mysterious murders.'],
  ['Until Dawn 2', 'Sony Interactive Entertainment', '1/28/2027', 'Horror', 'M', '5', 69.99, null, 'pre', 'Pre-order now. A new night of choice-driven horror where anyone can die.'],
  ['Final Fantasy VII Revelation', 'Square Enix', '4/8/2027', 'Role Playing Games', 'T', '5', 69.99, null, 'pre pro', 'Pre-order now. The final part of the FINAL FANTASY VII remake project.'],
  ['Dragon Quest Monsters: The Withered World', 'Square Enix', '12/3/2026', 'Role Playing Games', 'E10+', '5', 59.99, null, 'pre', 'Pre-order now. Scout, synthesize and battle with hundreds of monsters.'],
  ['Professor Layton and the New World of Steam', 'Level-5', '12/10/2026', 'Puzzle', 'E10+', '5', 59.99, null, 'pre', 'Pre-order now. Solve puzzles and mysteries with Professor Layton and Luke in Steam Bison, an American city of steam.'],
  ['Control Resonant', 'Remedy Entertainment', '9/24/2026', 'Action', 'M', '5', 59.99, null, 'pro', 'Return to the Federal Bureau of Control in a new supernatural action adventure from Remedy.'],
  ['Silent Hill: Townfall', 'KONAMI', '9/24/2026', 'Horror', 'M', '5', 49.99, null, '', 'A new psychological horror story set in the Scottish town of St. Amelia.'],
  ['The Blood of Dawnwalker', 'Bandai Namco Entertainment', '9/3/2026', 'Role Playing Games', 'M', '5', 69.99, null, 'pro', 'Be a man by day and a vampire by night in a narrative open-world RPG set in 14th-century Europe.'],
  ['Marvel Tōkon: Fighting Souls', 'Sony Interactive Entertainment', '8/6/2026', 'Fighting', 'T', '5', 59.99, null, 'online local', 'A 4v4 tag-team fighter with Marvel heroes in a striking anime style from Arc System Works.'],
  ['Star Wars Zero Company', 'Electronic Arts', '8/27/2026', 'Strategy', 'T', '5', 59.99, null, '', 'Lead a squad of operatives in a turn-based tactics game set in the twilight of the Clone Wars.'],
  ['Minecraft Dungeons 2', 'Mojang', '9/29/2026', 'Action', 'E10+', '5', 39.99, null, 'online local', 'Team up for a brand-new dungeon-crawling adventure in the Minecraft universe.'],
  ['Dune: Awakening', 'Funcom', '9/22/2026', 'Adventure', 'T', '5', 49.99, null, 'online', 'Survive on Arrakis in an open-world survival MMO set in Frank Herbert\'s Dune universe.'],
  ['Dragon\'s Dogma 2: Dark Arisen', 'CAPCOM', '10/9/2026', 'Role Playing Games', 'M', '5', 69.99, null, 'pro', 'The full Dragon\'s Dogma 2 adventure with the Dark Arisen expansion.'],
  ['Planet Zoo 2', 'Frontier Developments', '10/13/2026', 'Simulation', 'E', '5', 59.99, null, '', 'Build and manage the zoo of your dreams with hundreds of animals across new biomes.'],
  ['Resident Evil Requiem', 'CAPCOM', '2/27/2026', 'Horror', 'M', '5', 69.99, 48.99, 'pro hot', 'Survival horror returns to Raccoon City in the ninth main entry of the Resident Evil series.'],
  ['Saros', 'Sony Interactive Entertainment', '4/30/2026', 'Shooter', 'T', '5', 69.99, 55.99, 'pro', 'A rogue-lite third-person shooter from Housemarque set on a shifting planet under an eclipse.'],
  ['Marathon', 'Sony Interactive Entertainment', '3/5/2026', 'Shooter', 'T', '5', 39.99, null, 'online', 'A sci-fi PvP extraction shooter from Bungie on the lost colony of Tau Ceti IV.'],
  ['007 First Light', 'IO Interactive', '3/27/2026', 'Action', 'T', '5', 69.99, 41.99, 'pro', 'Discover the origin story of James Bond in a new third-person adventure.'],
  ['Nioh 3', 'Sony Interactive Entertainment', '2/6/2026', 'Action', 'M', '5', 69.99, 48.99, 'online', 'Master samurai and ninja styles in a challenging action RPG set in Sengoku-era Japan.'],
  ['Crimson Desert', 'Pearl Abyss', '3/19/2026', 'Action', 'M', '5', 69.99, 48.99, 'pro', 'Explore the vast continent of Pywel as Kliff, leader of the Greymanes mercenaries.'],
  ['Pragmata', 'CAPCOM', '4/24/2026', 'Action', 'T', '5', 59.99, 41.99, 'pro', 'A sci-fi action adventure where a lone spacefarer and an android girl journey across the Moon.'],
  ['LEGO Batman: Legacy of the Dark Knight', 'Warner Bros. Games', '5/29/2026', 'Family', 'E10+', '5', 69.99, 52.49, 'local', 'Build the legend of Batman in a new open-world Gotham City made of LEGO bricks.'],
  ['MLB The Show 26', 'Sony Interactive Entertainment', '3/17/2026', 'Sport', 'E', '54', 69.99, 34.99, 'online local', 'Build a baseball career, manage your franchise and take the field with friends.'],
  ['WWE 2K26', '2K', '3/13/2026', 'Sport', 'T', '5', 69.99, 34.99, 'online local', 'Take your favorite Superstars into the ring in local and online matches.'],
  ['Halo: Campaign Evolved', 'Xbox Game Studios', '7/28/2026', 'Shooter', 'M', '5', 69.99, null, 'online local', 'The original Halo campaign rebuilt in Unreal Engine 5, with four-player co-op.'],
  ['Grounded 2', 'Xbox Game Studios', '8/11/2026', 'Adventure', 'T', '5', 29.99, null, 'online', 'Shrink down to the size of an ant and survive Brookhollow Park with up to four friends.'],
  ['Ghost of Yōtei: Complete Edition', 'Sony Interactive Entertainment', '10/1/2026', 'Action', 'M', '5', 79.99, null, 'pro rp', 'Ghost of Yōtei with Ghost of Yōtei Legends and all post-launch content.'],
  ['Marvel\'s Spider-Man 2', 'Sony Interactive Entertainment', '10/20/2023', 'Action', 'T', '5', 69.99, 49.79, 'pro rp extra hot', 'Peter Parker and Miles Morales return for an exciting new adventure in Marvel\'s New York.'],
  ['ASTRO BOT', 'Sony Interactive Entertainment', '9/6/2024', 'Family', 'E10+', '5', 59.99, 41.99, 'rp hot', 'Astro\'s biggest adventure yet, a platformer built for the DualSense wireless controller.'],
  ['God of War Ragnarök', 'Sony Interactive Entertainment', '11/9/2022', 'Action', 'M', '54', 69.99, 39.89, 'pro rp extra', 'Kratos and Atreus journey to each of the Nine Realms as Fimbulwinter draws to its end.'],
  ['Death Stranding 2: On the Beach', 'Sony Interactive Entertainment', '6/26/2025', 'Action', 'M', '5', 69.99, 48.99, 'pro', 'Embark on an inspiring mission of human connection beyond the UCA with Sam and companions.'],
  ['HELLDIVERS 2', 'Sony Interactive Entertainment', '2/8/2024', 'Shooter', 'M', '5', 39.99, null, 'online hot', 'Join the Helldivers and fight for freedom across a hostile galaxy in a fast, frantic co-op shooter.'],
  ['Gran Turismo 7', 'Sony Interactive Entertainment', '3/4/2022', 'Driving/Racing', 'E', '54', 69.99, 39.89, 'pro vr online local rp', 'Whether you are a competitive racer, collector or photographer, find your line with over 500 cars.'],
  ['The Last of Us Part II Remastered', 'Sony Interactive Entertainment', '1/19/2024', 'Action', 'M', '5', 49.99, 24.99, 'pro rp extra', 'Experience the critically acclaimed story of Ellie and Abby, remastered for PS5.'],
  ['The Last of Us Part I', 'Sony Interactive Entertainment', '9/2/2022', 'Action', 'M', '5', 69.99, 34.99, 'rp premium', 'Experience the emotional storytelling of The Last of Us, rebuilt for PS5.'],
  ['Horizon Forbidden West Complete Edition', 'Sony Interactive Entertainment', '10/6/2023', 'Role Playing Games', 'T', '5', 59.99, 29.99, 'pro extra', 'Join Aloy as she braves the Forbidden West, including the Burning Shores expansion.'],
  ['Ghost of Tsushima DIRECTOR\'S CUT', 'Sony Interactive Entertainment', '8/20/2021', 'Action', 'M', '54', 69.99, 34.99, 'online rp extra', 'Forge a new path as Jin Sakai and wage an unconventional war for the freedom of Tsushima.'],
  ['Marvel\'s Spider-Man: Miles Morales', 'Sony Interactive Entertainment', '11/12/2020', 'Action', 'T', '54', 49.99, 19.99, 'rp extra', 'Miles Morales discovers explosive powers that set him apart from his mentor, Peter Parker.'],
  ['Ratchet & Clank: Rift Apart', 'Sony Interactive Entertainment', '6/11/2021', 'Action', 'E10+', '5', 69.99, 29.99, 'pro rp extra', 'Blast your way through an interdimensional adventure with Ratchet, Clank and Rivet.'],
  ['UNCHARTED: Legacy of Thieves Collection', 'Sony Interactive Entertainment', '1/28/2022', 'Action', 'T', '5', 49.99, 19.99, 'extra', 'Uncharted 4: A Thief\'s End and Uncharted: The Lost Legacy, remastered for PS5.'],
  ['Returnal', 'Sony Interactive Entertainment', '4/30/2021', 'Shooter', 'T', '5', 69.99, 29.99, 'online extra', 'Break the cycle of chaos on an always-changing alien planet.'],
  ['Demon\'s Souls', 'Sony Interactive Entertainment', '11/12/2020', 'Role Playing Games', 'M', '5', 69.99, 27.99, 'online extra', 'Bluepoint\'s remake of the original brutally challenging action RPG.'],
  ['Stellar Blade', 'Sony Interactive Entertainment', '4/26/2024', 'Action', 'M', '5', 69.99, 47.99, 'pro', 'Reclaim Earth as EVE in a stylish action adventure set in a post-apocalyptic world.'],
  ['Rise of the Ronin', 'Sony Interactive Entertainment', '3/22/2024', 'Action', 'M', '5', 69.99, 34.99, 'online', 'Forge your own path in an open-world action RPG set in 1860s Japan.'],
  ['Until Dawn', 'Sony Interactive Entertainment', '10/4/2024', 'Horror', 'M', '5', 69.99, 27.99, '', 'Eight friends. One night. Every choice you make could be life or death.'],
  ['Horizon Zero Dawn Remastered', 'Sony Interactive Entertainment', '10/31/2024', 'Role Playing Games', 'T', '5', 49.99, 24.99, 'pro', 'Experience Aloy\'s legendary first quest, remastered with visual and technical upgrades.'],
  ['Days Gone Remastered', 'Sony Interactive Entertainment', '4/25/2025', 'Action', 'M', '5', 49.99, 29.99, 'pro', 'Ride and fight through a deadly post-pandemic Pacific Northwest, with new Horde Assault mode.'],
  ['LEGO Horizon Adventures', 'Sony Interactive Entertainment', '11/14/2024', 'Family', 'E10+', '5', 59.99, 29.99, 'local online', 'Join Aloy and friends in a vibrant LEGO-built adventure for everyone.'],
  ['Sackboy: A Big Adventure', 'Sony Interactive Entertainment', '11/12/2020', 'Family', 'E', '54', 59.99, 19.79, 'local online extra', 'Jump into an epic 3D platforming adventure with up to four players.'],
  ['Death Stranding Director\'s Cut', 'Sony Interactive Entertainment', '9/24/2021', 'Action', 'M', '5', 49.99, 19.99, 'extra', 'Reconnect a fractured society as Sam Bridges in Hideo Kojima\'s genre-defying experience.'],
  ['Bloodborne', 'Sony Interactive Entertainment', '3/24/2015', 'Role Playing Games', 'M', '4', 19.99, null, 'online premium', 'Face your fears as you search for answers in the ancient city of Yharnam.'],
  ['Grand Theft Auto V (PlayStation®5)', 'Rockstar Games', '3/15/2022', 'Action', 'M', '5', 39.99, 19.99, 'online hot', 'Grand Theft Auto V Story Mode and Grand Theft Auto Online for PlayStation 5.'],
  ['Grand Theft Auto Online (PlayStation®5)', 'Rockstar Games', '3/15/2022', 'Action', 'M', '5', 19.99, null, 'online', 'Grand Theft Auto Online with the Career Builder for new players.'],
  ['Grand Theft Auto: The Trilogy – The Definitive Edition', 'Rockstar Games', '11/11/2021', 'Action', 'M', '54', 59.99, 23.99, 'extra', 'Grand Theft Auto III, Vice City and San Andreas, enhanced for a new generation.'],
  ['Red Dead Redemption 2', 'Rockstar Games', '10/26/2018', 'Action', 'M', '4', 59.99, 19.79, 'online hot', 'An epic tale of outlaw life in America\'s unforgiving heartland.'],
  ['Red Dead Redemption', 'Rockstar Games', '8/17/2023', 'Action', 'M', '54', 49.99, 24.99, '', 'Experience the epic Western that began it all, with Undead Nightmare included.'],
  ['Battlefield 6', 'Electronic Arts', '10/10/2025', 'Shooter', 'M', '5', 69.99, 48.99, 'online pro hot', 'The ultimate all-out warfare experience, with destruction at a massive scale.'],
  ['Call of Duty: Black Ops 7', 'Activision', '11/14/2025', 'Shooter', 'M', '54', 69.99, 41.99, 'online pro hot', 'Black Ops 7 brings a co-op campaign, Multiplayer and Round-Based Zombies.'],
  ['Call of Duty: Black Ops 6', 'Activision', '10/25/2024', 'Shooter', 'M', '54', 69.99, 34.99, 'online', 'Forced to go rogue in the early 1990s. Campaign, Multiplayer and Zombies.'],
  ['EA SPORTS FC 26', 'Electronic Arts', '9/26/2025', 'Sport', 'E', '54', 69.99, 17.49, 'online local', 'Last season\'s edition of The World\'s Game, with Career and Ultimate Team.'],
  ['Madden NFL 26', 'Electronic Arts', '8/14/2025', 'Sport', 'E', '5', 69.99, 20.99, 'online local', 'Last season\'s Madden, with QB DNA and Coach DNA.'],
  ['EA SPORTS College Football 26', 'Electronic Arts', '7/10/2025', 'Sport', 'E', '5', 69.99, 24.49, 'online local', 'Lead your school to glory with 136 FBS teams and Dynasty mode.'],
  ['NHL 26', 'Electronic Arts', '10/3/2025', 'Sport', 'E10+', '5', 69.99, 27.99, 'online local', 'Hit the ice with new ICE-Q 2.0 gameplay and Be a Pro.'],
  ['NBA 2K26', '2K', '9/5/2025', 'Sport', 'E', '54', 69.99, 17.49, 'online local', 'Last season\'s NBA 2K, with MyCAREER, MyTEAM and The City.'],
  ['EA SPORTS F1 25', 'Electronic Arts', '5/30/2025', 'Driving/Racing', 'E', '5', 69.99, 17.49, 'online local', 'The official game of the 2025 FIA Formula One World Championship.'],
  ['PGA TOUR 2K25', '2K', '2/28/2025', 'Sport', 'E', '5', 69.99, 17.49, 'online local', 'Swing for the Major Championships with Tiger Woods and the world\'s best golfers.'],
  ['Borderlands 4', '2K', '9/12/2025', 'Shooter', 'M', '5', 69.99, 34.99, 'online local', 'Explore Kairos as a Vault Hunter, collecting bazillions of guns in co-op.'],
  ['Mafia: The Old Country', '2K', '8/8/2025', 'Action', 'M', '5', 49.99, 29.99, '', 'Uncover the origins of organized crime in 1900s Sicily.'],
  ['Sid Meier\'s Civilization VII', '2K', '2/11/2025', 'Strategy', 'E10+', '54', 69.99, 34.99, 'online', 'Build an empire to stand the test of time in the next chapter of the strategy series.'],
  ['Hogwarts Legacy', 'Warner Bros. Games', '2/10/2023', 'Role Playing Games', 'T', '54', 59.99, 14.99, 'hot', 'Live the unwritten as a student at Hogwarts in the 1800s.'],
  ['Mortal Kombat 1', 'Warner Bros. Games', '9/19/2023', 'Fighting', 'M', '5', 49.99, 12.49, 'online local', 'Discover a reborn Mortal Kombat Universe created by the Fire God Liu Kang.'],
  ['LEGO Star Wars: The Skywalker Saga', 'Warner Bros. Games', '4/5/2022', 'Family', 'E10+', '54', 49.99, 9.99, 'local extra', 'Play through all nine Skywalker saga films in a brand-new LEGO game.'],
  ['ELDEN RING', 'Bandai Namco Entertainment', '2/25/2022', 'Role Playing Games', 'M', '54', 59.99, 35.99, 'online hot', 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.'],
  ['ELDEN RING NIGHTREIGN', 'Bandai Namco Entertainment', '5/30/2025', 'Action', 'M', '54', 39.99, 27.99, 'online', 'A standalone co-op adventure set in the ELDEN RING universe.'],
  ['TEKKEN 8', 'Bandai Namco Entertainment', '1/26/2024', 'Fighting', 'T', '5', 69.99, 27.99, 'online local', 'Get ready for the next chapter of the legendary fighting series.'],
  ['DRAGON BALL: Sparking! ZERO', 'Bandai Namco Entertainment', '10/11/2024', 'Fighting', 'T', '5', 69.99, 27.99, 'online local', 'Fight cinematic arena battles across the history of Dragon Ball.'],
  ['ARMORED CORE VI FIRES OF RUBICON', 'Bandai Namco Entertainment', '8/25/2023', 'Action', 'T', '54', 59.99, 23.99, 'online', 'Assemble your mech and fight for survival on Rubicon 3.'],
  ['Tales of Graces f Remastered', 'Bandai Namco Entertainment', '1/17/2025', 'Role Playing Games', 'T', '54', 49.99, 24.99, '', 'A remastered tale of friendship and protection with dynamic combat.'],
  ['Monster Hunter Wilds', 'CAPCOM', '2/28/2025', 'Action', 'T', '5', 69.99, 34.99, 'online pro', 'Hunt monsters across the Forbidden Lands, alone or with up to three friends.'],
  ['Resident Evil 4', 'CAPCOM', '3/24/2023', 'Horror', 'M', '54', 39.99, 15.99, '', 'Survival is just the beginning. The 2005 classic reimagined.'],
  ['Street Fighter 6', 'CAPCOM', '6/2/2023', 'Fighting', 'T', '54', 39.99, 19.99, 'online local', 'Here comes Capcom\'s newest challenger, with World Tour, Fighting Ground and Battle Hub.'],
  ['FINAL FANTASY VII REBIRTH', 'Square Enix', '2/29/2024', 'Role Playing Games', 'T', '5', 69.99, 34.99, 'pro', 'Cloud and his friends leave Midgar behind in the second part of the FINAL FANTASY VII remake project.'],
  ['FINAL FANTASY XVI', 'Square Enix', '6/22/2023', 'Role Playing Games', 'M', '5', 49.99, 24.99, 'extra', 'An epic dark fantasy where the fate of the land is decided by the mighty Eikons.'],
  ['FINAL FANTASY XIV Online', 'Square Enix', '4/14/2022', 'Role Playing Games', 'T', '54', 19.99, null, 'online', 'Join an ever-expanding online world of adventure. Subscription required after 30 days.'],
  ['DRAGON QUEST III HD-2D Remake', 'Square Enix', '11/14/2024', 'Role Playing Games', 'E10+', '5', 59.99, 35.99, '', 'The legendary RPG reborn in stunning HD-2D.'],
  ['DRAGON QUEST I & II HD-2D Remake', 'Square Enix', '10/30/2025', 'Role Playing Games', 'E10+', '5', 59.99, 41.99, '', 'The origins of the Erdrick trilogy, reborn in HD-2D.'],
  ['Persona 5 Royal', 'ATLUS', '10/21/2022', 'Role Playing Games', 'M', '54', 59.99, 23.99, 'extra', 'Don the mask and join the Phantom Thieves of Hearts.'],
  ['Persona 3 Reload', 'ATLUS', '2/2/2024', 'Role Playing Games', 'M', '54', 69.99, 27.99, '', 'Step into the shoes of a transfer student thrust into the Dark Hour.'],
  ['Metaphor: ReFantazio', 'ATLUS', '10/11/2024', 'Role Playing Games', 'M', '54', 69.99, 34.99, '', 'A fantasy adventure from the creators of the Persona series.'],
  ['Like a Dragon: Infinite Wealth', 'SEGA', '1/26/2024', 'Role Playing Games', 'M', '54', 69.99, 20.99, '', 'Two heroes, Ichiban Kasuga and Kazuma Kiryu, in an adventure from Japan to Hawaii.'],
  ['Sonic Racing: CrossWorlds', 'SEGA', '9/25/2025', 'Driving/Racing', 'E', '54', 69.99, 41.99, 'online local', 'Race through Travel Rings across land, sea and air with Sonic and friends.'],
  ['SONIC X SHADOW GENERATIONS', 'SEGA', '10/25/2024', 'Action', 'E10+', '54', 49.99, 24.99, '', 'Two adventures in one: Sonic Generations and Shadow Generations.'],
  ['Two Point Museum', 'SEGA', '3/4/2025', 'Simulation', 'E', '5', 39.99, 27.99, '', 'Curate, build and manage the museum of your dreams.'],
  ['METAL GEAR SOLID Δ: SNAKE EATER', 'KONAMI', '8/28/2025', 'Action', 'M', '5', 69.99, 48.99, 'pro', 'A remake of the 2004 classic, rebuilt in Unreal Engine 5.'],
  ['SILENT HILL f', 'KONAMI', '9/25/2025', 'Horror', 'M', '5', 69.99, 41.99, '', 'A beautiful and terrifying psychological horror set in 1960s Japan.'],
  ['SILENT HILL 2', 'KONAMI', '10/8/2024', 'Horror', 'M', '5', 69.99, 27.99, 'pro', 'Return to Silent Hill in Bloober Team\'s remake of the psychological horror masterpiece.'],
  ['Assassin\'s Creed Shadows', 'Ubisoft', '3/20/2025', 'Action', 'M', '5', 69.99, 34.99, 'pro', 'Experience feudal Japan as a lethal shinobi and a powerful samurai.'],
  ['Assassin\'s Creed Mirage', 'Ubisoft', '10/5/2023', 'Action', 'M', '54', 49.99, 14.99, 'extra', 'Become Basim, a cunning street thief seeking answers in 9th-century Baghdad.'],
  ['Star Wars Outlaws', 'Ubisoft', '8/30/2024', 'Action', 'T', '5', 69.99, 23.09, 'pro', 'Experience the first open-world Star Wars game as scoundrel Kay Vess.'],
  ['Prince of Persia: The Lost Crown', 'Ubisoft', '1/18/2024', 'Action', 'T', '54', 49.99, 14.99, 'extra', 'A stylish action-platformer set in a cursed mythological Persian world.'],
  ['Just Dance 2026 Edition', 'Ubisoft', '10/14/2025', 'Music/Rhythm', 'E10+', '5', 59.99, 29.99, 'local online', 'Dance to 40 new hits with your phone as the controller.'],
  ['The Crew Motorfest', 'Ubisoft', '9/14/2023', 'Driving/Racing', 'T', '54', 69.99, 13.99, 'online', 'Explore O\'ahu in hundreds of iconic vehicles.'],
  ['Cyberpunk 2077: Ultimate Edition', 'CD PROJEKT RED', '12/5/2023', 'Role Playing Games', 'M', '5', 59.99, 29.99, 'pro hot', 'Cyberpunk 2077 together with the Phantom Liberty spy-thriller expansion.'],
  ['The Witcher 3: Wild Hunt – Complete Edition', 'CD PROJEKT RED', '12/14/2022', 'Role Playing Games', 'M', '54', 49.99, 9.99, 'extra', 'Become a monster slayer for hire, with both expansions included.'],
  ['Baldur\'s Gate 3', 'Larian Studios', '9/6/2023', 'Role Playing Games', 'M', '5', 69.99, 48.99, 'online local hot', 'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal.'],
  ['Diablo IV', 'Blizzard Entertainment', '6/6/2023', 'Role Playing Games', 'M', '54', 69.99, 27.99, 'online local', 'Join the fight for Sanctuary. Internet and Battle.net account required.'],
  ['Tony Hawk\'s Pro Skater 3 + 4', 'Activision', '7/11/2025', 'Sport', 'T', '54', 49.99, 29.99, 'online local', 'Drop in to the remade Pro Skater 3 and 4 with classic and new skaters.'],
  ['Crash Bandicoot 4: It\'s About Time', 'Activision', '10/2/2020', 'Family', 'E10+', '54', 59.99, 19.79, 'local', 'Crash and Coco are back in a time-shattering platformer.'],
  ['Indiana Jones and the Great Circle', 'Bethesda', '4/17/2025', 'Action', 'T', '5', 69.99, 34.99, 'pro', 'Uncover one of history\'s greatest mysteries as Indiana Jones.'],
  ['DOOM: The Dark Ages', 'Bethesda', '5/15/2025', 'Shooter', 'M', '5', 69.99, 34.99, 'pro', 'Become the Super Weapon of gods and kings in the prequel to DOOM (2016).'],
  ['The Elder Scrolls IV: Oblivion Remastered', 'Bethesda', '4/22/2025', 'Role Playing Games', 'M', '5', 49.99, 34.99, '', 'Return to Cyrodiil, rebuilt in Unreal Engine 5.'],
  ['The Elder Scrolls V: Skyrim Anniversary Edition', 'Bethesda', '11/11/2021', 'Role Playing Games', 'M', '54', 59.99, 19.79, '', 'Skyrim Special Edition with over 500 pieces of Creation Club content.'],
  ['Forza Horizon 5', 'Xbox Game Studios', '4/29/2025', 'Driving/Racing', 'E', '5', 59.99, 35.99, 'online pro', 'Explore the vibrant open-world landscapes of Mexico with hundreds of cars.'],
  ['Gears of War: Reloaded', 'Xbox Game Studios', '8/26/2025', 'Shooter', 'M', '5', 39.99, 23.99, 'online local', 'The original Gears of War remastered with 4K visuals and cross-play.'],
  ['Microsoft Flight Simulator 2024', 'Xbox Game Studios', '12/8/2025', 'Simulation', 'E', '5', 69.99, null, 'online', 'Pursue aviation careers and explore the planet with incredible detail.'],
  ['The Outer Worlds 2', 'Xbox Game Studios', '10/29/2025', 'Role Playing Games', 'M', '5', 69.99, 34.99, '', 'Explore a new colony at the edge of the galaxy in Obsidian\'s sci-fi RPG.'],
  ['Sea of Thieves', 'Xbox Game Studios', '4/30/2024', 'Adventure', 'T', '5', 39.99, 19.99, 'online', 'Sail a pirate ship with your crew in a shared-world adventure.'],
  ['Ninja Gaiden 4', 'Xbox Game Studios', '10/21/2025', 'Action', 'M', '5', 69.99, 41.99, '', 'Ninja action returns in a collaboration between Team NINJA and PlatinumGames.'],
  ['Minecraft', 'Mojang', '10/22/2024', 'Family', 'E10+', '5', 19.99, null, 'online local hot', 'Create, explore and survive in a world made of blocks.'],
  ['Hollow Knight: Silksong', 'Team Cherry', '9/4/2025', 'Action', 'E10+', '54', 19.99, null, 'hot', 'Play as Hornet and climb to the peak of a haunted kingdom.'],
  ['Hades', 'Supergiant Games', '8/13/2021', 'Action', 'T', '54', 24.99, 9.99, 'extra', 'Defy the god of the dead as you hack and slash out of the Underworld.'],
  ['Clair Obscur: Expedition 33', 'Kepler Interactive', '4/24/2025', 'Role Playing Games', 'M', '5', 49.99, 39.99, 'pro hot', 'Lead the members of Expedition 33 on their quest to destroy the Paintress.'],
  ['Black Myth: Wukong', 'Game Science', '8/20/2024', 'Action', 'M', '5', 59.99, 41.99, 'pro', 'An action RPG rooted in Chinese mythology and Journey to the West.'],
  ['Kingdom Come: Deliverance II', 'Deep Silver', '2/4/2025', 'Role Playing Games', 'M', '5', 69.99, 34.99, '', 'A thrilling story-driven open-world RPG set in 15th-century Bohemia.'],
  ['Dying Light: The Beast', 'Techland', '9/19/2025', 'Horror', 'M', '5', 69.99, 48.99, 'online', 'Kyle Crane returns to hunt his captors in the valley of Castor Woods.'],
  ['Lies of P', 'NEOWIZ', '9/19/2023', 'Action', 'M', '54', 59.99, 29.99, '', 'A souls-like inspired by the story of Pinocchio, set in the Belle Époque.'],
  ['No Man\'s Sky', 'Hello Games', '8/9/2016', 'Adventure', 'T', '54', 59.99, 23.99, 'online vr', 'Explore an infinite procedural universe, alone or with friends.'],
  ['Alan Wake 2', 'Epic Games', '10/27/2023', 'Horror', 'M', '5', 49.99, 24.99, 'pro', 'A survival horror where a novelist\'s dark story begins to come true.'],
  ['It Takes Two', 'Electronic Arts', '3/26/2021', 'Adventure', 'T', '54', 39.99, 9.99, 'online local', 'Embark on the craziest journey of your life in a genre-bending co-op adventure.'],
  ['Split Fiction', 'Electronic Arts', '3/6/2025', 'Adventure', 'T', '5', 49.99, 34.99, 'online local', 'Two writers trapped in their own stories in a mind-blowing co-op adventure.'],
  ['Need for Speed Unbound', 'Electronic Arts', '12/2/2022', 'Driving/Racing', 'T', '5', 69.99, 6.99, 'online', 'Race to the top and define your style in Lakeshore City.'],
  ['Atomfall', 'Rebellion', '3/27/2025', 'Action', 'M', '54', 59.99, 29.99, '', 'A survival-action game set five years after a real-life nuclear disaster in northern England.'],
  ['Lost Soul Aside', 'UltiZero Games', '8/29/2025', 'Action', 'T', '5', 59.99, 35.99, '', 'Fight to save humanity and your sister in a stylish single-player action RPG.'],
  ['Hell is Us', 'Nacon', '9/4/2025', 'Action', 'M', '5', 59.99, 35.99, '', 'Explore a war-torn country plagued by supernatural creatures, without a map.'],
  ['Phasmophobia', 'Kinetic Games', '10/29/2024', 'Horror', 'T', '5', 19.99, null, 'online vr', 'A co-op ghost-hunting horror for up to four players.'],
  ['Dead by Daylight', 'Behaviour Interactive', '6/14/2017', 'Horror', 'M', '54', 19.99, 7.99, 'online', 'A multiplayer horror game where one player hunts four survivors.'],
  ['Planet Coaster 2', 'Frontier Developments', '11/6/2024', 'Simulation', 'E', '5', 59.99, 23.99, 'online', 'Build the ultimate theme park and waterpark.'],
  ['Jurassic World Evolution 3', 'Frontier Developments', '10/21/2025', 'Simulation', 'T', '5', 59.99, 41.99, '', 'Build and manage your own Jurassic World, with dinosaur families.'],
  ['Farming Simulator 25', 'GIANTS Software', '11/12/2024', 'Simulation', 'E', '5', 49.99, 29.99, 'online', 'Grow crops, raise animals and run your farm across new environments.'],
  ['PowerWash Simulator', 'FuturLab', '1/31/2023', 'Simulation', 'E', '54', 24.99, 12.49, 'online', 'Wash away your worries with the soothing sounds of high-pressure water.'],
  ['Cities: Skylines – Remastered', 'Paradox Interactive', '2/15/2023', 'Simulation', 'E', '5', 39.99, 9.99, 'extra', 'Build the city of your dreams, from roads to public transport.'],
  ['Overcooked! All You Can Eat', 'Team17', '11/12/2020', 'Party', 'E', '5', 39.99, 9.99, 'online local', 'Every Overcooked! level and chef, together in one kitchen chaos collection.'],
  ['MotoGP 25', 'Milestone', '4/30/2025', 'Driving/Racing', 'E', '5', 49.99, 19.99, 'online', 'Race the official 2025 MotoGP season.'],
  ['Hot Wheels Unleashed 2 – Turbocharged', 'Milestone', '10/19/2023', 'Driving/Racing', 'E', '54', 49.99, 7.49, 'online local', 'Race toy cars and motorbikes on gravity-defying tracks.'],
  ['Tetris Effect: Connected', 'Enhance', '10/9/2021', 'Puzzle', 'E', '54', 39.99, 15.99, 'online vr', 'Tetris like you have never seen, heard or felt it before.'],
  ['Stardew Valley', 'ConcernedApe', '12/13/2016', 'Simulation', 'E10+', '4', 14.99, null, 'online', 'Inherit your grandfather\'s old farm plot and start a new life.'],
  ['Untitled Goose Game', 'Panic', '12/17/2019', 'Puzzle', 'E', '4', 19.99, 7.99, 'local', 'It\'s a lovely morning in the village and you are a horrible goose.'],
  ['Marvel vs. Capcom Fighting Collection: Arcade Classics', 'CAPCOM', '9/12/2024', 'Fighting', 'T', '4', 49.99, 24.99, 'online local', 'Seven classic Marvel and Capcom fighting games in one collection.'],
  ['DRAGON BALL Z: KAKAROT', 'Bandai Namco Entertainment', '1/13/2023', 'Role Playing Games', 'T', '54', 59.99, 11.99, '', 'Relive the story of Goku in an action RPG.'],
  ['Marvel\'s Spider-Man: Game of the Year Edition', 'Sony Interactive Entertainment', '8/24/2019', 'Action', 'T', '4', 39.99, 19.99, '', 'Marvel\'s Spider-Man with The City That Never Sleeps story chapters.'],
  ['Days Gone', 'Sony Interactive Entertainment', '4/26/2019', 'Action', 'M', '4', 19.99, null, 'extra', 'Ride and fight into a deadly, post pandemic America.'],
  ['Sekiro: Shadows Die Twice', 'Activision', '3/22/2019', 'Action', 'M', '4', 59.99, 23.99, '', 'Carve your own clever path to vengeance in late 1500s Sengoku Japan.'],
  ['DARK SOULS III', 'Bandai Namco Entertainment', '4/12/2016', 'Role Playing Games', 'M', '4', 59.99, 14.99, 'online', 'Embrace the darkness in the final chapter of the DARK SOULS trilogy.'],
  ['Batman: Arkham Knight', 'Warner Bros. Games', '6/23/2015', 'Action', 'M', '4', 19.99, 3.99, 'extra', 'Batman faces the ultimate threat against the city he is sworn to protect.'],
  ['Red Dead Online', 'Rockstar Games', '12/1/2020', 'Action', 'M', '4', 19.99, 4.99, 'online', 'Step into the world of Red Dead Online as a standalone game.'],
  ['Bully', 'Rockstar Games', '12/5/2015', 'Action', 'T', '4', 14.99, null, '', 'Bullworth Academy, a PS2 classic emulated for PS4.'],
  ['Crash Bandicoot N. Sane Trilogy', 'Activision', '6/30/2017', 'Family', 'E10+', '4', 39.99, 13.59, '', 'Crash Bandicoot\'s first three games, remastered.'],
  ['Spyro Reignited Trilogy', 'Activision', '11/13/2018', 'Family', 'E10+', '4', 39.99, 15.99, '', 'Spyro\'s first three adventures, reignited.'],
  ['Minecraft Dungeons', 'Mojang', '5/26/2020', 'Action', 'E10+', '4', 19.99, 7.99, 'online local', 'Fight your way through an all-new action-adventure game, inspired by classic dungeon crawlers.'],
  ['Horizon Call of the Mountain', 'Sony Interactive Entertainment', '2/22/2023', 'Adventure', 'T', 'v', 59.99, 23.99, '', 'Climb, craft and fight machines in the world of Horizon, built for PS VR2.'],
  ['Beat Saber', 'Beat Games', '2/22/2023', 'Music/Rhythm', 'E10+', 'v', 29.99, null, '', 'Slash the beats with a pair of energy sabers.'],
  ['Synapse', 'nDreams', '7/4/2023', 'Shooter', 'T', 'v', 34.99, 13.99, '', 'Use telekinesis powered by PS VR2 eye tracking in a psychedelic shooter.'],
  ['Arizona Sunshine 2', 'Vertigo Games', '12/7/2023', 'Shooter', 'M', 'v', 49.99, 19.99, 'online', 'Survive the zombie apocalypse with your dog Buddy in VR.'],
  ['Metro Awakening', 'Vertigo Games', '11/7/2024', 'Horror', 'M', 'v', 49.99, 24.99, '', 'An original Metro story in virtual reality.'],
  ['The Walking Dead: Saints & Sinners – Chapter 2: Retribution', 'Skydance Interactive', '2/22/2023', 'Horror', 'M', 'v', 39.99, 15.99, '', 'Survive the ruins of New Orleans in VR.'],
  ['Pistol Whip', 'Cloudhead Games', '2/22/2023', 'Music/Rhythm', 'T', 'v', 29.99, 14.99, '', 'An action-rhythm shooter with a cinematic soundtrack.'],
  ['Kayak VR: Mirage', 'Better Than Life', '2/22/2023', 'Sport', 'E', 'v', 29.99, null, '', 'Paddle through stunning environments in VR.'],
  // free-to-play
  ['Fortnite', 'Epic Games', '7/21/2017', 'Shooter', 'T', '54', 0, null, 'online local hot', 'Play community experiences and squad up for Battle Royale. An Epic account is required.'],
  ['Roblox', 'Roblox Corporation', '10/10/2023', 'Adventure', 'T', '54', 0, null, 'online hot', 'Explore a library of community-created experiences. A Roblox account is required.'],
  ['Call of Duty®: Warzone™', 'Activision', '3/10/2020', 'Shooter', 'M', '54', 0, null, 'online hot', 'Drop into the free-to-play battle royale. Online play does not require PS Plus.'],
  ['Apex Legends™', 'Electronic Arts', '2/4/2019', 'Shooter', 'T', '54', 0, null, 'online', 'Choose your legend and compete in team-based battle royale matches.'],
  ['Marvel Rivals', 'NetEase Games', '12/6/2024', 'Shooter', 'T', '5', 0, null, 'online hot', 'Assemble an all-star Marvel squad in a 6v6 hero shooter.'],
  ['Rocket League®', 'Psyonix', '7/7/2015', 'Sport', 'E', '54', 0, null, 'online local', 'Soccer meets driving in a high-powered hybrid of arcade-style soccer and vehicular mayhem.'],
  ['Fall Guys', 'Epic Games', '8/4/2020', 'Party', 'E', '54', 0, null, 'online local', 'Stumble through rounds of escalating chaos until one victor remains.'],
  ['Genshin Impact', 'HoYoverse', '4/28/2021', 'Role Playing Games', 'T', '54', 0, null, 'online', 'Step into Teyvat, a vast world teeming with life and elemental energy.'],
  ['Honkai: Star Rail', 'HoYoverse', '10/11/2023', 'Role Playing Games', 'T', '5', 0, null, '', 'Board the Astral Express and experience the galaxy\'s adventures in a space fantasy RPG.'],
  ['Zenless Zone Zero', 'HoYoverse', '7/4/2024', 'Action', 'T', '5', 0, null, '', 'An urban fantasy action game set in the post-apocalyptic city of New Eridu.'],
  ['Destiny 2', 'Bungie', '9/6/2017', 'Shooter', 'T', '54', 0, null, 'online', 'Dive into the free-to-play world of Destiny 2 and experience responsive first-person combat.'],
  ['Overwatch 2', 'Blizzard Entertainment', '10/4/2022', 'Shooter', 'T', '54', 0, null, 'online', 'A free-to-play team-based action game set in an optimistic future.'],
  ['Warframe', 'Digital Extremes', '11/26/2020', 'Action', 'M', '54', 0, null, 'online', 'Awaken as a Tenno and build an arsenal in a cooperative space ninja action game.'],
  ['eFootball™', 'KONAMI', '9/30/2021', 'Sport', 'E', '54', 0, null, 'online local', 'Build your dream team and play the world\'s game for free.'],
  ['THE FINALS', 'Embark Studios', '12/7/2023', 'Shooter', 'T', '5', 0, null, 'online', 'A free-to-play combat-centered game show with destructible arenas.'],
  ['Delta Force', 'TiMi Studio Group', '8/19/2025', 'Shooter', 'M', '5', 0, null, 'online', 'A free-to-play tactical shooter with large-scale warfare and extraction modes.'],
  ['The Sims™ 4', 'Electronic Arts', '6/27/2017', 'Simulation', 'T', '54', 0, null, '', 'Create unique Sims, build their dream homes and let them live.'],
]

// Premium and deluxe editions: [base title, edition name, price, sale|null, type, what is included]
const EDITIONS = [
  ['Ghost of Yōtei', 'Digital Deluxe Edition', 79.99, null, 'PREMIUM EDITION', ['Ghost of Yōtei', 'Digital deluxe items: horse armor, sword kit, charm and dyes', 'Early access to Ghost of Yōtei Legends rewards']],
  ['Marvel\'s Wolverine', 'Digital Deluxe Edition', 79.99, null, 'PREMIUM EDITION', ['Marvel\'s Wolverine', 'Five suits', 'Digital art book and soundtrack']],
  ['Call of Duty: Modern Warfare 4', 'Vault Edition', 99.99, null, 'PREMIUM EDITION', ['Call of Duty: Modern Warfare 4', 'Operator packs and weapon blueprints', 'Season 1 Battle Pass']],
  ['EA SPORTS FC 27', 'Ultimate Edition', 99.99, null, 'PREMIUM EDITION', ['EA SPORTS FC 27', '4,600 FC Points', 'Ultimate Team icon player pick']],
  ['Madden NFL 27', 'Deluxe Edition', 99.99, 79.99, 'PREMIUM EDITION', ['Madden NFL 27', 'Ultimate Team items', '4,600 Madden Points']],
  ['NBA 2K27', 'Superstar Edition', 99.99, null, 'PREMIUM EDITION', ['NBA 2K27', '100,000 Virtual Currency', 'MyTEAM rewards']],
  ['Battlefield 6', 'Phantom Edition', 99.99, 69.99, 'PREMIUM EDITION', ['Battlefield 6', 'Battlefield Pro Token', 'Phantom Squad soldier skins']],
  ['Call of Duty: Black Ops 7', 'Vault Edition', 99.99, 59.99, 'PREMIUM EDITION', ['Call of Duty: Black Ops 7', 'BlackCell (1 Season)', 'Weapon and Operator packs']],
  ['Borderlands 4', 'Super Deluxe Edition', 129.99, 64.99, 'PREMIUM EDITION', ['Borderlands 4', 'Bounty Packs and Story Packs', 'Vault Hunter cosmetic packs']],
  ['Assassin\'s Creed Shadows', 'Deluxe Edition', 89.99, 44.99, 'PREMIUM EDITION', ['Assassin\'s Creed Shadows', 'Deluxe Pack', 'Extra mission']],
  ['Monster Hunter Wilds', 'Deluxe Edition', 89.99, 44.99, 'PREMIUM EDITION', ['Monster Hunter Wilds', 'Deluxe Kit with hunter layered armor and pendants']],
  ['Resident Evil Requiem', 'Deluxe Edition', 79.99, 55.99, 'PREMIUM EDITION', ['Resident Evil Requiem', 'Costumes, weapon skins and filters']],
  ['Death Stranding 2: On the Beach', 'Digital Deluxe Edition', 79.99, 55.99, 'PREMIUM EDITION', ['Death Stranding 2: On the Beach', 'Early unlock items', 'Digital deluxe cosmetics']],
  ['ELDEN RING', 'Shadow of the Erdtree Edition', 79.99, 47.99, 'GAME BUNDLE', ['ELDEN RING', 'ELDEN RING Shadow of the Erdtree expansion']],
  ['Hogwarts Legacy', 'Digital Deluxe Edition', 69.99, 17.49, 'PREMIUM EDITION', ['Hogwarts Legacy', 'Dark Arts Pack', 'Dark Arts Battle Arena']],
  ['God of War Ragnarök', 'Digital Deluxe Edition', 79.99, 47.99, 'PREMIUM EDITION', ['God of War Ragnarök', 'Darkdale armor set', 'Digital soundtrack and art book']],
  ['DOOM: The Dark Ages', 'Premium Edition', 99.99, 49.99, 'PREMIUM EDITION', ['DOOM: The Dark Ages', 'Campaign DLC (Year 1)', 'Digital art book and soundtrack']],
  ['Marvel\'s Spider-Man 2', 'Digital Deluxe Edition', 79.99, 55.99, 'PREMIUM EDITION', ['Marvel\'s Spider-Man 2', 'Five exclusive suits', 'Photo mode frames and stickers']],
  ['Diablo IV', 'Expansion Bundle', 89.99, 44.99, 'GAME BUNDLE', ['Diablo IV', 'Diablo IV: Vessel of Hatred']],
  ['Mafia: The Old Country', 'Deluxe Edition', 59.99, 35.99, 'PREMIUM EDITION', ['Mafia: The Old Country', 'Deluxe Pack with outfits, vehicles and weapons']],
]

// Add-ons and season passes: [title, base game title, type, price, sale|null, description]
const ADDONS = [
  ['ELDEN RING Shadow of the Erdtree', 'ELDEN RING', 'ADD-ON', 39.99, 23.99, 'Expansion. Travel to the Land of Shadow and follow in the footsteps of Miquella.'],
  ['Cyberpunk 2077: Phantom Liberty', 'Cyberpunk 2077: Ultimate Edition', 'ADD-ON', 29.99, 20.99, 'Spy-thriller expansion. Included in the Ultimate Edition; sold separately for Cyberpunk 2077 owners.'],
  ['Diablo IV: Vessel of Hatred', 'Diablo IV', 'ADD-ON', 39.99, 19.99, 'Expansion. Journey to Nahantu with the new Spiritborn class.'],
  ['Horizon Forbidden West: Burning Shores', 'Horizon Forbidden West Complete Edition', 'ADD-ON', 19.99, 9.99, 'Story expansion set in the ruins of Los Angeles.'],
  ['Call of Duty: Black Ops 7 - BlackCell (Season 01)', 'Call of Duty: Black Ops 7', 'ADD-ON', 29.99, null, 'Premium Battle Pass upgrade with COD Points and an exclusive Operator.'],
  ['Battlefield 6 - Battlefield Pro Token', 'Battlefield 6', 'ADD-ON', 19.99, null, 'Unlock the Battlefield Pro season path for one season.'],
  ['Baldur\'s Gate 3 - Digital Deluxe Edition Upgrade', 'Baldur\'s Gate 3', 'ADD-ON', 14.99, 11.99, 'Original soundtrack, digital art book and in-game cosmetic items.'],
  ['Street Fighter 6 - Year 2 Ultimate Pass', 'Street Fighter 6', 'SEASON PASS', 49.99, 24.99, 'Four Year 2 characters plus costumes and Drive Tickets.'],
  ['TEKKEN 8 - Playable Character Year 2 Pass', 'TEKKEN 8', 'SEASON PASS', 24.99, 14.99, 'Four additional fighters from the second year of TEKKEN 8.'],
  ['Mortal Kombat 1: Khaos Reigns', 'Mortal Kombat 1', 'ADD-ON', 39.99, 9.99, 'Story expansion with three new fighters.'],
  ['FINAL FANTASY XIV: Dawntrail', 'FINAL FANTASY XIV Online', 'ADD-ON', 39.99, null, 'Expansion. Sail to the new continent of Tural.'],
  ['Destiny 2: The Edge of Fate', 'Destiny 2', 'ADD-ON', 39.99, 19.99, 'Expansion. Explore Kepler and uncover the secrets of the Nine.'],
  ['HELLDIVERS 2 - Super Citizen Edition Upgrade', 'HELLDIVERS 2', 'ADD-ON', 19.99, null, 'DP-53 Savior of the Free armor, MP-98 Knight weapon and more.'],
  ['Alan Wake 2: Expansion Pass', 'Alan Wake 2', 'SEASON PASS', 29.99, 14.99, 'Night Springs and The Lake House expansions.'],
  ['Kingdom Come: Deliverance II - Expansion Pass', 'Kingdom Come: Deliverance II', 'SEASON PASS', 39.99, 23.99, 'Three story expansions, including Brushes with Death.'],
  ['Assassin\'s Creed Shadows - Claws of Awaji', 'Assassin\'s Creed Shadows', 'ADD-ON', 24.99, 14.99, 'Expansion. Travel to the mysterious island of Awaji.'],
  ['Star Wars Outlaws Season Pass', 'Star Wars Outlaws', 'SEASON PASS', 39.99, 15.99, 'Two story packs: Wild Card and A Pirate\'s Fortune.'],
  ['Grand Theft Auto V: Story Mode (PlayStation®5)', 'Grand Theft Auto Online (PlayStation®5)', 'ADD-ON', 19.99, null, 'Adds the Grand Theft Auto V Story Mode. Requires Grand Theft Auto Online (PlayStation®5).'],
  ['Hogwarts Legacy: Dark Arts Pack', 'Hogwarts Legacy', 'ADD-ON', 9.99, 4.99, 'Dark Arts Battle Arena, Thestral mount and Dark Arts cosmetic set.'],
  ['Monster Hunter Wilds - Cosmetic DLC Pack', 'Monster Hunter Wilds', 'ADD-ON', 19.99, null, 'Layered armor, pendants and stickers.'],
  ['The Sims™ 4 Businesses & Hobbies Expansion Pack', 'The Sims™ 4', 'ADD-ON', 39.99, 19.99, 'Turn your Sims\' passions into thriving businesses.'],
  ['Gran Turismo 7 - 25th Anniversary Digital Deluxe Upgrade', 'Gran Turismo 7', 'ADD-ON', 19.99, 9.99, 'Bonus cars, livery items and in-game credits.'],
]

// Virtual currency: [title, base game title, price]
const CURRENCY = [
  ['Fortnite - 1,000 V-Bucks', 'Fortnite', 8.99], ['Fortnite - 2,800 V-Bucks', 'Fortnite', 22.99], ['Fortnite - 5,000 V-Bucks', 'Fortnite', 36.99], ['Fortnite - 13,500 V-Bucks', 'Fortnite', 89.99],
  ['Call of Duty® Points - 1,100', 'Call of Duty®: Warzone™', 9.99], ['Call of Duty® Points - 2,400', 'Call of Duty®: Warzone™', 19.99], ['Call of Duty® Points - 5,000', 'Call of Duty®: Warzone™', 39.99], ['Call of Duty® Points - 13,000', 'Call of Duty®: Warzone™', 99.99],
  ['Apex Legends™ - 1,000 Apex Coins', 'Apex Legends™', 9.99], ['Apex Legends™ - 2,150 Apex Coins', 'Apex Legends™', 19.99], ['Apex Legends™ - 4,350 Apex Coins', 'Apex Legends™', 39.99],
  ['EA SPORTS FC™ 27 - 1050 FC Points', 'EA SPORTS FC 27', 9.99], ['EA SPORTS FC™ 27 - 2800 FC Points', 'EA SPORTS FC 27', 24.99], ['EA SPORTS FC™ 27 - 5900 FC Points', 'EA SPORTS FC 27', 49.99],
  ['Roblox - 800 Robux', 'Roblox', 9.99], ['Roblox - 2,000 Robux', 'Roblox', 24.99],
  ['Marvel Rivals - 500 Lattice', 'Marvel Rivals', 4.99], ['Marvel Rivals - 2,180 Lattice', 'Marvel Rivals', 19.99],
  ['Genshin Impact - 980 Genesis Crystals', 'Genshin Impact', 14.99], ['Genshin Impact - 6480 Genesis Crystals', 'Genshin Impact', 99.99],
  ['HELLDIVERS™ 2 - 1,000 Super Credits', 'HELLDIVERS 2', 9.99],
  ['NBA 2K27 - 35,000 VC', 'NBA 2K27', 9.99], ['NBA 2K27 - 75,000 VC', 'NBA 2K27', 19.99],
  ['Overwatch 2 - 1,000 Overwatch Coins', 'Overwatch 2', 9.99],
  ['Minecraft: 3,500 Minecoins', 'Minecraft', 19.99],
  ['Megalodon Shark Cash Card', 'Grand Theft Auto Online (PlayStation®5)', 99.99], ['Whale Shark Cash Card', 'Grand Theft Auto Online (PlayStation®5)', 49.99], ['Great White Shark Cash Card', 'Grand Theft Auto Online (PlayStation®5)', 19.99],
]
// Shark card IDs as listed on the store (GTA$ amounts shown in the description).
const SHARK = { 'Megalodon Shark Cash Card': ['UP1004-CUSA00419_00-GTAVCASHPACK0008', 'GTA$8,000,000'], 'Whale Shark Cash Card': ['UP1004-CUSA00419_00-GTAVCASHPACK0006', 'GTA$3,500,000'], 'Great White Shark Cash Card': ['UP1004-CUSA00419_00-GTAVCASHPACK0004', 'GTA$1,250,000'] }

// PlayStation Plus memberships (prices as on playstation.com/ps-plus).
const PLUS = [
  ['Essential', 1, 10.99], ['Essential', 3, 27.99], ['Essential', 12, 79.99],
  ['Extra', 1, 16.99], ['Extra', 3, 43.99], ['Extra', 12, 134.99],
  ['Premium', 1, 19.99], ['Premium', 3, 54.99], ['Premium', 12, 159.99],
]
const PLUS_PERKS = {
  Essential: ['Monthly games', 'Online multiplayer', 'Exclusive discounts', 'Cloud storage for game saves', 'Share Play'],
  Extra: ['Everything in Essential', 'Game Catalog of hundreds of PS5 and PS4 games', 'Ubisoft+ Classics'],
  Premium: ['Everything in Extra', 'Classics Catalog', 'Game trials', 'Cloud streaming of PS5 games', 'Sony Pictures Catalog'],
}

// PlayStation Direct hardware: [title, department, price, sale|null, item number, art, color, description, specs]
// department: consoles | controllers | audio | remote-play | vr | add-ons
const HARDWARE = [
  ['PlayStation®5 Pro Console', 'consoles', 749.99, null, '1000044776', 'console-pro', 'white', 'The most powerful PS5 console, with an upgraded GPU, advanced ray tracing and PlayStation Spectral Super Resolution. 2TB SSD. Disc drive sold separately.', { Storage: '2TB SSD', 'Disc drive': 'Sold separately', 'Video output': 'Up to 8K, 120Hz', 'In the box': 'PS5 Pro console, DualSense wireless controller, HDMI cable, AC power cord, USB cable' }],
  ['PlayStation®5 Console – Slim', 'consoles', 549.99, null, '1000041935', 'console', 'white', 'Play PS5 and PS4 discs and digital games with an Ultra HD Blu-ray disc drive. 1TB SSD.', { Storage: '1TB SSD', 'Disc drive': 'Ultra HD Blu-ray (included)', 'Video output': '4K, 120Hz', 'In the box': 'PS5 console, DualSense wireless controller, HDMI cable, AC power cord, USB cable' }],
  ['PlayStation®5 Digital Edition – Slim', 'consoles', 499.99, null, '1000041936', 'console-digital', 'white', 'An all-digital PS5 console with no disc drive. 1TB SSD.', { Storage: '1TB SSD', 'Disc drive': 'None (compatible with the Disc Drive for PS5 Digital Edition consoles)', 'Video output': '4K, 120Hz', 'In the box': 'PS5 Digital Edition console, DualSense wireless controller, HDMI cable, AC power cord, USB cable' }],
  ['PlayStation®5 Console – Ghost of Yōtei Bundle', 'consoles', 599.99, 549.99, '1000045201', 'console', 'white', 'PS5 console (with disc drive) and a voucher for Ghost of Yōtei.', { Storage: '1TB SSD', 'Disc drive': 'Ultra HD Blu-ray (included)', 'Included game': 'Ghost of Yōtei (voucher)' }],
  ['PlayStation®5 Pro Console – Call of Duty®: Modern Warfare 4 Bundle', 'consoles', 799.99, null, '1000046110', 'console-pro', 'white', 'PS5 Pro console with a voucher for Call of Duty: Modern Warfare 4. Bundle ships on 10/23/2026.', { Storage: '2TB SSD', 'Included game': 'Call of Duty: Modern Warfare 4 (voucher)' }],
  ['PlayStation®5 Digital Edition – Fortnite Cobalt Star Bundle', 'consoles', 499.99, null, '1000044612', 'console-digital', 'white', 'PS5 Digital Edition console with Fortnite Cobalt Star cosmetics and 1,000 V-Bucks.', { Storage: '1TB SSD', 'Included content': 'Fortnite Cobalt Star bundle and 1,000 V-Bucks (voucher)' }],
  ['DualSense® Wireless Controller – White', 'controllers', 74.99, 54.99, '1000038893', 'controller', 'white', 'Haptic feedback, adaptive triggers, built-in microphone and an iconic comfortable design.', { Connectivity: 'Bluetooth, USB Type-C', Battery: 'Built-in rechargeable', Compatibility: 'PS5, PC, Mac, iOS, Android' }],
  ['DualSense® Wireless Controller – Midnight Black', 'controllers', 74.99, 54.99, '1000038894', 'controller', 'black', 'The DualSense wireless controller in Midnight Black.', { Connectivity: 'Bluetooth, USB Type-C', Battery: 'Built-in rechargeable', Compatibility: 'PS5, PC, Mac, iOS, Android' }],
  ['DualSense® Wireless Controller – Cosmic Red', 'controllers', 74.99, 54.99, '1000038895', 'controller', 'red', 'The DualSense wireless controller in Cosmic Red.', { Connectivity: 'Bluetooth, USB Type-C', Compatibility: 'PS5, PC, Mac, iOS, Android' }],
  ['DualSense® Wireless Controller – Cobalt Blue', 'controllers', 74.99, 54.99, '1000038896', 'controller', 'blue', 'The DualSense wireless controller in Cobalt Blue.', { Connectivity: 'Bluetooth, USB Type-C', Compatibility: 'PS5, PC, Mac, iOS, Android' }],
  ['DualSense® Wireless Controller – Nova Pink', 'controllers', 74.99, 54.99, '1000038897', 'controller', 'pink', 'The DualSense wireless controller in Nova Pink.', { Connectivity: 'Bluetooth, USB Type-C', Compatibility: 'PS5, PC, Mac, iOS, Android' }],
  ['DualSense® Wireless Controller – Galactic Purple', 'controllers', 74.99, 54.99, '1000038898', 'controller', 'purple', 'The DualSense wireless controller in Galactic Purple.', { Connectivity: 'Bluetooth, USB Type-C', Compatibility: 'PS5, PC, Mac, iOS, Android' }],
  ['DualSense® Wireless Controller – Sterling Silver', 'controllers', 79.99, 59.99, '1000040191', 'controller', 'silver', 'Deco edition DualSense wireless controller with a metallic Sterling Silver finish.', { Connectivity: 'Bluetooth, USB Type-C', Compatibility: 'PS5, PC, Mac, iOS, Android' }],
  ['DualSense® Wireless Controller – Chroma Teal', 'controllers', 79.99, null, '1000044402', 'controller', 'teal', 'Chroma Collection DualSense wireless controller with a translucent Chroma Teal design.', { Connectivity: 'Bluetooth, USB Type-C', Compatibility: 'PS5, PC, Mac, iOS, Android' }],
  ['DualSense® Wireless Controller – Chroma Indigo', 'controllers', 79.99, null, '1000044403', 'controller', 'indigo', 'Chroma Collection DualSense wireless controller with a translucent Chroma Indigo design.', { Connectivity: 'Bluetooth, USB Type-C', Compatibility: 'PS5, PC, Mac, iOS, Android' }],
  ['DualSense® Wireless Controller – Ghost of Yōtei Limited Edition', 'controllers', 84.99, null, '1000045204', 'controller', 'gold', 'A limited edition DualSense wireless controller inspired by Ghost of Yōtei.', { Connectivity: 'Bluetooth, USB Type-C', Compatibility: 'PS5, PC, Mac, iOS, Android' }],
  ['DualSense Edge™ Wireless Controller', 'controllers', 199.99, 169.99, '1000032949', 'controller-edge', 'white', 'Ultra-customizable controller with remappable buttons, trigger stops, back buttons and swappable stick modules.', { 'In the box': 'Controller, USB braided cable, carrying case, connector housing, 2 standard caps, 2 high dome caps, 2 low dome caps, 2 half dome back buttons, 2 lever back buttons', Compatibility: 'PS5, PC' }],
  ['DualSense Edge™ Wireless Controller – Midnight Black', 'controllers', 209.99, null, '1000044130', 'controller-edge', 'black', 'The DualSense Edge wireless controller in Midnight Black.', { Compatibility: 'PS5, PC' }],
  ['Access™ controller for PS5', 'controllers', 89.99, null, '1000038938', 'access', 'white', 'A highly customizable controller kit designed to help players with disabilities play more comfortably.', { 'In the box': 'Access controller, 19 swappable button caps, 3 stick caps, 23 button tags, USB cable', Compatibility: 'PS5' }],
  ['DualSense Edge™ Stick Module', 'controllers', 24.99, null, '1000032950', 'stick-module', 'black', 'Replacement stick module for the DualSense Edge wireless controller.', { Compatibility: 'DualSense Edge wireless controller' }],
  ['PULSE Elite™ Wireless Headset', 'audio', 149.99, 119.99, '1000039386', 'headset', 'white', 'Planar magnetic drivers, retractable AI-enhanced noise-rejecting microphone and PlayStation Link wireless.', { Connectivity: 'PlayStation Link, Bluetooth', Battery: 'Up to 30 hours', Compatibility: 'PS5, PS Portal, PC, Mac, mobile' }],
  ['PULSE Elite™ Wireless Headset – Midnight Black', 'audio', 159.99, null, '1000044134', 'headset', 'black', 'The PULSE Elite wireless headset in Midnight Black.', { Connectivity: 'PlayStation Link, Bluetooth', Battery: 'Up to 30 hours' }],
  ['PULSE Explore™ Wireless Earbuds', 'audio', 199.99, 179.99, '1000039387', 'earbuds', 'white', 'Planar magnetic drivers in wireless earbuds, with PlayStation Link for lossless low-latency audio.', { Connectivity: 'PlayStation Link, Bluetooth', Battery: 'Up to 5 hours (plus 10 hours in case)' }],
  ['PULSE 3D™ Wireless Headset', 'audio', 99.99, 79.99, '1000026720', 'headset', 'white', 'Fine-tuned for 3D Audio on PS5 consoles, with dual noise-cancelling microphones.', { Connectivity: 'USB wireless adapter, 3.5mm', Battery: 'Up to 12 hours' }],
  ['PlayStation Portal™ Remote Player', 'remote-play', 199.99, 179.99, '1000039309', 'portal', 'white', 'Play your PS5 console over Wi-Fi with an 8" LCD screen and DualSense controller features.', { Screen: '8" LCD, 1080p, 60fps', Connectivity: 'Wi-Fi', Requirements: 'PS5 console and broadband internet (5Mbps or higher)' }],
  ['PlayStation Portal™ Remote Player – Midnight Black', 'remote-play', 209.99, null, '1000044133', 'portal', 'black', 'PlayStation Portal Remote Player in Midnight Black.', { Screen: '8" LCD, 1080p, 60fps', Connectivity: 'Wi-Fi' }],
  ['PlayStation®VR2', 'vr', 399.99, null, '1000035187', 'vr2', 'white', 'Escape into worlds that feel, look and sound truly real with OLED displays, eye tracking and Sense controllers.', { Display: 'OLED, 2000 x 2040 per eye', 'Refresh rate': '90Hz, 120Hz', 'In the box': 'PS VR2 headset, PS VR2 Sense controllers (L/R), stereo headphones, USB cable', Compatibility: 'PS5 (and PC with the PS VR2 PC adapter)' }],
  ['PlayStation®VR2 Sense™ Controller Charging Station', 'vr', 49.99, null, '1000035188', 'charger', 'white', 'Charge both PS VR2 Sense controllers at once with a simple click-in design.', { Compatibility: 'PS VR2 Sense controllers' }],
  ['PlayStation®VR2 PC adapter', 'vr', 59.99, 49.99, '1000043271', 'adapter', 'black', 'Connect your PS VR2 headset to a compatible PC to play VR games on Steam.', { Requirements: 'DisplayPort 1.4 and Bluetooth 4.0 on the PC' }],
  ['Disc Drive for PS5® Digital Edition Consoles', 'add-ons', 79.99, null, '1000041925', 'disc-drive', 'white', 'Add an Ultra HD Blu-ray disc drive to PS5 Digital Edition and PS5 Pro consoles.', { Compatibility: 'PS5 Digital Edition (slim), PS5 Pro', Note: 'One-time internet connection required for pairing' }],
  ['Vertical Stand for PS5® Consoles', 'add-ons', 29.99, null, '1000041926', 'stand', 'black', 'Stand your PS5 console upright.', { Compatibility: 'PS5 slim consoles, PS5 Pro' }],
  ['DualSense® Charging Station', 'add-ons', 39.99, 29.99, '1000026802', 'charger', 'white', 'Charge up to two DualSense wireless controllers at once without connecting to your console.', { Compatibility: 'DualSense wireless controller' }],
  ['Media Remote for PS5®', 'add-ons', 29.99, null, '1000026800', 'remote', 'black', 'Control movies, streaming services and more with an intuitive layout.', { Compatibility: 'PS5 consoles' }],
  ['HD Camera for PS5®', 'add-ons', 59.99, 39.99, '1000026801', 'camera', 'black', 'Add yourself to your gameplay videos and broadcasts with dual 1080p lenses.', { Resolution: '1080p, dual lenses', Compatibility: 'PS5 consoles' }],
  ['PS5® Console Covers – Midnight Black', 'add-ons', 54.99, null, '1000041927', 'covers', 'black', 'Swap your console\'s covers for Midnight Black. Two-piece set for PS5 slim (disc) consoles.', { Compatibility: 'PS5 slim consoles' }],
  ['PS5® Console Covers – Cobalt Blue', 'add-ons', 54.99, null, '1000041928', 'covers', 'blue', 'Console covers in Cobalt Blue for PS5 slim (disc) consoles.', { Compatibility: 'PS5 slim consoles' }],
  ['PS5® Console Covers – Volcanic Red', 'add-ons', 54.99, null, '1000041929', 'covers', 'red', 'Console covers in Volcanic Red for PS5 slim (disc) consoles.', { Compatibility: 'PS5 slim consoles' }],
  ['PS5® Console Covers – Sterling Silver', 'add-ons', 54.99, null, '1000041930', 'covers', 'silver', 'Deco edition console covers in Sterling Silver for PS5 slim (disc) consoles.', { Compatibility: 'PS5 slim consoles' }],
  ['WD_BLACK™ SN850P NVMe™ SSD for PS5® Consoles – 2TB', 'add-ons', 199.99, 169.99, '1000041931', 'ssd', 'black', 'Officially licensed M.2 SSD with heatsink to expand PS5 storage.', { Capacity: '2TB', Interface: 'PCIe Gen4 NVMe', Compatibility: 'PS5, PS5 Pro' }],
]
export const DIRECT_DEPARTMENTS = [
  ['consoles', 'PS5 consoles'], ['controllers', 'Controllers'], ['audio', 'Gaming audio'], ['remote-play', 'Remote play'], ['vr', 'PS VR2'], ['add-ons', 'Console add-ons'],
]

// ---------------------------------------------------------------------------------------------
const PLATFORM = { 5: ['PS5'], 54: ['PS5', 'PS4'], 4: ['PS4'], v: ['PS5'] }
const contentId = (publisher, code, name) => {
  const pub = PUB[publisher] || String(1000 + hash(publisher) % 8999)
  const n = String(hash(name) % 90000 + 10000)
  const lbl = label(name).slice(0, 16).padEnd(16, '0')
  return `UP${pub}-${code}${n}_00-${lbl}`
}
const ratingFor = (key, hot, release) => {
  const h = hash(key), age = Math.max(1, (Date.parse('2026-10-13') - Date.parse(release)) / 864e5)
  const score = Number((3.9 + (h % 100) / 100).toFixed(2))
  const base = Math.round(Math.min(age, 1500) * (hot ? 220 : 35) * (0.6 + (h % 70) / 100))
  const ratingCount = Math.max(60, base)
  const five = Math.round((score - 3.9) * 60 + 30)
  const four = Math.max(8, 38 - Math.round(five / 3)), one = Math.max(1, Math.round((5 - score) * 3))
  const three = Math.max(2, Math.round((5 - score) * 6)), two = Math.max(1, 100 - five - four - three - one)
  return { score, ratingCount, distribution: [five, four, three, two, one] }
}
const genreCopy = { Action: 'action', Adventure: 'adventure', Shooter: 'shooter', 'Driving/Racing': 'racing', 'Role Playing Games': 'role-playing', Sport: 'sports', Fighting: 'fighting', Simulation: 'simulation', Strategy: 'strategy', Horror: 'horror', Family: 'family', Puzzle: 'puzzle', Party: 'party', 'Music/Rhythm': 'rhythm' }

const items = []
const byTitle = new Map()
GAMES.forEach(([title, publisher, release, genres, rating, plat, price, sale, flags, blurb], i) => {
  const f = new Set(flags.split(' ').filter(Boolean))
  const platforms = PLATFORM[plat]
  const ps4Only = plat === '4'
  const pre = f.has('pre')
  const r = ratingFor(title, f.has('hot'), release)
  const p = {
    id: contentId(publisher, ps4Only ? 'CUSA' : 'PPSA', title), shelf: true, department: 'games', kind: 'other', format: 'digital',
    title, publisher, release, genres, rating, platforms, chips: [...platforms, ...(plat === 'v' ? ['PS VR2'] : [])],
    type: pre ? 'PRE-ORDER' : price === 0 ? 'FREE' : 'FULL GAME', cta: pre ? 'preorder' : 'cart', contentType: 'base-game',
    price, originalPrice: sale !== null ? price : price, editionName: 'Standard Edition', family: slugify(title),
    blurb, bullets: [blurb], plusTag: f.has('premium') ? 'Premium' : f.has('extra') ? 'Extra' : null, plusAdded: f.has('extra') || f.has('premium') ? `2026-${String(1 + hash(title) % 9).padStart(2, '0')}-15` : null,
    features: [...(f.has('pro') ? ['PS5 Pro Enhanced'] : []), ...(f.has('rp') || platforms.includes('PS5') && hash(title) % 3 === 0 ? ['Remote Play'] : []), ...(f.has('local') ? ['Local Multiplayer'] : []), ...(f.has('online') ? ['Online Multiplayer'] : []), ...(publisher === 'Sony Interactive Entertainment' && platforms.includes('PS5') ? ['Game Help'] : [])],
    vr: plat === 'v' ? 'PS VR2 required' : f.has('vr') ? 'PS VR2 optional' : 'No VR',
    localPlayers: f.has('local') ? 4 : 1, onlinePlayers: f.has('online') ? (genres === 'Shooter' ? 64 : 8) : 0,
    onlineRequired: price === 0 && !['The Sims™ 4'].includes(title) || ['HELLDIVERS 2', 'Marathon', 'Diablo IV', 'FINAL FANTASY XIV Online', 'Dune: Awakening'].includes(title),
    entitlements: platforms.map(v => `${v} digital license`), available: true, hot: f.has('hot'),
    keywords: `${genreCopy[genres] || ''} ${publisher} ${platforms.join(' ')} ${price === 0 ? 'free to play f2p' : ''} ${pre ? 'pre-order preorder' : ''} ${plat === 'v' ? 'vr psvr2 ps vr2' : ''}`,
    ...r, bestRank: i + 1, downloadRank: price === 0 ? i - 200 : i,
  }
  if (sale !== null) { p.originalPrice = price; p.price = sale }
  if (/^Grand Theft Auto|^Red Dead|^Bully/.test(title)) p.keywords += ' rockstar gta'
  if (title === 'Grand Theft Auto V (PlayStation®5)') { p.id = 'UP1004-PPSA03420_00-GTAVSTANDALONE01'; p.keywords += ' gta5 gtav five' }
  if (title === 'Grand Theft Auto Online (PlayStation®5)') { p.id = 'UP1004-PPSA03420_00-GTAOSTANDALONE01'; p.keywords += ' gta5 gtav' }
  if (title.startsWith('Grand Theft Auto: The Trilogy')) { p.id = 'UP1004-PPSA02469_00-GTATRILOGYDEFED0'; p.type = 'GAME BUNDLE'; p.keywords += ' vice city san andreas' }
  items.push(p); byTitle.set(title, p)
})
EDITIONS.forEach(([baseTitle, edition, price, sale, type, included]) => {
  const b = byTitle.get(baseTitle)
  const title = `${baseTitle} ${edition}`
  items.push({
    ...b, id: contentId(b.publisher, b.id.includes('CUSA') ? 'CUSA' : 'PPSA', title), title, editionName: edition, type: b.cta === 'preorder' ? 'PRE-ORDER' : type,
    price: sale ?? price, originalPrice: price, bullets: included, blurb: `${edition} of ${baseTitle}. ${b.blurb}`, includedSkus: [b.id],
    entitlements: [...b.entitlements, ...included.slice(1)], plusTag: null, plusAdded: null, hot: false, bestRank: b.bestRank + 0.5, downloadRank: b.downloadRank + 300,
    ...ratingFor(title, false, b.release),
  })
})
ADDONS.forEach(([title, baseTitle, type, price, sale, blurb], i) => {
  const b = byTitle.get(baseTitle)
  items.push({
    ...b, id: contentId(b.publisher, b.id.includes('CUSA') ? 'CUSA' : 'PPSA', title), title, editionName: type === 'SEASON PASS' ? 'Season Pass' : 'Add-On', type, contentType: 'add-on', cta: 'cart',
    price: sale ?? price, originalPrice: price, bullets: [blurb], blurb, baseId: b.id, entitlements: [`${title} for ${b.platforms.join(' / ')}`], includedSkus: undefined,
    plusTag: null, plusAdded: null, hot: false, features: [], bestRank: 200 + i, downloadRank: 400 + i, keywords: `${b.keywords} add-on addon dlc expansion ${type.toLowerCase()} ${baseTitle}`,
    ...ratingFor(title, false, b.release),
  })
})
CURRENCY.forEach(([title, baseTitle, price], i) => {
  const b = byTitle.get(baseTitle)
  const shark = SHARK[title]
  items.push({
    ...b, id: shark ? shark[0] : contentId(b.publisher, b.id.includes('CUSA') ? 'CUSA' : 'PPSA', title), title, editionName: 'Virtual Currency', type: 'VIRTUAL CURRENCY', contentType: 'consumable', cta: 'cart',
    price, originalPrice: price, blurb: shark ? `${shark[1]} for Grand Theft Auto Online.` : `${title.replace(/^.* - /, '')} for ${baseTitle}.`, baseId: b.id,
    entitlements: [`${title} (in-game currency)`], includedSkus: undefined, plusTag: null, plusAdded: null, hot: false, features: [], bestRank: 250 + i, downloadRank: 100 + i,
    keywords: `${b.keywords} virtual currency in-game coins points ${baseTitle} ${shark ? 'shark card gta$ gta online' : ''}`, ...ratingFor(title, false, b.release),
  })
  items.at(-1).bullets = [items.at(-1).blurb]
})
PLUS.forEach(([tier, months, price], i) => {
  const title = `PlayStation Plus ${tier}: ${months} Month Subscription`
  items.push({
    id: `UP9000-NPUO00${tier === 'Essential' ? 101 : tier === 'Extra' ? 102 : 103}_00-PSPLUS${tier.toUpperCase().slice(0, 4)}${String(months).padStart(2, '0')}MONTH`.slice(0, 36), shelf: true, department: 'subscriptions', kind: 'other', format: 'digital',
    title, publisher: 'Sony Interactive Entertainment', release: '6/13/2022', genres: 'Subscription', rating: 'RP', platforms: ['PS5', 'PS4'], chips: ['PS5', 'PS4'],
    type: 'SUBSCRIPTION', cta: 'cart', contentType: 'subscription', price, originalPrice: price, editionName: `${months} month${months > 1 ? 's' : ''}`, family: `ps-plus-${tier.toLowerCase()}`, tier, months,
    blurb: `${months}-month PlayStation Plus ${tier} membership. Renews automatically at the then-current price until cancelled.`, bullets: PLUS_PERKS[tier],
    plusTag: null, plusAdded: null, features: [], vr: 'No VR', localPlayers: 1, onlinePlayers: 0, onlineRequired: true, entitlements: [`PlayStation Plus ${tier} membership (${months} month${months > 1 ? 's' : ''})`],
    available: true, keywords: `ps plus playstation plus psplus subscription membership ${tier} ${months} month`, score: 4.6, ratingCount: 0, distribution: [], bestRank: 30 + i, downloadRank: 30 + i,
  })
})
HARDWARE.forEach(([title, department, price, sale, item, art, color, description, specs], i) => {
  const kind = department === 'consoles' ? 'CONSOLE' : 'ACCESSORY'
  const path = department === 'consoles' ? 'buy-consoles' : 'buy-accessories'
  const slug = slugify(title.replace(/–/g, ' '))
  const r = ratingFor(title, department === 'consoles' || /DualSense® Wireless Controller – (White|Midnight)/.test(title), '1/1/2024')
  items.push({
    id: item, shelf: true, department: 'hardware', directDepartment: department, directPath: `/direct.playstation.com/en-us/${path}/${slug}`, kind: 'other', physical: true, format: 'hardware', formatLabel: 'Hardware',
    title, brand: title.startsWith('WD_BLACK') ? 'Western Digital' : 'PlayStation', publisher: title.startsWith('WD_BLACK') ? 'Western Digital' : 'Sony Interactive Entertainment', release: '1/1/2024', genres: 'Hardware', rating: null,
    platforms: ['PS5'], chips: ['PS5'], type: kind, cta: 'cart', contentType: 'hardware', price: sale ?? price, originalPrice: price, editionName: 'Hardware', family: slug,
    art, color, blurb: description, bullets: [description], specs: { 'Item number': item, ...specs }, stock: 25, shippingLabel: 'Free standard shipping · 3–5 business days',
    plusTag: null, plusAdded: null, features: [], vr: department === 'vr' ? 'PS VR2 required' : 'No VR', localPlayers: 0, onlinePlayers: 0, entitlements: [], available: true,
    keywords: `hardware ${department.replace('-', ' ')} ${kind.toLowerCase()} ${title.includes('DualSense') ? 'controller dualsense ps5 controller gamepad' : ''} ${department === 'consoles' ? 'ps5 console playstation 5 system' : ''} ${department === 'audio' ? 'headset headphones earbuds audio pulse' : ''} ${department === 'vr' ? 'vr psvr2 virtual reality' : ''} ${department === 'remote-play' ? 'portal handheld remote player' : ''}`,
    ...r, bestRank: 20 + i, downloadRank: 900 + i,
  })
})

for (const p of items) {
  p.search = `${p.title} ${p.keywords}`
  p.ordinary = true
}
const date = p => new Date(p.release).getTime()
const TODAY = Date.parse('2026-10-13')
export const SHELF_COLLECTIONS = [
  ['new-releases', 'New releases', 'The latest games on PlayStation Store.', p => p.contentType === 'base-game' && p.editionName === 'Standard Edition' && p.cta === 'cart' && date(p) >= Date.parse('2026-06-01') && date(p) <= TODAY],
  ['pre-orders', 'Pre-orders', 'Pre-order upcoming games and editions. You are charged when you place the pre-order.', p => p.cta === 'preorder'],
  ['studios', 'PlayStation Studios', 'Distinctive adventures from PlayStation Studios.', p => p.publisher === 'Sony Interactive Entertainment' && p.contentType === 'base-game' && p.department === 'games'],
  ['free-to-play', 'Free to play', 'Add a free game to your library. Optional purchases may be available in-game.', p => p.price === 0],
  ['under-20', 'Games under $20', 'Great games that cost less than $20.', p => p.contentType === 'base-game' && p.price > 0 && p.price < 20],
  ['horror', 'Halloween horror', 'Survival horror and psychological scares for the spooky season.', p => p.genres === 'Horror' && p.contentType === 'base-game'],
  ['sports', 'Sports games', 'Football, basketball, baseball and more.', p => p.genres === 'Sport' && p.contentType === 'base-game'],
  ['racing', 'Racing games', 'From the circuit to the open road.', p => p.genres === 'Driving/Racing' && p.contentType === 'base-game'],
  ['rpg', 'Role-playing games', 'Build a party and follow your own story.', p => p.genres === 'Role Playing Games' && p.contentType === 'base-game'],
  ['together', 'Play together', 'Share a sofa or connect with friends online.', p => p.contentType === 'base-game' && (p.localPlayers > 1 || p.onlinePlayers > 1)],
  ['ps-vr2', 'PS VR2 games', 'Games built for PlayStation VR2.', p => p.vr === 'PS VR2 required' || p.vr === 'PS VR2 optional'],
  ['add-ons', 'Add-ons and in-game currency', 'Expand a game you already play. Check the required base game and platform.', p => p.contentType === 'add-on' || p.contentType === 'consumable'],
]
export const SHELF = items
export const DIRECT_ITEMS = items.filter(p => p.department === 'hardware')
export const STORE_ITEMS = items.filter(p => p.department !== 'hardware')
