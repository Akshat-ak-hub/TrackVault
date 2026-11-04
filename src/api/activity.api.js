import { apiRequest } from './http.js'

export const activityApi = {
  list: () => apiRequest('/activity?limit=100'),
}
