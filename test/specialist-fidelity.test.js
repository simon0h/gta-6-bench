import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { startServer } from './helpers.js'

// Public references live alongside the assets. These checks protect the observed
// media and cross-store journey, rather than requiring invented multi-view covers.
test('official reference assets remain local, nonempty and linked to an observed source', async () => {
  for (const store of ['playstation-store','xbox-store','rockstar-store','jb-hifi']) {
    const root = new URL(`../public/reference/${store}/`, import.meta.url)
    const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'))
    for (const asset of manifest.assets) {
      assert.match(asset.source_url, /^https:\/\//, asset.file)
      assert.ok((await readFile(new URL(asset.file, root))).byteLength > 0, asset.file)
    }
  }
})

test('GTA VI platform product pages use observed cover and screenshot presentations', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    const ps = await c.get('/playstation-store/en-us/concept/10000730/')
    assert.equal(ps.status, 200)
    assert.match(ps.text, /<h1>Grand Theft Auto VI: Ultimate Edition<\/h1>/)
    assert.match(ps.text, /gta-vi-hero\.jpg/)
    assert.match(ps.text, /11\/18\/2026 09:00 PM PST/)
    for (let i = 1; i <= 10; i++) {
      assert.ok(ps.text.includes(`href="#ps-screenshot-${i}"`))
      assert.ok(ps.text.includes(`id="ps-screenshot-${i}"`))
      assert.equal((await c.get(`/static/reference/playstation-store/gta-vi-screenshot-${i}.jpg`)).status, 200)
    }
    const xb = await c.get('/xbox-store/en-US/games/store/grand-theft-auto-vi/9p3h4968grsm')
    assert.equal(xb.status, 200)
    assert.match(xb.text, /class="xb-cover" src="\/static\/reference\/xbox-store\/gta-vi-cover\.png"/)
    assert.match(xb.text, /ESRB Mature 17\+/)
    assert.doesNotMatch(xb.text, /class="xb-gp-card"|Original illustrative cover/)
    assert.match(xb.text, /<div class="xb-buybox" id="buybox">/)
  } finally { await srv.close() }
})

test('Rockstar official drm links select the platform and lead to its exact edition', async () => {
  const srv = await startServer()
  try {
    const c = srv.client()
    for (const [drm, platform, standard, ultimate, upgrade] of [
      ['PlayStation', 'ps5', '/playstation-store/en-us/product/EP1004-PPSA01547_00-GTAVISTANDARD001', '/playstation-store/en-us/product/EP1004-PPSA01547_00-GTAVIULTIMATE001', '/playstation-store/en-us/product/EP1004-PPSA01547_00-ULTEDTIONUPGRADE'],
      ['Xbox', 'xbox', '/xbox-store/en-US/games/store/grand-theft-auto-vi/9p3h4968grsm', '/xbox-store/en-US/games/store/grand-theft-auto-vi-ultimate-edition/9nnzsnhlr63l', '/xbox-store/en-US/games/store/grand-theft-auto-vi-ultimate-edition-upgrade/9pn4llbr8rch'],
    ]) {
      const page = await c.get(`/rockstar-store/game/buy-gta-vi?drm=${drm}`)
      assert.equal(page.status, 200)
      assert.ok(page.text.includes(`name="platform" value="${platform}"`))
      for (const path of [standard, ultimate, upgrade]) {
        assert.ok(page.text.includes(`href="${path}"`), path)
        assert.equal((await c.get(path)).status, 200, path)
      }
      assert.match(page.text, /GTAVI_PreOrderWebstore_GamesGrid_FOB_1212x1497_R01\.jpg/)
      for (let i = 0; i < 8; i++) assert.ok(page.text.includes(`id="rs-shot-${i}"`))
    }
    const invalid = await c.get('/rockstar-store/game/buy-gta-vi?drm=__proto__')
    assert.equal(invalid.status, 200)
    assert.match(invalid.text, /name="platform" value=""/)
  } finally { await srv.close() }
})
