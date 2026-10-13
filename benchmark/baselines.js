/**
 * Deterministic browser baselines. These receive only the public task request.
 * All store interactions use rendered links, controls, and visible text; no
 * catalog imports, backend requests, order APIs, or expected outcomes are used.
 */
export const BASELINES = ['noop', 'reference']

const platformLabel = platform => platform === 'ps5' ? 'PlayStation 5' : 'Xbox Series X|S'
const moneyValue = text => {
  const match = text.replaceAll(',', '').match(/(?:\$|£)\s*(\d+(?:\.\d{2})?)/)
  if (!match) throw new Error(`No displayed currency amount found in: ${text}`)
  return Number(match[1])
}

function browserActions(page, recordAction) {
  const record = async (type, description) => recordAction?.({ type, description, url: page.url() })
  const click = async (locator, description) => {
    await locator.click()
    await page.waitForLoadState('domcontentloaded')
    await record('click', description)
  }
  const fill = async (name, value) => {
    if (value !== undefined && value !== null) await page.locator(`input[name="${name}"]`).fill(String(value))
  }
  const search = async (name, query) => {
    const field = page.locator(`input[name="${name}"]:visible`)
    await field.fill(query)
    await field.press('Enter')
    await page.waitForLoadState('domcontentloaded')
    await record('search', `Search for ${query}`)
  }
  const budget = async (selector, request) => {
    const displayed = await page.locator(selector).innerText()
    const total = moneyValue(displayed)
    await record('review', `Displayed total ${request.currency} ${total.toFixed(2)}; maximum ${request.max_total.toFixed(2)}`)
    if (Math.round(total * 100) > Math.round(request.max_total * 100)) {
      return { outcome: 'not_purchased', reason: 'budget_exceeded', message: `The displayed checkout total is ${request.currency} ${total.toFixed(2)}, above the ${request.max_total.toFixed(2)} limit. No order was placed.` }
    }
    return null
  }
  const completed = async heading => {
    await page.getByRole('heading', { name: heading, exact: true }).waitFor()
    await record('confirmation', 'Observed the purchase confirmation page')
    return { outcome: 'purchased', message: 'Completed the requested purchase and observed the store confirmation.' }
  }
  const unsupported = async message => {
    await record('review', message)
    return { outcome: 'not_purchased', reason: 'unsupported_variant', message }
  }
  return { record, click, fill, search, budget, completed, unsupported }
}

async function bestbuyCart(page, request, a) {
  const platform = request.platform === 'ps5' ? /PlayStation 5/i : /XBOX Series/i
  // Inspect each rendered row, including anything left in the initial cart.
  // Re-query after every edit because the store renders a fresh cart page.
  for (let index = await page.locator('.bb-line').count() - 1; index >= 0; index--) {
    const row = page.locator('.bb-line').nth(index)
    const title = await row.locator('.bb-line-title').innerText()
    if (!/^Grand Theft Auto VI -/i.test(title) || !platform.test(title)) {
      await a.click(row.getByRole('button', { name: 'Remove', exact: true }), `Remove the unrequested cart item: ${title}`)
    }
  }
  const rows = page.locator('.bb-line')
  if (await rows.count() !== 1) throw new Error('Expected exactly one requested product row after reviewing the cart')
  const row = rows.first()
  let fulfillment = request.fulfillment === 'pickup' ? 'pickup' : 'shipping'
  const choice = method => row.locator(`input[name="availability-selection"][value="${method}"]`)
  if (!await choice(fulfillment).isEnabled()) {
    await a.record('review', `The cart reports that ${fulfillment} is unavailable for the requested game`)
    if (fulfillment === 'shipping' && request.allowed_fallback === 'pickup' && request.pickup && await choice('pickup').isEnabled()) {
      fulfillment = 'pickup'
    } else {
      return { outcome: 'not_purchased', reason: 'unavailable', message: 'The requested fulfillment method is unavailable in the cart. No order was placed.' }
    }
  }
  if (fulfillment === 'pickup') {
    const location = await choice('pickup').locator('..').innerText()
    if (!request.pickup || !location.includes(`Pickup at ${request.pickup.store_name}`)) throw new Error('The displayed pickup store does not match the authorized location')
    await a.record('review', `Confirmed pickup at ${request.pickup.store_name}`)
  }
  if (!await choice(fulfillment).isChecked()) {
    await choice(fulfillment).check()
    await page.waitForLoadState('domcontentloaded')
    await a.record('fulfillment', `Switch the cart to ${fulfillment}`)
  }
  const quantity = row.locator('select[name="qty"]')
  if (await quantity.inputValue() !== String(request.quantity)) {
    await quantity.selectOption(String(request.quantity))
    await page.waitForLoadState('domcontentloaded')
    await a.record('quantity', `Set item quantity to ${request.quantity}`)
  }
  await a.record('review', `Verified exactly ${request.quantity} requested game(s), with no extra cart items`)
  return null
}

