// Authored synthetic designs. Each row describes a distinct construction or use;
// sizes stay inside the product's trusted variant table, never separate listings.
// Native silhouettes are used whenever an existing generic photograph is not a match.
const shapes = {
  runner: 'M18 78L34 43L55 45L73 63L122 77Q139 80 139 91L128 104H24L17 94Z M23 91H130',
  trail: 'M17 74L31 39L57 44L75 62L123 77L139 91L131 99H119V106H108V99H93V106H82V99H68V106H57V99H42V106H27L18 96Z',
  court: 'M20 79L32 38H55L71 66L122 79L137 89V104H20Z M25 91H131',
  cleat: 'M19 80L34 48H55L78 70L128 81L139 92L130 98H117V107H108V98H52V107H43V98H22Z',
  sandal: 'M27 67Q60 46 117 63L132 88Q106 108 41 99L23 89Z M40 58L95 48L107 72L50 84Z',
  tee: 'M55 23L30 34L15 57L36 70L52 48V105H108V48L124 70L145 57L130 34L105 23Q80 39 55 23Z',
  long: 'M56 25L30 38L13 96L30 102L52 56V106H108V56L130 102L147 96L130 38L104 25Q80 41 56 25Z',
  tank: 'M52 23H64Q68 43 80 43Q93 43 96 23H108L103 104H57Z',
  bra: 'M53 27H63L68 46Q80 55 92 46L97 27H108L117 82H43Z M43 85H117V96H43Z',
  shorts: 'M43 27H116L126 101H90L80 62L70 101H34Z',
  pants: 'M50 18H110L119 107H87L80 49L73 107H41Z',
  skirt: 'M58 23H101L127 103H33Z M58 39L47 98 M80 38V100 M99 39L111 98',
  dress: 'M61 13H69Q80 29 91 13H99L97 45L124 106H36L62 45Z',
  suit: 'M52 15H65L69 31Q80 41 91 31L96 15H108L101 63L112 81L90 108L80 92L70 108L48 81L59 63Z',
  jacket: 'M56 31L62 10Q80 1 98 10L104 31L127 41L146 100L131 105L108 60V108H83V31H77V108H52V60L29 105L14 100L33 41Z',
  vest: 'M56 24L69 17L80 27L91 17L104 24L97 52L107 105H53L63 52Z M79 28V103',
  bag: 'M47 26Q80 9 113 26L123 99H37Z M48 62H113V94H48Z M65 18V10H95V18',
  duffel: 'M31 45H129L141 91L128 103H32L19 91Z M54 43V27Q80 12 106 27V43 M57 44V100 M105 44V100',
  cap: 'M38 69Q36 24 78 22Q119 25 120 68L142 85L129 94L85 76L39 78Z',
  sock: 'M48 16H81V70L116 85Q127 99 110 106H47L36 92L47 72Z',
  bottle: 'M63 13H97V26L108 37V100Q80 111 52 100V37L63 26Z M63 16H97',
  ball: 'M127 61A47 47 0 1 1 33 61A47 47 0 1 1 127 61 M35 61H125 M80 15V108 M54 21Q97 62 54 101 M106 21Q65 62 106 101',
  mat: 'M31 36L106 24L139 85L56 104Z M28 34Q15 42 27 55L105 40Q119 30 106 23Z',
  band: 'M39 30Q80 10 121 30L130 89Q80 115 30 89Z M47 39L42 81Q80 97 118 81L111 39Q80 23 47 39Z',
  rope: 'M45 24Q3 48 35 92Q80 126 125 92Q155 48 115 24L109 30Q145 51 119 86Q80 111 41 86Q15 51 51 30Z M40 15H57V51H40Z M103 15H120V51H103Z',
  cone: 'M74 15H86L110 87H132V102H28V87H50Z',
  towel: 'M37 17H121V105H37Z M44 27H112 M44 91H112',
  goggles: 'M29 46H65L72 54H88L95 46H131L136 69L126 81H97L86 66H74L63 81H34L24 69Z',
  glove: 'M48 55V29Q53 20 59 28L61 47V18Q68 10 73 19V44L77 15Q85 10 88 20L88 45L94 23Q101 21 104 30L101 61L113 48Q127 49 119 63L101 100H58L42 71Q37 57 48 55Z',
}
const rows = text => text.trim().split('\n').map(line => line.trim().split('|'))
const ranges = []
function range(key, category, type, sport, shape, basePrice, color, designs, extra = {}) {
  ranges.push({ key, category, type, sport, shape, basePrice, color, designs: rows(designs), ...extra })
}
// Twelve distinct footwear constructions in each range.
range('road', 'Shoes', 'Road Running Shoes', 'Running', 'runner', 80, 'Black', `
Morning loop mesh runner|Open mesh upper and segmented forefoot rubber for short daily routes.
Long route rocker runner|A curved 34 mm foam stack supports a rolling stride on long easy runs.
Tempo flex road runner|A low 24 mm stack and deep flex grooves suit faster training sessions.
Rain commute road runner|A closed woven upper and gusseted tongue keep road spray outside.
Steady stride rail runner|Raised sidewall rails and a broad heel platform steady landings.
Open toe-box road runner|An anatomical forefoot allows toe spread while the narrow heel holds securely.
Cloud knit daily runner|A stretch-knit bootie hugs the instep without an external tongue.
Travel packable runner|A fold-flat heel and flexible foam sole compress into a travel bag.
Night route runner|Reflective heel and lace loops improve the visibility of the shoe itself.
Hot pavement vent runner|Large forefoot vents and a thin mesh tongue release warm air.
Heel cushion road runner|A soft heel insert and firm forefoot balance landing comfort and toe-off.
Low-drop road runner|A 4 mm heel-to-toe drop and even rubber coverage give a level platform.
`, { photo: 'running-shoes-black', collection: 'everyday-running' })
range('trail', 'Shoes', 'Trail Shoes', 'Running', 'trail', 100, 'Green', `
Creek crossing trail shoe|Drainage ports and a quick-drying mesh upper suit shallow wet crossings.
Loose gravel trail shoe|Closely spaced 3 mm lugs give traction on maintained gravel paths.
Mud channel trail shoe|Widely spaced 6 mm lugs leave room for mud to clear between steps.
Rock shield trail shoe|A flexible forefoot shield sits above the outsole to soften sharp stone contact.
Forest switchback trail shoe|A reinforced midfoot saddle holds the foot on winding woodland paths.
Alpine approach trail shoe|A sticky rubber toe zone and protective rand suit rocky approaches.
Door-to-trail hybrid shoe|Low central lugs run smoothly on pavement while outer lugs grip dirt.
Sand path trail shoe|Fine woven mesh and an integrated ankle cuff help keep grit outside.
Wet ridge trail shoe|A sealed membrane upper and covered seams resist persistent trail moisture.
Fast ascent trail shoe|A stripped-back upper and lightweight 4 mm lugs suit short hill efforts.
Long descent trail shoe|Extra heel cushioning and a secure tongue support extended downhill routes.
Winter track trail shoe|A brushed lining and closed upper add warmth on cold dry trail days.
`, { collection: 'trail' })
range('court', 'Shoes', 'Basketball Shoes', 'Basketball', 'court', 90, 'White', `
Pivot guard basketball shoe|A low collar and circular forefoot pivot zone suit quick direction changes.
Paint anchor basketball shoe|A wide heel base and high padded collar support close-to-basket play.
Outdoor grind basketball shoe|Thick abrasion-resistant rubber covers the full sole for outdoor courts.
Indoor grip basketball shoe|A softer herringbone rubber outsole is intended for clean indoor floors.
Crossover strap basketball shoe|An adjustable midfoot strap reinforces the lace closure.
Fast break basketball shoe|A light woven upper and flexible forefoot keep the build streamlined.
Landing pad basketball shoe|A deep heel cushion spreads landing pressure across a broad platform.
Wing support basketball shoe|A lateral outrigger and reinforced sidewall contain side-to-side movement.
Summer mesh basketball shoe|Open side panels and a perforated tongue ventilate warm-weather play.
Secure heel basketball shoe|An internal heel counter and split ankle padding hold the rear foot.
Court feel basketball shoe|A low foam platform places the foot closer to the playing surface.
All-session basketball shoe|A cushioned removable sockliner and durable toe overlay suit long practices.
`, { collection: 'team-sport' })
range('pitch', 'Shoes', 'Soccer Cleats', 'Soccer', 'cleat', 60, 'Blue', `
Grass touch soccer boot|Rounded molded studs and a textured instep suit firm natural grass.
Soft field soccer boot|Longer conical studs are intended for soft natural-grass training pitches.
Artificial grass soccer boot|Numerous short hollow studs spread pressure on modern artificial grass.
Turf control soccer shoe|Small rubber nubs give grip on short-pile artificial turf.
Indoor pass soccer shoe|A flat non-marking sole is designed for indoor hard courts.
Laceless touch soccer boot|An elastic instep sleeve replaces external laces for a clean contact zone.
Wide field soccer boot|A broader forefoot last leaves extra room across the toes.
Ankle sleeve soccer boot|A stretch collar sits above the ankle while a molded heel holds the foot.
Padded touch soccer boot|Soft forefoot padding cushions contact with the ball.
Speed weave soccer boot|A thin reinforced woven upper reduces bulk around the foot.
Offset lace soccer boot|Side-positioned laces create a larger central striking surface.
Training leather soccer boot|A supple leather forefoot is paired with a firm-ground molded sole.
`, { collection: 'team-sport' })
range('studio-shoe', 'Shoes', 'Training Shoes', 'Training', 'runner', 65, 'Black', `
Barbell platform trainer|A rigid flat heel platform supports stable weight-room positioning.
Rope climb gym trainer|Rubber wraps around the inner midfoot to resist rope abrasion.
Lateral circuit trainer|Raised sidewalls support shuffles and side-to-side drills.
Flexible floor trainer|A thin split-groove sole bends easily during floor exercises.
Jump circuit trainer|Resilient forefoot cushioning softens repeated jumping drills.
Rowing session trainer|A narrow heel and low toe profile fit comfortably in rowing straps.
Sled push trainer|A reinforced toe and grippy forefoot rubber suit indoor sled work.
Dance pivot trainer|A smooth pivot circle allows controlled turns on studio floors.
Kettlebell stance trainer|A wide flat outsole gives a steady base for strength practice.
Travel gym trainer|A collapsible upper and removable insole make packing simpler.
Breathable interval trainer|Open mesh around the instep vents heat between intervals.
Easy-entry gym trainer|A hinged heel and pull loops make stepping into the shoe easier.
`, { collection: 'training-essentials', photo: 'gym-trainer-black' })
range('racket-shoe', 'Shoes', 'Tennis Shoes', 'Tennis', 'court', 75, 'White', `
Hardcourt baseline shoe|A durable full herringbone sole suits abrasive hard courts.
Clay slide tennis shoe|A tight herringbone tread releases loose clay during slides.
Grass court tennis shoe|Small low-profile rubber bumps grip maintained grass courts.
Indoor tennis shoe|A pale non-marking rubber outsole suits indoor carpet courts.
Doubles volley tennis shoe|A flexible forefoot and low collar support short approach steps.
Toe-drag tennis shoe|A thick medial toe overlay resists repeated service-motion dragging.
Wide baseline tennis shoe|A broad forefoot last accommodates wider feet without loosening the heel.
Mesh rally tennis shoe|Open side mesh and a light tongue ventilate long rallies.
Heel-lock tennis shoe|An extended heel counter anchors the foot behind the arch.
Sidewall brace tennis shoe|A reinforced outer wall supports repeated lateral cuts.
Cushioned practice tennis shoe|Extra foam beneath the heel adds comfort during long drills.
Quicklace club tennis shoe|A single-pull lace toggle makes tension adjustments simple.
`, { collection: 'court-classics' })
range('everyday-shoe', 'Shoes', 'Lifestyle Shoes', 'Lifestyle', 'court', 55, 'Navy', `
Canvas deck sneaker|A breathable canvas upper sits on a flexible low rubber foxing.
Suede city cupsole|A suede forefoot and stitched rubber cupsole give a substantial everyday build.
Knit slip-on sneaker|An elastic knit entry replaces laces for quick changes.
Zip entry everyday sneaker|A side zipper opens the upper while decorative laces keep their setting.
Padded high-collar sneaker|A high soft collar and full tongue add ankle coverage.
Perforated summer sneaker|Perforations across the toe and sides ventilate the smooth upper.
Rain-ready city sneaker|A sealed synthetic upper and raised rubber sidewalls shed light splashes.
Platform court sneaker|A level raised rubber sole adds height without a pitched heel.
Foldable travel sneaker|An unstructured upper and thin flexible outsole fold into a carry pouch.
Moc-toe walking sneaker|A roomy stitched moc toe gives space across the forefoot.
Heritage panel sneaker|Overlapping suede and textile panels create a durable layered upper.
Winter lined sneaker|A soft brushed lining adds warmth inside a closed woven upper.
`, { collection: 'sportswear' })
range('play-shoe', 'Shoes', 'Kids Shoes', 'Lifestyle', 'runner', 40, 'Blue', `
Playground double-strap shoe|Two wide straps open a flexible toe-box for independent dressing.
School day leather shoe|A wipe-clean leather upper and reinforced toe suit daily school wear.
Splash path kids shoe|A closed water-resistant upper and rubber toe bumper handle wet paths.
Balance bike kids shoe|Extra toe rubber resists scuffing when children slow a balance bike.
Garden mesh kids shoe|Large mesh windows and a flexible sole suit warm outdoor play.
Easy zip kids high-top|A side zipper opens the padded high collar for easy changes.
First court kids shoe|A broad non-marking outsole and firm side panels support court games.
Play trail kids shoe|Shallow rubber lugs and a reinforced heel suit park trails.
Elastic lace kids shoe|Fixed stretch laces and a heel loop remove the need to tie knots.
Soft step kids sneaker|A flexible forefoot and cushioned collar suit early school-day walking.
Winter play kids shoe|A fleece lining and closed toe add warmth on chilly dry days.
Packaway kids shoe|A soft crushable upper fits easily into a school activity bag.
`, { collection: 'easy-on', gender: ['Kids'], ages: ['Little Kids'], sizes: ['US 10C', 'US 11C', 'US 12C', 'US 13C'], measurement: 'Foot length: US 10C 6.6 in; 11C 6.9 in; 12C 7.3 in; 13C 7.6 in.', sizeSystem: "US children's footwear" })
range('outdoor-shoe', 'Shoes', 'Hiking Shoes', 'Hiking', 'trail', 85, 'Gray', `
Daywalk hiking shoe|A shallow lug sole and flexible forefoot suit short maintained routes.
Ridge mid hiking boot|A padded mid-height collar and reinforced heel add coverage on rough paths.
Wetland hiking boot|A waterproof membrane and gusseted tongue help exclude trail water.
Desert hiking shoe|A light ventilated upper and sand-resistant tongue suit hot dry walks.
Scree approach hiking shoe|A full rubber rand shields the lower upper from sharp loose rock.
Pack support hiking boot|A firmer midsole platform supports walking with a loaded daypack.
Stream drainage hiking shoe|Open drainage channels let water leave after shallow crossings.
Fastpack hiking shoe|A light low-cut build and firm heel combine for brisk day hikes.
Winter insulated hiking boot|A synthetic insulated lining adds warmth for cold-weather walks.
City-to-path hiking shoe|A subdued lug profile transitions between sidewalks and local trails.
Ankle gaiter hiking shoe|A stretch fabric cuff helps prevent small debris from entering.
Wide roam hiking shoe|A roomy forefoot last allows toe movement on long walking days.
`, { collection: 'trail' })
range('open-shoe', 'Shoes', 'Sandals', 'Swimming', 'sandal', 25, 'Black', `
Pool drain slide|Drainage holes in the footbed release water after poolside use.
Adjustable strap slide|A broad hook-and-loop strap adjusts over the instep.
Double buckle sandal|Two adjustable forefoot straps hold a contoured cork-blend footbed.
Heel strap pool sandal|An adjustable heel strap keeps the sandal attached while walking.
Soft foam shower slide|A flexible one-piece foam body is easy to rinse after changing rooms.
Textured massage slide|Rounded footbed bumps provide a textured surface under bare feet.
Travel folding sandal|A segmented outsole folds at the arch for compact packing.
Closed-toe water sandal|A protective toe bumper and open side windows suit shoreline walks.
Beach thong sandal|A soft toe post and thin flexible sole suit casual dry beach paths.
Arch contour recovery slide|A raised arch contour and deep heel cup cradle the foot after sessions.
Cross-strap sport sandal|Two crossing textile straps distribute pressure over the instep.
Mesh water shoe|A closed mesh upper and drainage sole protect feet around pool edges.
`, { collection: 'swim' })
// Twenty apparel ranges, each with twelve individually authored cuts/features.
range('run-top', 'Clothing', 'Running Tops', 'Running', 'tee', 28, 'Navy', `
Split mesh running tee|Open mesh side panels ventilate the torso on steady runs.
Seam-free running tee|A circular-knit torso removes side seams beneath a hydration belt.
Shoulder vent running tee|Overlapping shoulder vents release warm air without exposing the back.
Pocket hem running tee|A small zipped rear hem pocket carries a key separately.
Raglan pace running tee|Raglan sleeves provide room for an unrestricted arm swing.
Merino blend running tee|A wool-blend jersey adds temperature balance on changing-weather routes.
Boxy recovery running tee|A loose cropped body leaves room after hot training sessions.
Perforated race running tee|Tiny laser-cut perforations reduce fabric coverage across the back.
Reflective route running tee|Reflective strips trace the shoulder and lower back seams.
Drop-tail route running tee|An extended rear hem adds coverage while leaning forward.
Sun collar running tee|A small stand collar covers the back of the neck.
Half-zip running tee|A short front zip allows adjustable ventilation during a run.
`, { collection: 'everyday-running' })
range('run-short', 'Clothing', 'Running Shorts', 'Running', 'shorts', 30, 'Black', `
Split-leg racing shorts|A 3-inch inseam and deep side split allow long strides.
Lined daily running shorts|A 5-inch woven shell includes a soft brief liner.
Two-layer trail shorts|A fitted inner short sits beneath a durable 6-inch woven shell.
Cargo trail running shorts|Two flat thigh pockets keep trail snacks close to the body.
Phone pocket running shorts|A secure stretch pocket is built into the inner liner.
Unlined distance shorts|A light 7-inch shell allows a separate base layer underneath.
Bonded hem running shorts|Smooth bonded edges remove stitching from the lower hems.
Rain shell running shorts|A water-shedding shell and covered pocket zip suit damp routes.
High waist running shorts|A wide high-rise waistband stays flat against the torso.
Compression race shorts|A close 8-inch stretch fit provides full upper-leg coverage.
Packable wind running shorts|A thin wind shell folds into its own back pocket.
Drawcord-free run shorts|An elastic gripper waist removes loose drawcord ends.
`, { collection: 'everyday-running', material: 'Polyester and elastane performance fabric.', measurement: 'Waist: S 29–32 in; M 32–35 in; L 35–38 in; XL 38–43 in.' })
range('run-layer', 'Clothing', 'Running Layers', 'Running', 'long', 42, 'Navy', `
Thumb-loop running layer|Integrated thumb loops keep sleeves in place on cool starts.
Grid-knit running layer|An open grid interior traps light warmth with less fabric contact.
Quarter-zip pace layer|A short front zip allows ventilation without removing the layer.
Mock-neck running layer|A close mock collar adds coverage in brisk wind.
Mesh-back running layer|A full mesh back panel releases heat beneath a light vest.
Fold-mitt running layer|Cuff extensions fold over the fingers when the temperature drops.
Merino route running layer|A wool-blend knit adds soft warmth during long easy sessions.
Pack-pocket running layer|The entire thin top packs into its own rear zip pocket.
Reflective seam running layer|Reflective piping follows the upper-arm and back seams.
Relaxed warm-up running layer|A dropped shoulder and roomy torso fit over a race singlet.
Side-zip running layer|A side vent zip lets the hem open over a belt or pack.
High-vent hooded run layer|A lightweight fitted hood adds coverage while a chest vent opens for airflow.
`, { collection: 'everyday-running' })
range('run-shell', 'Clothing', 'Running Jackets', 'Running', 'jacket', 70, 'Blue', `
Pack-pocket wind shell|A thin woven shell packs into one zipped chest pocket.
Sealed seam rain shell|Taped seams and a coated shell provide sustained rain coverage.
Back-vent running shell|A covered rear vent releases heat beneath the shoulder blades.
Sleeve-off running shell|Removable sleeves convert the jacket into a sleeveless wind layer.
Winter panel running shell|Light insulation covers the chest while stretch side panels vent heat.
Stow-hood running shell|The hood folds into the collar when conditions clear.
Waist-cinch trail shell|An adjustable waist holds the shell close beneath a running pack.
Half-zip trail anorak|A pullover front and large chest pocket reduce zipper length.
Cape-back running shell|An overlapping back panel leaves room over a slim hydration vest.
Reflective dusk running shell|Reflective shoulder panels highlight the jacket in directed light.
Long hem commute shell|An extended hem provides coverage over shorts during wet commutes.
Mesh-lined route shell|A loose mesh lining keeps the woven outer away from damp skin.
`, { collection: 'trail' })
range('gym-tee', 'Clothing', 'Training T-Shirts', 'Training', 'tee', 24, 'Cream', `
Raglan strength tee|Angled sleeve seams leave room for overhead movements.
Heavy jersey lift tee|A substantial cotton jersey drapes securely during weight-room work.
Mesh interval tee|An open polyester mesh body vents heat during circuit sessions.
Split hem training tee|Side hem splits create room when bending and lunging.
Longline floorwork tee|An extended body adds coverage during floor exercises.
Cropped box training tee|A short loose torso clears a high-rise waistband.
Seamless workout tee|A circular-knit body avoids side-seam pressure under straps.
Shoulder panel gym tee|Abrasion-resistant shoulder panels suit contact with training bags.
Cooling vent gym tee|Perforated panels at the underarm promote air circulation.
Close-fit base tee|A stretch fitted cut sits smoothly beneath another layer.
Reversible studio tee|Two finished faces allow either side of the soft jersey to face outward.
Henley recovery tee|A three-button neck opening makes the relaxed neckline adjustable.
`, { collection: 'training-essentials', material: 'Cotton and polyester jersey.' })
range('gym-bottom', 'Clothing', 'Training Shorts', 'Training', 'shorts', 28, 'Gray', `
Stretch squat shorts|Four-way stretch and a gusseted crotch allow deep bending.
Woven circuit shorts|A 7-inch woven shell includes two secure side pockets.
Mesh court training shorts|A double mesh layer provides airy coverage during indoor drills.
Compression liner gym shorts|A fitted liner extends below a loose outer shell.
Unlined lifting shorts|A simple 6-inch shell leaves room for a chosen base layer.
Zip-pocket training shorts|Two zipped hand pockets secure small belongings during movement.
Cargo warm-up shorts|Flat utility pockets hold locker items before the session.
High split studio shorts|Curved side splits allow unrestricted leg movement.
Knit recovery gym shorts|A soft loopback knit offers a relaxed after-session fit.
Long coverage gym shorts|A 10-inch inseam adds coverage above the knee.
Belt-loop climbing shorts|A reinforced waistband includes belt loops for active outdoor training.
Light packable gym shorts|A thin shell folds into a rear pocket for spare-kit storage.
`, { collection: 'training-essentials', measurement: 'Waist: S 29–32 in; M 32–35 in; L 35–38 in; XL 38–43 in.' })
range('studio-leg', 'Clothing', 'Leggings', 'Yoga', 'pants', 45, 'Black', `
Soft brushed studio leggings|A brushed interior and wide waistband suit slow studio sessions.
Side-pocket flow leggings|Flat stretch thigh pockets hold a phone while walking to class.
Stirrup stretch leggings|Underfoot loops keep the full-length legs in place.
Flared practice leggings|A gently flared lower leg leaves space around the ankle.
Seamless rib studio leggings|A circular rib knit reduces seams along the outer leg.
Mesh calf studio leggings|Mesh lower-leg panels add ventilation during warm sessions.
Cross-waist flow leggings|An overlapping front waistband forms a soft V shape.
Fold-waist studio leggings|A deep flexible waist folds down to the desired height.
Capri movement leggings|A mid-calf cut provides less lower-leg coverage.
Thermal walk leggings|A brushed thermal knit adds warmth for cool journeys to class.
Bootcut lounge leggings|A relaxed bootcut hem moves from studio recovery to everyday wear.
Inner-drawcord flow leggings|A concealed drawcord adds waistband adjustment.
`, { gender: ['Women'], collection: 'training-essentials', material: '78% polyester / 22% elastane stretch knit.', measurement: 'Waist: S 26–29 in; M 29–31.5 in; L 31.5–34.5 in; XL 34.5–38.5 in.', photo: null })
range('studio-bra', 'Clothing', 'Sports Bras', 'Training', 'bra', 28, 'Black', `
Racerback light-support bra|A narrow racerback and soft band suit low-impact studio movement.
Cross-strap studio bra|Two crossed back straps distribute light support over the shoulders.
Front-zip training bra|A covered front zipper makes changing after a workout easier.
Adjustable band sports bra|A hook-and-eye band allows circumference adjustment.
Longline studio bra|An extended lower band provides additional torso coverage.
Mesh-back training bra|An open mesh rear panel vents heat during training.
Wide-strap support bra|Broad shoulder straps spread pressure across the shoulders.
Convertible strap sports bra|Detachable rear strap anchors switch between straight and crossed layouts.
Molded-cup training bra|Separate lightly molded cups provide shaped coverage.
Unpadded stretch sports bra|A two-layer stretch front provides smooth coverage without inserts.
High-neck studio bra|A raised front neckline adds coverage during inverted positions.
Wrap-front practice bra|Overlapping front panels create a soft flexible neckline.
`, { gender: ['Women'], collection: 'training-essentials', material: '78% polyester / 22% elastane stretch knit.', measurement: 'Underbust: S 27–29 in; M 29–31 in; L 31–33 in; XL 33–35 in.' })
range('studio-top', 'Clothing', 'Studio Tops', 'Yoga', 'tank', 26, 'Gray', `
Open-back flow tank|A split open back allows ventilation and adjustable tying.
Ribbed studio tank|Soft vertical ribbing gives the fitted body gentle stretch.
Longline practice tank|An extended hem adds coverage over leggings.
Cropped movement tank|A short relaxed hem pairs with a high-rise waistband.
Built-in support studio tank|An internal light-support shelf bra adds one-layer convenience.
Twist-front yoga tank|A gathered front knot holds the hem above the waistband.
High-neck flow tank|A close high neckline adds coverage when bending forward.
Deep-armhole studio tank|Wide arm openings leave space around the shoulders.
Wrap-side studio tank|Overlapping side panels open naturally during twisting poses.
Mesh-panel practice tank|Mesh shoulder panels add airflow above the chest.
Soft cotton lounge tank|A breathable cotton jersey suits gentle stretching and recovery.
Adjustable strap studio tank|Sliding strap adjusters tune the shoulder fit.
`, { gender: ['Women'], collection: 'training-essentials' })
range('fleece-top', 'Clothing', 'Sweatshirts', 'Lifestyle', 'long', 42, 'Navy', `
Loopback crew sweatshirt|Unbrushed cotton loops provide a lighter sweatshirt layer.
Brushed winter crew|A brushed fleece interior adds warmth on cold everyday outings.
Half-zip fleece sweatshirt|A half-length front zipper allows adjustable neck coverage.
Mock-neck fleece top|A ribbed stand collar provides a close warm neckline.
Side-snap fleece pullover|Side hem snaps open the torso for easy layering.
Pocket crew sweatshirt|A discreet zipped side pocket secures small essentials.
Cropped fleece crew|A shorter boxy body sits above a high-rise waistband.
Oversized drop-shoulder crew|Dropped sleeves and a roomy chest allow relaxed layering.
Raglan fleece crew|Diagonal shoulder seams keep the top comfortable beneath a backpack.
Collared fleece pullover|A soft fold-over collar gives the fleece a shirt-like neckline.
Quilt-panel sweatshirt|A lightly quilted front panel adds texture and warmth over the chest.
Reversible fleece crew|Smooth jersey and plush fleece faces can each be worn outward.
`, { collection: 'club-fleece', material: '80% cotton / 20% polyester fleece.' })
range('hoodie', 'Clothing', 'Hoodies', 'Lifestyle', 'jacket', 48, 'Navy', `
Full-zip loopback hoodie|A full front zipper and unbrushed loops create an easy light layer.
Insulated fleece hoodie|A quilted inner body adds warmth beneath the fleece shell.
Oversized weekend hoodie|A wide torso and dropped sleeves create a loose layered fit.
Cropped zip hoodie|A shorter body and full zipper pair with high-rise bottoms.
Funnel hood pullover|A raised front hood opening covers more of the neck.
Sleeveless warm-up hoodie|Open armholes leave the shoulders free over a training tee.
Pocket-secure travel hoodie|A hidden zipped pocket sits inside the front kangaroo pocket.
Snap-front hooded fleece|Large front snaps offer an alternative to a zipper.
Mesh-lined summer hoodie|A thin hood and breathable mesh lining suit mild evenings.
Longline lounge hoodie|An extended body adds seat coverage for downtime.
Thumb-loop fleece hoodie|Extended cuffs with thumb loops keep sleeves in place.
Drawcord-free everyday hoodie|A shaped fixed hood removes loose drawcords from the neckline.
`, { collection: 'club-fleece', material: 'Cotton and polyester knit.' })
range('lounge-pant', 'Clothing', 'Pants', 'Lifestyle', 'pants', 38, 'Gray', `
Straight-leg loopback pants|A straight open hem and loopback jersey offer a light relaxed fit.
Brushed cuff lounge pants|Soft fleece and ribbed ankle cuffs keep warmth close.
Wide-leg recovery pants|A generous leg opening gives space during seated recovery.
Cargo knit lounge pants|Soft thigh pockets add practical storage to a relaxed knit cut.
Zip-ankle travel pants|Ankle zips open the hem over footwear during quick changes.
Tapered stretch commuter pants|A clean tapered woven cut includes stretch at the knees.
Snap-side warm-up pants|Side snaps allow the leg to open over athletic shoes.
Ribbed lounge pants|A soft rib knit stretches through the entire leg.
High-waist fleece pants|A deep high-rise waistband and loose leg provide relaxed coverage.
Knee-panel utility pants|Reinforced knee panels add durability for everyday active use.
Packable woven travel pants|Thin woven fabric folds into the right rear pocket.
Drawcord hem lounge pants|Adjustable ankle cords switch the open leg to a gathered shape.
`, { collection: 'club-fleece', material: 'Cotton and polyester knit.', measurement: 'Waist: S 29–32 in; M 32–35 in; L 35–38 in; XL 38–43 in.' })
range('basket-kit', 'Clothing', 'Basketball Clothing', 'Basketball', 'tee', 30, 'White', `
Reversible practice jersey|Two finished mesh faces separate teams during practice.
Wide-armhole court tank|Deep arm openings leave shoulders free for shooting drills.
Mesh warm-up shooting shirt|A loose short-sleeve mesh body fits over a game jersey.
Snap-front bench shirt|Front snaps let the layer open quickly on the sideline.
Longline court jersey|An extended lightweight torso stays tucked during play.
Sleeveless compression court top|A fitted stretch base layer sits beneath a jersey.
Padded elbow court top|Soft integrated elbow pads cushion contact with the floor.
Hooded sideline warm-up top|A light hood adds coverage between indoor sessions.
Quarter-zip court warm-up|A tall neck and short zip adjust coverage before play.
Raglan shooting tee|A flexible raglan shoulder leaves space for the shooting motion.
Vent-back court jersey|A large mesh back panel ventilates warm indoor games.
Cotton recovery court shirt|Soft cotton jersey provides a comfortable after-game layer.
`, { collection: 'team-sport' })
range('soccer-kit', 'Clothing', 'Soccer Clothing', 'Soccer', 'tee', 28, 'Blue', `
Mesh match training jersey|Ventilated side mesh and a simple crew neck suit everyday practice.
Long-sleeve field jersey|Full-length light sleeves add coverage on cool training days.
Padded goalkeeper jersey|Soft elbow padding adds cushioning for recreational keeper drills.
Quarter-zip pitch top|A close collar and short zipper adjust warm-up coverage.
Compression field base layer|A close stretch torso sits smoothly under a jersey.
Rain warm-up field top|A coated pullover body sheds light rain before training.
Sleeveless training bib|A loose mesh body slips over a tee to identify practice teams.
Reversible field bib|Two contrasting finished mesh faces allow quick team changes.
Thermal sideline shirt|A brushed inner knit adds warmth while waiting beside the pitch.
Collared travel team polo|A soft collar and three-button placket suit travel days.
Vent-back field jersey|A full back mesh insert releases warmth during intervals.
Raglan keeper warm-up|Raglan sleeves provide room for overhead catching drills.
`, { collection: 'team-sport' })
range('tennis-kit', 'Clothing', 'Tennis Clothing', 'Tennis', 'skirt', 38, 'Black', `
Box-pleat court skirt|Wide box pleats provide movement over an integrated stretch short.
Wrap-front tennis skort|An overlapping front skirt sits above fitted inner shorts.
Ball-pocket rally skirt|Two inverted inner-short pockets hold spare tennis balls.
Flared court skirt|A circular flared outer layer gives space for lateral steps.
Straight practice skort|A straight woven outer cut adds a clean low-bulk shape.
High-waist tennis skirt|A broad high-rise waist holds the skirt securely while moving.
Mesh-panel tennis skort|Mesh side panels improve ventilation above the inner shorts.
Long coverage court skirt|An 18-inch outer hem offers extra leg coverage.
Pull-on pleated tennis dress|A sleeveless dress combines a pleated skirt and removable inner shorts.
Zip-front rally dress|A short front zip adjusts the neckline of a fitted court dress.
Racerback court dress|An open racerback leaves room for shoulder movement.
Pocket-side court dress|Flat side pockets add storage to a simple A-line dress.
`, { gender: ['Women'], collection: 'court-classics', measurement: 'Waist: S 26–29 in; M 29–31.5 in; L 31.5–34.5 in; XL 34.5–38.5 in.' })
range('pool-kit', 'Clothing', 'Swimwear', 'Swimming', 'suit', 38, 'Black', `
Cross-back training swimsuit|Crossed shoulder straps leave room across the upper back.
High-neck pool swimsuit|A high front neckline provides additional chest coverage.
Zip-front leisure swimsuit|A short covered front zip makes changing simpler.
Square-neck lap swimsuit|A square neckline and broad straps give stable shoulder coverage.
Open-back lap swimsuit|A large open back combines with a narrow support band.
Long-torso pool swimsuit|An extended torso cut adds length between shoulder and hip.
Boyleg practice swimsuit|A short integrated leg adds upper-thigh coverage.
Long-sleeve swim suit|Full-length sleeves add coverage during outdoor swimming.
Wrap-front leisure swimsuit|Overlapping front panels create a flexible crossover fit.
Adjustable-strap pool suit|Sliding shoulder adjusters tune the torso length.
Scoop-back pool swimsuit|A medium scoop back provides easy entry with broad straps.
Panel-support swim suit|A lined front panel and internal soft shelf offer gentle support.
`, { gender: ['Women'], collection: 'swim', material: '82% polyester / 18% elastane swim knit.', care: 'Rinse after swimming. Hand wash in cool water and air dry in shade.', measurement: 'Bust: S 32.5–35.5 in; M 35.5–38 in; L 38–41 in; XL 41–44.5 in.' })
range('outdoor-layer', 'Clothing', 'Outdoor Jackets', 'Hiking', 'jacket', 70, 'Green', `
Sealed trail rain jacket|A coated shell and taped seams provide rain coverage on walking routes.
Fleece-lined walking jacket|A soft fleece lining adds warmth inside a woven outer.
Zip-off sleeve hiking jacket|Detachable sleeves change the jacket into a vest.
Pocket-rich utility shell|Four external pockets organize small walking essentials.
Packable summit wind jacket|A light wind shell stuffs into an included chest pocket.
Insulated ridge jacket|Synthetic fill through the torso traps warmth in cold dry conditions.
Long hem trail parka|An extended hem covers the upper legs during wet walks.
Stretch panel hiking jacket|Flexible side panels allow reaching and scrambling movement.
Vent-zip trail shell|Underarm zips release heat without removing the rain layer.
Stowaway hood hiking jacket|The adjustable hood rolls into a zipped collar pocket.
Snap storm walking jacket|A snap-down storm flap covers the main front zipper.
Reversible fleece trail jacket|A smooth woven face reverses to a soft fleece outer.
`, { collection: 'trail' })
range('kids-top', 'Clothing', 'Kids Tops', 'Lifestyle', 'tee', 18, 'Blue', `
Playday raglan tee|Raglan shoulder seams leave room for climbing and reaching.
School pocket tee|A small chest pocket and durable cotton jersey suit daily wear.
Easy-snap shoulder tee|Shoulder snaps widen the neckline for easy changes.
Longline playground tee|An extended back hem adds coverage while bending and climbing.
Mesh sports day tee|A light mesh back panel vents heat during school sports.
Soft sensory-seam tee|Flat seams and a printed neck label reduce bulky contact points.
Sun collar play tee|A raised rear collar covers the back of the neck outdoors.
Ribbed stretch kids tee|A soft ribbed fabric follows movement through the torso.
Reversible play tee|Two finished jersey faces allow either side to face outward.
Long-sleeve park tee|Full-length light sleeves add coverage on mild days.
Henley weekend kids tee|A three-snap neck opening makes the fit easy to adjust.
Zip-pocket adventure tee|A small zipped side pocket keeps a found treasure secure.
`, { collection: 'easy-on', gender: ['Kids'], ages: ['Little Kids', 'Big Kids'], sizes: ['4Y', '6Y', '8Y', '10Y', '12Y'], variantAges: { '4Y': ['Little Kids'], '6Y': ['Little Kids'], '8Y': ['Big Kids'], '10Y': ['Big Kids'], '12Y': ['Big Kids'] }, sizeSystem: "Children's apparel by age", measurement: 'Height: 4Y 38–41 in; 6Y 44–46 in; 8Y 50–52 in; 10Y 54–56 in; 12Y 58–60 in.' })
range('kids-bottom', 'Clothing', 'Kids Bottoms', 'Training', 'shorts', 20, 'Navy', `
Playground woven shorts|A light woven shell and elastic waist suit active outdoor days.
School jersey shorts|Soft cotton jersey and deep side pockets support everyday comfort.
Mesh games shorts|A double mesh body vents heat during running games.
Reinforced seat play shorts|A durable seat panel handles sitting on rough playground surfaces.
Zip-pocket adventure shorts|Two zipped side pockets keep small belongings secure.
Stretch tumbling shorts|Four-way stretch and a gusseted crotch allow floor movements.
Long coverage sports shorts|A longer hem extends toward the knee for additional coverage.
Soft loopback kids shorts|Unbrushed loopback fabric provides a gentle downtime layer.
Cargo discovery shorts|Flat thigh pockets offer space for small outdoor essentials.
Lined swim-play shorts|A light inner liner and quick-drying shell suit supervised pool play.
Easy-pull handle shorts|Small waistband pull loops help children dress independently.
Seam-flat practice shorts|Flat internal seams reduce bulky contact during movement.
`, { collection: 'easy-on', gender: ['Kids'], ages: ['Big Kids'], sizes: ['8Y', '10Y', '12Y'], sizeSystem: "Children's apparel by age", measurement: 'Height: 8Y 50–52 in; 10Y 54–56 in; 12Y 58–60 in.' })
range('cycle-top', 'Clothing', 'Cycling Jerseys', 'Cycling', 'tee', 45, 'Orange', `
Three-pocket road jersey|Three rear pockets store small ride essentials above the waist.
Full-zip climb jersey|A full front zipper provides adjustable airflow on climbs.
Mesh summer cycling jersey|Open mesh side panels ventilate warm-weather rides.
Thermal morning cycle jersey|A brushed interior adds warmth on cool early rides.
Long-sleeve touring jersey|Light full sleeves add coverage during extended trips.
Relaxed commute cycling shirt|A loose everyday cut includes a secure rear zip pocket.
Wind-panel cycling jersey|A close-woven chest panel reduces direct wind penetration.
Gripper-hem road jersey|A silicone inner hem strip holds the back in place while leaning forward.
Reflective commute jersey|Reflective rear details highlight the shirt in directed light.
Collared gravel ride shirt|A soft fold-over collar pairs with a loose utility pocket cut.
Sleeveless indoor cycling top|An open shoulder cut and mesh back suit stationary-bike sessions.
Pack-pocket cycle shell top|A thin short-sleeve wind shell folds into its own rear pocket.
`, { collection: 'sportswear' })
// Ten equipment/accessory ranges with ten different functions in each.
range('carry', 'Accessories', 'Bags', 'Lifestyle', 'bag', 28, 'Black', `
Shoe-separator training backpack|A lower zip compartment separates used footwear from clean kit.
Roll-top commute backpack|A rolling top closure adjusts the capacity above a padded back panel.
Laptop sleeve sport backpack|A padded internal sleeve separates a laptop from workout clothing.
Hydration-ready trail pack|A flat reservoir sleeve and hose opening suit day walks.
Drawstring gym sack|A single light compartment closes with shoulder-cord drawstrings.
Court racket backpack|An external handle opening accommodates a recreational tennis racket.
Ball-carry sports backpack|An expandable front mesh pocket holds a basketball or soccer ball.
Swim wet-pocket backpack|A separate lined pocket keeps damp pool items away from dry kit.
Reflective commute backpack|Reflective front panels highlight the bag in directed light.
Packable day backpack|The soft unstructured pack folds into its own interior pocket.
`, { collection: 'sportswear', material: 'Woven polyester with textile straps.', measurement: 'Adult daypack format; approximately 20 liters unless stated in details.' })
range('duffel-gear', 'Accessories', 'Bags', 'Training', 'duffel', 25, 'Black', `
Wet-pocket training duffel|A lined end compartment separates damp clothing after sessions.
Shoe-tunnel court duffel|A dedicated side tunnel keeps court shoes separate from clean kit.
Convertible backpack duffel|Padded shoulder straps let the bag carry as a backpack.
Locker-size gym duffel|A compact 18-liter body fits small gym lockers.
Weekend travel duffel|A roomy 45-liter body holds clothing for several nights.
Wide-mouth kit duffel|A U-shaped top zip opens the full main compartment for access.
Mesh pool duffel|An open mesh body lets damp pool gear ventilate during transport.
Fold-flat spare duffel|A soft empty bag folds into its end pocket for storage.
Racket-length court duffel|An elongated body holds a racket with its handle inside.
Padded team equipment duffel|A padded base cushions shared training equipment in transit.
`, { collection: 'training-essentials', material: 'Woven polyester body with webbing handles.', measurement: 'Approximately 32 liters unless stated in product details.' })
range('headwear', 'Accessories', 'Hats', 'Running', 'cap', 18, 'White', `
Mesh-panel running cap|Open rear mesh panels add airflow above the head.
Fold-brim travel cap|A flexible segmented brim folds into a jacket pocket.
Wide-brim trail hat|A surrounding brim adds coverage to the ears and neck.
Neck-flap sun cap|A removable rear fabric flap covers the back of the neck.
Thermal earflap cap|Fold-down fleece ear panels add coverage in cold weather.
Lightweight running visor|An open crown leaves the head ventilated above the shade brim.
Sweatband tennis visor|A broad absorbent inner band suits long court sessions.
Water-shedding trail cap|A close-woven coated crown sheds light rain.
Reflective dusk cap|Reflective strips follow the side panels for visibility in directed light.
Stretch skull running cap|A soft brim-free stretch cap fits closely under a hood.
`, { collection: 'everyday-running', material: 'Polyester textile with an adjustable or stretch headband.', measurement: 'Adult fit, head circumference 21–24 inches.' })
range('sock-kit', 'Accessories', 'Socks', 'Training', 'sock', 12, 'White', `
Arch-band ankle socks|A knitted arch band holds the low cuff close around the foot.
Cushioned hiking crew socks|Dense heel and toe terry cushions contact inside hiking shoes.
Thin court liner socks|A fine knit adds minimal bulk inside close-fitting court shoes.
Toe-separated yoga socks|Individual toe sections leave room for toe spreading on a mat.
Grip-sole studio socks|Silicone dots beneath the foot add grip on studio floors.
Thermal winter crew socks|A wool-blend knit traps warmth inside cold-weather footwear.
No-show heel-grip socks|A low hidden cuff and inner heel tab help resist slipping.
Mesh running quarter socks|Open instep mesh and a quarter-height cuff suit warm routes.
Knee-high field socks|A long ribbed leg covers shin guards during soccer practice.
Seamless-toe everyday socks|A smooth linked toe seam reduces bulk at the front of the foot.
`, { collection: 'training-essentials', material: 'Cotton / polyester / elastane knit; thermal style includes wool.', measurement: 'M fits US footwear 6–9; L fits US footwear 10–13.', sizes: ['M', 'L'], sizeSystem: 'Adult sock sizing' })
range('hydrate', 'Accessories', 'Bottles', 'Training', 'bottle', 16, 'Black', `
Insulated steel training bottle|A double-wall 24 fl oz steel body keeps the outer surface dry.
Soft flask running bottle|A flexible 17 fl oz flask compresses as its contents are consumed.
Wide-mouth recovery bottle|A broad 32 fl oz opening allows easy filling and cleaning.
Straw-lid gym bottle|A flip-up straw gives access without tipping the 24 fl oz bottle.
Mixing shaker training bottle|A removable mixing grid helps blend powders in a 24 fl oz body.
Squeeze sideline bottle|A flexible 28 fl oz body dispenses water through a push-pull nozzle.
Clip-loop hiking bottle|A rigid 30 fl oz body includes a loop for attachment to a pack.
Handle-lid team bottle|A large 40 fl oz bottle has a folding carry handle on the lid.
Flat pack commuter bottle|A slim 20 fl oz rectangular body fits alongside books in a bag.
Hand-strap running bottle|An adjustable hand strap holds a 17 fl oz bottle during runs.
`, { collection: 'training-essentials', material: 'Plastic bottle and lid; insulated style uses stainless steel.', measurement: 'Capacity is specified in the product description.', care: 'Hand wash with warm soapy water; leave open to dry.' })
range('floor-kit', 'Accessories', 'Mats', 'Yoga', 'mat', 24, 'Blue', `
Cushioned studio mat|An 8 mm foam surface adds cushioning for seated floor work.
Travel fold yoga mat|A thin 2 mm mat folds into a compact square for travel.
Alignment guide yoga mat|Printed center and hand-position guides assist placement during practice.
Natural rubber grip mat|A textured rubber surface provides a firm 4 mm practice base.
Cork surface yoga mat|A thin cork top covers a flexible rubber backing.
Wide practice exercise mat|A 32-inch width leaves extra space beside the body.
Long stretch exercise mat|An 80-inch length adds room for taller users to lie flat.
Roll-strap fitness mat|An integrated carry strap holds the rolled 6 mm mat closed.
Reversible texture yoga mat|Fine and coarse faces provide two surface textures.
Interlocking floor mat set|Four square foam tiles connect to cover a small exercise area.
`, { collection: 'training-essentials', material: 'Textured foam or rubber as specified in product description.', measurement: 'Standard mat 72 × 24 inches unless noted in description.' })
range('strength-kit', 'Accessories', 'Resistance Equipment', 'Training', 'band', 14, 'Green', `
Fabric hip training band|A short woven elastic loop adds resistance around the thighs.
Long assisted-pull band|A long continuous rubber loop supports assisted pull exercises.
Handle tube resistance kit|A resistance tube includes two soft hand grips.
Door-anchor exercise band|A long elastic band includes a padded door anchor for home sessions.
Mini loop mobility set|Three small elastic loops provide light to firm resistance options.
Figure-eight arm band|Two linked elastic loops form a compact upper-body exercise tool.
Ankle-cuff resistance tube|Two padded ankle cuffs join through a short resistance tube.
Stretch strap with loops|A non-elastic strap has multiple hand loops for controlled stretching.
Flat therapy-style band|A broad flat elastic strip offers light resistance for gentle exercises.
Anti-roll squat band|A wide grippy fabric loop stays flat around the upper legs.
`, { collection: 'training-essentials', material: 'Elastic textile or rubber with fabric reinforcements as described.', measurement: 'Adult exercise equipment; choose a comfortable resistance and inspect before use.' })
range('field-kit', 'Accessories', 'Training Equipment', 'Soccer', 'cone', 16, 'Orange', `
Low-profile field marker set|Twelve flexible low discs mark drill boundaries without tall obstacles.
Tall slalom training cones|Six tall flexible cones define weaving routes during footwork practice.
Flat agility marker set|Ten flat non-slip spots mark positions on indoor practice floors.
Adjustable training hurdle|A folding hurdle switches between two low step-over heights.
Roll-out agility ladder|A flat twelve-rung ladder rolls up for portable footwork drills.
Weighted corner marker|A flexible upright marker uses a broad weighted base on hard ground.
Target pass gate pair|Two low folding arches define passing targets on a practice field.
Ball carry mesh sack|A drawcord mesh sack carries several inflated practice balls.
Handheld ball inflation pump|A compact double-action hand pump includes an inflation needle.
Coach field clipboard|A wipe-clean soccer field board holds paper notes beneath a spring clip.
`, { collection: 'team-sport', material: 'Training-grade polymer or textile as appropriate to the equipment.', measurement: 'Recreational training equipment; see function described above.' })
range('pool-gear', 'Accessories', 'Swim Equipment', 'Swimming', 'goggles', 18, 'Blue', `
Clear-lens lap goggles|Clear lenses and an adjustable split strap suit indoor pool sessions.
Tinted outdoor swim goggles|Tinted lenses reduce visible brightness during outdoor swimming.
Wide-view leisure goggles|Broad lenses offer a wider view during recreational pool use.
Junior soft-seal goggles|A smaller soft seal and adjustable strap fit younger swimmers.
Silicone pool swim cap|A flexible silicone shell covers hair during pool sessions.
Long-hair swim cap|An extended rear pocket accommodates a tied bundle of hair.
Kickboard swim trainer|A buoyant hand-held board supports kick-focused practice.
Pull buoy swim trainer|A shaped buoyancy aid sits between the legs during arm-focused drills.
Mesh swim equipment pouch|A ventilated drawstring pouch carries damp swim essentials.
Compact microfiber pool towel|A quick-drying 32 × 60 inch towel folds into a small pouch.
`, { collection: 'swim', material: 'Swimming equipment materials are specified by item function.', measurement: 'Adult recreational pool use except the junior goggle style; adjustable fit where applicable.', care: 'Rinse with fresh water after use and dry in shade.' })
range('recovery-gear', 'Accessories', 'Recovery Equipment', 'Training', 'towel', 14, 'Gray', `
Textured foam recovery roller|A firm hollow roller has raised surface zones for controlled floor rolling.
Smooth foam recovery roller|A solid smooth foam cylinder provides an even rolling surface.
Peanut massage ball|Two joined firm balls keep the center channel clear during gentle rolling.
Spiked massage ball|A compact firm ball has rounded raised surface points.
Handheld muscle roller|A rotating central barrel sits between two easy-grip handles.
Cooling neck training towel|A light absorbent fabric is designed to be dampened for a cool feel.
Absorbent gym hand towel|A cotton terry towel wipes hands and benches between exercise sets.
Packable changing towel|A large soft towel includes corner snaps for temporary coverage.
Stretch assistance strap|A long woven strap with a metal loop adjusts for supported stretches.
Kneeling exercise pad|A thick small foam pad adds cushioning beneath knees during floor work.
`, { collection: 'training-essentials', material: 'Foam, polymer or textile as specified by item function.', measurement: 'Portable personal training accessory; intended for comfortable self-directed use.' })

