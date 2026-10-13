// Full-page screenshot of a store page.
//   node scripts/parity/shot.mjs /bestbuy out.png [width]            boots the app in-process
//   node scripts/parity/shot.mjs http://localhost:3000/bestbuy out.png [width]
import { chromium } from 'playwright'
const [,, target, out, w = '1366'] = process.argv
let url = target, server
if (target.startsWith('/')) {
  process.env.NODE_ENV ??= 'test'
  const { createApp } = await import('../../app.js')
  const app = await createApp({ persist: false })
  server = await new Promise(resolve => { const s = app.listen(0, () => resolve(s)) })
  url = `http://127.0.0.1:${server.address().port}${target}`
}
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch())
const p = await b.newPage({ viewport: { width: +w, height: 900 } })
await p.goto(url, { waitUntil: 'load' }); await p.screenshot({ path: out, fullPage: true }); await b.close()
server?.close()
