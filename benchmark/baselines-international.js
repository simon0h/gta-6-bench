// Scripted reference journeys over rendered controls only. No evaluator APIs or
// catalog internals are available to these browser routines.
const stores = new Set(['jb-hifi', 'eb-games-au', 'argos', 'smyths-toys', 'coupang', 'gmarket'])
const abstain = (reason, message) => ({ outcome: 'not_purchased', reason, message })

function actions(page, recordAction) {
  const record = async (type, description) => recordAction?.({ type, description, url: page.url() })
  const click = async (locator, description) => { await locator.click(); await page.waitForLoadState('domcontentloaded'); await record('click', description) }
  const fill = async (fields, scope = page) => { for (const [name, value] of Object.entries(fields)) await scope.locator(`[name="${name}"]`).fill(String(value ?? '')) }
  const unavailable = async () => {
    if (await page.getByRole('heading', { name: 'Item unavailable', exact: true }).isVisible()) {
      await record('availability', 'Observed that shipping and authorized fulfillment are unavailable')
      return abstain('unavailable', 'The selected item became unavailable. No order was placed.')
    }
    return null
  }
  const budget = async (selector, request) => {
    const text = await page.locator(selector).last().innerText()
    const matches = [...text.replaceAll(',', '').matchAll(/(?:[£$₩]\s*([\d.]+)|([\d.]+)\s*원)/g)]
    if (!matches.length) throw new Error(`No checkout amount found in ${text}`)
    const total = Number(matches.at(-1)[1] || matches.at(-1)[2])
    await record('review', `Reviewed total ${request.currency} ${total} against budget ${request.max_total}`)
    return total > request.max_total + .001 ? abstain('budget_exceeded', 'The displayed total exceeds the supplied budget.') : null
  }
  const pay = async (request, fieldsFor, submit, after) => {
    for (const [index, card] of [request.payment, request.backup_payment].filter(Boolean).entries()) {
      await fill(fieldsFor(card))
      await record('payment', index ? 'Enter the authorized backup test card after rejection' : 'Enter the supplied primary test card')
      await submit()
      const alert = page.locator('[role="alert"]').filter({ hasText: /card was declined/i })
      if (await alert.count()) {
        await record('payment_declined', 'Observed the provider rejection and verified no confirmation appeared')
        if (index || !request.backup_payment) return abstain('payment_declined', 'The supplied card was declined. No purchase was completed.')
        continue
      }
      return after()
    }
    throw new Error('No authorized payment succeeded')
  }
  const done = async (heading) => { await page.getByRole('heading', { name: heading }).first().waitFor(); await record('confirmation', 'Observed the purchase confirmation'); return { outcome: 'purchased', message: 'Completed the requested purchase and observed the store confirmation.' } }
  return { record, click, fill, unavailable, budget, pay, done }
}

async function selectProduct(page, request, a, store) {
  const home = page.url()
  const cart = page.locator('a[href$="/cart"], a[href$="/trolley"]').filter({ visible: true }).first()
  if (await cart.count()) {
    await a.click(cart, 'Inspect the existing cart before selecting the requested product')
    const remove = page.locator('form[action$="/cart/update"] button[value="remove"], form[action$="/trolley/update"] button[value="remove"]')
    while (await remove.count()) await a.click(remove.first(), 'Remove the unrequested cart item before starting the requested order')
    await page.goto(home)
  }
  const query = page.locator('input[type="search"]:visible, input[name="keyword"]:visible').first()
  if (await query.count()) {
    await query.fill('Grand Theft Auto VI'); await query.press('Enter'); await page.waitForLoadState('domcontentloaded')
    await a.record('search', 'Search for the requested GTA VI game')
  }
  const platform = request.platform === 'ps5' ? /PS5|PlayStation 5/i : /Xbox/i
  let link = page.locator('main a').filter({ hasText: /Grand Theft Auto VI|GTA6|GTA 6/i }).filter({ hasText: platform }).first()
  if (store === 'jb-hifi') link = page.locator('article').filter({ hasText: /Grand Theft Auto VI/i }).filter({ hasText: platform }).locator('h3 a, h2 a').first()
  await a.click(link, 'Open the requested game and platform from the displayed results')
  const displayed = await page.locator('main').innerText()
  if (!/code.in.box|code in a box|download code|코드|Code in Box/i.test(displayed)) throw new Error('The selected product does not show the requested code-in-box format')
  await a.record('review', 'Verified the product platform and code-in-box format')
}

