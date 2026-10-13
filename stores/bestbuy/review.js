import { createHash, randomBytes } from 'node:crypto'
import { totals, etaFor } from './data.js'
import { currentStore } from './location.js'

// Bind the rendered payment form to trusted order data, never submitted prices.
export function reviewFingerprint(store) {
  const t = totals(store), c = store.checkout
  return createHash('sha256').update(JSON.stringify({
    account: store.user?.id ?? null,
    lines: t.lines.map(l => ({ sku: l.product.sku, variant: l.variant || null, qty: l.qty,
      fulfillment: l.fulfillment, price: l.product.price, title: l.product.title,
      option: l.product.label, condition: l.product.condition, eta: etaFor(l.product, l.fulfillment) })),
    total: t.total, subtotal: t.subtotal, tax: t.tax, shipping: t.shipping,
    store: currentStore(store).id, zip: store.shipZip || '90001',
    contact: c.contact, address: c.address, pickup: c.pickup, gift: c.gift,
    service: c.levelOfService, payment: c.paymentMethod || 'card',
  })).digest('hex')
}

export function prepareReview(store) {
  const fingerprint = reviewFingerprint(store)
  if (store.checkout.review?.fingerprint !== fingerprint)
    store.checkout.review = { fingerprint, token: randomBytes(24).toString('hex') }
}

export function invalidateReview(store) {
  delete store.checkout.review
  delete store.checkout.paymentMethod
  delete store.checkout.paymentValues
}

export function currentReview(store, token) {
  const review = store.checkout.review
  // Preserve inherited direct-HTTP clients; browser forms always submit a token.
  return !!review && review.fingerprint === reviewFingerprint(store)
    && (token === undefined || token === review.token)
}
