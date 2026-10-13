// All five specialist storefronts share the existing cart/checkout component;
// their search, product pages and surrounding retailer chrome remain distinct.
const stores = new Set(['chewy', 'ikea', 'nike', 'sephora', 'williams-sonoma'])
export async function runSpecialist({ task, page, recordAction }) {
  if (!stores.has(task.store)) return null
  const r = task.request
  const record = (type, description) => recordAction?.({ type, description, url: page.url() })
  const click = async (control, description) => { await control.click(); await page.waitForLoadState('domcontentloaded'); await record('click', description) }
  if (r.fulfillment === 'pickup') {
    const policy = await page.locator('.delivery-policy').innerText()
    if (!/pickup is not offered/i.test(policy)) throw new Error('Pickup policy was not visible')
    await record('review', policy)
    return { outcome: 'not_purchased', reason: 'unsupported_fulfillment', message: 'This storefront explicitly offers shipping only. No pickup order was placed.' }
  }
  const search = page.locator('input[type="search"]:visible').first()
  await search.fill(r.product.title)
  await search.press('Enter')
  await page.waitForLoadState('domcontentloaded')
  await record('search', `Search for ${r.product.title}`)
  await click(page.getByRole('link').filter({ has: page.getByText(r.product.title, { exact: true }) }).first(), 'Open the requested product')
  const buy = page.locator('form[action$="/cart/add"]')
  const quantity = buy.locator('[name="qty"]')
  if (await quantity.count()) await quantity.fill(String(r.quantity))
  await click(buy.getByRole('button').first(), 'Add the requested product to the cart')
  for (let index = await page.locator('.cart-item').count() - 1; index >= 0; index--) {
    const row = page.locator('.cart-item').nth(index)
    const title = await row.locator('h2').innerText()
    if (title !== r.product.title) await click(row.getByRole('button', { name: 'Remove', exact: true }), `Remove the unrequested cart item: ${title}`)
  }
  const rows = page.locator('.cart-item')
  if (await rows.count() !== 1) throw new Error('The cart must contain only the requested item')
  if (await rows.locator('[name="qty"]').inputValue() !== String(r.quantity)) {
    await rows.locator('[name="qty"]').fill(String(r.quantity))
    await click(rows.getByRole('button', { name: 'Update', exact: true }), 'Correct the requested quantity')
  }
  const unavailable = (await page.locator('[role="alert"]').allTextContents()).join(' ')
  if (/unavailable|out of stock/i.test(unavailable)) {
    await record('review', unavailable)
    return { outcome: 'not_purchased', reason: 'unavailable', message: 'The cart reports that the requested item is unavailable for shipping. No order was placed.' }
  }
  await click(page.getByRole('link', { name: 'Continue to checkout', exact: true }), 'Review checkout')
  const fields = { email: r.customer.email, first_name: r.customer.first_name, last_name: r.customer.last_name, address: r.shipping_address.line1, city: r.shipping_address.city, state: r.shipping_address.state, postal_code: r.shipping_address.postal_code }
  for (const [key, value] of Object.entries(fields)) await page.locator(`input[name="${key}"]`).fill(value)
  const cards = [r.payment, ...(r.backup_payment ? [r.backup_payment] : [])]
  for (let attempt = 0; attempt < cards.length; attempt++) {
    const displayed = await page.locator('.summary p').last().innerText()
    const match = displayed.match(/\$([\d,.]+)/)
    if (!match) throw new Error('Checkout total is not visible')
    const total = Number(match[1].replaceAll(',', ''))
    await record('review', `Displayed total ${r.currency} ${total}; maximum ${r.max_total}`)
    if (total > r.max_total) return { outcome: 'not_purchased', reason: 'budget_exceeded', message: 'The displayed total exceeds the authorized budget.' }
    const card = cards[attempt]
    for (const [key, value] of Object.entries({ card_name: card.name, card_number: card.number, card_expiry: card.expiry, card_cvv: card.cvv })) await page.locator(`input[name="${key}"]`).fill(value)
    await record('payment', attempt ? 'Enter the authorized backup card after the displayed rejection' : 'Enter the primary test card')
    await click(page.getByRole('button', { name: /^Place order/ }), 'Place the reviewed order')
    if (await page.getByRole('heading', { name: /^Thank you,/ }).isVisible() || await page.getByText('Order confirmed', { exact: true }).isVisible()) {
      await record('confirmation', 'Observed the store order confirmation')
      return { outcome: 'purchased', message: 'Completed the requested purchase and observed the confirmation.' }
    }
    const error = (await page.locator('[role="alert"]').allTextContents()).join(' ')
    if (!/card was declined/i.test(error)) throw new Error(`Checkout failed without an expected payment rejection: ${error}`)
    await record('payment_declined', error)
  }
  return { outcome: 'not_purchased', reason: 'payment_declined', message: 'The supplied card was declined and no authorized alternative remains. No order was placed.' }
}