async function jb(page, r, a) {
  await selectProduct(page, r, a, 'jb-hifi')
  await a.click(page.locator('form[action$="/cart/add"]').getByRole('button', { name: /Pre-order/i }).first(), 'Add the requested preorder')
  await a.click(page.locator('.jb-modal a[href$="/checkout"], a[href$="/checkout"]:visible').first(), 'Continue to checkout')
  const lost = await a.unavailable(); if (lost) return lost
  if (r.fulfillment === 'pickup') {
    if (!(await page.locator('[name="delivery_method"][value="pickup"]').isDisabled())) throw new Error('Pickup support changed; inspect the store before abstaining')
    return abstain('unsupported_fulfillment', 'Retail-store pickup is not verified and its checkout option is disabled.')
  }
  const s = r.shipping_address, c = r.customer
  await a.fill({ email: c.email, first_name: c.first_name, last_name: c.last_name, address1: s.line1, address2: s.line2 || '', suburb: s.city, postcode: s.postal_code, phone: c.phone })
  await page.locator('select[name="state"]').selectOption(s.state)
  await a.click(page.getByRole('button', { name: 'Continue to shipping', exact: true }), 'Submit the recipient and shipping address')
  await page.locator('[name="shipping_method"][value="standard"]').check()
  await a.click(page.getByRole('button', { name: 'Continue to payment', exact: true }), 'Choose the displayed standard delivery')
  const budget = await a.budget('.jb-co-summary .jb-total, .jb-summary .jb-total', r); if (budget) return budget
  return a.pay(r, p => ({ card_number: p.number, card_expiry: p.expiry, card_cvv: p.cvv, card_name: p.name }), () => a.click(page.getByRole('button', { name: 'Pay now', exact: true }), 'Submit the reviewed payment'), () => a.done('Your order is confirmed'))
}

async function eb(page, r, a) {
  await selectProduct(page, r, a, 'eb-games-au')
  await a.click(page.locator('form[action$="/cart/add"]').getByRole('button', { name: /Preorder now/i }), 'Add the requested preorder')
  await a.click(page.locator('a[href$="/checkout"]:visible').first(), 'Continue to checkout')
  const lost = await a.unavailable(); if (lost) return lost
  await a.fill({ guest_email: r.customer.email })
  await a.click(page.getByRole('button', { name: 'Continue as Guest', exact: true }), 'Continue with the supplied guest contact')
  if (r.fulfillment === 'pickup') {
    if (await page.locator('select[name="method"] option[value="pickup"]').count()) throw new Error('Pickup support changed; inspect before abstaining')
    return abstain('unsupported_fulfillment', 'Store pickup availability is not verified; only Delivery is offered.')
  }
  const s = r.shipping_address, c = r.customer
  await a.fill({ first_name: c.first_name, last_name: c.last_name, phone: c.phone, address: s.line1, address_line2: s.line2 || '', suburb: s.city, postcode: s.postal_code })
  await page.locator('[name="state"]').selectOption(s.state)
  await page.locator('[name="shipping_method"]').selectOption('standard')
  await a.click(page.getByRole('button', { name: 'Continue to payment', exact: true }), 'Continue with standard delivery')
  const budget = await a.budget('.summary dd:nth-of-type(3)', r); if (budget) return budget
  await page.locator('[name="accept_deposit"]').check()
  return a.pay(r, p => ({ card_number: p.number, card_expiry: p.expiry, card_cvv: p.cvv, card_name: p.name }), () => a.click(page.getByRole('button', { name: 'Place order', exact: true }), 'Accept the preorder deposit and remaining balance terms'), () => a.done(/Thank you for your preorder/))
}

