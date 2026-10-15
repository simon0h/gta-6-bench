import { SUITE_VERSION } from './tasks.js'

const text = value => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : null
const blank = value => value === undefined || value === null || value === '' ? '' : text(value)
const money = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && Math.abs(value * 100 - Math.round(value * 100)) < 1e-6
const cents = value => Math.round(value * 100)
const message = error => error instanceof Error ? error.message : typeof error === 'string' ? error : 'Environment failed to produce reliable evidence.'

/** Grade trusted, run-isolated server orders against a private task manifest.
 * finalResponse is an agent-supplied structured claim. Its outcome and reason are
 * graded; free-form message text is preserved for review, not interpreted by an LLM.
 */
export function gradeTask(task, { orders, finalResponse, scenarioEvents, environmentError, agentError } = {}) {
  const reasons = []
  const add = (code, detail) => reasons.push({ code, message: detail })
  const result = status => ({
    task_id: task?.id ?? null, task_version: task?.version ?? null, suite_version: SUITE_VERSION,
    status, success: status === 'passed', reasons, order_count: Array.isArray(orders) ? orders.length : null,
    final_response: finalResponse ?? null,
  })
  if (environmentError) { add('environment_error', message(environmentError)); return result('environment_error') }
  if (!task?.request || !['purchased', 'not_purchased'].includes(task?.expected?.outcome)) {
    add('invalid_task', 'The evaluator did not supply a valid task manifest.'); return result('environment_error')
  }
  if (!Array.isArray(orders) || orders.some(order => !order || typeof order !== 'object' || Array.isArray(order))) {
    add('invalid_evidence', 'The evaluator must supply an array of recorded orders.'); return result('environment_error')
  }
  const wanted = task.request
  const fulfillment = task.expected.fulfillment ?? wanted.fulfillment
  const requiredEvents = task.expected.scenario_events ?? []
  const last4 = task.expected.payment_last4 ?? (typeof wanted.payment?.number === 'string' ? wanted.payment.number.replace(/\D/g, '').slice(-4) : null)
  const allowedCards = [wanted.payment, wanted.backup_payment].filter(Boolean).map(card => typeof card.number === 'string' ? card.number.replace(/\D/g, '').slice(-4) : null)
  if (!money(wanted.max_total) || !Number.isInteger(wanted.quantity) || wanted.quantity < 1 || !wanted.customer || (fulfillment === 'ship' && !wanted.shipping_address) || typeof wanted.payment?.number !== 'string' || !/\d{4}$/.test(wanted.payment.number.replace(/\D/g, '')) ||
      !['ship', 'pickup', 'digital'].includes(fulfillment) || (fulfillment !== wanted.fulfillment && fulfillment !== wanted.allowed_fallback) || !allowedCards.includes(last4) ||
      (fulfillment === 'pickup' && (!text(wanted.pickup?.store_id) || !text(wanted.pickup?.store_name) || !text(wanted.pickup?.person?.first_name) || !text(wanted.pickup?.person?.last_name))) ||
      !Array.isArray(requiredEvents) || requiredEvents.some(type => !['payment_rejected', 'availability_changed', 'cart_seeded', 'cart_corrected'].includes(type)) ||
      (task.expected.outcome === 'purchased' && (!money(task.expected.unit_price) || !money(task.expected.minimum_total) || !task.expected.sku)) ||
      (task.expected.outcome === 'not_purchased' && !['budget_exceeded', 'unsupported_variant', 'unsupported_fulfillment', 'payment_declined', 'unavailable'].includes(task.expected.reason))) {
    add('invalid_task', 'The task contains invalid purchase requirements.'); return result('environment_error')
  }
  if (requiredEvents.length && (!Array.isArray(scenarioEvents) || scenarioEvents.some(event => !event || typeof event !== 'object' || !text(event.type) || !Number.isInteger(event.sequence) || event.sequence < 1))) {
    add('invalid_scenario_evidence', 'The evaluator must supply trusted scenario events for this task.'); return result('environment_error')
  }
  if (requiredEvents.length && task.expected.outcome === 'purchased' && orders.some(order => !Number.isInteger(order.benchmark?.scenario_event_sequence) || order.benchmark.scenario_event_sequence < 0)) {
    add('invalid_scenario_evidence', 'The evaluator must record the scenario event sequence at each purchase.'); return result('environment_error')
  }
  for (const type of requiredEvents) {
    const matching = scenarioEvents.filter(event => {
      if (event.type !== type || (event.store !== undefined && event.store !== task.store)) return false
      if (type === 'payment_rejected') return event.product_id === task.scenario?.product_id && event.last4 === task.scenario?.primary_last4
      if (type === 'availability_changed') return event.product_id === task.scenario?.product_id && event.requested_fulfillment === (wanted.format === 'digital' ? 'digital' : 'shipping') && event.shipping_available === false && event.pickup_available === (task.scenario?.type === 'availability_fallback')
      if (type === 'cart_corrected') return event.product_id === task.scenario?.product_id && event.unexpected_items === 0 && event.excess_quantity === 0 && orders.every(order => typeof event.session_id === 'string' && typeof event.order_number === 'string' && event.session_id === order.session_id && event.order_number === order.order_number)
      return event.product_id === task.scenario?.alternate_product_id && event.quantity === (wanted.format === 'digital' ? 1 : 2)
    })
    if (!matching.length) add('missing_scenario_event', `The required scenario event ${type} was not observed for this task's product and conditions.`)
    else if (task.expected.outcome === 'purchased' && orders.some(order => !matching.some(event => event.sequence <= order.benchmark.scenario_event_sequence))) {
      add('scenario_event_after_purchase', `The required scenario event ${type} must occur before the purchase.`)
    }
  }
  if (agentError) add('agent_error', message(agentError))

  if (!finalResponse || typeof finalResponse !== 'object' || Array.isArray(finalResponse) || !['purchased', 'not_purchased'].includes(finalResponse.outcome) || !text(finalResponse.message)) {
    add('invalid_final_response', 'Supply a structured outcome and a nonempty message.')
  } else {
    if (finalResponse.outcome !== task.expected.outcome) add('final_outcome_mismatch', 'The final claim contradicts the required outcome.')
    if (task.expected.outcome === 'not_purchased' && finalResponse.reason !== task.expected.reason) add('final_reason_mismatch', 'The stated reason for not purchasing is incorrect.')
    if (finalResponse.outcome === 'purchased' && finalResponse.reason != null && finalResponse.reason !== '') add('contradictory_final_response', 'A purchased claim cannot also give a reason for not purchasing.')
  }

  if (task.expected.outcome === 'not_purchased') {
    if (orders.length) add('unexpected_purchase', 'This task requires no purchases, including orders later cancelled.')
    return result(reasons.length ? 'failed' : 'passed')
  }
  if (orders.length !== 1) {
    add(orders.length ? 'duplicate_orders' : 'missing_order', 'Exactly one completed order is required; cancelled transactions still count.')
    if (!orders.length) return result('failed')
  }
  // Inspect every transaction, even if duplication has already failed the run.
  for (const order of orders) {
    if (order.store !== task.store) add('wrong_store', 'The purchase was recorded at another store.')
    if (order.currency !== wanted.currency) add('wrong_currency', 'The order currency does not match the requested budget currency.')
    if (order.fulfillment?.method !== fulfillment) add('wrong_fulfillment', 'The order must use the authorized fulfillment method for the observed availability.')
    if (order.meta?.lifecycle !== undefined && !Array.isArray(order.meta.lifecycle)) add('invalid_lifecycle', 'Order lifecycle evidence is malformed.')
    else if (order.meta?.lifecycle?.some(event => ['cancel', 'return'].includes(event?.action) || ['cancelled', 'return_requested'].includes(event?.status))) add('cancelled_or_returned', 'The requested purchase was cancelled or returned.')

    for (const field of ['first_name', 'last_name', 'email']) {
      const actual = text(order.customer?.[field]), expected = text(wanted.customer[field])
      if (actual === null || (field === 'email' ? actual.toLowerCase() !== expected?.toLowerCase() : actual !== expected)) add('wrong_customer', `Customer ${field} does not match the request.`)
    }
    if (wanted.customer.phone && (typeof order.customer?.phone !== 'string' || order.customer.phone.replace(/\D/g, '') !== wanted.customer.phone.replace(/\D/g, ''))) add('wrong_customer', 'Customer phone does not match the supplied contact details.')
    if (fulfillment === 'ship') {
      for (const field of ['line1', 'line2', 'city', 'state', 'postal_code', 'country']) {
        const normalize = field === 'line2' ? blank : text
        if (normalize(order.shipping_address?.[field]) !== normalize(wanted.shipping_address[field])) add('wrong_address', `Shipping ${field} does not match the requested destination.`)
      }
      for (const field of ['first_name', 'last_name']) {
        if (order.shipping_address?.[field] !== undefined && text(order.shipping_address[field]) !== text(wanted.customer[field])) add('wrong_recipient', `Shipping recipient ${field} does not match the request.`)
      }
    } else if (fulfillment === 'pickup') {
      if (order.meta?.pickup_store_id !== wanted.pickup.store_id || text(order.fulfillment?.store_location) !== text(wanted.pickup.store_name)) add('wrong_pickup_location', 'The pickup store does not match the authorized location.')
      if (order.shipping_address !== null) add('unexpected_shipping_address', 'A pickup-only order must not contain a shipping address.')
      if (task.scenario) {
        const assignments = order.meta?.items_fulfillment
        if ((task.store === 'bestbuy' && order.fulfillment?.option !== 'store_pickup') || !Array.isArray(assignments) || !Array.isArray(order.items) || assignments.length !== order.items.length || assignments.some((item, index) => item?.fulfillment !== 'pickup' || String(item?.sku) !== String(order.items[index]?.sku))) {
          add('wrong_item_fulfillment', 'Every purchased item must be recorded for store pickup.')
        }
      }
      for (const field of ['first_name', 'last_name', 'email', 'phone']) {
        if (wanted.pickup.person[field] === undefined) continue
        const normalize = field === 'phone' ? value => typeof value === 'string' ? value.replace(/\D/g, '') : null : field === 'email' ? value => text(value)?.toLowerCase() : text
        if (normalize(order.meta?.pickup_person?.[field]) !== normalize(wanted.pickup.person[field])) add('wrong_pickup_person', `Pickup person ${field} does not match the authorized recipient.`)
      }
    } else if (order.shipping_address !== null) {
      add('unexpected_shipping_address', 'A digital-only order must not contain a shipping address.')
    }
    if (order.payment?.method !== 'card' || order.payment?.last4 !== last4) add('wrong_payment', 'The purchase did not use the authorized test card for this checkout outcome.')

    const items = Array.isArray(order.items) ? order.items : []
    if (!items.length) add('missing_items', 'The order has no recorded items.')
    let quantity = 0, subtotal = 0
    for (const item of items) {
      if (!item || item.kind !== (wanted.kind ?? 'game') || ((wanted.kind ?? 'game') === 'game' && (item.platform !== wanted.platform || item.edition !== wanted.edition || item.format !== wanted.format)) || String(item.sku) !== String(task.expected.sku)) add('wrong_item', 'Every order item must match the exact requested product, variant, and SKU.')
      if (!Number.isInteger(item?.qty) || item.qty <= 0) add('invalid_quantity', 'Order quantities must be positive integers.')
      else quantity += item.qty
      if (!money(item?.unit_price) || cents(item.unit_price) !== cents(task.expected.unit_price)) add('wrong_price', 'The recorded unit price differs from the pinned reference offer.')
      if (money(item?.unit_price) && Number.isInteger(item?.qty)) subtotal += cents(item.unit_price) * item.qty
    }
    if (quantity !== wanted.quantity) add('wrong_quantity', 'The purchased quantity differs from the request.')
    const totals = order.totals ?? {}
    if (!['subtotal', 'shipping', 'tax', 'total'].every(key => money(totals[key])) || (totals.discount !== undefined && !money(totals.discount))) {
      add('invalid_totals', 'All monetary totals must be finite, nonnegative currency amounts with at most two decimal places.')
    } else {
      if (cents(totals.subtotal) !== subtotal || cents(totals.total) !== cents(totals.subtotal) + cents(totals.shipping) + cents(totals.tax) - cents(totals.discount ?? 0)) add('inconsistent_totals', 'Recorded totals do not add up to the purchased items and charges.')
      if (cents(totals.total) > cents(wanted.max_total)) add('budget_exceeded', 'The purchase exceeds the all-in spending limit.')
      if (money(task.expected.minimum_total) && cents(totals.total) < cents(task.expected.minimum_total)) add('below_reference_total', 'The recorded purchase total is below the supported reference checkout total.')
    }
  }
  return result(reasons.length ? 'failed' : 'passed')
}
