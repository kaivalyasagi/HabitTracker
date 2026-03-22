import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/api/auth/me')
        .then(r => setUser(r.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (tokenData) => {
    localStorage.setItem('token', tokenData.access_token)
    setUser({
      id:                   tokenData.user_id,
      username:             tokenData.username,
      onboarding_completed: tokenData.onboarding_completed,
    })
    return tokenData
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const completeOnboarding = () => {
    setUser(prev => ({ ...prev, onboarding_completed: true }))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
