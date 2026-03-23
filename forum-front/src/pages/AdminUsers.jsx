import { useEffect, useState } from 'react'
import { getUsers, getUser, assignRole, removeRole, getRoles } from '../api/admin'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    Promise.all([getUsers(), getRoles()])
      .then(([u, r]) => { setUsers(u.data); setRoles(r.data) })
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = async (id) => {
    const r = await getUser(id)
    setSelected(r.data)
  }

  const handleAssign = async (role) => {
    try {
      await assignRole(selected.id, role)
      const r = await getUser(selected.id)
      setSelected(r.data)
      setFeedback(`Rôle '${role}' assigné.`)
    } catch { setFeedback('Erreur ou rôle déjà attribué.') }
    setTimeout(() => setFeedback(''), 3000)
  }

  const handleRemove = async (role) => {
    try {
      await removeRole(selected.id, role)
      const r = await getUser(selected.id)
      setSelected(r.data)
      setFeedback(`Rôle '${role}' retiré.`)
    } catch { setFeedback('Erreur lors du retrait.') }
    setTimeout(() => setFeedback(''), 3000)
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>👥 Gestion des utilisateurs</h1>
          <p>Attribuez et retirez des rôles aux membres de la plateforme</p>
        </div>

        <div className="row g-4">
          <div className="col-md-5">
            <div className="admin-table-card">
              <h6 className="mb-3">Liste des utilisateurs</h6>
              <ul className="user-list">
                {users.map(u => (
                  <li key={u.id}
                    className={`user-list-item ${selected?.id === u.id ? 'active' : ''}`}
                    onClick={() => handleSelect(u.id)}>
                    <div className="user-avatar">{u.firstName?.[0]}{u.lastName?.[0]}</div>
                    <div>
                      <div className="user-name">{u.firstName} {u.lastName}</div>
                      <div className="user-email">{u.email}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-md-7">
            {selected ? (
              <div className="admin-form-card">
                <h6>Détail — {selected.firstName} {selected.lastName}</h6>
                <p className="text-muted small">{selected.email}</p>

                {feedback && <div className="alert alert-info py-1 small">{feedback}</div>}

                <div className="mb-3">
                  <label className="form-label">Rôles actuels</label>
                  <div className="d-flex flex-wrap gap-2">
                    {selected.roles?.length > 0 ? selected.roles.map(r => (
                      <span key={r} className="role-badge">
                        {r}
                        <button className="role-remove-btn" onClick={() => handleRemove(r)}>✕</button>
                      </span>
                    )) : <span className="text-muted small">Aucun rôle</span>}
                  </div>
                </div>

                <div>
                  <label className="form-label">Assigner un rôle</label>
                  <div className="d-flex flex-wrap gap-2">
                    {roles.filter(r => !selected.roles?.includes(r)).map(r => (
                      <button key={r} className="btn btn-sm btn-forum-outline" onClick={() => handleAssign(r)}>
                        + {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <span>👈</span>
                <p>Sélectionnez un utilisateur pour gérer ses rôles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
