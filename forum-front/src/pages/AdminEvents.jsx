import { useEffect, useState } from 'react'
import { getEvents, createEvent, updateEvent, deleteEvent, getEventRegistrations } from '../api/events'

const emptyForm = { title: '', description: '', startDate: '', endDate: '', resources: [] }

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [registrations, setRegistrations] = useState({ eventId: null, list: [] })
  const [loading, setLoading] = useState(true)

  const load = () => getEvents().then(r => setEvents(r.data)).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      resources: form.resources.filter(r => r.resourceName.trim())
    }
    if (editId) await updateEvent(editId, payload)
    else await createEvent(payload)
    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
    load()
  }

  const handleEdit = (evt) => {
    setForm({
      title: evt.title,
      description: evt.description,
      startDate: evt.startDate.slice(0, 16),
      endDate: evt.endDate.slice(0, 16),
      resources: evt.resources ?? []
    })
    setEditId(evt.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet événement ?')) return
    await deleteEvent(id)
    load()
  }

  const handleViewRegistrations = async (id) => {
    const r = await getEventRegistrations(id)
    setRegistrations({ eventId: id, list: r.data })
  }

  const addResource = () => setForm({ ...form, resources: [...form.resources, { resourceName: '', quantity: 1 }] })
  const removeResource = (i) => setForm({ ...form, resources: form.resources.filter((_, idx) => idx !== i) })
  const updateResource = (i, field, val) => {
    const updated = [...form.resources]
    updated[i] = { ...updated[i], [field]: val }
    setForm({ ...form, resources: updated })
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header d-flex justify-content-between align-items-center">
          <div>
            <h1>🗓️ Gestion des événements</h1>
            <p>Créez et gérez les événements de la plateforme</p>
          </div>
          <button className="btn btn-forum" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(!showForm) }}>
            {showForm ? 'Annuler' : '+ Nouvel événement'}
          </button>
        </div>

        {showForm && (
          <div className="admin-form-card mb-4">
            <h5>{editId ? 'Modifier l\'événement' : 'Créer un événement'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Titre</label>
                  <input className="form-control forum-input" required value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <input className="form-control forum-input" value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date de début</label>
                  <input type="datetime-local" className="form-control forum-input" required
                    value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date de fin</label>
                  <input type="datetime-local" className="form-control forum-input" required
                    value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>

              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0">📦 Ressources</label>
                  <button type="button" className="btn btn-sm btn-forum-outline" onClick={addResource}>+ Ajouter</button>
                </div>
                {form.resources.map((r, i) => (
                  <div key={i} className="row g-2 mb-2 align-items-center">
                    <div className="col">
                      <input className="form-control forum-input" placeholder="Nom (ex: Table)"
                        value={r.resourceName} onChange={e => updateResource(i, 'resourceName', e.target.value)} />
                    </div>
                    <div className="col-3">
                      <input type="number" className="form-control forum-input" min={1}
                        value={r.quantity} onChange={e => updateResource(i, 'quantity', parseInt(e.target.value))} />
                    </div>
                    <div className="col-auto">
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeResource(i)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-forum mt-3">
                {editId ? 'Enregistrer les modifications' : 'Créer l\'événement'}
              </button>
            </form>
          </div>
        )}

        <div className="admin-table-card">
          <table className="table forum-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Ressources</th>
                <th>Inscrits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(evt => (
                <>
                  <tr key={evt.id}>
                    <td><strong>{evt.title}</strong></td>
                    <td>{new Date(evt.startDate).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>{new Date(evt.endDate).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>{evt.resources?.length ?? 0} type(s)</td>
                    <td>
                      <button className="btn btn-sm btn-forum-outline" onClick={() => handleViewRegistrations(evt.id)}>
                        👥 {evt.registrations?.length ?? 0}
                      </button>
                    </td>
                    <td className="d-flex gap-2">
                      <button className="btn btn-sm btn-forum-outline" onClick={() => handleEdit(evt)}>✏️</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(evt.id)}>🗑️</button>
                    </td>
                  </tr>
                  {registrations.eventId === evt.id && registrations.list.length > 0 && (
                    <tr key={`reg-${evt.id}`}>
                      <td colSpan={6}>
                        <div className="registrations-panel">
                          <strong>Inscrits :</strong>
                          <ul className="mb-0 mt-1">
                            {registrations.list.map((r, i) => (
                              <li key={i}>{r.firstName} {r.lastName} — {r.email}</li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