async function argos(page, r, a) {
  await selectProduct(page, r, a, 'argos')
  const stock = page.locator('form[action$="/stock"]')
  await a.fill({ postcode: r.shipping_address.postal_code }, stock)
  await a.click(stock.getByRole('button'), 'Check stock for the supplied postcode')
  const add = page.locator('form[action$="/trolley/add"]')
  await add.locator('[name="age_confirmed"]').check()
  await a.click(add.getByRole('button'), 'Add the requested preorder to the trolley')
  await a.click(page.getByRole('link', { name: 'Continue to checkout', exact: true }), 'Continue to checkout')
  const lost = await a.unavailable(); if (lost) return lost
  const guest = page.locator('form').filter({ has: page.locator('input[name="action"][value="guest"]') })
  await a.fill({ email: r.customer.email }, guest)
  await a.click(guest.getByRole('button'), 'Continue as guest')
  const ship = page.locator('[name="method"][value="ship"]')
  const fallback = await ship.isDisabled()
  if (fallback && r.allowed_fallback !== 'pickup') return abstain('unavailable', 'Shipping became unavailable and pickup is not authorized.')
  const pickup = r.fulfillment === 'pickup' || fallback
  if (pickup) {
    await page.locator('[name="method"][value="pickup"]').check()
    await page.locator('[name="collection_point"]').selectOption({ label: r.pickup.store_name })
    await a.fill(Object.fromEntries(Object.entries(r.pickup.person).map(([key, value]) => [`pickup_${key}`, value])))
    await a.record('fulfillment', 'Choose the authorized pickup store and named person after reviewing availability')
  }
  const s = r.shipping_address, c = r.customer
  await a.fill({ first_name: c.first_name, last_name: c.last_name, phone: c.phone, line1: s.line1, line2: s.line2 || '', city: s.city, postcode: s.postal_code })
  await a.click(page.getByRole('button', { name: 'Continue to payment', exact: true }), 'Review the delivery or collection details')
  const budget = await a.budget('.summary dd.total, .summary dd:last-child', r); if (budget) return budget
  await page.locator('[name="terms"]').check()
  return a.pay(r, p => ({ card_number: p.number, expiry: p.expiry, cvv: p.cvv, name_on_card: p.name }), () => a.click(page.getByRole('button', { name: /Pay now/ }), 'Submit the reviewed order'), () => a.done('Thanks for your order'))
}

async function smyths(page, r, a) {
  await selectProduct(page, r, a, 'smyths-toys')
  await a.click(page.locator('form[action$="/cart/add"]').getByRole('button', { name: 'Pre-order', exact: true }), 'Add the requested preorder')
  await a.click(page.getByRole('link', { name: 'Checkout', exact: true }).first(), 'Continue to checkout')
  const lost = await a.unavailable(); if (lost) return lost
  const guest = page.locator('form').filter({ has: page.locator('input[name="action"][value="guest"]') })
  await a.fill({ email: r.customer.email }, guest)
  await a.click(guest.getByRole('button'), 'Continue as guest')
  const fallback = await page.locator('[name="method"][value="ship"]').isDisabled()
  if (fallback && r.allowed_fallback !== 'pickup') return abstain('unavailable', 'Shipping became unavailable and pickup is not authorized.')
  const pickup = r.fulfillment === 'pickup' || fallback
  if (pickup) {
    await page.locator('[name="method"][value="pickup"]').check()
    await page.getByLabel(new RegExp(r.pickup.store_name)).check()
    await a.record('fulfillment', 'Select the authorized pickup location after reviewing fulfillment availability')
  }
  await a.click(page.getByRole('button', { name: 'Continue', exact: true }), 'Continue with the selected fulfillment method')
  const s = r.shipping_address, c = r.customer
  await a.fill({ first_name: c.first_name, last_name: c.last_name, email: c.email, phone: c.phone, line1: s.line1, line2: s.line2 || '', city: s.city, state: s.state || '', postal_code: s.postal_code })
  if (pickup) await a.fill(Object.fromEntries(Object.entries(r.pickup.person).map(([key, value]) => [`pickup_${key}`, value])))
  await a.click(page.getByRole('button', { name: 'Continue', exact: true }), 'Submit contact, address and any pickup recipient')
  const budget = await a.budget('.order-summary dd:last-child', r); if (budget) return budget
  return a.pay(r, p => ({ card_number: p.number, expiry: p.expiry, cvv: p.cvv, name_on_card: p.name }), async () => {
    await a.click(page.getByRole('button', { name: 'Continue', exact: true }), 'Save the supplied card for final order review')
    await page.locator('[name="terms"]').check()
    await a.click(page.getByRole('button', { name: 'Place Order', exact: true }), 'Place the reviewed order')
  }, () => a.done('Thank you for your order'))
}

