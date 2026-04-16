import axios from 'axios'
import { API_URL } from '../config'

// In-memory access token; refreshed via HttpOnly refresh cookie
let accessToken: string | null = null

export const setAccessToken = (t: string | null) => {
  accessToken = t
}

export const getStoredToken = () => accessToken

export const http = axios.create({ baseURL: API_URL, withCredentials: true })

http.interceptors.request.use(cfg => {
  if (accessToken) {
    cfg.headers = {
      ...(cfg.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    } as any
  }
  return cfg
})

let isRefreshing = false
let waiters: Array<(t: string | null) => void> = []

http.interceptors.response.use(
  r => r,
  async (error) => {
    const original: any = error?.config || {}
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        try {
          const { data } = await axios.post(
            `${API_URL}/Account/refresh`,
            {},
            { withCredentials: true },
          )
          const newToken: string | null = data?.accessToken || data?.token || null
          setAccessToken(newToken)
          waiters.forEach(w => w(newToken))
          waiters = []
          if (newToken) return http(original)
        } catch (e) {
          setAccessToken(null)
          waiters.forEach(w => w(null))
          waiters = []
          return Promise.reject(e)
        } finally {
          isRefreshing = false
        }
      }

      return new Promise((resolve, reject) => {
        waiters.push((token) => {
          if (token) {
            original.headers = original.headers || {}
            original.headers.Authorization = `Bearer ${token}`
            resolve(http(original))
          } else {
            reject(error)
          }
        })
      })
    }
    return Promise.reject(error)
  }
)


