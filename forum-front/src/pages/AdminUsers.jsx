import { useEffect, useState } from 'react'
import { getUsers, getUser, createUser, updateUser, deleteUser, assignRole, removeRole, getRoles } from '../api/admin'

const emptyForm = { firstName: '', lastName: '', email: '', password: '', role: 'User' }
const emptyEdit = { firstName: '', lastName: '', email: '', newPassword: '' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState({ msg: '', type: '' })
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [createForm, setCreateForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState(emptyEdit)
  const [search, setSearch] = useState('')

  const load = async () => {
    const [u, r] = await Promise.all([getUsers(), getRoles()])
    setUsers(u.data)
    setRoles(r.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const notify = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback({ msg: '', type: '' }), 3000)
  }

  const handleSelect = async (id) => {
    const r = await getUser(id)
    setSelected(r.data)
    setEditForm({ firstName: r.data.firstName ?? '', lastName: r.data.lastName ?? '', email: r.data.email, newPassword: '' })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createUser(createForm)
      setShowCreate(false)
      setCreateForm(emptyForm)
      load()
      notify('Utilisateur créé.')
    } catch { notify('Erreur lors de la création.', 'danger') }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      await updateUser(selected.id, editForm)
      setShowEdit(false)
      load()
      const r = await getUser(selected.id)
      setSelected(r.data)
      notify('Utilisateur modifié.')
    } catch { notify('Erreur lors de la modification.', 'danger') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try {
      await deleteUser(id)
      setSelected(null)
      load()
      notify('Utilisateur supprimé.')
    } catch { notify('Erreur lors de la suppression.', 'danger') }
  }

  const handleAssign = async (role) => {
    try {
      await assignRole(selected.id, role)
      const r = await getUser(selected.id)
      setSelected(r.data)
      notify(`Rôle '${role}' assigné.`)
    } catch { notify('Erreur ou rôle déjà attribué.', 'danger') }
  }

  const handleRemove = async (role) => {
    try {
      await removeRole(selected.id, role)
      const r = await getUser(selected.id)
      setSelected(r.data)
      notify(`Rôle '${role}' retiré.`)
    } catch { notify('Erreur lors du retrait.', 'danger') }
  }

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header d-flex justify-content-between align-items-center">
          <div>
            <h1>👥 Gestion des utilisateurs</h1>
            <p>{users.length} membre(s) sur la plateforme</p>
          </div>
          <button className="btn btn-forum" onClick={() => { setShowCreate(true); setShowEdit(false) }}>
            + Nouvel utilisateur
          </button>
        </div>

        {feedback.msg && (
          <div className={`alert alert-${feedback.type} mb-3`}>{feedback.msg}</div>
        )}

        <div className="row g-4">
          {/* ── Liste ── */}
          <div className="col-md-5">
            <div className="admin-table-card">
              <input className="form-control forum-input mb-3" placeholder="🔍 Rechercher..."
                value={search} onChange={e => setSearch(e.target.value)} />
              <ul className="user-list">
                {filtered.map(u => (
                  <li key={u.id}
                    className={`user-list-item ${selected?.id === u.id ? 'active' : ''}`}
                    onClick={() => { handleSelect(u.id); setShowCreate(false); setShowEdit(false) }}>
                    <div className="user-avatar">{u.firstName?.[0]}{u.lastName?.[0]}</div>
                    <div className="flex-grow-1">
                      <div className="user-name">{u.firstName} {u.lastName}</div>
                      <div className="user-email">{u.email}</div>
                    </div>
                    <div className="d-flex gap-1">
                      {u.roles?.map(r => (
                        <span key={r} className="role-badge" style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem' }}>{r}</span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Détail / Formulaires ── */}
          <div className="col-md-7">

            {/* Créer */}
            {showCreate && (
              <div className="admin-form-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Créer un utilisateur</h6>
                  <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
                </div>
                <form onSubmit={handleCreate}>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label">Prénom</label>
                      <input className="form-control forum-input" required value={createForm.firstName}
                        onChange={e => setCreateForm({ ...createForm, firstName: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Nom</label>
                      <input className="form-control forum-input" required value={createForm.lastName}
                        onChange={e => setCreateForm({ ...createForm, lastName: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control forum-input" required value={createForm.email}
                        onChange={e => setCreateForm({ ...createForm, email: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Mot de passe</label>
                      <input type="password" className="form-control forum-input" required minLength={8} value={createForm.password}
                        onChange={e => setCreateForm({ ...createForm, password: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Rôle</label>
                      <select className="form-control forum-input" value={createForm.role}
                        onChange={e => setCreateForm({ ...createForm, role: e.target.value })}>
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-forum mt-3 w-100">Créer</button>
                </form>
              </div>
            )}

            {/* Détail utilisateur sélectionné */}
            {selected && !showCreate && (
              <div className="admin-form-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 className="mb-0">{selected.firstName} {selected.lastName}</h6>
                    <small className="text-muted">{selected.email}</small>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-forum-outline" onClick={() => setShowEdit(!showEdit)}>✏️ Modifier</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(selected.id)}>🗑️ Supprimer</button>
                  </div>
                </div>

                {/* Formulaire édition */}
                {showEdit && (
                  <form onSubmit={handleEdit} className="mb-4 p-3" style={{ background: 'rgba(124,58,237,0.05)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label">Prénom</label>
                        <input className="form-control forum-input" value={editForm.firstName}
                          onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} />
                      </div>
                      <div className="col-6">
                        <label className="form-label">Nom</label>
                        <input className="form-control forum-input" value={editForm.lastName}
                          onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control forum-input" value={editForm.email}
                          onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Nouveau mot de passe <span className="text-muted">(laisser vide pour ne pas changer)</span></label>
                        <input type="password" className="form-control forum-input" minLength={8} value={editForm.newPassword}
                          onChange={e => setEditForm({ ...editForm, newPassword: e.target.value })} />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-forum btn-sm mt-2">Enregistrer</button>
                  </form>
                )}

                {/* Rôles */}
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
            )}

            {!selected && !showCreate && (
              <div className="empty-state">
                <span>👈</span>
                <p>Sélectionnez un utilisateur ou créez-en un nouveau</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
