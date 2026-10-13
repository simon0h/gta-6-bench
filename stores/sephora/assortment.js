// Authored synthetic house-collection ranges. Every tuple describes a different
// formula, applicator, construction or kit; shades and sizes stay on one listing.
// Native artwork is intentional: existing photographs do not depict these formulas.
export function beautyAssortment(p, slugify) {
  const rows = []
  const add = (title, category, type, brand, price, shape, description, extra) => rows.push(p(slugify(title), title, category, type, brand, price, null, shape, description, extra))
  const makeup = [
    ['Lipstick', 'Color Study', 23, 'lipstick', 'Stick', 'Rosewood', 'Velvet wax lip color|Cushion butter lip color|Satin oil lip color|Sheer gel lip color|Powder-soft lip color'],
    ['Lip Gloss', 'Color Study', 20, 'tube', 'Liquid', 'Rosewood', 'Cushion peptide lip gloss|Jojoba shine lip gloss|Glass gel lip gloss|Pearl veil lip gloss|Plush butter lip gloss'],
    ['Lip Oil', 'Color Study', 24, 'tube', 'Oil', 'Rosewood', 'Apricot lip oil|Camellia lip oil|Meadowfoam lip oil|Jojoba lip oil|Squalane lip oil'],
    ['Lip Liner', 'Color Study', 16, 'pencil', 'Pencil', 'Rosewood', 'Wax precision lip liner|Gel glide lip liner|Powder contour lip liner|Cream blend lip liner|Brush-tip liquid lip liner'],
    ['Blush', 'Color Study', 25, 'palette', 'Powder', 'Rosewood', 'Cloud mineral cheek powder|Silk pressed cheek powder|Pearl baked cheek powder|Velvet loose cheek powder|Soft-focus talc-free cheek powder'],
    ['Eyeshadow', 'Color Study', 29, 'palette', 'Powder', 'Brown', 'Clay matte eye palette|Pearl shimmer eye palette|Baked satin eye palette|Pressed pigment eye palette|Cream-to-powder eye palette'],
    ['Eyeliner', 'Color Study', 18, 'pencil', 'Pencil', 'Black', 'Gel glide eye pencil|Wax detail eye pencil|Powder smudge eye pencil|Felt-tip liquid eye pen|Brush-tip liquid eye pen'],
    ['Mascara', 'Color Study', 22, 'tube', 'Liquid', 'Black', 'Tubing lash mascara|Fiber brush lash mascara|Comb wand lash mascara|Curved brush lash mascara|Micro brush lash mascara'],
    ['Brow Pencil', 'Color Study', 19, 'pencil', 'Pencil', 'Brown', 'Micro wax brow pencil|Angled cream brow pencil|Powder fill brow pencil|Fork-tip liquid brow pen|Brush-tip liquid brow pen'],
    ['Foundation', 'Studio Form', 38, 'pump', 'Liquid', 'Light neutral', 'Serum finish foundation|Oil-free velvet foundation|Water-gel sheer foundation|Squalane satin foundation|Mineral pigment foundation'],
    ['Concealer', 'Studio Form', 27, 'tube', 'Liquid', 'Light neutral', 'Serum flex concealer|Cream coverage concealer|Water-gel concealer|Satin oil concealer|Soft matte concealer'],
    ['Primer', 'Studio Form', 29, 'tube', 'Gel', 'Clear', 'Glycerin grip primer|Silicone glide primer|Water-gel primer|Pearl glow primer|Oil-free matte primer'],
    ['Setting Powder', 'Studio Form', 31, 'jar', 'Powder', 'Clear', 'Rice finishing powder|Silica veil powder|Mineral setting powder|Pearl finishing powder|Cornstarch loose powder'],
    ['Setting Spray', 'Studio Form', 27, 'spray', 'Mist', 'Clear', 'Glycerin dewy setting mist|Aloe natural setting mist|Oil-free matte setting mist|Fine pearl setting mist|Fragrance-free finishing mist'],
    ['Brushes', 'Studio Form', 18, 'brush', 'Tool', '', 'Angled synthetic blush brush|Dense buffing foundation brush|Fan finishing powder brush|Tapered crease blending brush|Flat detail concealer brush'],
    ['Highlighter', 'Color Study', 26, 'palette', 'Powder', 'Champagne', 'Baked pearl highlighter|Pressed shimmer highlighter|Loose mineral highlighter|Cream-to-powder highlighter|Satin micropearl highlighter'],
    ['Bronzer', 'Studio Form', 28, 'palette', 'Powder', 'Brown', 'Clay matte bronzer|Baked satin bronzer|Loose mineral bronzer|Cream-to-powder bronzer|Pressed pearl bronzer'],
  ]
  for (const [type, brand, price, shape, formulation, colorName, names] of makeup) for (const [i, title] of names.split('|').entries()) {
    const tool = formulation === 'Tool'
    const finish = /matte|powder|velvet|clay/i.test(title) ? 'Matte' : /shine|glass|gloss|oil/i.test(title) ? 'Glossy' : /pearl|shimmer/i.test(title) ? 'Shimmer' : 'Natural'
    const actualForm = /liquid.*(?:liner|pen)/i.test(title) ? 'Liquid' : formulation
    add(title, 'Makeup', type, brand, price + i, shape, tool ? `${title} with washable synthetic fibers for its named application.` : `${title} in ${colorName.toLowerCase()}, with a ${finish.toLowerCase()} finish. The named texture or applicator distinguishes this formula.`, {
      formulation: actualForm, finish: tool ? '' : finish, colorName, color: colorName === 'Black' ? '#242424' : colorName === 'Brown' ? '#73523d' : colorName === 'Light neutral' ? '#e8c6aa' : colorName === 'Champagne' ? '#d5b57b' : colorName === 'Clear' ? '#deddd4' : '#a55862',
      size: tool ? '1 brush' : ['Foundation','Primer','Setting Spray'].includes(type) ? '30 mL' : formulation === 'Powder' ? '8 g' : formulation === 'Pencil' ? '1 g' : formulation === 'Stick' ? '3.5 g' : '5 mL',
      coverage: ['Foundation','Concealer'].includes(type) ? (/sheer/.test(title) ? 'Light' : 'Medium') : '',
      material: tool ? 'Synthetic fibers and a reusable handle.' : `${title}; ${actualForm.toLowerCase()} format. Color: ${colorName}.`,
      preferences: title.includes('Fragrance-free') ? ['Fragrance-free'] : [],
      use: tool ? 'Apply the named makeup product with light strokes. Wash bristles and air dry after use.' : `Apply a small amount to the ${/Lip/.test(type) ? 'lips' : /Brow/.test(type) ? 'brows' : /Eye|Mascara/.test(type) ? 'intended eye makeup area' : 'face'} and follow package directions.`,
    })
  }
  const skinProfiles = [
    ['Oat', 'Oat extract', ['Dry','Normal']], ['Glycerin', 'Glycerin', ['Dry','Combination']], ['Aloe', 'Aloe leaf extract', ['Normal','Combination']],
    ['Squalane', 'Squalane', ['Dry','Normal']], ['Panthenol', 'Panthenol', ['Normal','Dry']], ['Green tea', 'Green tea extract', ['Combination','Oily']], ['Rice', 'Rice extract', ['Normal','Combination']],
  ]
  const skinFormats = [
    ['daily face cream','Moisturizer','Cream','jar','50 mL',29,'Smooth onto clean skin after lighter layers.'],
    ['water-gel face moisturizer','Moisturizer','Gel','jar','50 mL',28,'Smooth a thin layer onto clean skin.'],
    ['facial serum','Serum','Serum','dropper','30 mL',32,'Pat a few drops onto clean skin before moisturizer.'],
    ['rinse-off facial cleanser','Cleanser','Gel','pump','150 mL',22,'Massage onto damp skin, then rinse.'],
    ['cleansing balm','Cleansing Balm','Balm','jar','75 g',27,'Massage onto dry skin, add water and rinse.'],
    ['facial toner','Toner','Liquid','tube','150 mL',23,'Press a small amount into clean skin.'],
    ['eye-area cream','Eye Cream','Cream','jar','15 mL',26,'Tap around the orbital area; avoid direct contact with eyes.'],
    ['overnight lip balm','Lip Mask','Balm','jar','10 g',18,'Apply a thin layer to clean lips.'],
    ['facial sheet mask','Sheet Mask','Sheet','packet','1 sheet',8,'Apply to clean skin and remove after the label-directed time.'],
    ['rinse-off cream mask','Face Mask','Cream','jar','75 mL',25,'Apply to clean skin and rinse after the label-directed time.'],
    ['facial essence','Essence','Liquid','tube','100 mL',26,'Pat onto clean skin before cream.'],
    ['facial cleansing milk','Cleanser','Milk','pump','150 mL',24,'Massage onto damp skin and rinse thoroughly.'],
    ['water facial mist','Face Mist','Mist','spray','100 mL',21,'Close eyes before misting lightly over the face.'],
  ]
  for (const [prefix, ingredient, skin] of skinProfiles) for (const [name,type,formulation,shape,size,price,use] of skinFormats) add(`${prefix} ${name}`, 'Skincare',type,'Daily Theory',price,shape,`A fragrance-free ${name} with ${ingredient.toLowerCase()} for a simple daily routine.`,{size,formulation,skin,preferences:['Fragrance-free'],material:`${ingredient} in a ${formulation.toLowerCase()} formula. Fragrance-free; see packaging for the complete ingredient list.`,use})
  const hairProfiles = [
    ['Jojoba','jojoba oil',['Dry','Curly','Coily']],['Aloe','aloe extract',['Normal','Wavy']],['Oat','oat extract',['Dry','Straight']],['Rice','rice extract',['Normal','Straight']],['Coconut','coconut oil',['Dry','Curly']],['Argan','argan oil',['Dry','Coily']],['Green tea','green tea extract',['Normal','Wavy']],
  ]
  const hairFormats = [
    ['wash shampoo','Shampoo','Liquid','pump','250 mL',24,'Massage into wet hair and rinse.'],
    ['rinse conditioner','Conditioner','Cream','tube','250 mL',25,'Work through lengths after shampooing and rinse.'],
    ['rich hair mask','Hair Mask','Cream','jar','200 mL',29,'Apply to wet lengths and rinse after the time indicated on the label.'],
    ['leave-in milk','Leave-In Conditioner','Milk','pump','150 mL',24,'Smooth a small amount through damp lengths.'],
    ['curl styling cream','Styling Cream','Cream','tube','150 mL',26,'Work through damp curls and style as desired.'],
    ['soft-hold styling gel','Styling Gel','Gel','tube','150 mL',23,'Distribute through damp hair before styling.'],
    ['air-dry foam','Styling Foam','Foam','pump','150 mL',25,'Work a small amount into damp hair and allow to dry.'],
    ['finishing hair serum','Hair Serum','Serum','dropper','30 mL',28,'Smooth a small amount over dry ends.'],
    ['scalp wash scrub','Scalp Scrub','Scrub','jar','150 g',27,'Massage gently into a wet scalp and rinse; avoid irritated skin.'],
    ['detangling mist','Detangler','Mist','spray','150 mL',22,'Mist over damp lengths and gently comb from ends upward.'],
    ['wash-day pre-shampoo oil','Pre-Shampoo Oil','Oil','dropper','50 mL',27,'Apply to lengths before shampooing and rinse out with shampoo.'],
    ['smooth styling balm','Styling Balm','Balm','jar','60 g',24,'Warm a small amount between palms and smooth over flyaways.'],
  ]
  for (const [prefix,ingredient,hair] of hairProfiles) for (const [name,type,formulation,shape,size,price,use] of hairFormats) add(`${prefix} ${name}`,'Hair',type,'Strand Ritual',price,shape,`A ${formulation.toLowerCase()} ${name} made with ${ingredient}.`,{size,formulation,hair:name.includes('curl')?['Curly','Coily']:hair,material:`${ingredient} in a ${formulation.toLowerCase()} hair formula.`,use})
  const accords = [
    ['Rose & cedar','Floral'],['Iris & tea','Floral'],['Jasmine & pear','Floral'],['Orange blossom & fig','Floral'],['Magnolia & musk','Floral'],
    ['Bergamot & basil','Citrus'],['Grapefruit & mint','Citrus'],['Mandarin & neroli','Citrus'],['Lemon & verbena','Citrus'],
    ['Cedar & vetiver','Woody'],['Sandalwood & cardamom','Woody'],['Hinoki & moss','Woody'],['Cypress & sage','Woody'],
    ['Vanilla & amber','Warm'],['Cacao & tonka','Warm'],['Fig & black tea','Warm'],['Pear & freesia','Fruity'],['Peach & osmanthus','Fruity'],['Sea salt & driftwood','Fresh'],
  ]
  for (const [notes,scent] of accords) for (const [name,type,formulation,shape,size,price] of [
    ['eau de parfum','Eau de Parfum','Spray','perfume','50 mL',68],['eau de toilette','Eau de Toilette','Spray','perfume','50 mL',49],['solid perfume','Solid Perfume','Balm','jar','8 g',29],['perfume oil roller','Perfume Oil','Oil','tube','10 mL',32],
  ]) add(`${notes} ${name}`,'Fragrance',type,'Scent Archive',price,shape,`${notes} notes in a ${scent.toLowerCase()} ${name}.`,{size,formulation,scent,notes,material:formulation==='Balm'?'Scented wax-and-oil balm in a reusable tin.':formulation==='Oil'?'Fragrance oil in a glass roller bottle.':'Fragrance in a glass spray bottle.',use:formulation==='Spray'?'Spray lightly on pulse points, avoiding face and eyes.':'Apply sparingly to pulse points; avoid eyes and irritated skin.',gift:true})
  const bodyProfiles = ['Oat milk','Shea butter','Cocoa butter','Aloe leaf','Rice milk','Coconut milk','Jojoba oil','Almond oil','Avocado oil','Olive oil','Mango butter','Green tea','White tea','Cucumber','Rose water','Lavender','Neroli','Bergamot','Fig leaf']
  for (const prefix of bodyProfiles) for (const [name,type,formulation,shape,size,price,use] of [
    ['shower gel','Body Wash','Gel','pump','300 mL',19,'Lather on wet body skin and rinse.'],['body lotion','Body Lotion','Lotion','pump','250 mL',25,'Massage onto clean body skin.'],['hand cream','Hand Cream','Cream','tube','75 mL',15,'Massage a small amount into hands.'],['sugar body polish','Body Scrub','Scrub','jar','225 g',29,'Massage gently onto wet skin and rinse. Avoid freshly shaved or irritated skin.'],
  ]) add(`${prefix} ${name}`,'Bath & Body',type,'Body Edit',price,shape,`${prefix} ${name} for your everyday body-care routine.`,{size,formulation,skin:['Normal','Dry'],material:`${prefix} ${formulation.toLowerCase()} formula in a ${shape==='jar'?'wide-mouth jar':shape==='pump'?'pump bottle':'squeeze tube'}.`,use})
  const kitThemes = [
    ['Oat & glycerin','Daily Theory'],['Aloe & rice','Daily Theory'],['Squalane & panthenol','Daily Theory'],
    ['Jojoba & coconut','Strand Ritual'],['Argan & oat','Strand Ritual'],['Rice & green tea','Strand Ritual'],
    ['Rose & cedar','Scent Archive'],['Bergamot & basil','Scent Archive'],['Vanilla & amber','Scent Archive'],
    ['Shea & oat','Body Edit'],['Cocoa & almond','Body Edit'],['Neroli & fig','Body Edit'],
  ]
  const kitFormats = {
    'Daily Theory': [['cleansing pair','Skincare Set','Gel cleanser 100 mL and cleansing balm 50 g.'],['daily layering trio','Skincare Set','Essence 50 mL, serum 20 mL and face cream 40 mL.'],['mask ritual duo','Skincare Set','Rinse-off cream mask 50 mL and 2 facial sheet masks.'],['evening comfort set','Skincare Set','Cleansing milk 100 mL, eye cream 10 mL and lip balm 8 g.']],
    'Strand Ritual': [['wash-day pair','Hair Set','Shampoo 150 mL and conditioner 150 mL.'],['curl styling trio','Hair Set','Curl cream 75 mL, styling gel 75 mL and foam 75 mL.'],['length-care duo','Hair Set','Hair mask 100 mL and finishing serum 20 mL.'],['air-dry styling set','Hair Set','Detangling mist 75 mL, leave-in milk 75 mL and styling balm 30 g.']],
    'Scent Archive': [['spray wardrobe pair','Fragrance Set','Eau de parfum 30 mL and eau de toilette 30 mL.'],['pulse-point duo','Fragrance Set','Solid perfume 8 g and perfume oil roller 10 mL.'],['scent layering trio','Fragrance Set','Eau de parfum 30 mL, body mist 75 mL and body lotion 75 mL.'],['scent discovery quartet','Fragrance Set','Four 5 mL samples: eau de parfum, eau de toilette, body mist and perfume oil.']],
    'Body Edit': [['shower ritual pair','Body Set','Shower gel 150 mL and sugar body polish 100 g.'],['moisture ritual duo','Body Set','Body lotion 150 mL and hand cream 50 mL.'],['sink-side trio','Body Set','Hand wash 150 mL, hand cream 50 mL and a cotton washcloth.'],['weekend body set','Body Set','Shower gel 100 mL, body lotion 100 mL and sugar polish 75 g.']],
  }
  for (const [theme,brand] of kitThemes) for (const [i,[name,type,contents]] of kitFormats[brand].entries()) add(`${theme} ${name}`,'Sets',type,brand,39+i*8,'set',`${theme} formulas paired for a ${name}.`,{size:contents,formulation:'Set',gift:true,material:contents,use:'Use each included item according to its individual label instructions.'})
  if (rows.length !== 460) throw new Error(`Beauty assortment must add 460 base listings; received ${rows.length}`)
  return rows
}
