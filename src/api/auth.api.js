import { apiRequest } from './http.js'

export const authApi = {
  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (details) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(details),
    }),
  me: () => apiRequest('/auth/me'),
}
