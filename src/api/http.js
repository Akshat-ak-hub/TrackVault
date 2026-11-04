const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export async function apiRequest(path, options = {}) {
  const token = window.sessionStorage.getItem('trackvault_token')
  const organizationId = window.sessionStorage.getItem(
    'trackvault_organization_id',
  )
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(organizationId ? { 'X-Organization-Id': organizationId } : {}),
      ...options.headers,
    },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.message ?? 'The request could not be completed')
  }
  return payload
}

export async function apiDownload(path) {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
  const token = window.sessionStorage.getItem('trackvault_token')
  const organizationId = window.sessionStorage.getItem(
    'trackvault_organization_id',
  )
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(organizationId ? { 'X-Organization-Id': organizationId } : {}),
    },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message ?? 'The file could not be downloaded')
  }
  return response.blob()
}
