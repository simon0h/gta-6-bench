// Product page copy for the everyday assortment (shelf.js): an overview in JB Hi-Fi's product-page
// voice and a "Key features" list, written from each row's type, brand and attributes. Nothing here
// changes a product's id, price, stock or title; it only fills the Description / Key features text.

const num = s => parseFloat(String(s).replace(/,/g, ''))
const inch = s => s ? String(s).replace(/\s*inch$/, '"') : ''
const lc = s => String(s || '').toLowerCase()
const star = v => String(v).replace(/ stars?$/, ' Star')
const has = (a, k) => a[k] != null && a[k] !== ''

// Attribute -> key feature line. Order of keys in a row is kept; Colour goes last.
const FEATURE = {
  'Display size': (v, t) => /phone|iphone|watch/i.test(t) ? `${inch(v)} display` : `${inch(v)} screen`,
  Processor: v => `${v} processor`,
  Graphics: v => `${v} graphics`,
  RAM: v => `${v} RAM`,
  Storage: (v, t) => /ssd|emmc/i.test(v) ? `${v.replace(/ SSD$/, '')} SSD storage`.replace('eMMC SSD', 'eMMC') : /portable ssd|hard drive|accessor/i.test(t) ? `${v} capacity` : `${v} storage`,
  Resolution: (v, t) => /camera|doorbell|webcam|dash/i.test(t) ? `${v} video` : /monitor/i.test(t) ? `${v} resolution` : `${v} resolution`,
  Panel: v => `${v} panel`,
  'Refresh rate': v => `${v} refresh rate`,
  Channels: v => `${v} channel sound`,
  'Battery life': v => `Up to ${v} battery life`,
  'Noise cancelling': v => /yes/i.test(v) ? 'Active noise cancellation' : null,
  Style: v => `${v} design`,
  Connectivity: v => /^(5G|4G)$/.test(v) ? `${v} capable` : `${v} connectivity`,
  Protection: v => /^IP\d/.test(v) ? `${v} dust and water resistant` : v,
  Capacity: (v, t) => /power bank/i.test(t) ? `${v} battery capacity` : /fridge|washing|dryer/i.test(t) ? `${v} capacity` : `${v} capacity`,
  Power: (v, t) => /charger/i.test(t) ? `${v} fast charging` : `${v} power`,
  'Energy rating': v => `${star(v)} energy rating`,
  'Water capacity': v => `${v} water tank`,
  Type: v => v.charAt(0).toUpperCase() + v.slice(1),
  Runtime: v => `${v} run time`,
  Filter: v => `${v} filtration`,
  'Room coverage': v => `Purifies rooms ${v.toLowerCase()}`,
  'Cooling capacity': v => `${v} cooling capacity`,
  'Case size': v => `${v} case`,
  Sensor: v => `${v} sensor`,
  'Video resolution': v => `${v} video recording`,
  'Focal length': v => `${v} focal length`,
  Mount: v => `${v} mount`,
  'Flight time': v => `Up to ${v} flight time`,
  'Top speed': v => `Top speed of ${v}`,
  Range: v => `${v} range`,
  Brightness: v => `${v} brightness`,
  Coverage: v => `Wi-Fi coverage ${v.toLowerCase()}`,
  Functions: v => `${v}`,
  Users: v => `For ${v.toLowerCase()}`,
  Devices: v => `Protects up to ${v} devices`,
  Format: (v, t) => /download/i.test(v) ? 'Digital code delivered by email' : null,
  Compatibility: v => `Compatible with ${v}`,
  Film: v => `Uses ${v} film`,
  Exposures: v => `${v} exposures`,
  Speed: v => `Plays ${v}`,
  Keys: v => `${v} full-size keys`,
  Slots: v => `${v} slots`,
  Pieces: v => `${Number(v).toLocaleString('en-AU')} pieces`,
  'Recommended age': v => `Recommended for ages ${v}`,
  Players: v => `${v} players`,
  Packs: v => `Includes ${v}`,
  Height: v => `Stands approx. ${v} tall`,
  Length: v => `${v} cable length`,
  Connector: v => `${v} connectors`,
  Maps: v => `Preloaded ${v} maps`,
  Switch: v => `${v} mechanical switches`,
  Discs: (v, t) => /vinyl/i.test(t) ? `${v} vinyl` : null,
}

