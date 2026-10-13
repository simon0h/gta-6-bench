#!/usr/bin/env node
// Website parity scorecard.
//
// Compares a local store clone against the checklist in research/parity/<slug>.json,
// which lists what the real retailer site has: header links, footer links, key pages,
// homepage sections and sitemap sections. Also crawls the clone for broken links.
//
//   node scripts/parity/check.mjs <slug> [--base http://localhost:3000] [--max 3000] [--json]
//
// With no --base it boots the app in-process on a free port.
// Exit code is 0 only when the score is at least 80% and no internal link is broken.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const flag = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback }
const slug = args.find(a => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'))
if (!slug) { console.error('usage: check.mjs <slug> [--base url] [--max n] [--json]'); process.exit(2) }
const asJson = args.includes('--json')
const maxPages = Number(flag('--max', 3000))
const spec = JSON.parse(readFileSync(path.join(ROOT, 'research/parity', `${slug}.json`), 'utf8'))

let base = flag('--base'), server
if (!base) {
  process.env.NODE_ENV ??= 'test'
  const { createApp } = await import(path.join(ROOT, 'app.js'))
  const app = await createApp({ persist: false })
  server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  base = `http://127.0.0.1:${server.address().port}`
}
const prefix = `/${slug}`
let cookie = ''
async function get(url) {
  const res = await fetch(base + url, { redirect: 'manual', headers: { cookie, accept: 'text/html' } })
  const set = res.headers.get('set-cookie'); if (set) cookie = set.split(';')[0]
  const type = res.headers.get('content-type') || ''
  const body = type.includes('html') || type.includes('xml') || type.includes('text') ? await res.text() : (await res.arrayBuffer(), '')
  return { status: res.status, location: res.headers.get('location'), type, body }
}
async function follow(url, hops = 5) {
  let r = await get(url)
  while (r.status >= 300 && r.status < 400 && r.location && hops--) {
    url = r.location.startsWith('http') ? new URL(r.location).pathname + new URL(r.location).search : r.location
    r = await get(url)
  }
  return { ...r, url }
}

const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;|&#160;/g, ' ').replace(/&reg;|&#174;/g, '®').replace(/&trade;|&#8482;/g, '™').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const norm = s => decode(String(s)).replace(/<[^>]*>/g, ' ').replace(/[®™]/g, '').replace(/\s+/g, ' ').trim().toLowerCase()
const textOf = html => norm(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' '))
const links = html => [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(m => {
  const href = /href\s*=\s*"([^"]*)"/i.exec(m[1])?.[1]
  const aria = /aria-label\s*=\s*"([^"]*)"/i.exec(m[1])?.[1] || ''
  const title = /title\s*=\s*"([^"]*)"/i.exec(m[1])?.[1] || ''
  return { href: href && decode(href), text: norm(`${m[2]} ${aria} ${title}`) }
}).filter(l => l.href)
const local = p => p.startsWith('/') && !p.startsWith(prefix + '/') && p !== prefix ? prefix + p : p
const samePath = (href, want) => {
  const h = href.split('#')[0], w = local(want).split('#')[0]
  return h === w || h === w + '/' || h.replace(/\/$/, '') === w.replace(/\/$/, '')
}
const UNCAPTURED = /data-reference-state="uncaptured"|>Page not captured<|>Page not found<|>Not found</i
function substantive(r) {
  if (r.status !== 200 || !r.type.includes('html')) return `HTTP ${r.status}`
  if (UNCAPTURED.test(r.body)) return 'placeholder page'
  if (!/<h1\b/i.test(r.body)) return 'no <h1> heading'
  return null
}

const home = await follow(prefix + (spec.home_path || '/'))
const homeLinks = links(home.body)
const homeText = textOf(home.body)
let sitemap = null
if (spec.sitemap_path) { sitemap = await follow(local(spec.sitemap_path)); if (substantive(sitemap)) sitemap = null }
const sitemapLinks = sitemap ? links(sitemap.body) : []
const pageCache = new Map()
async function page(p) { if (!pageCache.has(p)) pageCache.set(p, await follow(local(p))); return pageCache.get(p) }

