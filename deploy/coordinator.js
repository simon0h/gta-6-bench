// Node's storefront state is process-local. Commit a checkpoint before returning
// each dynamic response, and restore that checkpoint whenever the process starts.
export const STATE_LIMIT = 16 * 1024 * 1024
export const RESPONSE_LIMIT = 16 * 1024 * 1024

export async function readBounded(response, limit) {
  if (Number(response.headers.get('content-length')) > limit) {
    await response.body?.cancel()
    throw new Error('Hosting payload exceeds its configured limit')
  }
  if (!response.body) return new Uint8Array()
  const reader = response.body.getReader()
  const chunks = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > limit) throw new Error('Hosting payload exceeds its configured limit')
      chunks.push(value)
    }
  } catch (error) {
    await reader.cancel().catch(() => {})
    throw error
  } finally {
    reader.releaseLock()
  }
  const output = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.byteLength }
  return output
}

// Rows to write so the checkpoint table matches state. Only changed rows are
// written: Cloudflare bills each row written, and most requests change one or two.
export function checkpointChanges(rows, state, kinds) {
  const saved = new Map(), counts = new Map()
  for (const row of rows) {
    saved.set(`${row.kind}\n${row.ordinal}`, row.value)
    counts.set(row.kind, Math.max(counts.get(row.kind) ?? 0, row.ordinal + 1))
  }
  const writes = [], trims = []
  for (const kind of kinds) {
    for (const [ordinal, item] of state[kind].entries()) {
      const value = JSON.stringify(item)
      if (saved.get(`${kind}\n${ordinal}`) !== value) writes.push({ kind, ordinal, value })
    }
    if ((counts.get(kind) ?? 0) > state[kind].length) trims.push({ kind, from: state[kind].length })
  }
  for (const kind of counts.keys()) if (!kinds.includes(kind)) trims.push({ kind, from: 0 })
  return { writes, trims }
}

export function isStaticRequest(request) {
  if (!['GET', 'HEAD'].includes(request.method)) return false
  // Trial assets pass through a session middleware in their isolated worker.
  if (/(?:^|;)\s*bench_attempt=/.test(request.headers.get('cookie') || '')) return false
  const pathname = new URL(request.url).pathname
  return /^\/static\//.test(pathname) || /^\/[a-z0-9-]+\/static\//.test(pathname)
}

export class CheckpointCoordinator {
  constructor({ prepare, forward, snapshot, save, invalidate }) {
    Object.assign(this, { prepare, forward, snapshot, save, invalidate })
    this.queue = Promise.resolve()
  }

  fetch(request) {
    const operation = this.queue.then(async () => {
      try {
        await this.prepare()
        const response = await this.forward(request)
        const body = await readBounded(response, RESPONSE_LIMIT)
        // GET handlers also create sessions and change account/cart state.
        await this.save(await this.snapshot())
        return new Response(['HEAD'].includes(request.method) || [204, 205, 304].includes(response.status) ? null : body, response)
      } catch (error) {
        await this.invalidate().catch(() => {})
        throw error
      }
    })
    // A failed request must not poison the queue or trigger a replay of a POST.
    this.queue = operation.catch(() => {})
    return operation
  }
}
