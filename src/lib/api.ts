import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://motorsss-superwebman.pythonanywhere.com/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Inject access token on each request
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = Cookies.get('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh })
          Cookies.set('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          Cookies.remove('access_token')
          Cookies.remove('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/token/', { email, password }),
  register: (data: { email: string; password: string; first_name: string; last_name: string }) =>
    api.post('/auth/register/', data),
  me: () => api.get('/auth/me/'),
}

// Vehicles
export const vehiclesAPI = {
  list: (params?: Record<string, string | number>) =>
    api.get('/vehicles/', { params }),
  get: (id: number) => api.get(`/vehicles/${id}/`),
  create: (data: FormData) =>
    api.post('/vehicles/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: FormData) =>
    api.patch(`/vehicles/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: number) => api.delete(`/vehicles/${id}/`),
  switchType: (id: number) => api.post(`/vehicles/${id}/switch_type/`),
}

// Dossiers
export const dossiersAPI = {
  list: () => api.get('/dossiers/'),
  get: (id: number) => api.get(`/dossiers/${id}/`),
  create: (data: FormData) =>
    api.post('/dossiers/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadDocument: (id: number, file: File, nom: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('nom', nom)
    return api.post(`/dossiers/${id}/upload_document/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  validate: (id: number) => api.post(`/dossiers/${id}/valider/`),
  refuse: (id: number, motif: string) => api.post(`/dossiers/${id}/refuser/`, { motif }),
  // Admin
  adminList: (params?: Record<string, string>) => api.get('/admin/dossiers/', { params }),
}
