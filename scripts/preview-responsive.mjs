// Development-only preview: renders the real store in an ordinary, same-origin
// iframe so browser QA can inspect responsive layouts without resizing its window.
import { createApp } from '../app.js'
import { esc } from '../lib/html.js'
import { productImage, productAssetViewCount } from '../lib/product-assets.js'
import { classifyProductAsset } from '../lib/product-asset-art.js'

const app = await createApp({ persist: false })
const port = Number(process.env.PORT || 3180)
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Choose a valid local preview port')
const widths = [390, 768, 1280]
app.get('/__viewport', (req, res) => {
  const store = app.locals.stores.find(store => store.slug === req.query.store) || app.locals.stores[0]
  const width = widths.includes(Number(req.query.width)) ? Number(req.query.width) : 390
  const candidate = typeof req.query.route === 'string' ? req.query.route : store.url
  let route = store.url
  try {
    const url = new URL(candidate, 'http://preview.local')
    if (url.origin === 'http://preview.local' && (url.pathname === store.url || url.pathname.startsWith(store.url + '/'))) route = url.pathname + url.search + url.hash
  } catch {}
  res.type('html').send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Responsive storefront preview</title><style>
    *{box-sizing:border-box}body{margin:0;background:#e9edf2;color:#18212b;font:14px system-ui,sans-serif}header{padding:16px;background:white;border-bottom:1px solid #ccd3dc}h1{font-size:18px;margin:0 0 12px}form{display:flex;flex-wrap:wrap;align-items:end;gap:12px}label{display:grid;gap:4px}input,select,button{padding:8px;font:inherit;border:1px solid #8794a4;border-radius:4px}input{width:330px;max-width:80vw}button{background:#163c69;color:white;cursor:pointer}main{padding:20px;width:max-content;min-width:100%}iframe{display:block;border:0;background:white;box-shadow:0 2px 12px #17273826}p{margin:10px 0 0;color:#46515e}a{color:#164b89}
  </style></head><body><header><h1>Responsive storefront preview</h1><form><label>Store<select name="store">${app.locals.stores.map(item => `<option value="${esc(item.slug)}"${item.slug === store.slug ? ' selected' : ''}>${esc(item.name)}</option>`).join('')}</select></label><label>Viewport width<select name="width">${widths.map(value => `<option value="${value}"${value === width ? ' selected' : ''}>${value}px</option>`).join('')}</select></label><label>Store route<input name="route" value="${esc(route)}"></label><button>Show preview</button></form><p>Local QA only. The frame uses the real storefront routes and this browser's local session. <a href="${esc(route)}">Open storefront directly</a></p><p><output id="dimensions" aria-live="polite">Loading storefront…</output></p><details><summary>Layout overflow details</summary><pre id="overflow"></pre></details></header><main><iframe title="${esc(store.name)} at ${width}px" src="${esc(route)}" width="${width}" height="${width === 390 ? 844 : 1000}"></iframe></main><script>
    const frame=document.querySelector('iframe'), status=document.getElementById('dimensions');let observer;
    frame.addEventListener('load',()=>{observer?.disconnect();try{const doc=frame.contentDocument;const measure=()=>{const root=doc.documentElement;status.textContent=doc.title+' · Viewport '+root.clientWidth+'px · Content '+root.scrollWidth+'px · Broken images '+[...doc.images].filter(image=>image.complete&&!image.naturalWidth).length; const offenders=[...doc.querySelectorAll('body *')].filter(element=>{if(typeof element.checkVisibility==='function'&&!element.checkVisibility())return false;const rect=element.getBoundingClientRect();if(!rect.width||rect.right<=root.clientWidth+1)return false;for(let parent=element.parentElement;parent&&parent!==doc.body;parent=parent.parentElement)if(['auto','scroll','hidden','clip'].includes(doc.defaultView.getComputedStyle(parent).overflowX))return false;return true});document.getElementById('overflow').textContent=offenders.slice(0,8).map(element=>element.tagName.toLowerCase()+'.'+String(element.className).trim().replaceAll(' ','.')+' right='+Math.round(element.getBoundingClientRect().right)+'px').join('\\n')||'No uncontained horizontal overflow detected.'};measure();observer=new ResizeObserver(measure);observer.observe(doc.documentElement)}catch{status.textContent='Open the local storefront directly to inspect this page.'}});
  </script></body></html>`)
})
// Contact sheets for reviewing illustration families; never mounted by server.js.
app.get('/__product-assets', (req, res) => {
  const byFamily = new Map()
  for (const p of app.locals.productAssetIndex.byAssetKey.values()) {
    const family = classifyProductAsset(p)
    if (!byFamily.has(family)) byFamily.set(family, p)
  }
  const all = [...byFamily].sort(([a], [b]) => a.localeCompare(b))
  const page = Math.max(0, Math.min(Math.ceil(all.length / 6) - 1, Number(req.query.page) || 0))
  const chosen = all.slice(page * 6, page * 6 + 6)
  res.type('html').send(`<!doctype html><html><head><meta charset="utf-8"><title>Product asset contact sheet</title><style>body{font:14px system-ui;margin:16px;color:#111}h1{font-size:20px}h2{font-size:14px;margin:8px 0}.samples{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.views{display:flex;gap:4px}.views img{width:25%;min-width:0;height:auto}article{border:1px solid #ddd;padding:12px}a{margin-right:12px}</style></head><body><h1>Product artwork · page ${page + 1} / ${Math.ceil(all.length / 6)}</h1><nav>${Array.from({length:Math.ceil(all.length/6)},(_,i)=>`<a href="?page=${i}">${i+1}</a>`).join('')}</nav><div class="samples">${chosen.map(([family,p])=>`<article><h2>${esc(family)} · ${esc(p.title)}</h2><div class="views">${Array.from({length:productAssetViewCount(p.raw)},(_,view)=>productImage(p.store,{...p.raw,...(p.variant?{variantId:p.variant.id}:{})},{view,loading:'eager'})).join('')}</div></article>`).join('')}</div></body></html>`)
})
app.listen(port, '127.0.0.1', error => {
  if (error) {
    console.error(`Unable to start responsive preview: ${error.message}`)
    process.exitCode = 1
    return
  }
  console.log(`Responsive preview: http://127.0.0.1:${port}/__viewport`)
})
