import { gzipSync, gunzipSync } from 'node:zlib'

// A replay is the page itself as the agent saw it (layout, scrolling, pointer,
// clicks and typed text with card fields masked by the recorder). Chunks are
// stored compressed and read back in order; they are never used for grading.
export const REPLAY_LIMITS = {
  upload: 1024 * 1024, // compressed or plain request body
  expanded: 16 * 1024 * 1024, // events JSON after decompression
  chunk: 1024 * 1024, // stored gzip bytes; stays under a SQLite row limit as base64
  trial: 48 * 1024 * 1024, // stored gzip bytes per task
  chunks: 4000,
  events: 50000,
  read: 8 * 1024 * 1024, // gzip bytes returned per page of chunks
}
const KEYS = new Set(['trial_id', 'id', 'page_id', 'seq', 'at', 'elapsed_ms', 'count', 'bytes', 'data'])
const fail = (message, status = 400) => Object.assign(new Error(message), { status })
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/

/** Turn one browser upload (gzip bytes or a JSON array) into a stored chunk.
 * Secrets, such as the agent URL capability shown in the task link, are removed. */
export function replayChunk(body, secrets = []) {
  if (!Buffer.isBuffer(body) || !body.length) throw fail('Empty replay chunk')
  if (body.length > REPLAY_LIMITS.upload) throw fail('Replay chunk is too large', 413)
  const compressed = body[0] === 0x1f && body[1] === 0x8b
  let text
  try { text = (compressed ? gunzipSync(body, { maxOutputLength: REPLAY_LIMITS.expanded }) : body).toString('utf8') }
  catch { throw fail('Invalid replay chunk') }
  const redacted = secrets.filter(Boolean).reduce((value, secret) => value.split(secret).join('[task]'), text)
  let events
  try { events = JSON.parse(redacted) } catch { throw fail('Invalid replay chunk') }
  if (!Array.isArray(events) || !events.length || events.length > REPLAY_LIMITS.events
    || events.some(event => !event || typeof event !== 'object' || Array.isArray(event)
      || !Number.isInteger(event.type) || !Number.isFinite(event.timestamp))) throw fail('Invalid replay events')
  const data = compressed && redacted === text ? body : gzipSync(Buffer.from(redacted))
  if (data.length > REPLAY_LIMITS.chunk) throw fail('Replay chunk is too large', 413)
  return { count: events.length, bytes: data.length, data: data.toString('base64') }
}

export function validateReplayChunk(chunk, trial) {
  if (!chunk || typeof chunk !== 'object' || Array.isArray(chunk) || Object.keys(chunk).some(key => !KEYS.has(key))
    || chunk.trial_id !== trial.id || !trial.replay
    || !Number.isSafeInteger(chunk.id) || chunk.id < 1 || chunk.id > trial.replay.chunk_count
    || typeof chunk.page_id !== 'string' || !Number.isSafeInteger(chunk.seq) || chunk.seq < 1
    || typeof chunk.at !== 'string' || !Number.isFinite(Date.parse(chunk.at))
    || !Number.isSafeInteger(chunk.elapsed_ms) || chunk.elapsed_ms < 0
    || !Number.isSafeInteger(chunk.count) || chunk.count < 1
    || !Number.isSafeInteger(chunk.bytes) || chunk.bytes < 1 || chunk.bytes > REPLAY_LIMITS.chunk
    || typeof chunk.data !== 'string' || !BASE64.test(chunk.data)
    || Buffer.from(chunk.data, 'base64').length !== chunk.bytes) throw fail('Invalid replay chunk checkpoint')
}

export function validReplayMetadata(replay) {
  return replay && typeof replay === 'object' && !Array.isArray(replay) && replay.version === 1
    && Number.isSafeInteger(replay.chunk_count) && replay.chunk_count >= 0 && replay.chunk_count <= REPLAY_LIMITS.chunks
    && Number.isSafeInteger(replay.bytes) && replay.bytes >= 0 && replay.bytes <= REPLAY_LIMITS.trial
    && Object.keys(replay).every(key => ['version', 'chunk_count', 'bytes'].includes(key))
}

/** Take chunks in id order until the read budget is used (always at least one). */
export function replayPage(chunks, after) {
  const page = []
  let bytes = 0
  for (const chunk of chunks) {
    if (chunk.id <= after) continue
    if (page.length && bytes + chunk.bytes > REPLAY_LIMITS.read) break
    page.push(chunk); bytes += chunk.bytes
    if (page.length >= 200) break
  }
  return page
}
