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
  const status = error.response?.status
  const detail = response?.errors ? Object.values(response.errors).flat().join(' ') : response?.message
  if (detail) return status ? `${status}: ${detail}` : detail
  if (status === 401) return '401: Sesi berakhir. Silakan login kembali.'
  if (status === 403) return '403: Anda tidak memiliki akses ke data ini.'
  if (status === 404) return '404: Data atau endpoint tidak ditemukan.'
  if (status === 422) return '422: Data yang dikirim belum valid.'
  if (status >= 500) return `${status}: Server sedang bermasalah.`
  return 'Terjadi kesalahan. Silakan coba lagi.'
}

export default api
