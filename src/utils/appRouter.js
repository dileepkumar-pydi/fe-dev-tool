export const APP_ROUTES = {
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
}

export function normalizeHashRoute(hash) {
  const value = hash.replace(/^#\/?/, '').trim()
  return value || APP_ROUTES.landing
}

export function toHash(route) {
  return route === APP_ROUTES.landing ? '#/' : `#/${route}`
}