const results = []
for (const item of spec.items) {
  const problems = []
  const label = norm(item.label)
  if (item.kind === 'header' || item.kind === 'footer' || item.kind === 'sitemap') {
    const pool = item.kind === 'sitemap' ? sitemapLinks : homeLinks
    if (item.kind === 'sitemap' && !sitemap) problems.push('no sitemap page')
    const byLabel = pool.filter(l => l.text.includes(label))
    if (!byLabel.length) problems.push(`no "${item.label}" link on ${item.kind === 'sitemap' ? 'sitemap' : 'homepage'}`)
    else if (item.path && !byLabel.some(l => samePath(l.href, item.path))) problems.push(`"${item.label}" link goes to ${byLabel[0].href}, expected ${local(item.path)}`)
  }
  if (item.kind === 'home') {
    for (const e of item.expect || [item.label]) if (!homeText.includes(norm(e))) problems.push(`homepage missing "${e}"`)
  }
  if (item.path && item.kind !== 'home') {
    const r = await page(item.path)
    const bad = substantive(r); if (bad) problems.push(`${local(item.path)}: ${bad}`)
    else for (const e of item.expect || []) if (!textOf(r.body).includes(norm(e))) problems.push(`${local(item.path)} missing "${e}"`)
  }
  results.push({ kind: item.kind, label: item.label, path: item.path, ok: !problems.length, problems })
}

// Crawl every internal GET link for liveness.
const seen = new Map(), queue = [prefix + (spec.home_path || '/')], broken = [], queued = new Set(), variants = new Map()
const skip = /\/(sign-?out|log-?out|signout|logout)\b/i
while (queue.length && seen.size < maxPages) {
  const url = queue.shift(); if (seen.has(url)) continue
  let r
  try { r = await get(url) } catch (e) { seen.set(url, 'ERR'); broken.push({ url, status: 'ERR' }); continue }
  seen.set(url, r.status)
  if (r.status >= 300 && r.status < 400) {
    const loc = r.location || ''
    if (loc.startsWith('/')) queue.push(loc)
    continue
  }
  if (r.status >= 400) { broken.push({ url, status: r.status }); continue }
  if (!r.type.includes('html')) continue
  for (const m of r.body.matchAll(/\b(?:href|src)\s*=\s*"([^"]+)"/gi)) {
    const h = decode(m[1]).split('#')[0]
    if (!h || h.startsWith('data:') || h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('javascript:')) continue
    if (/^(https?:)?\/\//i.test(h)) continue
    if (!h.startsWith('/')) continue
    if (skip.test(h)) continue
    const isPage = /href/i.test(m[0])
    if (!h.startsWith(prefix + '/') && h !== prefix && !h.startsWith('/static/') && !h.startsWith('/product-assets/')) {
      if (isPage) broken.push({ url: h, status: 'leaves store', from: url })
      continue
    }
    // Sort/filter links multiply; a few query variants per path are enough to prove the route works.
    const pathOnly = h.split('?')[0]
    if (h.includes('?') && (variants.get(pathOnly) || 0) >= 5) continue
    if (!seen.has(h) && !queued.has(h)) { queued.add(h); variants.set(pathOnly, (variants.get(pathOnly) || 0) + 1); queue.push(h) }
  }
}

const passed = results.filter(r => r.ok).length
const score = results.length ? passed / results.length : 0
const byKind = {}
for (const r of results) { const k = byKind[r.kind] ||= { passed: 0, total: 0 }; k.total++; if (r.ok) k.passed++ }
const summary = { store: slug, score: Math.round(score * 1000) / 10, passed, total: results.length, by_kind: byKind,
  crawled: seen.size, broken_links: broken.length, ok: score >= 0.8 && broken.length === 0 }
if (asJson) console.log(JSON.stringify({ ...summary, failures: results.filter(r => !r.ok), broken }, null, 2))
else {
  console.log(`${slug}: ${summary.score}% (${passed}/${results.length}) · crawled ${seen.size} pages · ${broken.length} broken links · ${summary.ok ? 'PASS' : 'FAIL'}`)
  for (const [k, v] of Object.entries(byKind)) console.log(`  ${k.padEnd(8)} ${v.passed}/${v.total}`)
  for (const r of results.filter(r => !r.ok)) console.log(`  ✗ [${r.kind}] ${r.label}: ${r.problems.join('; ')}`)
  for (const b of broken.slice(0, 40)) console.log(`  ✗ broken ${b.status} ${b.url}${b.from ? ` (from ${b.from})` : ''}`)
  if (broken.length > 40) console.log(`  … ${broken.length - 40} more broken links`)
}
server?.close()
process.exit(summary.ok ? 0 : 1)
