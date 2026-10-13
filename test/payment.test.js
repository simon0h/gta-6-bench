import test from 'node:test'
import assert from 'node:assert/strict'
import { validateCard, luhn, cardBrand, last4 } from '../lib/payment.js'

const valid = { number:'4242 4242 4242 4242', expiry:'12/99', cvv:'123' }

test('payment: formatted scalar card data and separate expiry fields remain supported', () => {
  assert.deepEqual(validateCard(valid), {ok:true,brand:'Visa',last4:'4242'})
  assert.equal(validateCard({...valid,expiry:undefined,exp_month:12,exp_year:2099}).ok, true)
  assert.equal(validateCard({...valid,number:'4242-4242-4242-4242'}).ok, true)
})

test('payment: structured and repeated fields never concatenate into valid card credentials', () => {
  const malformed = [ ['42424242','42424242'], ['4242424242424242'], {toString:'bad'}, Object.create(null) ]
  for (const number of malformed) {
    assert.equal(validateCard({...valid,number}).ok, false)
    assert.equal(luhn(number), false)
    assert.equal(cardBrand(number), 'Card')
    assert.equal(last4(number), '')
  }
  // Some legacy callers stringify form values first; comma-joined duplicates
  // must still be rejected instead of having punctuation stripped away.
  for (const number of ['42424242,42424242', 'card:4242424242424242']) assert.equal(validateCard({...valid,number}).ok, false)
  for (const expiry of [['12/99'], {toString:'bad'}, Object.create(null), false, 0]) assert.equal(validateCard({...valid,expiry,exp_month:12,exp_year:2099}).ok, false)
  for (const cvv of [['123'], {toString:'bad'}, Object.create(null)]) assert.equal(validateCard({...valid,cvv}).ok, false)
  for (const [exp_month,exp_year] of [[[12],2099],[12,[2099]],[1.5,2099],[12,2099.5]]) {
    assert.equal(validateCard({...valid,expiry:undefined,exp_month,exp_year}).ok, false)
  }
})
