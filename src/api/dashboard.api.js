import { apiRequest } from './http.js'

export const dashboardApi = {
  stats: () => apiRequest('/dashboard/stats'),
}
