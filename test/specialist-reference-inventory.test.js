import test from 'node:test'
import assert from 'node:assert/strict'

const counts = {'playstation-store':3,'xbox-store':5,'rockstar-store':1,'game-uk':2,'jb-hifi':2,'smyths-toys':2,'eb-games-au':2,'argos':2}

test('specialist fixture mode retains explicit legacy inventories', async () => {
 for (const store of Object.keys(counts)) {
  const {inventory}=await import(`../stores/${store}/inventory.js`)
  assert.equal(inventory.length,500,store)
 }
})
