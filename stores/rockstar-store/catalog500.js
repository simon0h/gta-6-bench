import { makeGameFixtures } from '../../lib/expanded-games.js'
import { makeHardwareFixtures } from '../../lib/expanded-hardware.js'
export const isPlayable=p=>p.catalogType==='game'||p.section==='Games'&&p.id!=='gta-plus'
const keepsakes=[
 ['archive-binder','Rockstar Collector Archive Binder',24.99,'binder','Ring binder with twenty protective pages for postcards and printed inserts.','Board, paper and polypropylene','11 × 12 inches'],
 ['desk-mat','Rockstar Studio Keyboard Desk Mat',29.99,'mat','Desk mat with stitched edges and a geometric studio emblem.','Woven surface and rubber base','31 × 12 inches'],
 ['postcard-box','Rockstar Landscapes Postcard Box',19.99,'cards','Twenty illustrated landscape postcards with a keepsake storage box.','Printed card','Twenty 4 × 6 inch cards'],
 ['art-print','Rockstar Night Drive Art Print',24.99,'print','A rolled city-at-night illustration on heavyweight paper; frame not included.','Archival paper','18 × 24 inches'],
 ['mug','Rockstar Workshop Ceramic Mug',17.99,'mug','Glazed ceramic mug with an embossed studio star and rounded handle.','Glazed ceramic','12 fl oz'],
 ['coaster-set','Rockstar Map Tile Coaster Set',22.99,'coasters','Four different illustrated map tiles with cork-backed bases.','Printed fiberboard and cork','Four 4 inch square coasters'],
 ['display-board','Rockstar Enamel Pin Display Board',26.99,'board','Wall-mounted fabric board for displaying collectible enamel pins; pins not included.','Linen and cork','10 × 14 inches'],
 ['bookends','Rockstar Skyline Metal Bookends',34.99,'bookends','Pair of cut-metal skyline bookends with padded non-slip bases.','Powder-coated steel','6 inch height; two pieces'],
 ['notebook','Rockstar Field Notes Hardcover Journal',16.99,'notebook','Hardcover ruled journal with index pages, ribbon marker and rear pocket.','Paper and cloth binding','A5; 192 pages'],
 ['sticker-folder','Rockstar Travel Emblem Sticker Folder',12.99,'stickers','Twelve different travel-emblem vinyl stickers in a printed collector folder.','Printed vinyl and card','Twelve die-cut stickers'],
]
export function expandCatalog(original){
 const oldGames=original.filter(isPlayable)
 const games=makeGameFixtures({count:250-oldGames.length,existingPlatforms:oldGames.map(p=>p.id==='gta-vi'?'ps5':'pc')}).map(g=>({
  ...g,id:`rs-${g.id}`,sku:`RS-${g.id.toUpperCase()}`,section:'Games',path:`/game/buy-${g.id}`,sale:'direct',delivery:'physical',
  category:'console-game',collections:['games','new-arrivals'],chips:[g.platformLabel],genre:g.genre,inventory:g.stock,stock:'In stock',
  blurb:`${g.description} Physical ${g.formatLabel.toLowerCase()} for ${g.platformLabel}; check the supported platform before ordering.`,
  note:'The listed game is included. Console hardware is sold separately.',care:'Keep the game media in its protective case. Follow the included installation or code-redemption instructions.',
 }))
 const needed=250-(original.length-oldGames.length)
 const hardware=makeHardwareFixtures({count:Math.min(216,needed)}).map(h=>({...h,id:`rs-${h.id}`,sku:`RS-${h.id.toUpperCase()}`,section:'Gear',path:`/merchandise/${h.id}`,sale:'direct',delivery:'physical',category:h.catalogType==='console'?'consoles':'accessories',collections:['gaming-hardware','new-arrivals'],chips:[h.specs.Platform||h.specs.Compatibility],blurb:h.description,inventory:h.stock,stock:'In stock',care:'Check the listed hardware compatibility before use. Follow the supplied setup instructions.'}))
 const merch=keepsakes.slice(0,needed-hardware.length).map(([id,title,price,shape,blurb,material,dimensions])=>({id:`rs-${id}`,sku:`RS-${id.toUpperCase()}`,title,price,shape,blurb,material,dimensions,kind:'other',catalogType:'other',section:'Gear',category:'collectibles',collections:['rockstar','collectibles','new-arrivals'],path:`/merchandise/rs-${id}`,sale:'direct',delivery:'physical',inventory:15,stock:'In stock',art:`/rockstar-store/art/rs-${id}.svg`,keywords:`${title} merchandise gift keepsake`,specs:{Material:material,Dimensions:dimensions},care:'Wipe dry; protect printed surfaces from moisture. Follow the included care instructions.'}))
 return [...games,...hardware,...merch]
}