function features(type, attributes) {
  const out = []
  for (const [k, v] of Object.entries(attributes)) {
    if (k === 'Colour') continue
    const f = FEATURE[k]?.(v, type)
    if (f) out.push(f)
  }
  if (attributes.Colour) out.push(`Colour: ${attributes.Colour}`)
  return out
}

// Overview paragraphs by product type. `n` is the product name without its colour in brackets.
const OVERVIEW = {
  Laptops: (n, a, b) => [`The ${n} is built for getting things done, from assignments and spreadsheets to streaming and video calls. ${has(a, 'Processor') ? `The ${a.Processor} processor and ${a.RAM} of memory keep everyday apps and multitasking smooth, ` : ''}with a ${a.Storage} for your files, photos and software.`, `Its ${inch(a['Display size'])} display gives you room to work, and the slim, portable design is easy to take between home, the office and campus.${a.Graphics ? ` With ${a.Graphics} graphics on board, it's ready for gaming and creative work too.` : ''}`],
  Tablets: (n, a) => [`The ${n} puts a bright ${inch(a['Display size'])} display, all-day apps and entertainment in a slim, light design that goes anywhere.`, `Take notes, sketch, read, video call or stream your favourite shows, with ${a.Storage} of storage for apps, photos and downloads.`],
  'Desktop computers': (n, a) => [`The ${n} brings desktop performance to your home office or study, powered by the ${a.Processor} with ${a.RAM} of memory and a ${a.Storage}.`, `It's a reliable everyday computer for work, school and family, with plenty of ports for your monitor, keyboard and accessories.`],
  Monitors: (n, a) => [`The ${n} gives you a ${inch(a['Display size'])} screen at ${a.Resolution} with a ${a['Refresh rate']} refresh rate${num(a['Refresh rate']) >= 144 ? ', so fast-moving games stay sharp and smooth' : ' for crisp text and images across work and study'}.`, `Adjust it to your desk, connect your laptop, PC or console and enjoy more room to see everything at once.`],
  Printers: (n, a) => [`The ${n} is an easy all-in-one for home and small office, handling ${lc(a.Functions)} jobs from one compact unit.`, `Print wirelessly from your phone, tablet or computer over ${a.Connectivity}, and keep everyday documents, school projects and photos moving.`],
  Networking: (n, a) => [`The ${n} delivers fast, reliable ${a.Connectivity} to the whole household, so streaming, gaming and video calls can all happen at once.`, `Set up and manage your network from the companion app, with parental controls and security features built in. Requires a compatible internet service.`],
  'Computer accessories': (n, a) => [`Complete your setup with the ${n}. It's designed for comfort and reliability, whether you're working, studying or creating.`, `${a.Connectivity ? `It connects via ${a.Connectivity} and` : 'It'} works with popular Windows and Mac computers.`],
  iPhone: (n, a) => [`The ${n} features a ${inch(a['Display size'])} display, advanced camera system and all-day battery life, with ${a.Storage} of storage for your photos, videos and apps.`, `It's unlocked for all Australian networks, so you can use it with your current SIM or choose a new plan. SIM and plan sold separately.`],
  'Android phones': (n, a, b) => [`The ${n} brings a ${inch(a['Display size'])} display, a versatile camera system and ${a.Connectivity} speeds to your pocket, with ${a.Storage} of storage built in.`, `This handset is unlocked for Australian networks, so it works with the carrier of your choice. SIM and plan sold separately.`],
  'Prepaid phones': (n, a) => [`The ${n} is an easy, affordable smartphone for calls, messages, maps and apps on the ${a.Connectivity} network.`, `This phone is locked to its network. Recharge sold separately.`],
  'Phone cases': (n, a) => [`Protect your phone in style with the ${n}. It's made to fit the ${a.Compatibility} precisely, with raised edges to help protect the screen and camera.`, `Buttons and ports stay easy to reach, and the slim profile slips easily into a pocket or bag.`],
  'Phone chargers': (n, a) => [`Keep your devices topped up with the ${n}, delivering up to ${a.Power} for fast, safe charging at home, at work or on the go.`, `Compact and reliable, it's a smart spare to keep by the bed, at your desk or in your travel bag.`],
  'Power banks': (n, a) => [`Never run flat with the ${n}. Its ${a.Capacity} battery can recharge your phone more than once on a single charge.`, `Charge via ${a.Connectivity}, and toss it in your bag for commutes, travel and long days out.`],
  'Smart watches': (n, a) => [`The ${n} helps you stay active, connected and healthy, with workout tracking, heart rate and sleep insights, and notifications right on your wrist.`, `${a['Case size']} case with ${a.Connectivity} connectivity. Pair it with a compatible smartphone to get started.`],
  'Fitness trackers': n => [`The ${n} tracks your steps, heart rate, sleep and workouts in a slim, comfortable band you can wear all day and night.`, `Get your stats and notifications at a glance, with a battery that lasts for days between charges.`],
  'Watch straps': (n, a) => [`Give your watch a fresh look with the ${n}. Made to fit ${a['Case size']} cases and swaps on in seconds.`],
  TVs: (n, a, b) => [`Bring the big screen home with the ${n}. Its ${inch(a['Display size'])} ${a.Panel} panel delivers ${a.Resolution} detail, rich colour and deep contrast for movies, sport and gaming.`, `Built-in smart features give you instant access to Netflix, Stan, Disney+, YouTube and Australian free-to-air catch-up apps, and the latest HDMI connections are ready for your console and soundbar. Internet connection and subscriptions may be required.`],
  Soundbars: (n, a) => [`Upgrade your TV sound with the ${n}. ${a.Channels} channel audio fills the room for movies, sport and music, with clearer dialogue you won't have to strain to hear.`, `Connects to your TV via ${a.Connectivity} for simple, single-remote control.`],
  Projectors: (n, a) => [`Create a cinema at home with the ${n}, delivering ${a.Resolution} images at ${a.Brightness} for movie nights, sport and gaming.`, `Built-in smart apps let you start streaming straight away. Subscriptions sold separately.`],
  'Streaming players': (n, a) => [`Turn any TV into a smart TV with the ${n}. Stream your favourite services in ${a.Resolution} with a simple, fast interface and voice search.`, `Subscriptions sold separately. Internet connection required.`],
  'Blu-ray & DVD players': (n, a) => [`Get the most from your disc collection with the ${n}, playing ${a.Format}, Blu-ray and DVD with stunning picture quality.`],
  'TV wall brackets': (n, a) => [`The ${n} is a reliable, easy-to-install way to complete your TV setup${a.Compatibility ? `, suitable for ${a.Compatibility}` : ''}.`, `Ask in store about our professional TV wall mounting and installation service.`],
  Headphones: (n, a, b) => [`The ${n} deliver rich, detailed sound for music, podcasts and calls${a['Noise cancelling'] === 'Yes' ? ', with active noise cancellation to block out the commute, the office or a long-haul flight' : ''}.`, `${a['Battery life'] ? `Get up to ${a['Battery life']} of listening on a single charge, ` : ''}${a['Battery life'] ? 'with' : 'With'} soft, cushioned ear cups made for all-day comfort and easy ${a.Connectivity} pairing with your phone, tablet or laptop.`],
  Earbuds: (n, a) => [`The ${n} pack big, clear sound into a compact design${a['Noise cancelling'] === 'Yes' ? ', with active noise cancellation to tune out the world around you' : ''}.`, `A secure, comfortable fit and a pocket-sized charging case keep the music going all day, with easy ${a.Connectivity} pairing to your devices.`],
  'Portable speakers': (n, a) => [`Take the party anywhere with the ${n}. It delivers big, room-filling sound from a portable design${a.Protection ? `, and it's ${a.Protection} rated, so the beach, the pool and the backyard are all fair game` : ''}.`, `${a['Battery life'] ? `Up to ${a['Battery life']} of playtime on a single charge. ` : ''}Pair over ${a.Connectivity} in seconds.`],
  'Smart speakers': (n, a) => [`Fill your home with music with the ${n}. Stream from your favourite apps, ask your voice assistant for the news or weather, and control compatible smart home devices.`, `Connects over ${a.Connectivity}. Add more speakers for multi-room sound.`],
  Turntables: (n, a) => [`Spin your records with the ${n}. It plays ${a.Speed} and is simple to set up, so you can drop the needle in minutes.`, `${/bluetooth/i.test(a.Connectivity) ? 'Built-in Bluetooth lets you stream your vinyl to a wireless speaker or headphones.' : 'USB output lets you digitise your favourite records.'}`],
  'Hi-Fi systems': (n, a) => [`Enjoy detailed, true-to-the-recording sound in your living room or on your desk with the ${n}.`, `Connect via ${a.Connectivity} to stream from your phone, play from your TV or pair with your turntable.`],
  'Mirrorless cameras': (n, a) => [`Shoot stunning stills and video with the ${n}. Its ${a.Sensor} sensor delivers detail and low-light performance, with ${a['Video resolution']} video for content creation.`, `Fast autofocus, a compact body and interchangeable lenses make it easy to grow your photography skills.`],
  'Camera lenses': (n, a) => [`The ${n} is a versatile ${a['Focal length']} lens for the ${a.Mount} mount, ideal for portraits, travel and everyday shooting.`],
  'Action cameras': (n, a) => [`Record your adventures with the ${n}. ${a['Video resolution']} video and strong stabilisation keep footage smooth, and it's ${lc(a.Protection)}.`, `Mount it to your helmet, bike or board and share clips straight to your phone with the companion app.`],
  'Instant cameras': (n, a) => [`Print your memories in seconds with the ${n}. Point, shoot and watch your photo develop in your hands.`, `${a.Film ? `Uses ${a.Film} film.` : ''}`],
  Drones: (n, a) => [`Shoot stunning aerial photos and ${a['Video resolution']} video with the ${n}, with up to ${a['Flight time']} of flight time per battery.`, `Intelligent flight modes and obstacle sensing make it easy to fly. Check CASA rules before flying.`],
  'PlayStation consoles': (n, a) => [`Experience lightning-fast loading, haptic feedback and adaptive triggers with the ${n}, with ${a.Storage} of storage for your game library.`, `Play the latest PS5 exclusives and the biggest new releases, plus stream from your favourite apps.`],
  'Xbox consoles': (n, a) => [`The ${n} brings next-gen speed and performance in Xbox's smallest console, with ${a.Storage} of storage.`, `Play hundreds of games with Xbox Game Pass (subscription sold separately). ${a.Format === 'Digital' ? 'All-digital: no disc drive.' : ''}`],
  'Nintendo Switch consoles': (n, a) => [`Play at home on the TV or take it on the go with the ${n}. Switch between TV, tabletop and handheld modes in seconds.`, `${a.Storage} of internal storage. Expand with a microSD card (sold separately).`],
  'PC gaming': n => [`Level up your PC setup with the ${n}, built for speed, precision and long gaming sessions.`],
  VR: (n, a) => [`Step into mixed reality with the ${n}. Play, work out and watch in immersive 3D, or blend virtual objects with the room around you.`, `${a.Storage} of storage for games and apps.`],
  'PS5 accessories': (n, a) => [`Official accessory for PlayStation 5. The ${n} is designed to get the most from your console.`],
  'Xbox accessories': n => [`The ${n} features a textured grip, hybrid D-pad and seamless pairing with Xbox Series X|S, Xbox One, Windows PC and mobile devices.`],
  'Nintendo Switch accessories': n => [`Get more from Nintendo Switch 2 with the ${n}.`],
  'Gaming accessories': (n, a) => [`Level up your setup with the ${n}${a.Compatibility ? `, compatible with ${a.Compatibility}` : ''}.`, `Built for comfort and performance across long gaming sessions.`],
  'Coffee machines': (n, a) => [`Make café-quality coffee at home with the ${n}. This ${lc(a.Type)} machine makes it easy to pull a great espresso, flat white or long black every morning.`, `${a['Water capacity'] ? `The ${a['Water capacity']} water tank means fewer refills, and` : 'And'} the removable parts make cleaning simple.`],
  Vacuums: (n, a) => [`Keep floors spotless with the ${n}. Powerful suction picks up dust, crumbs and pet hair from carpets and hard floors.`, `${a.Runtime ? `Get up to ${a.Runtime.replace(/^Up to /i, '')} of cleaning per charge` : 'Clean every room with ease'}, with tools for edges, upholstery and the car.`],
  'Kitchen appliances': (n, a) => [`Make everyday cooking easier with the ${n}${a.Capacity ? `, with a ${a.Capacity} capacity` : ''}${a.Power ? ` and ${a.Power} of power` : ''}.`, `Simple controls and easy-clean parts make it a kitchen favourite you'll use every day.`],
  'Fridges & freezers': (n, a) => [`Keep food fresh and organised with the ${n}. ${a.Capacity} of flexible storage with adjustable shelves and door bins.`, `${star(a['Energy rating'])} energy rating. Ask about delivery, installation and removal of your old fridge.`],
  'Washing machines & dryers': (n, a) => [`Take care of the whole household's laundry with the ${n}. ${a.Capacity} capacity with programs for everyday loads, delicates and bulky items.`, `${star(a['Energy rating'])} energy rating. Ask about delivery and installation.`],
  'Heating & cooling': (n, a) => [`Stay comfortable all year round with the ${n}.`, a.Filter ? `${a.Filter} filtration traps fine dust and allergens, with simple controls to set and forget.` : `Simple controls, a timer and a remote make it easy to set and forget.`],
  'Security cameras': (n, a) => [`Keep an eye on home from anywhere with the ${n}. ${a.Resolution} video, night vision and motion alerts sent straight to your phone.`, `Internet connection and app required. Some features may require a subscription.`],
  'Video doorbells': (n, a) => [`See, hear and speak to visitors from your phone with the ${n}, with ${a.Resolution} video and instant motion alerts.`, `Internet connection and app required. Some features may require a subscription.`],
  'Smart lighting': n => [`Set the mood with the ${n}. Control lights from your phone or with your voice, set schedules and choose from millions of colours.`],
  'Smart plugs & power': n => [`Make your home smarter with the ${n}. Control and schedule devices from your phone or with your voice assistant.`],
  'Hair care': n => [`Get salon-style results at home with the ${n}, designed for fast styling with less heat damage.`],
  'Shavers & trimmers': n => [`Get a close, comfortable shave and trim with the ${n}, made for everyday grooming.`],
  'Electric toothbrushes': n => [`Get a cleaner feeling every day with the ${n}, with multiple cleaning modes and a built-in timer.`],
  Massagers: n => [`Ease sore muscles after training or a long day with the ${n}. Compact, quiet and easy to take to the gym.`],
  'Musical instruments': n => [`Start making your own music with the ${n}, a great choice for beginners and players stepping up.`],
  'Dash cams': (n, a) => [`Record the road ahead with the ${n}, recording ${a.Resolution} footage automatically when you drive.`, `Save and share clips to your phone over ${a.Connectivity}.`],
  'Car stereos': (n, a) => [`Upgrade your in-car entertainment with the ${n}, featuring a ${inch(a['Display size'])} touchscreen with wireless Apple CarPlay and Android Auto.`, `Professional installation recommended.`],
  'GPS navigation': (n, a) => [`Turn-by-turn directions for Australian roads on a ${inch(a['Display size'])} screen with the ${n}.`, `Preloaded ${a.Maps} maps.`],
  'e-Scooters': (n, a) => [`Zip around town with the ${n}, with a top speed of ${a['Top speed']} and ${lc(a.Range)} of range per charge.`, `Foldable for easy storage. Check your state's road rules before riding.`],
  'e-Bikes': (n, a) => [`Pedal-assist commuting made easy with the ${n}, with ${lc(a.Range)} of range per charge.`],
  'Microsoft 365': (n, a) => [`Get premium Microsoft apps including Word, Excel, PowerPoint and Outlook, plus 1TB of OneDrive cloud storage per person. ${/^1 /.test(a.Users) ? 'For one person.' : `Share with ${lc(a.Users)}.`}`, `Digital code emailed after purchase.`],
  'Antivirus & security': (n, a) => [`Protect up to ${a.Devices} PCs, Macs, phones or tablets with ${n.replace(/ \(Digital Download\)$/, '')}.`, `Digital code emailed after purchase.`],
  LEGO: (n, a) => [`Build, display and enjoy the ${n}. This ${Number(a.Pieces).toLocaleString('en-AU')}-piece set comes with step-by-step instructions for a rewarding build.`],
  'Pop! Vinyl': n => [`Add the ${n} to your collection. Stands approx. 9.5cm tall in a window display box.`],
  Figurines: (n, a) => [`Collect the ${n}${a.Compatibility ? ` and tap it on ${a.Compatibility} to unlock in-game content in compatible games` : ''}.`],
  'Trading cards': n => [`${n}. Pokémon Trading Card Game product.`],
  'Games & puzzles': (n, a) => [`A family favourite for game night. ${a.Players} players, ages ${a['Recommended age']}.`],
}

const GENRE = {
  'Action & Adventure': 'Explore a sprawling world, take on tough enemies and uncover a gripping story in this action-adventure.',
  Platformer: 'Run, jump and explore inventive levels packed with secrets, perfect for solo play or the whole family.',
  Sports: 'Take to the field with the latest teams, players and modes, and play with friends online or on the couch.',
  Shooter: 'Gear up for intense, fast-paced combat in a gripping campaign and online multiplayer.',
  'Survival Horror': 'Survive the night in a tense, atmospheric horror experience. Play with the lights on.',
  'Role-playing': 'Create your character, choose your path and battle through an epic role-playing adventure.',
  Racing: 'Hit the track with a huge line-up of cars and courses, from quick races to full championship seasons.',
  Party: 'Gather friends and family for mini-games, board game fun and plenty of friendly rivalry.',
  Simulation: 'Build, create and relax at your own pace, with something new to discover every day.',
  Sandbox: 'Build, explore and survive in a world made of blocks, on your own or with friends.',
  Fighting: 'Master your favourite fighters and battle friends locally or online.',
}

// "Artist - Album (Vinyl)" -> { artist, album }
const splitMusic = t => { const m = /^(.+?) - (.+?) \((?:Vinyl|CD)\)$/.exec(t); return m ? { artist: m[1], album: m[2] } : { artist: '', album: t } }
const MEDIA = {
  Vinyl: (t, a) => { const { artist, album } = splitMusic(t); return [`${artist ? `${artist}'s ` : ''}${album} on ${({ '1 LP': 'single LP', '2 LP': 'double LP', '3 LP': 'triple LP' })[a.Discs] || 'LP'} vinyl.`, `A must for every ${lc(a.Genre)} collection. Turntable required.`] },
  CDs: (t, a) => { const { artist, album } = splitMusic(t); return [`${album}${artist ? ` by ${artist}` : ''} on CD.`, `Add it to your ${lc(a.Genre)} collection.`] },
  '4K Ultra HD': (t, a) => [`${t.replace(/ \(4K.*$/, '')} on 4K Ultra HD + Blu-ray. Includes the 4K Ultra HD disc and a Blu-ray disc.`, `Rated ${a.Classification}. Region ${a.Region}. 4K Ultra HD Blu-ray player required for the 4K disc.`],
  'Blu-ray': (t, a) => [`${t.replace(/ \(Blu-ray\)$/, '')} on Blu-ray.`, `Rated ${a.Classification}. Region ${a.Region}. Blu-ray player required.`],
  DVD: (t, a) => [`${t.replace(/ \(DVD\)$/, '')} on DVD.`, `Rated ${a.Classification}. Region ${a.Region}.`],
  'TV series': (t, a) => [`${t.replace(/ \((?:DVD|Blu-ray)\)$/, '')} on ${a.Format}.`, `Rated ${a.Classification}. Region ${a.Region}.`],
}

export function shelfCopy({ type, brand, title, attributes: a, isGame, platformName, classification, summary }) {
  if (isGame) {
    return {
      overview: [`${title} for ${platformName}. ${GENRE[a.Genre] || ''}`.trim(), `Published by ${a['Game publisher'] || brand}. Classification: ${classification}.${/^(MA15\+|R18\+)$/.test(classification) ? ' Not suitable for younger players.' : ''}`],
      features: [`Platform: ${platformName}`, a.Genre && `Genre: ${a.Genre}`, `Classification: ${classification}`, `Publisher: ${a['Game publisher'] || brand}`].filter(Boolean),
    }
  }
  if (MEDIA[type]) {
    const lines = MEDIA[type](title, a)
    return { overview: lines, features: Object.entries(a).map(([k, v]) => `${k}: ${v}`) }
  }
  const name = title.replace(/\s+\d+mm \S+(?: \S+)? (?:Aluminium|Titanium) Case with .*$/, '').replace(/,\s*\d+GB RAM,\s*\d+(?:GB|TB) SSD/, '').replace(/(?:\s*(?:\([^)]*\)|\[[^\]]*\]))+\s*$/, '')
  const overview = (OVERVIEW[type]?.(name, a, brand) || [`${title}. ${summary || ''}`.trim()]).map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean)
  return { overview, features: features(type, a) }
}
