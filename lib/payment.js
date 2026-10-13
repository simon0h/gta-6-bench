// Fake payment validation. Accepts any Luhn-valid card with a future expiry.
// Suggested test card: 4242 4242 4242 4242, any future MM/YY, any 3-digit CVV.

const scalar = value => typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))

// A task suite may pin card-expiry validation without changing timestamps or
// overriding the process clock. Reject misspelled or impossible dates loudly.
export function benchmarkDate(value = process.env.BENCHMARK_DATE) {
  if (value === undefined) return null
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('BENCHMARK_DATE must be a valid ISO date (YYYY-MM-DD)')
  }
  const date = new Date(`${value}T00:00:00.000Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('BENCHMARK_DATE must be a valid ISO date (YYYY-MM-DD)')
  }
  return date
}

export function luhn(num) {
  if (!scalar(num)) return false
  const formatted = String(num).trim()
  if (!/^[\d\s-]+$/.test(formatted)) return false
  const digits = formatted.replace(/[\s-]/g, '')
  if (digits.length < 12 || digits.length > 19) return false
  let sum = 0, dbl = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i])
    if (dbl) { d *= 2; if (d > 9) d -= 9 }
    sum += d; dbl = !dbl
  }
  return sum % 10 === 0
}

export function cardBrand(num) {
  if (!scalar(num)) return 'Card'
  const d = String(num).replace(/\D/g, '')
  if (/^4/.test(d)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'Mastercard'
  if (/^3[47]/.test(d)) return 'American Express'
  if (/^6(011|5)/.test(d)) return 'Discover'
  return 'Card'
}

export function last4(num) { return scalar(num) ? String(num).replace(/\D/g, '').slice(-4) : '' }

/**
 * Validate card fields. Accepts expiry as "MM/YY", "MM/YYYY", or separate month/year.
 * Returns { ok: true, brand, last4 } or { ok: false, errors: {field: message} }.
 */
export function validateCard({ number, expiry, exp_month, exp_year, cvv }) {
  const pinnedDate = benchmarkDate()
  const errors = {}
  if (!luhn(number)) errors.number = 'Enter a valid card number.'
  let m = exp_month, y = exp_year
  if ((m !== undefined && !scalar(m)) || (y !== undefined && !scalar(y))) {
    errors.expiry = 'Enter a valid expiration date.'
    m = undefined; y = undefined
  }
  if (expiry !== undefined && expiry !== null && expiry !== '') {
    const match = scalar(expiry) && String(expiry).trim().match(/^(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/)
    if (match) { m = match[1]; y = match[2] } else errors.expiry = 'Enter expiration as MM/YY.'
  }
  m = Number(m); y = Number(y)
  if (y < 100) y += 2000
  if (!Number.isInteger(m) || !(m >= 1 && m <= 12) || !Number.isInteger(y)) errors.expiry ??= 'Enter a valid expiration date.'
  else {
    const now = pinnedDate || new Date()
    const year = pinnedDate ? now.getUTCFullYear() : now.getFullYear()
    const month = (pinnedDate ? now.getUTCMonth() : now.getMonth()) + 1
    if (y < year || (y === year && m < month)) errors.expiry = 'This card has expired.'
  }
  if (!scalar(cvv) || !/^\d{3,4}$/.test(String(cvv).trim())) errors.cvv = 'Enter the 3 or 4 digit security code.'
  if (Object.keys(errors).length) return { ok: false, errors }
  return { ok: true, brand: cardBrand(number), last4: last4(number) }
}
