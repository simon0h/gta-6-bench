import test from 'node:test'
import assert from 'node:assert/strict'
import { money } from '../lib/html.js'

test('KRW displays grouped whole won while existing currencies retain cents', () => {
  assert.equal(money(89800, 'KRW'), '89,800원')
  assert.equal(money(179600, 'KRW'), '179,600원')
  assert.equal(money(0, 'KRW'), '0원')
  assert.equal(money(79.99), '$79.99')
  assert.equal(money(67.99, 'GBP'), '£67.99')
  assert.equal(money(129.95, 'AUD'), 'A$129.95')
})
