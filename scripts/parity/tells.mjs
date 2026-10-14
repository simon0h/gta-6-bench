#!/usr/bin/env node
// Finds wording that tells a shopper (or an AI agent) the store is a test copy.
// Crawls a store's pages and served SVGs, and searches visible text plus alt/title/aria-label/
// placeholder/meta text for giveaway phrases.
//
//   node scripts/parity/tells.mjs <slug> [--max 1500] [--json]
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const flag = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback }
const slug = args.find(a => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'))
const maxPages = Number(flag('--max', 1500))
const asJson = args.includes('--json')

export const TELLS = [
  /synthetic/i, /benchmark/i, /simulat/i, /\bimitat/i, /not affiliated/i, /no real (orders?|payments?|money|purchase)/i,
  /sandbox/i, /\bfixtures?\b/i, /\bmock(ed)?\b/i, /\bfake\b/i, /placeholder/i, /\bdemo\b/i,
  /test (environment|store|mode|data|copy|site)/i, /\bcaptur(e|ed|ing)\b/i, /uncaptured/i, /not (been )?verified|unverified/i,
  /\bevidence\b/i, /source (capture|data|page)/i, /reference (mode|catalog|capture|data|copy|store)/i,
  /\bassumption\b/i, /illustrative/i, /approximat/i, /not established/i, /\bAI agents?\b/i, /\bgrader\b/i, /\bscenario\b/i,
  /locally (drawn|rendered|generated)/i, /generated (image|artwork|art|illustration)/i, /drawn (image|picture|art)/i,
  /local (copy|clone|simulation|replica|order)/i, /\breplica\b/i, /\bclone\b/i, /not (a |an )?real/i,
  /미수집/, /수집되지/, /검증되지/, /미검증/, /가상/, /시뮬/, /벤치마크/, /합성/, /테스트/,
]
const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;|&#160;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
function readable(html) {
  const body = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ')
  const attrs = [...body.matchAll(/\b(?:alt|title|aria-label|placeholder|content|value|label)\s*=\s*"([^"]*)"/gi)].map(m => m[1])
  const title = /<title>([\s\S]*?)<\/title>/i.exec(html)?.[1] || ''
  return decode([title, body.replace(/<[^>]+>/g, ' '), ...attrs].join(' \n ')).replace(/[ \t]+/g, ' ')
}
export function findTells(text) {
  const hits = []
  for (const re of TELLS) {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
    for (const m of text.matchAll(g)) hits.push({ word: m[0], at: text.slice(Math.max(0, m.index - 70), m.index + 70).replace(/\s+/g, ' ').trim() })
  }
  return hits
}

if (slug) {
  process.env.NODE_ENV ??= 'test'
  const { createApp } = await import(path.join(ROOT, 'app.js'))
  const app = await createApp({ persist: false })
  const server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  const base = `http://127.0.0.1:${server.address().port}`
  const prefix = `/${slug}`
  const queue = [prefix + '/'], seen = new Set(), queued = new Set(queue), variants = new Map(), found = new Map()
  let cookie = ''
  const extra = ['/search?q=gta+6', '/search?q=grand+theft+auto', '/s?k=gta+6', '/search?keyword=gta+6', '/np/search?q=gta+6', '/w?q=gta+6', '/s?query=gta+6', '/cart', '/checkout', '/account', '/sitemap']
  for (const e of extra) if (!queued.has(prefix + e)) { queued.add(prefix + e); queue.push(prefix + e) }
  while (queue.length && seen.size < maxPages) {
    const url = queue.shift(); if (seen.has(url)) continue; seen.add(url)
    let res; try { res = await fetch(base + url, { redirect: 'manual', headers: { cookie } }) } catch { continue }
    const set = res.headers.get('set-cookie'); if (set) cookie = set.split(';')[0]
    const loc = res.headers.get('location'); if (loc?.startsWith('/') && !queued.has(loc)) { queued.add(loc); queue.push(loc) }
    const type = res.headers.get('content-type') || ''
    if (!/html|svg|xml|text/.test(type)) { await res.arrayBuffer(); continue }
    const body = await res.text()
    const text = type.includes('svg') ? decode(body.replace(/<[^>]+>/g, ' ')) : readable(body)
    for (const h of findTells(text)) {
      const key = h.at.replace(/\d+/g, '#').slice(0, 120)
      if (!found.has(key)) found.set(key, { ...h, url, count: 0 })
      found.get(key).count++
    }
    for (const m of body.matchAll(/\b(?:href|src)\s*=\s*"([^"]+)"/gi)) {
      const h = decode(m[1]).split('#')[0]
      if (!h.startsWith(prefix + '/') || /sign-?out|log-?out/i.test(h)) continue
      if (/\.(png|jpe?g|webp|gif|css|js|woff2?|ico)(\?|$)/i.test(h)) continue
      const p = h.split('?')[0]
      if (h.includes('?') && (variants.get(p) || 0) >= 3) continue
      if (/\.svg(\?|$)/i.test(h) && (variants.get('svg') || 0) >= 150) continue
      if (!queued.has(h)) { queued.add(h); variants.set(/\.svg/i.test(h) ? 'svg' : p, (variants.get(/\.svg/i.test(h) ? 'svg' : p) || 0) + 1); queue.push(h) }
    }
  }
  server.close()
  const list = [...found.values()].sort((a, b) => b.count - a.count)
  if (asJson) console.log(JSON.stringify({ store: slug, pages: seen.size, phrases: list.length, hits: list }, null, 2))
  else {
    console.log(`${slug}: ${list.length} giveaway phrases on ${seen.size} pages`)
    for (const h of list.slice(0, 60)) console.log(`  [${h.word}] x${h.count} ${h.url}\n      …${h.at}…`)
  }
  process.exit(list.length ? 1 : 0)
}
