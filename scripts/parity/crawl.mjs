// BFS crawl a store's GET links; report broken ones
const base = process.argv[2], store = process.argv[3], max = +(process.argv[4]||400)
const seen = new Map(), q = [`/${store}`], broken = []
const jar = {}
while (q.length && seen.size < max) {
  const u = q.shift(); if (seen.has(u)) continue
  let r; try { r = await fetch(base+u, { redirect: 'manual', headers: { cookie: jar.c||'' } }) } catch (e) { seen.set(u, 'ERR'); continue }
  const sc = r.headers.get('set-cookie'); if (sc) jar.c = sc.split(';')[0]
  seen.set(u, r.status)
  if (r.status >= 300 && r.status < 400) { const l = r.headers.get('location'); if (l && l.startsWith('/')) q.push(l); continue }
  if (r.status >= 400) { broken.push([r.status, u]); continue }
  const ct = r.headers.get('content-type')||''; if (!ct.includes('html')) continue
  const html = await r.text()
  for (const m of html.matchAll(/href="([^"#]+)"/g)) {
    let h = m[1].replace(/&amp;/g,'&'); if (!h.startsWith('/')) continue
    if (!h.startsWith(`/${store}`) && !h.startsWith('/static') && !h.startsWith('/product-assets')) { broken.push(['OUT', h, 'from', u]); continue }
    if (/\/(signout|logout|sign-out)/.test(h)) continue
    if (!seen.has(h)) q.push(h)
  }
}
const ok = [...seen.values()].filter(s => s===200).length
console.log(JSON.stringify({ store, crawled: seen.size, ok, broken: broken.length, sample: broken.slice(0,15) }))
