import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { setAccessToken } from '../lib/axios'
import { API_URL } from '../config'

export type AuthContextValue = {
  isAuthenticated: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
  ready: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const hydrate = async () => {
      try {
        const { data } = await axios.post(
          `${API_URL}/Account/refresh`,
          {},
          { 
            withCredentials: true,
            timeout: 10000 // 10 second timeout
          },
        )
        const newToken: string | null = data?.accessToken || data?.token || null
        if (!mounted) return
        setAccessToken(newToken)
        setToken(newToken)
        setError(null)
      } catch (err) {
        if (!mounted) return
        setAccessToken(null)
        setToken(null)
        setError(null)
      } finally {
        if (!mounted) return
        setReady(true)
      }
    }
    hydrate()
    return () => {
      mounted = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      ready,
      error,
      login: (newToken: string) => {
        setAccessToken(newToken)
        setToken(newToken)
        setError(null)
      },
      logout: () => {
        axios
          .post(`${API_URL}/Account/logout`, {}, { withCredentials: true })
          .catch(() => {})
          .finally(() => {
            setAccessToken(null)
            setToken(null)
            setError(null)
          })
      },
    }),
    [token, ready, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