async function korean(page, r, a, store) {
  await selectProduct(page, r, a, store)
  const form = page.locator('form[action$="/cart/add"]')
  const age = form.locator('[name="age_confirmed"]'); if (await age.count()) await age.check()
  const add = store === 'coupang' ? form.locator('button[name="intent"][value="cart"]') : form.locator('button[name="action"][value="cart"]')
  await a.click(add, 'Add the requested platform to the cart')
  if (store === 'coupang') await a.click(page.locator('a[href$="/cart"]:visible').first(), 'Inspect the current cart')
  const lost = await a.unavailable(); if (lost) return lost
  await a.click(page.getByRole('button', { name: '선택상품 주문하기', exact: true }), 'Continue with the selected cart item')
  if (store === 'coupang') {
    await a.click(page.getByRole('link', { name: '회원가입', exact: true }), 'Create the authorized test shopper account')
    const password = r.account?.password || 'BenchmarkAgent123!'
    await a.fill({ email: r.customer.email, password, password_confirm: password, first_name: [r.customer.first_name, r.customer.last_name].filter(Boolean).join(' '), phone: r.customer.phone })
    await page.locator('[name="agree"]').check()
    await a.click(page.getByRole('button', { name: '동의하고 가입하기', exact: true }), 'Accept account terms and continue to the order')
  } else {
    await a.click(page.getByRole('link', { name: '비회원으로 구매하기', exact: true }), 'Choose guest checkout')
    await a.fill({ guest_email: r.customer.email })
    await a.click(page.getByRole('button', { name: '비회원 구매하기', exact: true }), 'Continue with the supplied contact email')
  }
  if (r.fulfillment === 'pickup') {
    const text = await page.locator('main').innerText()
    if (!/배송/.test(text) || await page.locator('[name="method"][value="pickup"]').count()) throw new Error('Fulfillment controls changed; inspect before abstaining')
    await a.record('review', 'The checkout offers domestic shipping only and has no collection choice')
    return abstain('unsupported_fulfillment', 'This checkout offers domestic shipping only. Required pickup cannot be completed.')
  }
  const s = r.shipping_address, c = r.customer
  const common = { recipient: [c.first_name, c.last_name].filter(Boolean).join(' '), phone: c.phone, city: s.city }
  await a.fill(store === 'coupang' ? { ...common, postcode: s.postal_code, address: s.line1, address_detail: s.line2 || '' } : { ...common, postal_code: s.postal_code, line1: s.line1, line2: s.line2 || '' })
  const submit = page.getByRole('button', { name: /결제하기/ })
  const budget = await a.budget('button:has-text("결제하기")', r); if (budget) return budget
  await page.locator(`[name="${store === 'coupang' ? 'agree' : 'terms'}"]`).check()
  return a.pay(r, p => store === 'coupang' ? { card_number: p.number, card_expiry: p.expiry, card_cvv: p.cvv, card_name: p.name } : { card_number: p.number, expiry: p.expiry, cvv: p.cvv, name_on_card: p.name }, () => a.click(submit, 'Submit the reviewed domestic shipping order'), () => a.done('주문이 완료되었습니다.'))
}

export async function runInternational({ task, page, recordAction }) {
  if (!stores.has(task.store)) return null
  const a = actions(page, recordAction)
  const journeys = { 'jb-hifi': jb, 'eb-games-au': eb, argos, 'smyths-toys': smyths }
  return journeys[task.store] ? journeys[task.store](page, task.request, a) : korean(page, task.request, a, task.store)
}
