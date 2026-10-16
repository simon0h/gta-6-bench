import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

// In-memory test accounts, per store. Every store seeds the same tester so
// a benchmark task can say "sign in with tester@example.com / Password123!".
// Passwords are kept only as salted scrypt hashes: the stores are public, and a
// visitor may type a password they use elsewhere.

export const TEST_ACCOUNT = {
  email: 'tester@example.com',
  password: 'Password123!',
  first_name: 'Alex',
  last_name: 'Tester',
  phone: '555-014-2026',
}

// Each store keeps the tester plus at most this many of the newest sign-ups,
// trimmed in batches so the hosting checkpoint is not rewritten on every sign-up.
export const MAX_ACCOUNTS_PER_STORE = 500
const KEPT_AFTER_TRIM = 400
const HASH = 'scrypt'
const byStore = new Map()

function hashPassword(password) {
  const salt = randomBytes(16)
  return `${HASH}:${salt.toString('base64url')}:${scryptSync(String(password), salt, 32, { N: 4096 }).toString('base64url')}`
}

function passwordMatches(stored, password) {
  const [kind, salt, hash, extra] = String(stored).split(':')
  // Checkpoints saved before hashing hold the plain password; they are hashed on import.
  if (kind !== HASH || !salt || !hash || extra !== undefined) return stored === password
  const expected = Buffer.from(hash, 'base64url')
  const actual = scryptSync(password, Buffer.from(salt, 'base64url'), expected.length, { N: 4096 })
  return timingSafeEqual(actual, expected)
}

// Pruned sign-ups leave gaps, so number from the highest id rather than the count.
const nextNumber = (store, b) => 1 + Math.max(b.size, ...[...b.values()].map(account => Number(account.id.slice(store.length + 1)) || 0))

const hashed = value => String(value).startsWith(`${HASH}:`) ? value : hashPassword(value)

function bucket(store) {
  if (!byStore.has(store)) {
    byStore.set(store, new Map([[TEST_ACCOUNT.email.toLowerCase(), { ...TEST_ACCOUNT, password: hashPassword(TEST_ACCOUNT.password), id: `${store}-1`, created_at: new Date().toISOString(), addresses: [], payment_methods: [] }]]))
  }
  return byStore.get(store)
}

export function findAccount(store, email) {
  return bucket(store).get(String(email ?? '').trim().toLowerCase()) ?? null
}

export function authenticate(store, email, password) {
  const acct = findAccount(store, email)
  if (!acct || !passwordMatches(acct.password, String(password ?? ''))) return null
  return acct
}

// Whether text contains the account's password as one of its words. Only the
// hash is kept, so each longer word is checked; the store's support form uses it.
export function passwordIn(store, email, text) {
  const acct = findAccount(store, email)
  if (!acct) return false
  const words = [...new Set(String(text ?? '').split(/\s+/).filter(word => word.length >= 6))].slice(0, 40)
  return words.some(word => passwordMatches(acct.password, word))
}

export function createAccount(store, { email, password, first_name = '', last_name = '', phone = '', ...extra }) {
  const key = String(email ?? '').trim().toLowerCase()
  if (!key || !password) throw new Error('email and password are required')
  const b = bucket(store)
  if (b.has(key)) return { error: 'An account with this email already exists.' }
  const acct = { id: `${store}-${nextNumber(store, b)}`, email: key, password: hashPassword(password), first_name, last_name, phone, created_at: new Date().toISOString(), addresses: [], payment_methods: [], ...extra }
  b.set(key, acct)
  if (b.size > MAX_ACCOUNTS_PER_STORE + 1) {
    for (const email of b.keys()) {
      if (b.size <= KEPT_AFTER_TRIM + 1) break
      if (email !== TEST_ACCOUNT.email.toLowerCase()) b.delete(email)
    }
  }
  return acct
}

export function publicAccount(acct) {
  if (!acct) return null
  const { password, ...rest } = acct
  return rest
}

export function resetAccounts() { byStore.clear() }

export function exportAccounts() {
  return structuredClone([...byStore].flatMap(([store, accounts]) =>
    [...accounts.values()].map(account => ({ store, account }))))
}

export function prepareAccountImport(snapshot) {
  if (!Array.isArray(snapshot)) throw new Error('Accounts must be an array')
  const next = new Map()
  for (const entry of structuredClone(snapshot)) {
    const { store, account } = entry || {}
    if (typeof store !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(store)
      || !account || typeof account !== 'object' || Array.isArray(account)
      || typeof account.id !== 'string' || !account.id
      || typeof account.email !== 'string' || !account.email.trim()
      || typeof account.password !== 'string' || !account.password) {
      throw new Error('Invalid account checkpoint')
    }
    const email = account.email.trim().toLowerCase()
    if (!next.has(store)) next.set(store, new Map())
    if (next.get(store).has(email)) throw new Error('Duplicate account checkpoint')
    next.get(store).set(email, { ...account, password: hashed(account.password) })
  }
  return () => {
    byStore.clear()
    for (const [store, accounts] of next) byStore.set(store, accounts)
  }
}
