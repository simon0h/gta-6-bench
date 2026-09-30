// In-memory test accounts, per store. Every store seeds the same tester so
// a benchmark task can say "sign in with tester@example.com / Password123!".

export const TEST_ACCOUNT = {
  email: 'tester@example.com',
  password: 'Password123!',
  first_name: 'Alex',
  last_name: 'Tester',
  phone: '555-014-2026',
}

const byStore = new Map()

function bucket(store) {
  if (!byStore.has(store)) {
    byStore.set(store, new Map([[TEST_ACCOUNT.email.toLowerCase(), { ...TEST_ACCOUNT, id: `${store}-1`, created_at: new Date().toISOString(), addresses: [], payment_methods: [] }]]))
  }
  return byStore.get(store)
}

export function findAccount(store, email) {
  return bucket(store).get(String(email ?? '').trim().toLowerCase()) ?? null
}

export function authenticate(store, email, password) {
  const acct = findAccount(store, email)
  if (!acct || acct.password !== String(password ?? '')) return null
  return acct
}

export function createAccount(store, { email, password, first_name = '', last_name = '', phone = '', ...extra }) {
  const key = String(email ?? '').trim().toLowerCase()
  if (!key || !password) throw new Error('email and password are required')
  const b = bucket(store)
  if (b.has(key)) return { error: 'An account with this email already exists.' }
  const acct = { id: `${store}-${b.size + 1}`, email: key, password: String(password), first_name, last_name, phone, created_at: new Date().toISOString(), addresses: [], payment_methods: [], ...extra }
  b.set(key, acct)
  return acct
}

export function publicAccount(acct) {
  if (!acct) return null
  const { password, ...rest } = acct
  return rest
}

export function resetAccounts() { byStore.clear() }