const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const photos = {
  'Mesh-panel running cap': 'sport-cap-white',
  'Straw-lid gym bottle': 'sport-bottle-black',
  'Cushioned studio mat': 'yoga-mat-blue',
  'Roll-strap fitness mat': 'yoga-mat-blue',
}
// Select a silhouette by the actual item, including mixed equipment ranges.
function silhouette(r, title) {
  if (/Indoor pass|Turf control/.test(title)) return shapes.runner
  if (/Mesh water shoe/.test(title)) return shapes.runner
  if (/Wide-brim/.test(title)) return 'M47 61Q44 22 80 22Q116 22 113 61Q157 70 137 89Q80 109 23 89Q3 70 47 61Z'
  if (/Neck-flap/.test(title)) return 'M38 67Q34 20 80 20Q120 24 120 68L143 81L125 90L83 75L61 78L59 108H30L36 71Z'
  if (/Earflap|earflap/.test(title)) return 'M37 67Q33 20 80 20Q125 24 121 68L140 83L118 90L108 72L107 106H91L86 77L58 77L54 106H35Z'
  if (/Drawstring|sack|pouch/.test(title)) return 'M42 29H118L123 97Q80 116 37 97Z M39 23H121 M49 21L39 8 M110 21L120 8'
  if (/Handheld muscle roller/.test(title)) return 'M18 54H48V45H112V54H142V73H112V82H48V73H18Z'
  if (/Peanut massage/.test(title)) return 'M80 38C35 6 15 44 26 76C36 105 61 107 80 88C101 107 126 105 136 76C147 44 125 6 80 38Z'
  if (/Spiked massage/.test(title)) return 'M80 12L91 25L109 20L113 38L133 41L127 61L138 75L123 86L121 102L103 102L90 115L77 101L58 111L49 95L30 93L31 72L19 60L34 46L31 28L52 27L64 12L76 26Z'
  if (/Cooling neck/.test(title)) return 'M58 11H101V108H58Z'
  if (/Handheld ball inflation/.test(title)) return 'M49 17H111V25H85V96H102V105H58V96H74V25H49Z M90 37Q140 33 128 90H119'
  if (/Tube|tube/.test(title) && r.key === 'strength-kit') return 'M27 23H54V45H27Z M106 23H133V45H106Z M39 46Q4 105 80 106Q156 105 119 46L113 46Q145 98 80 98Q15 98 45 46Z'
  if (/Figure-eight/.test(title)) return 'M80 53Q22 1 21 56Q22 112 80 69Q138 112 139 56Q138 1 80 53Z M68 59Q33 29 33 57Q34 89 68 59Z M92 59Q126 89 127 57Q127 29 92 59Z'
  if (/Interlocking/.test(title)) return 'M28 21H70V29H90V21H132V58H123V78H132V106H90V97H70V106H28V78H37V58H28Z'

  if (/dress/.test(title)) return shapes.dress
  if (/sleeveless.*hoodie/.test(title)) return shapes.vest
  if (/running visor|tennis visor/.test(title)) return 'M30 58Q80 34 124 59L141 84L123 91L83 72L34 77Z'
  if (/skull.*cap|swim cap/.test(title)) return 'M33 78Q29 19 80 18Q131 19 127 78Z'
  if (/sock/.test(title) && /ankle|liner|No-show|quarter/.test(title)) return 'M52 60H81V80L112 89L108 105H48L39 94L48 80Z'
  if (/jersey|tank|bib/.test(title) && r.key === 'basket-kit' || /bib/.test(title)) return shapes.tank
  if (/Long-sleeve|Thermal|Quarter-zip|warm-up|Padded goalkeeper/.test(title) && ['basket-kit', 'soccer-kit', 'kids-top', 'cycle-top'].includes(r.key)) return shapes.long
  if (r.key === 'pool-gear') {
    if (/pouch/.test(title)) return shapes.bag
    if (/towel/.test(title)) return shapes.towel
    if (/Kickboard/.test(title)) return 'M44 32Q80 7 116 32L125 101H35Z'
    if (/Pull buoy/.test(title)) return 'M52 22Q80 7 108 22L94 60L108 98Q80 112 52 98L66 60Z'
  }
  if (r.key === 'recovery-gear') {
    if (/roller/.test(title)) return 'M43 23Q20 62 43 99H117Q140 62 117 23Z M43 23Q65 62 43 99 M117 23Q96 62 117 99'
    if (/ball/.test(title)) return shapes.ball
    if (/strap/.test(title)) return shapes.band
    if (/pad/.test(title)) return 'M30 36H121L137 85L122 99H31L23 85Z'
  }
  if (r.key === 'field-kit') {
    if (/marker set/.test(title)) return 'M27 78Q45 46 62 78L60 87H29Z M65 57Q82 25 99 57L97 66H67Z M103 91Q120 60 137 91L135 100H105Z'
    if (/hurdle|gate/.test(title)) return 'M23 103V29H137V103H125V42H35V103Z'
    if (/ladder/.test(title)) return 'M36 14H44V108H36Z M116 14H124V108H116Z M44 23H116V29H44Z M44 47H116V53H44Z M44 71H116V77H44Z M44 95H116V101H44Z'
    if (/sack/.test(title)) return shapes.bag
    if (/pump/.test(title)) return 'M49 17H111V25H85V96H102V105H58V96H74V25H49Z M90 37Q140 33 128 90H119'
    if (/clipboard/.test(title)) return 'M40 19H120V109H40Z M62 11H98V28H62Z'
  }
  return shapes[r.shape]
}
export function expandedCatalog(make) {
  return ranges.flatMap((r, rangeIndex) => r.designs.map(([title, feature], designIndex) => {
    const id = slug(title)
    const price = r.basePrice + designIndex * (r.category === 'Shoes' ? 4 : r.category === 'Clothing' ? 3 : 2)
    const sizes = r.sizes || (r.category === 'Shoes' ? ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'] : r.category === 'Clothing' ? ['S', 'M', 'L', 'XL'] : null)
    const junior = title === 'Junior soft-seal goggles'
    const gender = junior ? ['Kids'] : r.gender || ['Men', 'Women']
    const ages = junior ? ['Big Kids'] : r.ages || (['court', 'racket-shoe', 'basket-kit', 'soccer-kit'].includes(r.key) ? ['Adults', 'Teens'] : ['Adults'])
    const type = /Indoor pass|Turf control/.test(title) ? 'Soccer Shoes' : title === 'Mesh water shoe' ? 'Water Shoes' : r.type
    const stock = designIndex === 11 && rangeIndex % 4 === 0 ? 0 : 10
    const photo = photos[title] || (r.photo && !/Rain|knit|Travel|Wide|Easy-entry/.test(title) ? r.photo : null)
    return make(id, title, r.category, type, price, photo, r.color, r.sport, r.collection, feature, {
      art: silhouette(r, title), gender, ages,
      options: sizes ? { Size: sizes } : {}, stock,
      variantAges: r.variantAges,
      variants: sizes?.map((size, index) => ({ id: `${id}-${slug(size)}`, options: { Size: size }, price, stock: stock ? (index === sizes.length - 1 && designIndex % 7 === 0 ? 0 : 3 + ((designIndex + index) % 6)) : 0, ...(r.variantAges?.[size] ? { ages: r.variantAges[size] } : {}) })),
      sizeSystem: r.sizeSystem || (r.category === 'Shoes' ? "US men's footwear" : r.category === 'Clothing' ? (gender[0] === 'Women' ? "Women's apparel" : 'Adult apparel') : 'One size'),
      fit: r.category === 'Shoes' ? 'Choose your usual footwear size; construction and intended surface are described below.' : r.category === 'Clothing' ? 'Use the size measurements below and the described cut to choose your fit.' : 'Use the dimensions and intended activity below to choose your equipment.',
      ...(r.measurement ? { measurement: r.measurement } : {}),
      material: /leather/.test(title) ? 'Leather forefoot with textile lining and a molded sole.' : /Canvas/.test(title) ? 'Canvas textile upper with rubber outsole.' : /Suede/.test(title) ? 'Suede leather upper with textile lining and rubber cupsole.' : r.material || (r.category === 'Shoes' ? 'Textile and synthetic upper; foam midsole; rubber outsole. Specialized construction is described above.' : 'Polyester performance textile; specialized panels are described above.'),
      ...(r.care ? { care: r.care } : {}),
      details: [feature, `Designed for ${r.sport.toLowerCase()} use.`, `Color: ${r.color}.`],
      aliases: `${r.key} ${feature}`, newness: designIndex < 2 ? 60 + rangeIndex : 0,
      badge: stock === 0 ? 'Coming back soon' : designIndex < 2 ? 'New' : '', rating: 4.2 + (designIndex % 5) / 10, reviews: 12 + rangeIndex * 3 + designIndex,
    })
  }))
}
