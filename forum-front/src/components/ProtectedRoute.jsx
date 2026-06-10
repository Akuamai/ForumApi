import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Protège une route : redirige vers /login si non connecté, vers /events si non admin (quand adminOnly=true)
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { token, isAdmin } = useAuth()
  if (!token) return <Navigate to="/login" />
  if (adminOnly && !isAdmin) return <Navigate to="/events" />
  return children
}