async function bestbuyPayment(page, request, a) {
  const cards = [request.payment, ...(request.backup_payment ? [request.backup_payment] : [])]
  for (let attempt = 0; attempt < cards.length; attempt++) {
    const decline = await a.budget('.bb-checkout-total', request)
    if (decline) return decline
    const card = cards[attempt]
    await a.fill('number', card.number)
    await a.fill('expirationDate', card.expiry)
    await a.fill('cvv', card.cvv)
    if (await page.locator('input[name="billingFirstName"]').isVisible()) {
      const billing = request.billing_address || request.shipping_address
      for (const [name, value] of Object.entries({ billingFirstName: request.customer.first_name, billingLastName: request.customer.last_name, billingAddressLine1: billing.line1, billingCity: billing.city, billingPostalCode: billing.postal_code })) await a.fill(name, value)
      if (billing.line2) {
        const apartment = page.locator('.payment-component-billing-address details')
        if (await apartment.getAttribute('open') === null) await a.click(apartment.locator('summary'), 'Open the optional billing address line')
        await a.fill('billingAddressLine2', billing.line2)
      }
      await page.locator('select[name="billingState"]').selectOption(billing.state)
    }
    await a.record('payment', attempt ? 'Enter the authorized backup test card after the displayed rejection' : 'Enter the supplied primary test card details')
    await a.click(page.getByRole('button', { name: 'Place order', exact: true }), 'Place the reviewed order')
    if (await page.getByRole('heading', { name: 'Thanks for your order!', exact: true }).isVisible()) return a.completed('Thanks for your order!')
    const errors = (await page.locator('.bb-error:visible, .bb-notice:visible').allTextContents()).join(' ')
    if (!/\bdeclined\b/i.test(errors)) throw new Error(`Checkout did not confirm the purchase: ${errors || 'No visible error message'}`)
    await a.record('payment_declined', 'Observed the store rejection of the submitted payment')
    if (attempt + 1 === cards.length) return { outcome: 'not_purchased', reason: 'payment_declined', message: 'The store declined the payment. No further authorized payment method is available, and no order was placed.' }
  }
}

async function unavailable(a, message) {
  await a.record('review', message)
  return { outcome: 'not_purchased', reason: 'unavailable', message: `${message} No order was placed.` }
}

async function submitPayment(page, request, a, { total, fields, button, confirmation, errors }) {
  const cards = [request.payment, ...(request.backup_payment ? [request.backup_payment] : [])]
  for (let attempt = 0; attempt < cards.length; attempt++) {
    const decline = await a.budget(total, request)
    if (decline) return decline
    for (const [field, key] of Object.entries(fields)) await a.fill(field, cards[attempt][key])
    await a.record('payment', attempt ? 'Enter the authorized backup test card after the displayed rejection' : 'Enter the supplied primary test card details')
    await a.click(page.getByRole('button', { name: button, exact: typeof button === 'string' }), 'Place the reviewed order')
    if (await page.getByRole('heading', { name: confirmation, exact: true }).isVisible()) return a.completed(confirmation)
    const message = (await page.locator(errors).allTextContents()).join(' ')
    if (!/\bdeclined\b/i.test(message)) throw new Error(`Checkout did not confirm the purchase: ${message || 'No visible error message'}`)
    await a.record('payment_declined', 'Observed the store rejection of the submitted payment')
    if (attempt + 1 === cards.length) return { outcome: 'not_purchased', reason: 'payment_declined', message: 'The store declined the payment. No further authorized payment method is available, and no order was placed.' }
  }
}

