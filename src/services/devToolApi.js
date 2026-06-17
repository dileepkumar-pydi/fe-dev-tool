const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://dev-tool-service.onrender.com/v1/dev-tool'

async function apiRequest(path, { method = 'GET', body, headers, isFormData = false } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: isFormData
      ? headers
      : {
          'Content-Type': 'application/json',
          ...headers,
        },
    body: body
      ? isFormData
        ? body
        : JSON.stringify(body)
      : undefined,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      payload?.status?.description || payload?.data?.message || 'Something went wrong while calling the API.',
    )
  }

  return payload
}

export function base64EncodeText(value) {
  return apiRequest('/api/base64/encode/text', {
    method: 'POST',
    body: { value },
  })
}

export function base64DecodeText(value) {
  return apiRequest('/api/base64/decode/text', {
    method: 'POST',
    body: { value },
  })
}

export function formatJson(value) {
  return apiRequest('/api/json/format', {
    method: 'POST',
    body: { value },
  })
}

export function minifyJson(value) {
  return apiRequest('/api/json/minify', {
    method: 'POST',
    body: { value },
  })
}

export function validateJson(value) {
  return apiRequest('/api/json/validate', {
    method: 'POST',
    body: { value },
  })
}

export function generateHash(value, algorithm) {
  return apiRequest('/api/hash/digest', {
    method: 'POST',
    body: { value, algorithm },
  })
}

export function transformTextCase(value, targetCase) {
  return apiRequest('/api/text/case', {
    method: 'POST',
    body: { value, targetCase },
  })
}

export function fetchTextStats(value) {
  return apiRequest('/api/text/stats', {
    method: 'POST',
    body: { value },
  })
}

export function convertTimestampToDate(timestamp, zoneId = 'UTC') {
  return apiRequest('/api/timestamp/to-date', {
    method: 'POST',
    body: { timestamp, zoneId },
  })
}

export function convertDateToTimestamp(dateTime, zoneId = 'UTC') {
  return apiRequest('/api/timestamp/to-timestamp', {
    method: 'POST',
    body: { dateTime, zoneId },
  })
}

export function convertColorFromHex(value) {
  return apiRequest('/api/color/from-hex', {
    method: 'POST',
    body: { value },
  })
}

export function convertNumberBase(value, sourceBase, targetBase) {
  return apiRequest('/api/number-base/convert', {
    method: 'POST',
    body: { value, sourceBase, targetBase },
  })
}

export function escapeValue(type, mode, value) {
  return apiRequest(`/api/escape/${type}/${mode}`, {
    method: 'POST',
    body: { value },
  })
}

export function generateUuid() {
  return apiRequest('/api/uuid/generate', {
    method: 'POST',
  })
}

export function validateUuid(value) {
  return apiRequest('/api/uuid/validate', {
    method: 'POST',
    body: { value },
  })
}

export function inspectFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest('/api/file/inspect', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}
