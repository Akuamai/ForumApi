import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const timerRef = useRef(null)

  const user = token ? jwtDecode(token) : null
  const role = user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
  const isAdmin = role === 'Admin' || (Array.isArray(role) && role.includes('Admin'))

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const scheduleLogout = (t) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const { exp } = jwtDecode(t)
    const ms = exp * 1000 - Date.now()
    if (ms <= 0) { logout(); return }
    timerRef.current = setTimeout(logout, ms)
  }

  const saveToken = (t) => {
    localStorage.setItem('token', t)
    setToken(t)
    scheduleLogout(t)
  }

  useEffect(() => {
    if (token) scheduleLogout(token)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, role, isAdmin, saveToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
