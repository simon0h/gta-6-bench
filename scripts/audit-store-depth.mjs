// Read-only HTTP smoke audit of the local synthetic environments. This does not
// replace browser visual checks or checkout tests. It never follows external URLs.
import { writeFile } from 'node:fs/promises'

const origin = new URL(process.env.AUDIT_BASE || 'http://127.0.0.1:3106')
if (!['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname)) throw new Error('Audit only supports a local server')
const maxPages = Number(process.env.AUDIT_MAX_PAGES || 100)
const selected = process.env.AUDIT_STORES?.split(',').filter(Boolean)
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&#x2F;', '/')
const results = []
const checkedAssets = new Map()

async function get(url) {
  for (let i = 0; i < 8; i++) {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) })
    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      const next = new URL(response.headers.get('location'), url)
      if (next.origin !== origin.origin) throw new Error(`External redirect: ${next.href}`)
      url = next
      continue
    }
    return { response, url }
  }
  throw new Error('Redirect loop')
}

function links(html, page, slug) {
  const found = []
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi)) {
    try {
      const url = new URL(decode(match[1]), page)
      url.hash = ''
      if (url.origin !== origin.origin || !(url.pathname === `/${slug}` || url.pathname.startsWith(`/${slug}/`))) continue
      if (/\/(?:logout|signout|sign-out|confirmation|order-confirmation)(?:\/|$)/i.test(url.pathname)) continue
      if (url.pathname.includes('/static/')) continue
      found.push(url.href)
    } catch {}
  }
  return found
}

async function assets(html, page, errors) {
  const paths = [...html.matchAll(/(?:\bsrc|\bhref)\s*=\s*["']([^"']+)["']/gi)].map(match => decode(match[1]))
  for (const match of html.matchAll(/url\(["']?([^)'"\s]+)["']?\)/gi)) paths.push(decode(match[1]))
  for (const value of paths) {
    let url
    try { url = new URL(value, page) } catch { continue }
    if (url.origin !== origin.origin || !url.pathname.includes('/static/')) continue
    if (!checkedAssets.has(url.href)) {
      try {
        const { response } = await get(url)
        checkedAssets.set(url.href, response.status)
        await response.arrayBuffer()
      } catch (error) { checkedAssets.set(url.href, error.message) }
    }
    const status = checkedAssets.get(url.href)
    if (status !== 200) errors.push({ page: page.pathname + page.search, asset: url.pathname, status })
  }
}

const storesResponse = await get(new URL('/api/stores', origin))
const stores = await storesResponse.response.json()
for (const store of stores.filter(store => !selected || selected.includes(store.slug))) {
  const queue = [new URL(`/${store.slug}/`, origin).href], visited = new Set(), errors = [], warnings = []
  let totalLinks = 0
  while (queue.length && visited.size < maxPages) {
    const href = queue.shift()
    if (visited.has(href)) continue
    visited.add(href)
    try {
      const { response, url } = await get(new URL(href))
      const html = await response.text()
      if (response.status !== 200) errors.push({ page: new URL(href).pathname + new URL(href).search, status: response.status })
      if (response.status === 200 && response.headers.get('content-type')?.includes('text/html')) {
        if (!/<title>[^<]+<\/title>/i.test(html)) warnings.push({ page: url.pathname, issue: 'Missing page title' })
        if (!/<html[^>]*lang=/i.test(html)) warnings.push({ page: url.pathname, issue: 'Missing document language' })
        const discovered = links(html, url, store.slug)
        totalLinks += discovered.length
        queue.push(...discovered.filter(link => !visited.has(link) && !queue.includes(link)))
        await assets(html, url, errors)
      }
    } catch (error) { errors.push({ page: href, error: error.message }) }
  }
  const result = { store: store.slug, pagesChecked: visited.size, unvisitedLinks: queue.length, totalLinks, errors, warnings }
  results.push(result)
  console.log(`${store.slug}: ${visited.size} pages, ${errors.length} errors, ${warnings.length} warnings, ${queue.length} links beyond limit`)
}
const report = { auditedAt: new Date().toISOString(), base: origin.origin, maxPagesPerStore: maxPages, authenticated: false, postFormsTested: false, assetsChecked: checkedAssets.size, results }
await writeFile(process.env.AUDIT_REPORT || new URL('../research/depth/http-audit.json', import.meta.url), JSON.stringify(report, null, 2) + '\n')
if (results.some(result => result.errors.length)) process.exitCode = 1
