import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { esc } from './html.js'

const STORES = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'stores')
const sheets = new Map()

// Every stylesheet the store serves, so the page keeps the store's fonts and colours.
function storeSheets(slug) {
  if (!sheets.has(slug)) {
    const dir = path.join(STORES, slug, 'public')
    const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '') && existsSync(dir)
    sheets.set(slug, valid ? readdirSync(dir).filter(file => file.endsWith('.css')).sort().map(file => `/${slug}/static/${file}`) : [])
  }
  return sheets.get(slug)
}

// Shown when a store request fails unexpectedly, in place of Express's bare
// white "Internal Server Error" page.
export function storeErrorPage({ slug, name } = {}) {
  const links = storeSheets(slug)
  const home = links.length ? `/${slug}` : '/'
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(name ? `Something went wrong | ${name}` : 'Something went wrong')}</title>
<style>body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f;background:#fff}.store-error{max-width:560px;margin:72px auto;padding:0 20px;text-align:center;line-height:1.5}.store-error h1{font-size:26px;margin:0 0 12px}.store-error a{display:inline-block;margin-top:16px;padding:10px 20px;border-radius:999px;border:1px solid currentColor;color:inherit;text-decoration:none;font-weight:600}</style>
${links.map(href => `<link rel="stylesheet" href="${esc(href)}">`).join('')}</head>
<body><main class="store-error" role="main"><h1>Sorry, something went wrong.</h1><p>We couldn't complete your request. Please try again in a moment.</p><a href="${esc(home)}">Go to the homepage</a></main></body></html>`
}
