import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || ''

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('sb_token'))
  const [loading, setLoading] = useState(true)

  const authAxios = useMemo(() => {
    const instance = axios.create({ baseURL: API_URL })
    instance.interceptors.request.use(config => {
      const t = localStorage.getItem('sb_token')
      if (t) config.headers.Authorization = `Bearer ${t}`
      return config
    })
    instance.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) {
          localStorage.removeItem('sb_token')
          setToken(null)
          setUser(null)
        }
        return Promise.reject(err)
      }
    )
    return instance
  }, [])

  const fetchMe = useCallback(async () => {
    try {
      const res = await authAxios.get('/api/auth/me')
      setUser(res.data)
    } catch {
      localStorage.removeItem('sb_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [authAxios])

  useEffect(() => {
    if (token) {
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [token, fetchMe])

  const login = async (email, password) => {
    const res = await authAxios.post('/api/auth/login', { email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('sb_token', t)
    setToken(t)
    setUser(u)
    return u
  }

  const signup = async (name, email, password) => {
    const res = await authAxios.post('/api/auth/signup', { name, email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('sb_token', t)
    setToken(t)
    setUser(u)
    return { user: u, is_new: res.data.is_new }
  }

  const googleLogin = async (credential) => {
    const res = await authAxios.post('/api/auth/google', { credential })
    const { token: t, user: u, is_new } = res.data
    localStorage.setItem('sb_token', t)
    setToken(t)
    setUser(u)
    return { user: u, is_new }
  }

  const logout = () => {
    localStorage.removeItem('sb_token')
    setToken(null)
    setUser(null)
    toast('Signed out. See you soon! 👋')
  }

  const refreshUser = async () => {
    const res = await authAxios.get('/api/users/me')
    setUser(res.data)
    return res.data
  }

  const updateUser = async (data) => {
    const res = await authAxios.patch('/api/users/me', data)
    setUser(res.data)
    return res.data
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, signup, googleLogin, logout,
      refreshUser, updateUser, authAxios,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
