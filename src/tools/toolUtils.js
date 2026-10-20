const MAX_INPUT_LENGTH = 100_000
const MAX_DIFF_LINES = 800

function checkSize(value, label) {
  if (value.length > MAX_INPUT_LENGTH) throw new Error(`${label} must be 100,000 characters or fewer.`)
}

function decodeSegment(segment, label) {
  if (!/^[A-Za-z0-9_-]+$/.test(segment) || segment.length % 4 === 1) throw new Error(`Invalid JWT ${label} encoding.`)
  try {
    const binary = atob(segment.replace(/-/g, '+').replace(/_/g, '/'))
    const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, (char) => char.charCodeAt(0))))
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object')
    return value
  } catch {
    throw new Error(`JWT ${label} must contain a valid JSON object.`)
  }
}

export function decodeJwt(input, now = Date.now()) {
  const token = input.trim()
  checkSize(token, 'Token')
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Enter a JWT with three dot-separated segments.')
  if (!/^[A-Za-z0-9_-]*$/.test(parts[2]) || parts[2].length % 4 === 1) throw new Error('Invalid JWT signature encoding.')
  const header = decodeSegment(parts[0], 'header')
  const payload = decodeSegment(parts[1], 'payload')
  if (typeof header.alg !== 'string' || !header.alg) throw new Error('JWT header must include an algorithm (alg).')
  const dates = {}
  for (const claim of ['iat', 'nbf', 'exp']) {
    if (Object.hasOwn(payload, claim)) {
      if (typeof payload[claim] !== 'number' || !Number.isFinite(payload[claim]) || !Number.isFinite(new Date(payload[claim] * 1000).getTime())) {
        throw new Error(`JWT ${claim} must be a valid numeric timestamp in seconds.`)
      }
      dates[claim] = new Date(payload[claim] * 1000).toISOString()
    }
  }
  return { header, payload, dates, expired: payload.exp === undefined ? null : now >= payload.exp * 1000,
    notYetActive: payload.nbf !== undefined && now < payload.nbf * 1000 }
}

export function runRegex(pattern, flags, input) {
  if (!pattern) throw new Error('Enter a regular expression.')
  if (pattern.length > 1000) throw new Error('Pattern must be 1,000 characters or fewer.')
  checkSize(input, 'Test text')
  if (!/^[gimsu]*$/.test(flags) || new Set(flags).size !== flags.length) throw new Error('Use each supported flag (g, i, m, s, u) at most once.')
  const expression = new RegExp(pattern, flags)
  const matches = []
  let match
  let truncated = false
  while ((match = expression.exec(input)) !== null) {
    matches.push({ start: match.index, end: match.index + match[0].length, value: match[0],
      groups: match.slice(1).map((group) => group ?? null), namedGroups: match.groups ? { ...match.groups } : null })
    if (!expression.global) break
    if (matches.length >= 1000) { truncated = true; break }
    if (!match[0].length) {
      const point = input.codePointAt(expression.lastIndex)
      expression.lastIndex += expression.unicode && point > 0xffff ? 2 : 1
    }
  }
  return { matches, truncated }
}

function orderedJson(value) {
  if (Array.isArray(value)) return value.map(orderedJson)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, orderedJson(value[key])]))
  }
  return value
}

export function compareInputs(left, right, mode = 'text') {
  checkSize(left, 'Original input')
  checkSize(right, 'Updated input')
  if (mode === 'json') {
    try { left = JSON.stringify(orderedJson(JSON.parse(left)), null, 2) } catch { throw new Error('Original input is not valid JSON.') }
    try { right = JSON.stringify(orderedJson(JSON.parse(right)), null, 2) } catch { throw new Error('Updated input is not valid JSON.') }
  }
  const oldLines = left === '' ? [] : left.split(/\r?\n/)
  const newLines = right === '' ? [] : right.split(/\r?\n/)
  if (oldLines.length > MAX_DIFF_LINES || newLines.length > MAX_DIFF_LINES) throw new Error('Compare up to 800 lines per input.')
  const matrix = Array.from({ length: oldLines.length + 1 }, () => new Uint16Array(newLines.length + 1))
  for (let i = oldLines.length - 1; i >= 0; i--) {
    for (let j = newLines.length - 1; j >= 0; j--) {
      matrix[i][j] = oldLines[i] === newLines[j] ? matrix[i + 1][j + 1] + 1 : Math.max(matrix[i + 1][j], matrix[i][j + 1])
    }
  }
  const lines = []
  let i = 0
  let j = 0
  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      lines.push({ type: 'same', value: oldLines[i], oldLine: ++i, newLine: ++j })
    } else if (i < oldLines.length && (j === newLines.length || matrix[i + 1][j] >= matrix[i][j + 1])) {
      lines.push({ type: 'removed', value: oldLines[i], oldLine: ++i, newLine: null })
    } else {
      lines.push({ type: 'added', value: newLines[j], oldLine: null, newLine: ++j })
    }
  }
  return { lines, added: lines.filter((line) => line.type === 'added').length,
    removed: lines.filter((line) => line.type === 'removed').length }
}
