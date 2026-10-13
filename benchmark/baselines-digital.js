// Native digital-store reference journeys. Decisions use public requirements
// and rendered controls only; no evaluator IDs, stock APIs or hidden outcomes.
export async function runDigital({ task, page, recordAction }) {
  if (!['playstation-store', 'xbox-store'].includes(task.store)) return null
  const request = task.request
  const ps = task.store === 'playstation-store'
  const record = async (type, description) => recordAction?.({ type, description, url: page.url() })
  const click = async (locator, description) => { await locator.click(); await page.waitForLoadState('domcontentloaded'); await record('click', description) }
  const fill = async (name, value) => { if (value !== undefined && value !== null) await page.locator(`input[name="${name}"]:visible`).fill(String(value)) }
  const stop = async (reason, message) => { await record('review', message); return { outcome: 'not_purchased', reason, message: `${message} No order was placed.` } }
  const alerts = async () => (await page.locator('[role="alert"]:visible').allTextContents()).join(' ')
  const budget = async selector => {
    const displayed = await page.locator(selector).innerText()
    const match = displayed.replaceAll(',', '').match(/\$\s*(\d+(?:\.\d{2})?)/)
    if (!match) throw new Error('Checkout did not display a total')
    const total = Number(match[1])
    await record('review', `Displayed total USD ${total.toFixed(2)}; maximum ${request.max_total.toFixed(2)}`)
    return Math.round(total * 100) > Math.round(request.max_total * 100) ? stop('budget_exceeded', 'The displayed checkout total exceeds the authorized budget.') : null
  }
  const account = request.account
  if (!account?.email || !account.password) throw new Error('Digital purchases require the supplied account credentials')
  await click(page.locator(ps ? '.ps-signin' : '.xb-me'), 'Sign in to the supplied purchasing account')
  await fill(ps ? 'email' : 'loginfmt', account.email)
  await click(page.getByRole('button', { name: 'Next', exact: true }), 'Submit the supplied account email')
  await fill(ps ? 'password' : 'passwd', account.password)
  await click(page.getByRole('button', { name: ps ? 'Sign In' : 'Sign in', exact: true }), 'Submit the supplied account password')
  if (!ps && await page.getByRole('button', { name: 'No', exact: true }).isVisible()) await click(page.getByRole('button', { name: 'No', exact: true }), 'Continue without persistent sign-in')

  const badge = page.locator(ps ? '.ps-cart-badge' : '.xb-badge')
  if (await badge.isVisible()) {
    await click(page.locator(ps ? '.ps-cart' : '.xb-cart'), 'Inspect the existing digital cart')
    const remove = ps ? page.locator('.ps-items').getByRole('button', { name: /^Remove .+ from cart$/ }) : page.locator('.xb-line').getByRole('button', { name: 'Remove', exact: true })
    while (await remove.count()) await click(remove.first(), 'Remove the unrequested cart item before buying the requested single digital license')
    await record('review', 'Confirmed the cart is empty before the direct digital purchase')
    await click(ps ? page.getByRole('link', { name: 'Continue Shopping', exact: true }) : page.getByRole('link', { name: 'Xbox home', exact: true }), 'Return to shopping')
  }

  await click(page.locator(ps ? '.ps-search > summary' : '.xb-search-toggle'), 'Open the store search')
  const search = page.locator('input[name="q"]:visible')
  await search.fill('Grand Theft Auto VI')
  await search.press('Enter')
  await page.waitForLoadState('domcontentloaded')
  await record('search', 'Find the requested digital edition')
  const title = request.edition === 'ultimate' ? 'Grand Theft Auto VI: Ultimate Edition' : 'Grand Theft Auto VI'
  const product = ps
    ? page.locator('.ps-tile').filter({ has: page.getByText(title, { exact: true }) })
    : page.locator('.xb-tile').filter({ has: page.getByText(title, { exact: true }) })
  await click(product.first(), `Open ${title}`)
  const productText = await page.locator('main').innerText()
  if (request.fulfillment === 'pickup') {
    if (!/digital|license/i.test(productText)) throw new Error('The visible product does not establish digital delivery')
    return stop('unsupported_fulfillment', 'The selected product is a digital license. This store offers no pickup option for it.')
  }
  if (request.format !== 'digital' || request.quantity !== 1) return stop('unsupported_variant', 'This purchase path offers one digital license for the selected account.')
  await record('review', `Confirmed the requested ${request.edition} edition for ${request.platform}, delivered as one digital license`)
  const preorder = ps ? page.locator('.ps-hero-card').getByRole('button', { name: 'Pre-Order', exact: true }) : page.getByRole('button', { name: new RegExp(`^Preorder ${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.`) })
  await click(preorder, 'Start the requested digital preorder')
  if (/unavailable/i.test(await alerts())) return stop('unavailable', 'The store reports that the selected digital item became unavailable.')

  const billing = request.billing_address || request.shipping_address
  if (!billing) throw new Error('Digital card checkout requires the supplied billing address')
  const cards = [request.payment, ...(request.backup_payment ? [request.backup_payment] : [])]
  for (let attempt = 0; attempt < cards.length; attempt++) {
    const card = cards[attempt]
    const [month, year] = card.expiry.split('/')
    const expiryYear = year.length === 2 ? `20${year}` : year
    const declinedBudget = await budget(ps ? '.ps-drawer .ps-total' : '.xb-dialog .xb-total')
    if (declinedBudget) return declinedBudget
    if (ps) {
      await click(page.getByRole('link', { name: 'Add Payment Method', exact: true }), 'Add the authorized test payment card')
      await click(page.getByRole('link', { name: /Add a Credit\/Debit Card/ }), 'Choose credit or debit card')
      for (const [name, value] of Object.entries({ cardNumber: card.number, cardholderName: card.name, cvv: card.cvv })) await fill(name, value)
      await page.locator('select[name="expMonth"]').selectOption(month.padStart(2, '0'))
      await page.locator('select[name="expYear"]').selectOption(expiryYear)
      await click(page.getByRole('button', { name: 'Next', exact: true }), 'Validate the card fields before billing')
      for (const [name, value] of Object.entries({ firstName: request.customer.first_name, lastName: request.customer.last_name, address1: billing.line1, address2: billing.line2 || '', city: billing.city, zip: billing.postal_code, phone: billing.phone || account.phone || request.customer.phone || '5550142026' })) await fill(name, value)
      await page.locator('select[name="state"]').selectOption(billing.state)
      await click(page.getByRole('button', { name: 'Save', exact: true }), 'Save the card and supplied billing address')
      await record('payment', attempt ? 'Use the authorized backup after the displayed primary rejection' : 'Use the supplied primary test card')
      await click(page.getByRole('button', { name: 'Pre-Order & Pay', exact: true }), 'Confirm the reviewed digital purchase')
    } else {
      if (attempt) await click(page.getByRole('link', { name: 'Change', exact: true }), 'Change payment after the displayed rejection')
      const newCard = page.locator('input[name="pi"][value="new"]:visible')
      if (await newCard.isVisible()) await newCard.check()
      for (const [name, value] of Object.entries({ cardNumber: card.number, nameOnCard: card.name, cvv: card.cvv, address1: billing.line1, address2: billing.line2 || '', city: billing.city, zip: billing.postal_code })) await fill(name, value)
      await page.locator('select[name="expMonth"]').selectOption(month.padStart(2, '0'))
      await page.locator('select[name="expYear"]').selectOption(expiryYear)
      await page.locator('select[name="state"]').selectOption(billing.state)
      await click(page.getByRole('dialog').getByRole('button', { name: 'Pre-order', exact: true }), 'Review the supplied payment method')
      await record('payment', attempt ? 'Use the authorized backup after the displayed primary rejection' : 'Use the supplied primary test card')
      await click(page.getByRole('dialog').getByRole('button', { name: 'Pre-order', exact: true }), 'Confirm the reviewed digital purchase')
    }
    const confirmation = page.getByRole('heading', { name: ps ? 'Thank you for your purchase!' : /Thanks for your purchase/ })
    if (await confirmation.isVisible()) { await record('confirmation', 'Observed the digital purchase confirmation'); return { outcome: 'purchased', message: 'Purchased the requested digital license and observed the store confirmation.' } }
    const error = await alerts()
    if (!/declined/i.test(error)) throw new Error(`Digital purchase was not confirmed: ${error || 'No visible error'}`)
    await record('payment_declined', 'Observed the store rejection of the submitted payment')
    if (attempt + 1 === cards.length) return stop('payment_declined', 'The store declined the payment and no further payment method is authorized.')
  }
}
