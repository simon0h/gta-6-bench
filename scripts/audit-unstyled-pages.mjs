#!/usr/bin/env node
// Finds store pages that render as bare HTML (browser default white page and
// serif font) because no stylesheet reaches them. Crawls every link of every
// store, submits every form it finds (once filled in, once empty), probes a
// missing page, and checks that each HTML response has a <style> block or a
// stylesheet link that actually loads.
//
//   node scripts/audit-unstyled-pages.mjs [--agent] [--render] [--store <slug>] [--max 4000] [--json]
//
// --agent runs the stores the way a hosted benchmark trial does (agent view).
// --render also opens one page of each kind in Chromium and flags text that
// falls back to the browser's default font even though a stylesheet loaded.
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const flag = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback }
const agent = args.includes('--agent')
const only = flag('--store')
const maxPages = Number(flag('--max', 4000))
const render = args.includes('--render')
process.env.NODE_ENV = 'test'
process.env.CATALOG_MODE ||= 'reference'

const { createApp } = await import(path.join(ROOT, 'app.js'))
const { readdirSync, existsSync } = await import('node:fs')
const slugs = readdirSync(path.join(ROOT, 'stores'), { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(path.join(ROOT, 'stores', d.name, 'index.js')))
  .map(d => d.name).filter(s => !only || s === only)

const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
const SAMPLE = { email: 'jordan.lee@example.com', password: 'Harbor-Light-2026', tel: '5035550147', number: '1' }
function fillValue(input) {
  const n = (input.name || '').toLowerCase()
  if (input.type === 'email' || /email/.test(n)) return SAMPLE.email
  if (input.type === 'password' || /password/.test(n)) return SAMPLE.password
  if (/card.?num|cardnumber|^number$|^cc/.test(n)) return '4111111111111111'
  if (/cvv|cvc|security/.test(n)) return '123'
  if (/exp/.test(n)) return '12/30'
  if (/zip|postal|postcode/.test(n)) return '97201'
  if (/phone|tel/.test(n) || input.type === 'tel') return SAMPLE.tel
  if (/qty|quantity/.test(n) || input.type === 'number') return SAMPLE.number
  if (/state|region/.test(n)) return 'OR'
  if (/city|town/.test(n)) return 'Portland'
  if (/country/.test(n)) return 'US'
  if (/first/.test(n)) return 'Jordan'
  if (/last/.test(n)) return 'Lee'
  if (/name/.test(n)) return 'Jordan Lee'
  if (/address|street|line/.test(n)) return '120 Harbor Way'
  return input.value || 'x'
}

function parseForms(html) {
  const forms = []
  for (const m of html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)) {
    const attr = (src, name) => (src.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i')) || [])[1]
    const method = (attr(m[1], 'method') || 'get').toLowerCase()
    const action = decode(attr(m[1], 'action') || '')
    const inputs = []
    for (const i of m[2].matchAll(/<(input|select|textarea)\b([^>]*)>(?:([\s\S]*?)<\/(?:select|textarea)>)?/gi)) {
      const name = attr(i[2], 'name'); if (!name) continue
      const type = (attr(i[2], 'type') || (i[1].toLowerCase() === 'input' ? 'text' : i[1].toLowerCase())).toLowerCase()
      if (['submit', 'button', 'image', 'file', 'reset'].includes(type)) continue
      if ((type === 'checkbox' || type === 'radio') && !/\bchecked\b/i.test(i[2])) {
        if (type === 'radio' && inputs.some(x => x.name === name)) continue
      }
      let value = decode(attr(i[2], 'value') ?? '')
      if (i[1].toLowerCase() === 'select') {
        const opts = [...(i[3] || '').matchAll(/<option\b([^>]*)>/gi)]
        const chosen = opts.find(o => /\bselected\b/i.test(o[1])) || opts.find(o => attr(o[1], 'value')) || opts[0]
        value = chosen ? decode(attr(chosen[1], 'value') ?? '') : ''
      }
      inputs.push({ name, type, value })
    }
    forms.push({ method, action, inputs })
  }
  return forms
}

async function audit(slug) {
  const app = await createApp(agent ? { persist: false, captcha: { mode: 'off' }, benchmark: { runId: `audit-${slug}`, stores: [slug] } } : { persist: false, captcha: { mode: 'off' } })
  const server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)) })
  const base = `http://127.0.0.1:${server.address().port}`
  const jar = new Map()
  const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ')
  const remember = r => { for (const c of r.headers.getSetCookie()) { const [kv] = c.split(';'); const i = kv.indexOf('='); jar.set(kv.slice(0, i), kv.slice(i + 1)) } }
  const cssCache = new Map()
  async function cssOk(href) {
    if (cssCache.has(href)) return cssCache.get(href)
    let ok = false
    try {
      const r = await fetch(new URL(href, base), { headers: { cookie: cookieHeader() } })
      ok = r.ok && (r.headers.get('content-type') || '').includes('css') && (await r.text()).length > 200
    } catch {}
    cssCache.set(href, ok)
    return ok
  }
  const pages = new Map(), problems = [], queue = [{ method: 'GET', url: `/${slug}` }, { method: 'GET', url: `/${slug}/this-page-does-not-exist` }]
  const formsSeen = new Set(), rendered = new Map()
  async function visit({ method, url, body, from }) {
    let r
    try {
      r = await fetch(base + url, { method, redirect: 'manual', body, headers: { cookie: cookieHeader(), ...(body ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) } })
    } catch (e) { return }
    remember(r)
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get('location')
      if (loc && loc.startsWith('/') && !pages.has(`GET ${loc}`)) queue.unshift({ method: 'GET', url: loc, from: `${method} ${url}` })
      return
    }
    const ct = r.headers.get('content-type') || ''
    const text = await r.text()
    const looksHtml = ct.includes('html') || /^\s*<(!doctype|html)/i.test(text)
    if (!looksHtml) {
      if (r.status >= 400 && ct.includes('text/plain') && !/\.(svg|png|jpe?g|webp)|\/(img|image|art|media|photo)/i.test(url)) problems.push({ kind: 'plain-text', method, url, status: r.status, from, title: text.slice(0, 80) })
      return
    }
    const inline = /<style\b[^>]*>[\s\S]{40,}?<\/style>/i.test(text)
    const links = [...text.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/gi)].map(m => decode((m[0].match(/href="([^"]+)"/) || [])[1] || '')).filter(Boolean)
    const results = await Promise.all(links.map(async h => [h, await cssOk(h)]))
    const loaded = results.filter(([, ok]) => ok).length
    const title = ((text.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '').trim().slice(0, 80)
    if (!inline && !loaded) problems.push({ kind: 'unstyled', method, url, status: r.status, from, title, links, body, detail: text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) })
    else if (results.some(([, ok]) => !ok)) problems.push({ kind: 'missing-stylesheet', method, url, status: r.status, from, title, broken: results.filter(([, ok]) => !ok).map(([h]) => h) })
    const kind = `${r.status} ${method} ${url.split('?')[0].replace(/\/[^/]*\d[^/]*/g, '/#')}`
    if (render && !rendered.has(kind)) rendered.set(kind, { method, url, status: r.status, html: text })
    if (r.status >= 400) return
    for (const m of text.matchAll(/href="([^"#]+)"/g)) {
      const h = decode(m[1])
      if (!h.startsWith(`/${slug}`) || /\/(signout|logout|sign-out)/i.test(h) || /\/static\//.test(h)) continue
      if (!pages.has(`GET ${h}`)) queue.push({ method: 'GET', url: h, from: url })
    }
    for (const form of parseForms(text)) {
      const action = form.action ? new URL(form.action, base + url) : new URL(base + url)
      if (action.origin !== base || !action.pathname.startsWith(`/${slug}`) || /sign-?out|logout/i.test(action.pathname)) continue
      const key = `${form.method} ${action.pathname} ${form.inputs.map(i => i.name).sort().join(',')}`
      if (formsSeen.has(key)) continue
      formsSeen.add(key)
      const filled = new URLSearchParams(form.inputs.map(i => [i.name, i.value || fillValue(i)]))
      const empty = new URLSearchParams(form.inputs.filter(i => i.type === 'hidden').map(i => [i.name, i.value]))
      for (const params of [filled, empty]) {
        // Forms go to the front so every form is tried before the page cap is reached.
        if (form.method === 'get') { const u = new URL(action); for (const [k, v] of params) u.searchParams.set(k, v); queue.unshift({ method: 'GET', url: u.pathname + u.search, from: url }) }
        else queue.unshift({ method: 'POST', url: action.pathname + action.search, body: params.toString(), from: url })
      }
    }
  }
  while (queue.length && pages.size < maxPages) {
    const item = queue.shift()
    const key = `${item.method} ${item.url}${item.body ? ' ' + item.body : ''}`
    if (pages.has(key)) continue
    pages.set(key, true)
    await visit(item)
  }
  if (render) await renderCheck(base, [...rendered.values()], problems, cookieHeader())
  server.close()
  return { slug, crawled: pages.size, kinds: rendered.size, problems }
}

let browser
async function renderCheck(base, list, problems, cookie) {
  if (!browser) {
    const { chromium } = await import('playwright')
    browser = await chromium.launch(existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {})
  }
  const context = await browser.newContext({ extraHTTPHeaders: { cookie } })
  const page = await context.newPage()
  let current
  await page.route('**/*', route => {
    const req = route.request()
    if (req.isNavigationRequest() && req.frame() === page.mainFrame()) return route.fulfill({ status: 200, contentType: 'text/html', body: current.html })
    if (['image', 'media', 'font'].includes(req.resourceType())) return route.abort()
    return route.continue()
  })
  for (const item of list) {
    current = item
    try {
      await page.goto(base + item.url, { waitUntil: 'load', timeout: 15000 })
      const result = await page.evaluate(() => {
        const out = { total: 0, fallback: 0, samples: [] }
        const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT)
        while (walker.nextNode()) {
          const node = walker.currentNode, el = node.parentElement
          if (!el || !node.textContent.trim() || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue
          const box = el.getBoundingClientRect(), cs = getComputedStyle(el)
          if (!box.width || !box.height || cs.visibility === 'hidden') continue
          out.total++
          if (/^"?Times New Roman"?$/.test(cs.fontFamily)) { out.fallback++; if (out.samples.length < 3) out.samples.push(`<${el.tagName.toLowerCase()} class="${el.className}">${node.textContent.trim().slice(0, 40)}`) }
        }
        return out
      })
      if (result.fallback) problems.push({ kind: result.fallback === result.total ? 'unstyled-render' : 'default-font-text', method: item.method, url: item.url, status: item.status, title: ((item.html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '').trim().slice(0, 80), detail: `${result.fallback}/${result.total} text runs in default font: ${result.samples.join(' | ')}` })
    } catch (e) { problems.push({ kind: 'render-error', method: item.method, url: item.url, status: item.status, title: '', detail: e.message.slice(0, 120) }) }
  }
  await context.close()
}

const all = []
for (const slug of slugs) {
  const result = await audit(slug)
  all.push(result)
  if (!args.includes('--json')) {
    const counts = result.problems.reduce((a, p) => ({ ...a, [p.kind]: (a[p.kind] || 0) + 1 }), {})
    console.log(`${slug.padEnd(20)} crawled ${String(result.crawled).padStart(5)}${render ? ` rendered ${result.kinds}` : ''}  ${JSON.stringify(counts)}`)
    for (const p of result.problems.slice(0, 40)) console.log(`   ${p.kind} ${p.status} ${p.method} ${p.url}  "${p.title}"${p.links?.length ? ' links=' + p.links.join(',') : ''}${p.broken ? ' broken=' + p.broken.join(',') : ''}${p.detail ? `\n      ${p.detail}${p.body !== undefined ? ` [body: ${p.body.slice(0, 120)}]` : ''}` : ''}`)
  }
}
if (browser) await browser.close()
if (args.includes('--json')) console.log(JSON.stringify(all, null, 1))
process.exit(all.some(r => r.problems.some(p => p.kind !== 'plain-text')) ? 1 : 0)
