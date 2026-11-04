import { apiDownload, apiRequest } from './http.js'

export const documentsApi = {
  list: () => apiRequest('/documents'),
  upload: (formData) =>
    apiRequest('/documents', { method: 'POST', body: formData }),
  addVersion: (id, formData) =>
    apiRequest(`/documents/${id}/versions`, { method: 'POST', body: formData }),
  submit: (id) => apiRequest(`/documents/${id}/submit`, { method: 'POST' }),
  decide: (id, status, comment) =>
    apiRequest(`/documents/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ status: status.toLowerCase(), comment }),
    }),
  file: (id, version) => apiDownload(`/documents/${id}/file/${version}`),
}
