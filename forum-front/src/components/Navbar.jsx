import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg forum-navbar">
      <div className="container">
        <Link className="navbar-brand forum-brand" to="/">
          <span className="brand-icon">⚡</span> ForumApp
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item">
              <Link className="nav-link" to="/events">Événements</Link>
            </li>
            {isAdmin && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/events">Gérer événements</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/users">Gérer utilisateurs</Link>
                </li>
              </>
            )}
            {user ? (
              <li className="nav-item">
                <button className="btn btn-forum-outline btn-sm" onClick={handleLogout}>
                  Déconnexion
                </button>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="btn btn-forum-outline btn-sm" to="/login">Connexion</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-forum btn-sm" to="/register">Inscription</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