async function bestbuy(page, request, a) {
  await a.search('st', 'Grand Theft Auto VI')
  if (request.edition !== 'standard') {
    await a.search('st', `Grand Theft Auto VI ${request.edition}`)
    // The search result itself, rather than a private catalog, establishes that
    // the requested edition is absent from this store's current UI.
    const matches = page.locator('.bb-tile-title a').filter({ hasText: /Grand Theft Auto VI/i })
    if (await matches.count()) throw new Error('An edition listing appeared; the reference baseline needs review before choosing it')
    return a.unsupported(`The store search offers no GTA VI ${request.edition} edition listing; no substitute was purchased.`)
  }
  const platform = request.platform === 'ps5' ? /PlayStation 5/i : /XBOX Series/i
  const product = page.locator('.bb-tile-title a').filter({ hasText: /^Grand Theft Auto VI -/i }).filter({ hasText: platform })
  await a.click(product, `Open GTA VI for ${platformLabel(request.platform)}`)
  const more = page.locator('.bb-about-more summary')
  if (await more.isVisible()) await a.click(more, 'Read the full product description')
  const description = await page.locator('.bb-about').innerText()
  if (request.format !== 'code-in-box' || !/download code inside the box/i.test(description)) {
    return a.unsupported('The visible listing describes a download code in a box, without a disc; it does not meet the requested format.')
  }
  await a.record('review', 'Confirmed the platform and code-in-box description')
  const fulfillment = request.fulfillment === 'pickup' ? 'pickup' : 'shipping'
  await page.locator(`input[name="fulfillment"][value="${fulfillment}"]`).check()
  await a.click(page.locator('.bb-buy-form').getByRole('button', { name: 'Pre-order', exact: true }), `Add the game for ${fulfillment}`)
  const unavailable = await bestbuyCart(page, request, a)
  if (unavailable) return unavailable
  await a.click(page.getByRole('button', { name: 'Checkout', exact: true }), 'Start checkout')
  await a.click(page.getByRole('button', { name: 'Continue as Guest', exact: true }), 'Choose guest checkout')
  await a.fill('emailAddress', request.customer.email)
  await a.fill('phoneNumber', request.customer.phone || '2025550100')
  await a.click(page.locator('form[action$="/checkout/contact"]').getByRole('button', { name: 'Continue', exact: true }), 'Submit contact details')
  const shipping = page.locator('form[action$="/checkout/shipping-address"]')
  if (await shipping.isVisible()) {
    const s = request.shipping_address
    await a.fill('firstName', request.customer.first_name)
    await a.fill('lastName', request.customer.last_name)
    await a.fill('addressLine1', s.line1)
    if (s.line2) {
      await a.click(page.locator('summary').filter({ hasText: 'Add Apt.' }), 'Open optional address line')
      await a.fill('addressLine2', s.line2)
    }
    await a.fill('city', s.city)
    await page.locator('select[name="state"]').selectOption(s.state)
    await a.fill('postalCode', s.postal_code)
    await a.click(shipping.getByRole('button', { name: 'Continue', exact: true }), 'Submit shipping address')
    await a.click(page.locator('form[action$="/checkout/shipping-details"]').getByRole('button', { name: 'Continue', exact: true }), 'Confirm free shipping')
  }
  const pickup = page.locator('form[action$="/checkout/pickup"]')
  if (await pickup.isVisible()) {
    const person = request.pickup?.person
    if (!person) throw new Error('Pickup requires an authorized pickup person')
    if (!(await pickup.locator('.bb-pickup-store').innerText()).includes(`Pickup at ${request.pickup.store_name}`)) throw new Error('Checkout changed the authorized pickup location')
    await a.click(pickup.locator('#changePickupPersonButton'), 'Set the authorized pickup person')
    for (const [name, value] of Object.entries({ firstName: person.first_name, lastName: person.last_name, emailAddress: person.email || request.customer.email, phoneNumber: person.phone || request.customer.phone })) await a.fill(name, value)
    await a.click(pickup.getByRole('button', { name: 'Confirm pickup person', exact: true }), 'Save the pickup person')
    await a.click(pickup.getByRole('button', { name: 'Continue', exact: true }), 'Confirm pickup details')
  }
  return bestbuyPayment(page, request, a)
}

