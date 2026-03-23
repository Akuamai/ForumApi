import { createContext, useContext, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))

  const user = token ? jwtDecode(token) : null
  const role = user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
  const isAdmin = role === 'Admin' || (Array.isArray(role) && role.includes('Admin'))

  const saveToken = (t) => {
    localStorage.setItem('token', t)
    setToken(t)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, role, isAdmin, saveToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
