import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const getApiError = (error) => {
  const response = error.response?.data
  if (response?.errors) return Object.values(response.errors).flat().join(' ')
  return response?.message || 'Terjadi kesalahan. Silakan coba lagi.'
}

export default api
