export const APP_ROUTES = {
  image: 'app/image',
  web: 'app/web',
  jwt: 'app/jwt',
  regex: 'app/regex',
  diff: 'app/diff',
  landing: 'landing',
  dashboard: 'app/dashboard',
  base64: 'app/base64',
  json: 'app/json',
  hash: 'app/hash',
  text: 'app/text',
  timestamp: 'app/timestamp',
  number: 'app/number',
  escape: 'app/escape',
  uuid: 'app/uuid',
  color: 'app/color',
  file: 'app/file',
  pdf: 'app/pdf',
}

export function normalizeHashRoute(hash) {
  const value = hash.replace(/^#\/?/, '').trim()
  if (value === 'dashboard') return APP_ROUTES.dashboard
  if (value.startsWith('tools/')) return `app/${value.slice(6)}`
  return value || APP_ROUTES.landing
}

export function toHash(route) {
  return route === APP_ROUTES.landing ? '#/' : `#/${route}`
}