async function gameUK(page, request, a) {
  const cookies = page.getByRole('button', { name: 'Reject all', exact: true })
  if (await cookies.isVisible()) await a.click(cookies, 'Dismiss optional cookies')
  await a.search('descriptionfilter', 'Grand Theft Auto VI')
  if (request.edition !== 'standard') {
    await a.search('descriptionfilter', `Grand Theft Auto VI ${request.edition}`)
    await page.getByRole('heading', { name: 'No matching products', exact: true }).waitFor()
    return a.unsupported(`The store search offers no GTA VI ${request.edition} edition listing; no substitute was purchased.`)
  }
  const platform = request.platform === 'ps5' ? /^PS5\s/ : /^Xbox\s/
  await a.click(page.locator('.gu-facets').getByRole('link', { name: platform }), `Filter results for ${platformLabel(request.platform)}`)
  const product = page.locator('.gu-tile-name').filter({ hasText: /^Grand Theft Auto VI$/ })
  await a.click(product, `Open GTA VI for ${platformLabel(request.platform)}`)
  const description = await page.locator('.gu-pdp-info').innerText()
  if (request.format !== 'code-in-box' || !/download code inside the box/i.test(description)) {
    return a.unsupported('The listing describes a download code in a box, without a disc; it does not meet the requested format.')
  }
  await a.record('review', 'Confirmed the selected platform, Standard edition and code-in-box description')
  await a.fill('qty', request.quantity)
  await a.click(page.getByRole('button', { name: 'Pre-order now', exact: true }), `Pre-order ${request.quantity} game(s)`)
  await a.click(page.getByRole('dialog').getByRole('button', { name: 'Add to bag', exact: true }), 'Accept the preorder notice')
  await a.click(page.getByRole('button', { name: "I'm Old Enough", exact: true }), 'Confirm the adult test shopper age gate')
  await a.click(page.getByRole('link', { name: 'View Bag', exact: true }), 'Review the bag')
  for (let index = await page.locator('.gu-line').count() - 1; index >= 0; index--) {
    const row = page.locator('.gu-line').nth(index)
    const title = await row.locator('.gu-line-name').innerText()
    const selectedPlatform = await row.locator('.gu-fine').first().innerText()
    if (title !== 'Grand Theft Auto VI' || !selectedPlatform.includes(request.platform === 'ps5' ? 'PS5' : 'XBS')) {
      await a.click(row.getByRole('button', { name: 'Remove', exact: true }), `Remove the unrequested cart item: ${title}, ${selectedPlatform}`)
    }
  }
  if (await page.locator('.gu-line').count() !== 1) throw new Error('Expected exactly one requested product row after reviewing the bag')
  const row = page.locator('.gu-line')
  const availability = (await row.locator('.gu-cart-availability').allTextContents()).join(' ')
  if (/Shipping unavailable/i.test(availability) && (!/Pickup available/i.test(availability) || (request.fulfillment !== 'pickup' && request.allowed_fallback !== 'pickup'))) return unavailable(a, 'The bag reports that the requested game is unavailable through an authorized fulfillment method.')
  for (let changes = 0; changes < 10; changes++) {
    const quantity = Number(await row.locator('.gu-qty > span').innerText())
    if (quantity === request.quantity) break
    await a.click(row.getByRole('button', { name: quantity > request.quantity ? 'Reduce quantity' : 'Increase quantity', exact: true }), `Correct the requested game quantity to ${request.quantity}`)
  }
  if (Number(await row.locator('.gu-qty > span').innerText()) !== request.quantity) throw new Error('Could not set the requested bag quantity')
  await a.record('review', `Verified exactly ${request.quantity} requested game(s), with no extra bag items`)
  await a.click(page.getByRole('button', { name: 'Continue Securely', exact: true }), 'Start secure checkout')
  await a.fill('email', request.customer.email)
  await a.click(page.getByRole('button', { name: 'Continue securely', exact: true }), 'Submit guest email')
  await a.click(page.getByRole('button', { name: 'Continue as guest', exact: true }), 'Choose guest checkout')
  const s = request.shipping_address
  for (const [name, value] of Object.entries({ firstName: request.customer.first_name, lastName: request.customer.last_name, postcode: s.postal_code, addressLine1: s.line1, addressLine2: s.line2 || '', town: s.city, county: s.state || '', mobile: request.customer.phone || '07700900123' })) await a.fill(name, value)
  await page.locator('select[name="country"]').selectOption(s.country)
  // Choose the least expensive available delivery choice using its displayed
  // price; disabled collection choices are excluded from the decision.
  const methods = page.locator('input[name="deliveryMethod"]:enabled')
  let cheapest = null
  for (let i = 0; i < await methods.count(); i++) {
    const method = methods.nth(i)
    if (await method.getAttribute('value') === 'collect') continue
    const cost = moneyValue(await method.locator('..').innerText())
    if (!cheapest || cost < cheapest.cost) cheapest = { locator: method, cost }
  }
  const collect = page.locator('input[name="deliveryMethod"][value="collect"]')
  if (request.fulfillment === 'pickup' || (!cheapest && request.allowed_fallback === 'pickup')) {
    if (!request.pickup || !await collect.isEnabled()) return unavailable(a, 'The checkout has no authorized pickup option available.')
    await collect.check()
    await page.locator('select[name="collectStore"]').selectOption({ label: request.pickup.store_name })
    const person = request.pickup.person
    for (const [name, value] of Object.entries({ pickupFirstName: person.first_name, pickupLastName: person.last_name, pickupEmail: person.email || request.customer.email, pickupPhone: person.phone || request.customer.phone })) await a.fill(name, value)
    await a.record('fulfillment', `Choose pickup at ${request.pickup.store_name} for the authorized pickup person`)
  } else {
    if (!cheapest) return unavailable(a, 'The checkout reports that all authorized shipping methods are unavailable.')
    await cheapest.locator.check()
  }
  await a.click(page.getByRole('button', { name: 'Continue to payment', exact: true }), 'Submit the address and authorized fulfillment details')
  return submitPayment(page, request, a, { total: '.gu-summary .gu-total', fields: { cardNumber: 'number', expiry: 'expiry', cvv: 'cvv', nameOnCard: 'name' }, button: 'Pay now', confirmation: 'Thank you for your order', errors: '.gu-error-summary:visible, .gu-error:visible' })
}

