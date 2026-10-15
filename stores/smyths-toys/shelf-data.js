// Smyths Toys UK shop-floor assortment for the reference storefront.
// Rows were read from smythstoys.com/uk/en-gb category listings and the homepage on 2026-10-13
// (Ref numbers, names, prices, was-prices, listing ratings and category URL paths). Where a listing
// did not show a rating, the rating column is blank and shelf.js fills a stable plausible value.
// These items are ordinary merchandise for browsing; they are NOT part of the evidence-backed
// GTA VI rows in data.js / catalog-evidence.js and never become GTA order lines.
//
// Columns: ref | title | price | was | rating | category URL path | category codes | brand
// The first category code is the primary one (department is derived from it).
export const SHELF_ROWS = `
189784|PJ Masks Playset 2-in-1 Transforming Mobile HQ|64.99|69.99|4.4|toys/action-figures-and-playsets/pj-masks|SM060101,top-toys|PJ Masks
225620|Missy Kissy Talking Baby Doll 38cm|24.99|29.99|4.8|toys/fashion-and-dolls/baby-dolls|SM060104,top-toys|Missy Kissy
259321|Battat Light-Up Vanity Beauty Playset|24.99|29.99||toys/pre-school-and-electronic-learning/battat|SM060103,top-toys|Battat
259868|Bolt the Robo Pup Interactive Toy|19.99||5.0|toys/construction-and-cars/robots|SM060102,top-toys|Robo Pets
259825|Race & Chase Laser Remote Control Car|19.99|||toys/construction-and-cars/radio-control-cars|SM060102,top-toys|Speed Machines
236277|Kitchen Corner Grocery Store Playset with Accessories 64 Pieces|29.99|34.99|4.5|toys/wooden-toys-and-puzzles/wooden-kitchens|SM060120,top-toys|Kitchen Corner
223155|L.O.L. Surprise! O.M.G. Glam N' Go Camper Playset|39.99|49.99|4.4|toys/fashion-and-dolls/lol-surprise|SM060104,top-toys|L.O.L. Surprise!
259697|Barbie Dream Plane|79.99|99.99|5.0|toys/fashion-and-dolls/barbie|SM06010403,top-toys|Barbie
258639|HEX Bots Alive Inside Robot Remote Control Explodapede|24.99|29.99||toys/construction-and-cars/robots|SM060102|HEXBUG
254684|Disney Pixar Toy Story 5 Interactables Figure 2 Pack Woody & Buzz Lightyear|39.99|49.99|5.0|toys/action-figures-and-playsets/toy-story|SM060101,top-toys|Disney Toy Story
263039|Magnetic Cubes 200 Piece Village Building Set|29.99||5.0|toys/construction-and-cars/magnetic-tiles-and-building-blocks|SM060102,SM060113|Magnetic Cubes
261366|Netflix KPop Demon Hunters Kinetic Sand Ramen Surprise Cup Assortment|9.99|||toys/arts-crafts-and-music/kinetic-sand|SM060105,SM060639,SM060114|Kinetic Sand
258395|Sticki Rolls Aphmau Rolluxe Handbag and Jewellery Making Kit|39.99|||toys/arts-crafts-and-music/jewellery-making|SM060105|Sticki Rolls
261250|Crafty Co. Wooden Arts & Craft Table and Stool|39.99|49.99||toys/arts-crafts-and-music/craft-sets|SM060105,SM060120|Crafty Co.
148245|Play-Doh Tubs 85g Super Colour 20 Pack|10.00||4.9|toys/arts-crafts-and-music/play-doh|SM060105,top-toys|Play-Doh
199195|3Doodler Start+ 3D Printing Pen Essentials Set|39.99||4.2|toys/arts-crafts-and-music/3d-art|SM060105,SM060113|3Doodler
200593|SmART Sketcher Projector 2.0 Tracing Drawing Set|59.99||4.6|toys/arts-crafts-and-music/drawing-and-sketching|SM060105,SM060113|SmART Sketcher
255761|Rump Race Game|19.99||2.5|toys/games-puzzles-and-books/board-games/family-board-games|SM060106|Goliath
245308|Stay Active Level Out Balance Board Electronic Game|24.99||4.6|toys/games-puzzles-and-books/board-games/family-board-games|SM060106|Stay Active
242702|Marble Run Electronic 310 Piece Game|24.99||5.0|toys/games-puzzles-and-books/board-games/childrens-board-games|SM060106,SM060113|Marble Run
258254|UNO Show 'Em No Mercy Extreme|19.99||5.0|toys/games-puzzles-and-books/board-games/family-board-games|SM060106|UNO
258593|Gui Gui By Salish Beautify Your Slime Mega Pack|49.99||5.0|toys/arts-crafts-and-music/slime-and-putty|SM060105|Gui Gui
255835|Pets Alive by ZURU Mommy Elephant and Baby Surprise Set|34.99||5.0|toys/fashion-and-dolls/pets-alive|SM060104|ZURU
250454|Arias Reborn Doll 40cm Noah with Cushion|69.99||4.8|toys/fashion-and-dolls/baby-dolls|SM060104|Arias
256185|Arias Reborn Doll 40cm Ariel with Cushion|69.99||5.0|toys/fashion-and-dolls/baby-dolls|SM060104|Arias
259335|Arias Reborn De Paris Doll Carriage Pram Handle Height 93cm|79.99||5.0|toys/fashion-and-dolls/dolls-prams-and-strollers|SM060104|Arias
254202|Silver Cross Ranger Baby Doll Pram Pink and Black|29.99||4.8|toys/fashion-and-dolls/dolls-prams-and-strollers|SM060104|Silver Cross
232424|LEGO Marvel 76269 Avengers Tower Set for Adults|429.99||4.9|toys/lego-and-bricks/lego-marvel|SM060107|LEGO
226501|LEGO Ideas 21330 Home Alone McCallisters' House Set for Adults|259.99||4.9|toys/lego-and-bricks/lego-ideas|SM060107|LEGO
259175|LEGO Technic 42232 Koenigsegg Sadair's Spear Megacar Set for Adults|349.99|399.99|3.0|toys/lego-and-bricks/lego-technic|SM060107,new-lego-range|LEGO
208001|LEGO City 60337 Remote Control Express Passenger Train Set Powered UP|137.99|139.99|4.9|toys/lego-and-bricks/lego-city|SM060107|LEGO
254465|LEGO Editions 43023 McLaren Mastercard F1 Team Lando Norris Helmet Set|63.99|79.99|5.0|toys/lego-and-bricks/lego-editions|SM060107|LEGO
253736|LEGO Marvel 76344 Iron Man Mark 3 Collector's Edition Set for Adults|102.99|119.99|4.9|toys/lego-and-bricks/lego-marvel|SM060107|LEGO
236732|LEGO Harry Potter 76435 Hogwarts Castle: The Great Hall Set|169.99||4.9|toys/lego-and-bricks/lego-harry-potter|SM060107|LEGO
248583|LEGO Icons 10351 Sherlock Holmes: Book Nook Set for Adults|109.99||5.0|toys/lego-and-bricks/lego-icons|SM060107|LEGO
259143|LEGO Pokémon 72164 SMART Play: Training House with Pikachu Set|54.99|59.99|5.0|toys/lego-and-bricks/lego-pokemon|SM060107,new-lego-range|LEGO
254413|LEGO Editions 43012 Football Highlights: Cristiano Ronaldo Set|17.99|24.99|4.6|toys/lego-and-bricks/lego-editions|SM060107|LEGO
141295|LEGO Classic 10698 Large Creative Brick Box Classic Building Bricks Set|34.99|44.99|4.9|toys/lego-and-bricks/lego-classic|SM060107|LEGO
259186|LEGO Minecraft 21582 Chicken Jockey Set|19.99|24.99||toys/lego-and-bricks/lego-minecraft|SM060107,new-lego-range|LEGO
253726|LEGO Icons 10365 Captain Jack Sparrow's Pirates of the Caribbean Ship Set for Adults|299.99||5.0|toys/lego-and-bricks/lego-icons|SM060107|LEGO
253762|LEGO DC Batman 76300 Arkham Asylum Set for Adults|269.99||4.9|toys/lego-and-bricks/lego-dc|SM060107|LEGO
258989|LEGO City 60501 Lava Land Roller Coaster Park Set|89.99|||toys/lego-and-bricks/lego-city|SM060107,new-lego-range|LEGO
243554|LEGO Harry Potter 76444 Diagon Alley Wizarding Shops Set for Adults|132.99|169.99|4.7|toys/lego-and-bricks/lego-harry-potter|SM060107|LEGO
259210|LEGO City 60511 Vintage Steam Train Set|60.99|79.99|5.0|toys/lego-and-bricks/lego-city|SM060107,new-lego-range|LEGO
254456|LEGO Icons 11370 Stranger Things: The Creel House Set for Adults|249.99||5.0|toys/lego-and-bricks/lego-icons|SM060107|LEGO
254450|LEGO Disney 43306 Toy Story Lotso Set|34.99||5.0|toys/lego-and-bricks/lego-disney|SM060107|LEGO
254454|LEGO Editions 43022 Scuderia Ferrari HP Lewis Hamilton Helmet Set|63.99|79.99|5.0|toys/lego-and-bricks/lego-editions|SM060107|LEGO
222334|Dimples Wooden Light-Up Vanity Table and Stool|39.99|49.99||toys/fashion-and-dolls/kids-costumes-dress-up-and-face-paint|SM060104,SM060120|Dimples
244796|Kitchen Corner Wooden Play Kitchen|29.99|||toys/wooden-toys-and-puzzles/wooden-kitchens|SM060120|Kitchen Corner
259505|Clickeez Advent Calendar|29.99|||toys/fashion-and-dolls/clickeez|SM060104|Clickeez
257207|My Mini Baby Mom & Surprise Doll By ZURU|19.99|||toys/fashion-and-dolls/5-surprise-mini-brands|SM060104,SM06010416|ZURU
256824|Little Live Pets My Baby Kiki the Koala Interactive Pet|29.99|||toys/top-toys|SM060104,top-toys|Little Live Pets
253307|Pokémon Pikachu Puppetronic by RealFX Interactive Toy|59.99|69.99|3.9|toys/action-figures-and-playsets/pokemon-toys/pokemon-playsets-and-figures|SM060101|Pokémon
177648|Barbie Malibu House Playset|49.99|||toys/fashion-and-dolls/barbie|SM06010403|Barbie
259219|Clickeez Clickable Bubble Pops 12 Pack Assortment|19.99|||toys/fashion-and-dolls/clickeez|SM060104|Clickeez
230737|Dimples Wooden Dress-Up Rack with Light-Up Mirror|59.99|||toys/fashion-and-dolls/wooden-furniture|SM060104,SM060120|Dimples
238663|Monster High Playset Haunted High School|99.99|149.99||toys/fashion-and-dolls/monster-high|SM060104|Monster High
259351|Clickeez Clickable Bubble Pops Keyboard Mega Pack|29.99|||toys/fashion-and-dolls/clickeez|SM060104|Clickeez
219082|Sadie's Wooden Doll House|69.99|||toys/wooden-toys-and-puzzles/wooden-dolls-houses-and-accessories|SM060120,SM060104|Sadie's
258090|Little Live Pets My Magical Dragon Skye Interactive Pet|49.99|||toys/fashion-and-dolls/little-live-pets|SM060104|Little Live Pets
259762|Bitzee Aquarium Interactive Digital Pet|39.99|||toys/fashion-and-dolls/interactive-pets|SM060104|Bitzee
253214|Our Generation Doll Sister Tory & Baby Riley|36.99|||toys/fashion-and-dolls/our-generation/our-generation-dolls|SM060104|Our Generation
177651|Barbie Dream Plane with Pilot Doll Playset|49.99|||toys/fashion-and-dolls/barbie|SM06010403|Barbie
148402|Barbie Wedding Gift Set Dolls 4 Pack|29.99|||toys/fashion-and-dolls/barbie|SM06010403|Barbie
254683|Disney Toy Story Ultimate Action Buzz Lightyear Interactive Toy|49.99|59.99|4.7|toys/top-toys|SM060101,top-toys|Disney Toy Story
254698|Disney Toy Story Ultimate Action Woody Interactive Toy|49.99|59.99|4.7|toys/top-toys|SM060101,top-toys|Disney Toy Story
197425|Disney Toy Story Action Figures RV Friends 6 Pack|44.99||4.8|toys/action-figures-and-playsets/toy-story|SM060101|Disney Toy Story
255238|WWE Wrekkin' Slambulance Breakaway Vehicle|39.99|44.99|3.0|toys/action-figures-and-playsets/wwe-wrestling/wwe-wrestling-range|SM060101|WWE
260829|Toy Story Bullseye Inflatable Hopper|19.99|||toys/action-figures-and-playsets/toy-story|SM060101|Disney Toy Story
254742|Disney Pixar Toy Story 5 Figure Roundup Bullseye 30cm|34.99||5.0|toys/action-figures-and-playsets/toy-story|SM060101|Disney Toy Story
257735|Five Nights at Freddy's Action Figure Endo-Series Montgomery Gator 15cm|24.99||3.8|toys/action-figures-and-playsets/five-nights-at-freddys|SM060101|Five Nights at Freddy's
242936|WWE Playset Survivor Series War Games|74.99||4.3|toys/action-figures-and-playsets/wwe-wrestling/wwe-ring-playsets|SM060101|WWE
258895|Marvel Spidey and His Amazing Friends Playset Rescue Web-Quarters|39.99|49.99||toys/action-figures-and-playsets/spidey-and-his-amazing-friends|SM060101,SM060613|Marvel
254238|Nintendo The Super Mario Galaxy Movie: Hatchin' Yoshi Interactive Toy Egg|39.99|59.99|4.2|toys/fashion-and-dolls/interactive-pets|SM060104|Super Mario
103133|Disney Toy Story Slinky Dog|19.99||4.6|toys/action-figures-and-playsets/toy-story|SM060101|Disney Toy Story
263509|WWE Ultimate Edition Action Figure Kane|29.99|||toys/action-figures-and-playsets/wwe-wrestling/wwe-ultimate-figures|SM060101|WWE
252525|Robo Alive by ZURU Mega Aquarium Set 17 Piece|39.99||4.7|toys/action-figures-and-playsets/robo-alive|SM060101|ZURU
233320|Disney Pixar Cars Mack Mini Racers Hauler with 5 Diecast Cars|19.99||4.4|toys/action-figures-and-playsets/disney-cars/disney-cars-range|SM060101,SM060102|Disney Cars
199193|Super Mario Deluxe Bowser's Airship Playset|24.99|29.99|4.1|toys/action-figures-and-playsets/mario-figures-and-playsets|SM060101|Super Mario
258282|Poo Fighters Poo Drop Challenge Game|14.99|||toys/top-toys|SM060106,top-toys|Poo Fighters
259994|Zoom Chutes|79.99|||toys/games-puzzles-and-books/board-games/preschool-board-games|SM060106|Zoom Chutes
225185|Electronic Arcade Game Crane Game Claw Machine|29.99|||toys/games-puzzles-and-books/tabletop-arcade-games|SM060106|Arcade Classics
239242|Flip'Ems Bottle Character Assortment|12.99|||toys/games-puzzles-and-books/board-games/childrens-board-games|SM060106|Flip'Ems
199624|Elefun Game|19.99|||toys/games-puzzles-and-books/board-games/hasbro-board-games|SM060106|Hasbro Gaming
260695|Guess Who? Pokémon Edition Game|19.99|||toys/games-puzzles-and-books/board-games/childrens-board-games|SM060106|Hasbro Gaming
252682|Hot Dog Drop Game|19.99|||toys/games-puzzles-and-books/board-games/childrens-board-games|SM060106|Goliath
213055|Stay Active Jump-It Wipeout Game|49.99|||toys/games-puzzles-and-books/board-games/family-board-games|SM060106|Stay Active
248039|Hasbro Simon Jump Electronic Game Mat|24.99|||toys/games-puzzles-and-books/board-games/adult-and-party-board-games|SM060106|Hasbro Gaming
258778|Ravensburger Netflix KPop Demon Hunters Jigsaw Puzzles Bumper Pack 4 x 100 Pieces|8.99|||toys/games-puzzles-and-books/jigsaws-and-puzzles/ravensburger-puzzles-bumper-packs|SM060106,SM060639,SM060114|Ravensburger
211444|Electronic Arcade Game Smash-A-Mole Machine|29.99|||toys/games-puzzles-and-books/tabletop-arcade-games|SM060106|Arcade Classics
255381|Colour Stack Challenge Game|19.99|21.99||toys/games-puzzles-and-books/board-games/family-board-games|SM060106|Goliath
256134|Hues and Cues Board Game|20.99|||toys/games-puzzles-and-books/board-games/family-board-games|SM060106|The Op
242741|Battat Hippodontist Colour-Changing Dentist Playset|16.99|||toys/pre-school-and-electronic-learning/battat|SM060103|Battat
159727|Electronic Arcade Game Hover Shot 2.0 Shooting Gallery|19.99|||toys/games-puzzles-and-books/tabletop-arcade-games|SM060106|Arcade Classics
236068|Magnetic Tiles Ball Run 125-Piece Set|34.99|||toys/construction-and-cars/magnetic-tiles-and-building-blocks|SM060102,SM060113|Magnetic Tiles
251522|Crafty Co. Drawing Robot Set|39.99|||toys/arts-crafts-and-music/drawing-and-sketching|SM060105,SM060113|Crafty Co.
196848|Hot Wheels City Mega Garage Playset|39.99|||toys/construction-and-cars/hot-wheels/hot-wheels-playsets|SM06010210|Hot Wheels
238225|Hot Wheels City Roller Coaster Rally Playset with 5 Diecast Cars|34.99|||toys/construction-and-cars/hot-wheels/hot-wheels-playsets|SM06010210|Hot Wheels
211190|Laser X Revolution Laser Tag Double Blasters 2 Pack|29.99|||toys/construction-and-cars/blasters-and-toy-guns|SM060102|Laser X
230551|Magnetic Tiles 100-Piece Building Set|39.99|||toys/construction-and-cars/magnetic-tiles-and-building-blocks|SM060102,SM060113|Magnetic Tiles
246645|Remote Control Titan Crawler Truck 1:8 Scale|49.99|||toys/construction-and-cars/radio-control-cars|SM060102|Speed Machines
260878|Magnetic Tiles Construction Site 86-Piece Building Set|39.99|||toys/construction-and-cars/magnetic-tiles-and-building-blocks|SM060102|Magnetic Tiles
234293|Marvel Spider-Man Remote Control Skateboard Figure Set|29.99|||brand/spider-man|SM060102,SM060613|Marvel
260151|Robo Strikers Remote Control Soccer Robot|19.99|||toys/construction-and-cars/robots|SM060102|Robo Strikers
188373|Ziggy the Robo Dog|29.99|||toys/construction-and-cars/robots|SM060102|Robo Pets
196849|Hot Wheels Mario Kart Rainbow Road Race Track Playset|92.99|109.99||toys/construction-and-cars/hot-wheels/hot-wheels-playsets|SM06010210|Hot Wheels
242696|Play Factory Foam Blocks 24 Pack|39.99|||toys/construction-and-cars/other-construction|SM06010315,SM060102|Play Factory
239343|Zoey the Robo Dog|29.99|||toys/construction-and-cars/robots|SM060102|Robo Pets
250277|Com Creator Video Walkie Talkies Set|29.99|||toys/construction-and-cars/spy-kits-and-walkie-talkies|SM060102|Com Creator
257093|Magnetic Cubes 200-Piece Adventure Building Set|29.99|||toys/construction-and-cars/magnetic-tiles-and-building-blocks|SM060102|Magnetic Cubes
262128|Tonies Audio Character Set Bluey, Bingo and Muffin Multipack|39.99|||toys/pre-school-and-electronic-learning/tonies/toniebox-audio|SM0601039702|Tonies
248526|PAW Patrol My Size Lookout Tower with Chase Figure and Vehicle|79.99|||toys/pre-school-and-electronic-learning/paw-patrol-toys|SM06010350|PAW Patrol
242359|Play Factory Air Track Inflatable Gym Mat|79.99||5.0|toys/pre-school-and-electronic-learning/play-factory|SM06010315|Play Factory
250815|Play Factory Sensory Spinning Chair Blue|34.99|39.99|4.9|toys/pre-school-and-electronic-learning/play-factory|SM06010315|Play Factory
255596|Play Factory Sensory Spinning Chair Pink|34.99|39.99|4.9|toys/pre-school-and-electronic-learning/play-factory|SM06010315|Play Factory
189360|Fisher-Price Little People Playset Caring for Animals Farm|34.99||4.8|toys/pre-school-and-electronic-learning/fisher-price/fisher-price-little-people|SM060103|Fisher-Price
251102|Tonies Toniebox 2 Starter Set Cloud Pink|109.99|||toys/pre-school-and-electronic-learning/tonies/toniebox|SM0601039702|Tonies
251066|Tonies Toniebox 2 Starter Set Sky Blue|109.99|||toys/pre-school-and-electronic-learning/tonies/toniebox|SM0601039702|Tonies
256688|Bluey's Light and Surprise Mega House Playset 73.5 cm|99.99|||toys/pre-school-and-electronic-learning/bluey|SM060103|Bluey
258445|Fisher-Price Little People Barbie DreamHouse Bundle Playset|59.99|||toys/pre-school-and-electronic-learning/fisher-price/fisher-price-little-people|SM060103|Fisher-Price
239065|Play Factory Gymnastic Bar|39.99||4.7|toys/pre-school-and-electronic-learning/play-factory|SM06010315|Play Factory
148260|Fisher-Price Princess Mommy Baby Walker and Doll Set|34.99|||toys/educational-toys|SM060103|Fisher-Price
258424|PAW Patrol: The Dino Movie Ultimate Dino Hauler Motorised Vehicle|49.99|||toys/pre-school-and-electronic-learning/paw-patrol-toys|SM06010350|PAW Patrol
160535|LeapFrog Scoop & Learn Ice Cream Cart|44.99||4.8|toys/pre-school-and-electronic-learning/leapfrog-toys/leapfrog-infant|SM060103|LeapFrog
248437|Gabby's Dollhouse: The Movie 73cm Deluxe Interactive Meow-mazing Dollhouse Playset|79.99|||toys/pre-school-and-electronic-learning/gabbys-dollhouse|SM060103|Gabby's Dollhouse
257637|Danny Go! Colour Beat Drumsticks|19.99|||toys/arts-crafts-and-music/musical-instruments-and-karaoke/toy-musical|SM060105|Danny Go!
208863|Fisher-Price Little People Disney Princess Playset Play & Go Castle|34.99||4.6|toys/pre-school-and-electronic-learning/fisher-price/fisher-price-little-people|SM060103|Fisher-Price
259813|Play Factory Sensory Jump Mat|39.99|49.99|5.0|toys/pre-school-and-electronic-learning/play-factory|SM06010315|Play Factory
250283|Play Factory Musical Wave Balance Beam Set|44.99|49.99|4.8|toys/pre-school-and-electronic-learning/play-factory|SM06010315|Play Factory
245071|Play Factory Foam Ball Pit with 150 Balls Pink|39.99|||toys/pre-school-and-electronic-learning/play-factory|SM06010315|Play Factory
257458|Play Factory Ball Pit with 150 Balls Beige|39.99|||toys/pre-school-and-electronic-learning/play-factory|SM06010315|Play Factory
225677|Doctor Squish Squishy Maker|29.99|||toys/sensory-toys/sensory-play|SM060105|Doctor Squish
262752|Topps Premier League Official Trading Cards 2026/2027 Golden Boot Tin Assortment|29.99|||toys/arts-crafts-and-music/football-cards-and-stickers|SM060105|Topps
241305|Crayola Colour Wonder Magic Light Brush Set|24.99|||toys/arts-crafts-and-music/art-sets|SM060105|Crayola
258527|Gui Gui Beautify Your Slime Fruity Glow Mega Slime Haul|29.99|||toys/arts-crafts-and-music/slime-and-putty|SM060105|Gui Gui
252301|Digital Double Dance Mat|29.99|||toys/sensory-toys/physical-play-sensory-toys|SM060105|Stay Active
250688|Slime Mart Shopping Cart by ZURU|29.99|||toys/arts-crafts-and-music/slime-and-putty|SM060105|ZURU
261870|Crazy Aaron's Thinking Putty Mixed by Me Playset|24.99|||toys/sensory-toys/messy-sensory-toys|SM060105|Crazy Aaron's
259433|PopSing KPop Demon Hunters LED Light-Up Wireless Karaoke Microphone|14.99|||toys/arts-crafts-and-music/musical-instruments-and-karaoke/karaoke|SM060105,SM060639|PopSing
258671|PopSing KPop Demon Hunters Party Karaoke Set|49.99|||toys/arts-crafts-and-music/musical-instruments-and-karaoke/karaoke|SM060105,SM060639|PopSing
259292|Pen Creator Studio K-Pop Demon Hunters|19.99|||brand/kpop-demon-hunters|SM060105,SM060639|Pen Creator
258217|Giftie Badge Maker and Carry Case|34.99|||toys/arts-crafts-and-music/craft-sets|SM060105|Giftie
258044|iKaraoke DJ MixMaster|49.99|||toys/arts-crafts-and-music/musical-instruments-and-karaoke/musical-instruments|SM060105|iKaraoke
263598|Crayola Globbles Squishy Toy 16 Pack|19.99|||toys/squishy-toys|SM060105|Crayola
260969|Crayola Mess-Free Touch-Lights Set|24.99|||brand/crayola|SM060105|Crayola
241249|Zummi Strive Single-to-Double Travel System with EnfaSafe i-Size R129 Car Seat Midnight|299.99|349.99||baby/pushchairs-and-strollers/double-prams-and-double-pushchairs|SM060205|Zummi
218687|Joie Litetrax Stroller Shale|149.99|||brand/joie/joie-pushchairs-and-strollers|SM060205|Joie
245673|Graco Miravi Compact Stroller Black|84.99|99.99||baby/pushchairs-and-strollers/strollers|SM060205|Graco
236333|Joie Mytrax Pro Stroller Shale|179.99|||baby/pushchairs-and-strollers/strollers|SM060205|Joie
253764|Joie i-Muze LX Stroller Travel System Bundle with i-Juva i-Size R129 Belt-Fitted Car Seat Raven|119.99|139.99||baby/pushchairs-and-strollers/strollers|SM060205|Joie
245603|Joie Signature Estrella Double Stroller Eclipse|249.99|299.99||brand/joie/joie-pushchairs-and-strollers|SM060205|Joie
253248|Zummi Explorer 2 Compact Stroller Black|99.99|||baby/pushchairs-and-strollers/strollers|SM060205|Zummi
216880|Zummi Eden Compact Stroller Shale|119.99|||baby/pushchairs-and-strollers/strollers|SM060205|Zummi
246296|Joie Trakker Stroller Black|49.99|||brand/joie/joie-pushchairs-and-strollers|SM060205|Joie
253310|Zummi Zip2 Stroller Black|109.99|||baby/pushchairs-and-strollers/strollers|SM060205|Zummi
245712|Graco Miravi Compact Stroller Stormy Blue|84.99|99.99||baby/pushchairs-and-strollers/strollers|SM060205|Graco
257536|Zummi Explorer 2 Compact Stroller Chocolate|99.99|||baby/pushchairs-and-strollers/strollers|SM060205|Zummi
244846|Cygnet Compact Stroller Almond|99.99|119.99||baby/pushchairs-and-strollers/strollers|SM060205|Cygnet
245722|Graco Avvos Double Stroller Grey|124.99|||brand/graco|SM060205|Graco
247285|Joie Elin Compact Stroller Maple|179.99|||baby/pushchairs-and-strollers/strollers|SM060205|Joie
205842|Playgro Stella Sensory Teething Toys 4 Pack|14.99|||toys/sensory-toys/baby-sensory-toys|SM060216|Playgro
247041|Peps Umbrella Stroller with Canopy|19.99|||baby/pushchairs-and-strollers/strollers|SM060205|Peps
243702|Cygnet Compact Stroller Black|99.99|114.99||baby/pushchairs-and-strollers/strollers|SM060205|Cygnet
163965|Playgro Amazing Garden Twirly Whirly Teether Sensory Stroller Toy|11.99|||baby/pushchairs-and-strollers/pushchair-accessories-and-toys|SM060216,SM060205|Playgro
252118|Nested Willow Baby Swing|74.99||4.8|baby/bouncers-swings-and-rockers/baby-swings|SM060211|Nested
216955|Nested Sorrento Wooden Cot Bed White|119.99||4.6|baby/cots-cribs-and-bedding/cot-beds|SM060203|Nested
243840|miniuno ImolaFix 360° i-Size ISOFix R129 Car Seat|79.99||4.9|baby/car-seats-and-bases/40-150cm-every-stage-car-seats|SM060202|miniuno
244212|Baby Elegance Haddington Cot Bed with Changing Unit Stone|129.99||4.8|brand/baby-elegance|SM060203|Baby Elegance
253805|Babylo You & Me Crib Cashmere|49.99||4.8|brand/babylo|SM060203|Babylo
255631|Baby Elegance Co-Glide Electric Bedside Crib Walnut|159.99||5.0|brand/baby-elegance|SM060203|Baby Elegance
242858|Baby Elegance Elle Haddington Cot Stone|79.99||4.8|brand/baby-elegance|SM060203|Baby Elegance
231256|Panorama XTi by Babylo 2-in-1 Travel System with EnfaSafe i-Size R129 Car Seat Leaf|229.99||4.9|brand/babylo|SM060205|Babylo
218473|EnfaSafe i-Size ISOFix R129 Car Seat Base|89.99|||baby/car-seats-and-bases/isofix-car-seat-bases|SM060202|EnfaSafe
243839|miniuno Orvital 360º i-Size ISOFix R129 Car Seat|109.99|||baby/car-seats-and-bases/40-150cm-every-stage-car-seats|SM060202|miniuno
226218|Joie i-Trillo FX i-Size ISOFix R129 High-Back Booster Seat Shale|69.99|79.99||baby/car-seats-and-bases/100-150cm-high-back-booster-seats|SM060202|Joie
253170|EnfaSafe Navigator i-Size R129 Belt-Fitted Car Seat|54.99|||baby/car-seats-and-bases/40-150cm-every-stage-car-seats|SM060202|EnfaSafe
243842|miniuno Journiie i-Size R129 Belt-Fitted Car Seat|49.99|||baby/car-seats-and-bases/76-150cm-forward-facing-car-seats|SM060202|miniuno
224013|Joie Elevate i-Size R129 Belt-Fitted Car Seat Shale|64.99|||baby/car-seats-and-bases/76-150cm-forward-facing-car-seats|SM060202|Joie
208511|Joie Spin 360° GTi i-Size ISOFix R129 Car Seat Shale|149.99|||baby/car-seats-and-bases/40-105cm-extended-rear-facing-car-seats|SM060202|Joie
245026|Joie i-Spin 360° i-Size ISOFix R129 Car Seat Shale|174.99|||baby/car-seats-and-bases/40-105cm-extended-rear-facing-car-seats|SM060202|Joie
209254|Joie i-Trillo i-Size R129 Belt-Fitted High-Back Booster Seat Shale|49.99|||baby/car-seats-and-bases/r129-car-seats|SM060202|Joie
254117|EnfaSafe i-Size 180° Spin R129 Car Seat Base|119.99|||baby/car-seats-and-bases/isofix-car-seat-bases|SM060202|EnfaSafe
230035|miniuno Tripiie i-Size R129 Belt-Fitted High-Back Booster Seat|29.99|||baby/car-seats-and-bases/r129-car-seats|SM060202|miniuno
241303|Joie i-Irvana i-Size ISOFix R129 Car Seat Shale|119.99|||brand/joie/joie-car-seats|SM060202|Joie
226145|Graco Junior Maxi i-Size R129 Belt-Fitted High-Back Booster Seat Midnight|34.99|||brand/graco|SM060202|Graco
233908|CBX by CYBEX Solution X i-Fix i-Size ISOFix R129 High-Back Booster Seat Pure Black|79.99|||baby/car-seats-and-bases/100-150cm-high-back-booster-seats|SM060202|CBX by CYBEX
253863|miniuno BoostaFix R129 ISOFix Backless Booster Seat|19.99|||baby/car-seats-and-bases/125-150cm-booster-seats|SM060202|miniuno
227867|Graco Extend LX R129 Belt-Fitted Car Seat Midnight|74.99|||brand/graco|SM060202|Graco
223047|Fisher-Price Mix & Learn DJ Table|49.99|||baby/the-baby-collection|SM060216|Fisher-Price
182614|MAM Easy Start Self-Sterilising Anti-Colic Baby Bottles Set|34.99|||baby/feeding/sterilisers-and-baby-bottles|SM060201|MAM
194278|Fisher-Price Laugh & Learn Magical Musical Mirror|26.99|||toys/pre-school-and-electronic-learning/fisher-price/fisher-price-infant-toys|SM060216|Fisher-Price
245610|Little Discoveries by BeZou Soft Foam Play Mat Grey|39.99|||baby/baby-toys/playmats-and-gyms|SM060216|BeZou
110716|Fisher-Price Poppity Pop Musical Dino|29.99|||toys/pre-school-and-electronic-learning/fisher-price/fisher-price-newborn-and-nursery|SM060216|Fisher-Price
150942|Bright Starts Disney Finding Nemo Sea of Activities Baby Jumper|89.99|||toys/disney|SM060213|Bright Starts
234481|Play Factory Foldable Foam Baby Play Mat|24.99|||toys/pre-school-and-electronic-learning/play-factory|SM060216,SM06010315|Play Factory
231109|Fisher-Price Glow and Grow Kick & Play Piano Baby Gym Blue|39.99|||toys/pre-school-and-electronic-learning/fisher-price/fisher-price-newborn-and-nursery|SM060216|Fisher-Price
213655|Nuby RapidCool Baby Bottle Maker Kit|49.99|||baby/feeding/sterilisers-and-baby-bottles|SM060201|Nuby
224268|TOMY Toomies Bath Barista Toy Set|15.99|19.99||toys/pre-school-and-electronic-learning/tomy|SM060214|TOMY
225364|Little Tikes Stand 'n' Dance Starfish Pink|24.99|||brand/little-tikes|SM060216|Little Tikes
253139|Fisher-Price Laugh & Learn Mix & Learn DJ Table Pink|49.99|||toys/pre-school-and-electronic-learning/fisher-price/fisher-price-infant-toys|SM060216|Fisher-Price
251709|Little Discoveries by BeZou Plush Bunny Play Gym|39.99|||baby/baby-toys/playmats-and-gyms|SM060216|BeZou
208860|Fisher-Price Laugh & Learn Smart Stages Crawl Around Car - Pink|49.99|59.99||toys/pre-school-and-electronic-learning/fisher-price/fisher-price-infant-toys|SM060216|Fisher-Price
197789|VTech Baby 4-in-1 Alphabet Train Ride On Red|49.99|||toys/pre-school-and-electronic-learning/vtech-toys/vtech-infant|SM060216|VTech
182615|MAM Easy Start Microwave Steam Steriliser and Anti-Colic Baby Bottles Set|59.99|||baby/feeding/sterilisers-and-baby-bottles|SM060201|MAM
223046|Fisher-Price Smart Stages DJ Bouncin' Star Toy|21.99|||toys/pre-school-and-electronic-learning/fisher-price/fisher-price-infant-toys|SM060216|Fisher-Price
208225|VTech VM3258 Night Light Video Baby Monitor with 2.8 Inch Screen|39.99|||baby/baby-monitors-and-safety/baby-monitors|SM060208|VTech
254091|Sensory Blackout Swing Seat|89.99|99.99||toys/sensory-toys/sensory-play|SM060308|Play Factory
235359|Kick-About Interactive Football Training Game|29.99|||outdoor/sports-and-equipment/football|SM06030701|Kick-About
230878|10ft Thorpe Sports Trampoline with Enclosure Net|129.99|||outdoor/trampolines-and-accessories/trampolines|SM060309|Thorpe Sports
261881|Netflix KPop Demon Hunters Folding Scooter with LED Wheels|19.99||3.6|outdoor/scooters/inline-scooters|SM060311,SM060639|KPop Demon Hunters
192531|18 Inch Glitch Bike Metallic Blue|139.99|||outdoor/bikes/18-bikes-6-8-years|SM060301|Glitch
232388|24 Inch Verve Ultra Mountain Bike Blue|189.99|||outdoor/bikes/24-bikes|SM060301|Verve
232389|24 Inch Verve Ultra Mountain Bike Pink|189.99|||outdoor/bikes/24-bikes|SM060301|Verve
182698|12 x 8ft Thorpe Sports Rectangle Trampoline with Enclosure Net|239.99|||outdoor/trampolines-and-accessories/trampolines|SM060309|Thorpe Sports
170007|Little Tikes Cozy Coupe Car Fairy Ride On|69.99|||outdoor/pedal-cars|SM060304|Little Tikes
192532|20 Inch Verve Cool Bike Metallic Purple|139.99|||outdoor/bikes/20-bikes-6-9-years|SM060301|Verve
233759|155 - 210cm Thorpe Sports Portable Basketball Stand|49.99|||outdoor/basketball|SM060315|Thorpe Sports
181800|16 Inch Moto X Motocross-Style Bike Green|139.99|||outdoor/bikes/16-bikes-5-6-years|SM060301|Moto X
223388|20 Inch Verve Neo Chrome BMX Bike Metallic|169.99|||outdoor/bikes/bmx-bikes|SM060301|Verve
220467|Razor Hovertrax Prizma Self-Balancing Hoverboard Black|199.99|||outdoor/hoverboards|SM060327|Razor
231611|PonyCycle Ride On Unicorn|199.99|||outdoor/ride-ons|SM060304|PonyCycle
249359|Aero G6 LED Electric Scooter Blue|119.99||4.3|outdoor/scooters/electric-scooters|SM060311|Aero
231379|12ft Thorpe Sports Trampoline with Enclosure Net|169.99|||outdoor/trampolines-and-accessories/trampolines|SM060309|Thorpe Sports
261066|4ft Foldable 4-in-1 Games Table|99.99|||outdoor/games-tables|SM060316|Thorpe Sports
246004|18 Inch Verve Star Bike with Basket Mint|139.99|||outdoor/bikes/18-bikes-6-8-years|SM060301|Verve
249348|Aero G6 LED Electric Scooter Pink|119.99||4.5|outdoor/scooters/electric-scooters|SM060311|Aero
246631|Marvel Spider-Man Twist n Turn 3 Wheel Scooter with LED Lights|24.99||4.5|outdoor/scooters/3-wheel-scooters|SM060311,SM060613|Marvel
236330|Blindside 360 Pro Stunt Scooter|39.99||4.7|outdoor/scooters/stunt-scooters|SM060311|Blindside
247709|4 Way Multi-Ramp Set|49.99||4.3|outdoor/scooters/stunt-scooters|SM060311|Blindside
247656|Multi-Ramp Set|24.99||4.7|outdoor/scooters/stunt-scooters|SM060311|Blindside
240258|Rahmory Moonlight Folding Scooter with LED Lights|34.99||4.6|outdoor/scooters/inline-scooters|SM060311|Rahmory
255379|Aero A5 Folding Scooter Blue|44.99||5.0|outdoor/scooters/large-scooters|SM060311|Aero
213021|Blindside Neo Pro Stunt Scooter|99.99||4.9|outdoor/scooters/stunt-scooters|SM060311|Blindside
186592|Blindside 1200 Stunt Scooter|59.99||4.6|outdoor/scooters/stunt-scooters|SM060311|Blindside
257299|Pulse 230 Folding Scooter|59.99||4.0|outdoor/scooters/large-scooters|SM060311|Pulse
255432|Aero A5 Folding Scooter Purple|44.99||5.0|outdoor/scooters/large-scooters|SM060311|Aero
248903|Chilli Morph-X Pro Stunt Scooter|89.99||5.0|outdoor/scooters/stunt-scooters|SM060311|Chilli
251117|Blindside Wave Stunt Scooter|49.99||5.0|outdoor/scooters/stunt-scooters|SM060311|Blindside
229513|Aero Neo Chrome Folding Scooter with Colour LED Wheels|59.99||4.9|outdoor/scooters/large-scooters|SM060311|Aero
211007|Blindside 1000 Stunt Scooter|49.99||4.8|outdoor/scooters/stunt-scooters|SM060311|Blindside
260192|Micro Mini Duo 3 Wheel Scooter with LED Wheels Sky Blue|49.99||5.0|outdoor/scooters/3-wheel-scooters|SM060311|Micro
246618|Disney Frozen Folding Scooter with LED Wheels|16.99||4.9|outdoor/scooters/inline-scooters|SM060311|Disney Frozen
232873|PlayStation 5 Disc Console Slim|569.99||4.8|gaming-and-tech/playstation-5/playstation-5-consoles|playstation-gaming|PlayStation
253274|PlayStation 5 Digital Edition Slim|519.99||4.9|gaming-and-tech/playstation-5/playstation-5-consoles|playstation-gaming|PlayStation
263568|EA SPORTS FC 27 PS5|58.99|62.99|4.9|gaming-and-tech/games/ea-sports-fc-27|playstation-gaming,top-selling-games|EA SPORTS
264369|WD_BLACK SN850P NVMe SSD Game Drive Storage for PlayStation 5 - 2TB|309.99||5.0|gaming-and-tech/playstation-5/playstation-5-accessories|gaming-accessories,playstation-gaming|WD_BLACK
263098|Call of Duty: Modern Warfare 4 - PS5|59.99|||gaming-and-tech/pre-order-games/playstation-5-pre-order-games|SM06040301,playstation-gaming|Activision
231577|WD_BLACK SN850P NVMe SSD Game Drive Storage for PlayStation 5 - 1TB|209.99||4.8|gaming-and-tech/playstation-5/playstation-5-accessories|gaming-accessories,playstation-gaming|WD_BLACK
264704|PlayStation 5 DualSense Wireless Controller – Marvel's Wolverine Battle Yellow Limited Edition|74.99||5.0|gaming-and-tech/games/marvels-wolverine|gaming-controllers,playstation-gaming|PlayStation
262306|Star Wars: Galactic Racer Standard Edition PS5|42.99|||gaming-and-tech/games/star-wars-galactic-racer|playstation-gaming|Star Wars
257083|PlayStation 5 Techno Red Dualsense Wireless Controller|62.99|69.99|5.0|gaming-and-tech/playstation-5/playstation-5-accessories|gaming-controllers,playstation-gaming|PlayStation
257102|PlayStation 5 Rhythm Blue Dualsense Wireless Controller|62.99|69.99|5.0|gaming-and-tech/playstation-5/playstation-5-accessories|gaming-controllers,playstation-gaming|PlayStation
201095|PlayStation 5 DualSense Wireless Controller Midnight Black|59.99|64.99|4.8|gaming-and-tech/playstation-5/playstation-5-accessories|gaming-controllers,playstation-gaming|PlayStation
206889|PlayStation 5 Starlight Blue Dualsense Wireless Controller|59.99|64.99||gaming-and-tech/playstation-5/playstation-5-accessories|gaming-controllers,playstation-gaming|PlayStation
257110|PlayStation 5 Remix Green Dualsense Wireless Controller|62.99|69.99||gaming-and-tech/playstation-5/playstation-5-accessories|gaming-controllers,playstation-gaming|PlayStation
191489|PlayStation 5 DualSense Wireless Controller|59.99|64.99||gaming-and-tech/playstation-5/playstation-5-accessories|gaming-controllers,playstation-gaming|PlayStation
232999|Disc Drive For PS5 Digital Edition Consoles (model group – slim)|69.99|||gaming-and-tech/playstation-5/playstation-5-accessories|gaming-accessories,playstation-gaming|PlayStation
232976|PlayStation 5 PULSE Elite Wireless Headset|119.99|129.99||gaming-and-tech/playstation-5/playstation-5-accessories|SM060407,playstation-gaming|PlayStation
265057|PULSE ELEVATE Wireless Speakers - Midnight Black|199.99|||gaming-and-tech/playstation-5/playstation-5-accessories/pulse-elevate-wireless-speakers|SM060465,playstation-gaming|PlayStation
229427|Marvel's Spider-Man 2 PS5|58.99|69.99|4.9|gaming-and-tech/games/marvels-spider-man-gaming|playstation-gaming,top-selling-games,SM060613|PlayStation Studios
191452|Gran Turismo 7 PS5|59.99||4.8|gaming-and-tech/playstation-5/playstation-5-games|playstation-gaming,top-selling-games|PlayStation Studios
240866|Astro Bot PS5|51.99|59.99|4.9|gaming-and-tech/playstation-5/playstation-5-games|playstation-gaming,top-selling-games|PlayStation Studios
265103|Stage Tour Game & Kramer Guitar Controller Bundle - PS5|119.99|||gaming-and-tech/playstation-5/playstation-5-accessories|gaming-accessories,playstation-gaming|Stage Tour
242313|XBOX Series X - 1TB Robot White Digital Console|619.99||4.8|gaming-and-tech/xbox-series-x-s/xbox-series-x-s-consoles|xbox-gaming|XBOX
244768|XBOX Series S 512GB Console|429.99||4.7|gaming-and-tech/xbox-series-x-s/xbox-series-x-s-consoles|xbox-gaming|XBOX
242312|XBOX Series S - 1TB Robot White Console|519.99||4.9|gaming-and-tech/xbox-series-x-s/xbox-series-x-s-consoles|xbox-gaming|XBOX
263660|EA SPORTS FC 27 XBOX Series X & XBOX One|58.99|62.99|4.4|gaming-and-tech/games/ea-sports-fc-27|xbox-gaming,top-selling-games|EA SPORTS
264641|XBOX Wireless Controller - Gears of War: E-Day Limited Edition|79.99|||gaming-and-tech/gaming-controllers/xbox-controllers|gaming-controllers,xbox-gaming|XBOX
263126|Call of Duty: Modern Warfare 4 - Xbox Series X|59.99|||gaming-and-tech/pre-order-games/xbox-series-x-pre-order-games|SM06040302,xbox-gaming|Activision
192015|XBOX Wireless Controller - Carbon Black|49.99||4.6|gaming-and-tech/xbox-series-x-s/xbox-series-x-s-accessories|gaming-controllers,xbox-gaming|XBOX
216168|XBOX Elite Wireless Controller Series 2 - Core (White)|109.99||4.5|gaming-and-tech/xbox-series-x-s/xbox-series-x-s-accessories|gaming-controllers,xbox-gaming|XBOX
244251|XBOX Wireless Headset – Xbox Series X¦S, Xbox One, and Windows Devices|84.99||4.9|gaming-and-tech/xbox-series-x-s/xbox-series-x-s-accessories|SM060407,xbox-gaming|XBOX
196217|XBOX Wireless Controller - Pulse Red|52.99||4.7|gaming-and-tech/xbox-series-x-s/xbox-series-x-s-accessories|gaming-controllers,xbox-gaming|XBOX
263594|XBOX Wireless Controller - X25 Special Edition - XBOX Series X¦S & XBOX One|74.99|||gaming-and-tech/xbox-series-x-s/xbox-series-x-s-accessories|gaming-controllers,xbox-gaming|XBOX
254542|Seagate HDD Portable Game Drive Storage for Xbox - 2TB|126.99||5.0|gaming-and-tech/xbox-series-x-s/xbox-series-x-s-accessories|gaming-accessories,xbox-gaming|Seagate
238592|Stealth Panther LED Light-Up Multiplatform Gaming Headset - Black|29.99||4.1|gaming-and-tech/playstation-5/playstation-5-accessories|SM060407|Stealth
192245|XBOX Wireless Controller - Robot White|49.99||4.7|gaming-and-tech/xbox-series-x-s/xbox-series-x-s-accessories|gaming-controllers,xbox-gaming|XBOX
249605|Nintendo Switch 2 Console|389.99|419.99|4.9|gaming-and-tech/nintendo-switch-2/nintendo-switch-2-consoles|nintendo-gaming|Nintendo
265573|Nintendo Switch 2 The Legend of Zelda 40th Anniversary Edition Console|429.99|||gaming-and-tech/nintendo-switch-2/nintendo-switch-2-consoles|nintendo-gaming|Nintendo
263650|The Legend of Zelda: Ocarina of Time Nintendo Switch 2|54.99|||gaming-and-tech/pre-order-games/nintendo-switch-2-pre-order-games|SM060403,nintendo-gaming|Nintendo
182022|Nintendo Switch Neon Red/Blue with Improved Battery Life|259.99||4.9|gaming-and-tech/nintendo-switch/nintendo-switch-consoles|nintendo-gaming,SM060452|Nintendo
249630|Mario Kart World Nintendo Switch 2|59.99||5.0|gaming-and-tech/nintendo-switch-2/nintendo-switch-2-games|nintendo-gaming,top-selling-games|Nintendo
263443|Nintendo Switch Sports Resort - Nintendo Switch 2|41.99|||gaming-and-tech/pre-order-games/nintendo-switch-2-pre-order-games|SM060403,nintendo-gaming|Nintendo
263661|EA SPORTS FC 27 Nintendo Switch|47.99|49.99||gaming-and-tech/games/ea-sports-fc-27|nintendo-gaming,SM060452|EA SPORTS
263923|Just Dance: Decades of Hits - Nintendo Switch|34.99|||gaming-and-tech/games/just-dance-games|nintendo-gaming,SM060452|Ubisoft
255477|Pokémon Pokopia Nintendo Switch 2|54.99||5.0|gaming-and-tech/pokemon-gaming|pokemon-gaming,nintendo-gaming|Pokémon
263662|EA SPORTS FC 27 Nintendo Switch 2|50.99|54.99|5.0|gaming-and-tech/games/ea-sports-fc-27|nintendo-gaming|EA SPORTS
257788|Tomodachi Life: Living the Dream Nintendo Switch|39.99|44.99|4.7|gaming-and-tech/games/tomodachi-life-living-the-dream|nintendo-gaming,SM060452|Nintendo
157612|Mario Kart 8 Deluxe Nintendo Switch|37.99||4.9|gaming-and-tech/nintendo-switch/nintendo-switch-games|nintendo-gaming,SM060452,top-selling-games|Nintendo
254033|Super Mario Galaxy + Super Mario Galaxy 2 Nintendo Switch|44.99||4.9|gaming-and-tech/mario-gaming/mario-games|nintendo-gaming,SM060452,top-selling-games|Nintendo
168112|Minecraft Nintendo Switch|19.99||4.8|gaming-and-tech/nintendo-switch/nintendo-switch-games|nintendo-gaming,SM060452,top-selling-games|Mojang
263445|Minecraft Dungeons II - Deluxe Edition Nintendo Switch 2|37.99|39.99||gaming-and-tech/games/minecraft-dungeons-ii|nintendo-gaming|Mojang
249631|Donkey Kong Bananza Nintendo Switch 2|49.99||4.9|gaming-and-tech/nintendo-switch-2/nintendo-switch-2-games|nintendo-gaming,top-selling-games|Nintendo
224188|Sonic Origins Plus Nintendo Switch Code In Box|12.99|24.99|4.7|gaming-and-tech/games/sonic-origins-plus|nintendo-gaming,SM060452,gaming-offers|SEGA
241311|Super Mario Party Jamboree Nintendo Switch|37.99||4.8|gaming-and-tech/nintendo-switch/nintendo-switch-games|nintendo-gaming,SM060452,top-selling-games|Nintendo
157682|Super Mario Odyssey Nintendo Switch|37.99||4.8|gaming-and-tech/nintendo-switch/nintendo-switch-games|nintendo-gaming,SM060452|Nintendo
236454|Pokémon Legends Z-A Nintendo Switch|39.99||4.6|gaming-and-tech/games/pokemon-legends-z-a|pokemon-gaming,nintendo-gaming,SM060452,top-selling-games|Pokémon
172767|Animal Crossing New Horizons Nintendo Switch|36.99||4.9|gaming-and-tech/games/animal-crossing-games|nintendo-gaming,SM060452,top-selling-games|Nintendo
251053|Hogwarts Legacy Nintendo Switch 2|27.99|36.99|4.0|gaming-and-tech/nintendo-switch-2/nintendo-switch-2-games|nintendo-gaming,gaming-offers|Warner Bros. Games
244961|Dog Man: Mission Impawsible Nintendo Switch|24.99||4.7|gaming-and-tech/nintendo-switch/nintendo-switch-games|nintendo-gaming,SM060452|Mindscape
168351|Pokémon: Let's Go Pikachu Nintendo Switch|37.99||4.8|gaming-and-tech/pokemon-gaming|pokemon-gaming,nintendo-gaming,SM060452|Pokémon
193055|Super Mario 3D World + Bowser's Fury Nintendo Switch|37.99||4.9|gaming-and-tech/nintendo-switch/nintendo-switch-games|nintendo-gaming,SM060452|Nintendo
249640|The Legend of Zelda: Breath of the Wild Nintendo Switch 2|54.99||5.0|gaming-and-tech/nintendo-switch-2/nintendo-switch-2-games|nintendo-gaming|Nintendo
201305|Colors Live Nintendo Switch|29.99||4.5|gaming-and-tech/nintendo-switch/nintendo-switch-games|nintendo-gaming,SM060452|Colors
193047|Mario + Rabbids Kingdom Battle Nintendo Switch (Code in Box)|12.99||4.5|gaming-and-tech/nintendo-switch/nintendo-switch-games|nintendo-gaming,SM060452,gaming-offers|Ubisoft
265092|Stage Tour Game & Kramer Guitar Controller Bundle - Nintendo Switch 2|119.99|||gaming-and-tech/nintendo-switch-2/nintendo-switch-2-accessories|gaming-accessories,nintendo-gaming|Stage Tour
`.trim().split('\n').map(line => {
  const [sku, title, price, was, rating, catPath, codes, brand] = line.split('|')
  return { sku, title: title.replaceAll('¦', '|'), price: Number(price), was: was ? Number(was) : null, rating: rating ? Number(rating) : null, catPath, codes: codes.split(','), brand }
})