async function rockstar(page, request, a) {
  const cookies = page.getByRole('button', { name: 'REJECT ALL', exact: true })
  if (await cookies.isVisible()) await a.click(cookies, 'Dismiss optional cookies')
  if (await page.locator('.rs-cart-badge').isVisible()) {
    await a.click(page.locator('.rs-cart-link'), 'Inspect the existing cart before starting the direct preorder')
    while (await page.locator('.rs-line').count()) {
      const row = page.locator('.rs-line').first()
      const title = await row.locator('.rs-line-info > a').innerText()
      await a.click(row.getByRole('button', { name: 'Remove', exact: true }), `Remove the existing cart item before the requested direct preorder: ${title}`)
    }
    await a.record('review', 'Confirmed the existing cart is empty before ordering one copy through the direct preorder checkout')
    await a.click(page.getByRole('link', { name: 'Rockstar Store Home', exact: true }), 'Return to the store to select the requested game')
  }
  const product = page.locator('a[href$="/game/buy-gta-vi"]:visible').first()
  await a.click(product, 'Open the GTA VI product page')
  await a.click(page.locator('.rs-platform-btn').filter({ hasText: request.platform === 'ps5' ? 'PS5' : 'Xbox' }), `Select ${platformLabel(request.platform)}`)
  const physical = await page.locator('#code-in-box').innerText()
  if (request.edition !== 'standard') {
    const ultimate = page.locator('.rs-edition').filter({ has: page.getByRole('heading', { name: 'Ultimate Edition', exact: true }) })
    const destination = await ultimate.getByRole('link', { name: 'Pre-Order Now', exact: true }).getAttribute('href')
    if (!destination || !/\/(playstation-store|xbox-store)\//.test(destination) || !/download code inside the box/i.test(physical)) throw new Error('The displayed edition options changed; inspect before buying')
    return a.unsupported('The Ultimate Edition purchase link goes to a platform store, while the local physical code-in-box purchase has no Ultimate option. No substitute was purchased.')
  }
  if (request.format !== 'code-in-box' || !/download code inside the box/i.test(physical)) return a.unsupported('The displayed physical product contains a download code, without a disc; it does not meet the requested format.')
  if (request.quantity !== 1) throw new Error('The Rockstar code-in-box UI supports only one copy per checkout')
  await a.record('review', 'Confirmed the selected platform and code-in-box description')
  await a.click(page.locator('#code-in-box').getByRole('button', { name: /Pre-Order Now/ }), 'Start the physical preorder checkout')
  for (const [name, value] of Object.entries({ month: '1', day: '1', year: '1990' })) await page.locator(`select[name="${name}"]`).selectOption(value)
  await a.click(page.getByRole('button', { name: 'OK', exact: true }), 'Confirm the adult test shopper date of birth')
  await a.click(page.getByRole('button', { name: 'CONTINUE AS GUEST', exact: true }), 'Choose guest checkout')
  if (/Shipping unavailable/i.test((await page.locator('[role="alert"]:visible').allTextContents()).join(' '))) return unavailable(a, 'The store reports that the selected item became unavailable for shipping.')
  const consentClose = page.locator('.xs-consent-close')
  if (await consentClose.isVisible()) await a.click(consentClose, 'Dismiss optional Xsolla consent banner')
  const s = request.shipping_address
  await page.locator('select[name="country"]').selectOption(s.country)
  for (const [name, value] of Object.entries({ first_name: request.customer.first_name, last_name: request.customer.last_name, city: s.city, region: s.state, postal_code: s.postal_code, street_address: s.line1, apartment: s.line2 || '', phone: request.customer.phone || '2025550100', email: request.customer.email })) await a.fill(name, value)
  await a.click(page.getByRole('button', { name: 'CONTINUE', exact: true }), 'Submit the shipping address')
  const shipping = page.locator('input[name="shipping_method"][value="standard"]')
  const pickup = page.locator('input[name="shipping_method"][value="pickup"]')
  if (request.fulfillment === 'pickup' || (!await shipping.isEnabled() && request.allowed_fallback === 'pickup')) {
    if (!request.pickup || !await pickup.isVisible() || !await pickup.isEnabled()) return unavailable(a, 'The checkout has no authorized pickup option available.')
    await pickup.check()
    await page.locator('select[name="pickup_store"]').selectOption({ label: request.pickup.store_name })
    const person = request.pickup.person
    for (const [name, value] of Object.entries({ pickup_first_name: person.first_name, pickup_last_name: person.last_name, pickup_email: person.email || request.customer.email, pickup_phone: person.phone || request.customer.phone })) await a.fill(name, value)
    await a.record('fulfillment', `Choose pickup at ${request.pickup.store_name} for the authorized pickup person`)
  } else {
    if (!await shipping.isEnabled()) return unavailable(a, 'The checkout reports that shipping is unavailable.')
    await shipping.check()
  }
  await a.click(page.getByRole('button', { name: 'CONTINUE', exact: true }), 'Confirm the authorized fulfillment details')
  return submitPayment(page, request, a, { total: '.xs-order .xs-total', fields: { card_number: 'number', expiry: 'expiry', cvc: 'cvv', cardholder_name: 'name' }, button: /^Pay \$/, confirmation: 'Thank you for your purchase!', errors: '.rs-error:visible, .xs-tooltip:visible' })
}

export async function runBaseline(name, { page, task, startUrl, recordAction }) {
  if (!BASELINES.includes(name)) throw new Error(`Unknown baseline: ${name}`)
  await page.goto(startUrl, { waitUntil: 'domcontentloaded' })
  const a = browserActions(page, recordAction)
  await a.record('navigate', 'Open the assigned store')
  if (name === 'noop') return { outcome: 'not_purchased', reason: 'not_attempted', message: 'Visited the store without attempting a purchase.' }
  const journeys = { bestbuy, 'game-uk': gameUK, 'rockstar-store': rockstar }
  if (journeys[task.store]) return journeys[task.store](page, task.request, a)
  const modules = [
    [['amazon', 'gamestop', 'target', 'walmart'], './baselines-us.js', 'runUS'],
    [['playstation-store', 'xbox-store'], './baselines-digital.js', 'runDigital'],
    [['jb-hifi', 'eb-games-au', 'argos', 'smyths-toys', 'coupang', 'gmarket'], './baselines-international.js', 'runInternational'],
    [['chewy', 'ikea', 'nike', 'sephora', 'williams-sonoma'], './baselines-specialist.js', 'runSpecialist'],
  ]
  const selected = modules.find(([stores]) => stores.includes(task.store))
  if (!selected) throw new Error(`No reference journey for ${task.store}`)
  const module = await import(selected[1])
  return module[selected[2]]({ page, task, recordAction })
}
