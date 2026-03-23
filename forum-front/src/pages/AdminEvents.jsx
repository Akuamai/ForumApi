import { useEffect, useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import { getEvents, createEvent, updateEvent, deleteEvent, getEventRegistrations } from '../api/events'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { 'fr': fr }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), getDay, locales })

const emptyForm = { title: '', description: '', startDate: '', endDate: '', resources: [] }

const messages = {
  next: '›', previous: '‹', today: "Aujourd'hui",
  month: 'Mois', week: 'Semaine', day: 'Jour', agenda: 'Agenda',
  noEventsInRange: 'Aucun événement sur cette période.',
  showMore: n => `+${n} de plus`
}

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [registrations, setRegistrations] = useState([])
  const [showRegs, setShowRegs] = useState(false)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('month')

  const load = async () => {
    const r = await getEvents()
    setEvents(r.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const calEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    start: new Date(e.startDate),
    end: new Date(e.endDate),
    resource: e
  }))

  const openCreate = (slotInfo) => {
    const start = slotInfo.start
    const end = slotInfo.end ?? slotInfo.start
    setForm({
      ...emptyForm,
      startDate: format(start, "yyyy-MM-dd'T'HH:mm"),
      endDate: format(end, "yyyy-MM-dd'T'HH:mm"),
    })
    setEditId(null)
    setShowModal(true)
  }

  const openEdit = (calEvt) => {
    const e = calEvt.resource
    setForm({
      title: e.title,
      description: e.description,
      startDate: format(new Date(e.startDate), "yyyy-MM-dd'T'HH:mm"),
      endDate: format(new Date(e.endDate), "yyyy-MM-dd'T'HH:mm"),
      resources: e.resources ?? []
    })
    setEditId(e.id)
    setShowModal(true)
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const payload = { ...form, resources: form.resources.filter(r => r.resourceName?.trim()) }
    if (editId) await updateEvent(editId, payload)
    else await createEvent(payload)
    setShowModal(false)
    setForm(emptyForm)
    setEditId(null)
    load()
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer cet événement ?')) return
    await deleteEvent(editId)
    setShowModal(false)
    setEditId(null)
    load()
  }

  const handleViewRegs = async () => {
    const r = await getEventRegistrations(editId)
    setRegistrations(r.data)
    setShowRegs(true)
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
      <div className="container-fluid px-4">
        <div className="page-header d-flex justify-content-between align-items-center">
          <div>
            <h1>🗓️ Calendrier des événements</h1>
            <p>Cliquez sur un jour pour créer, sur un événement pour modifier</p>
          </div>
          <button className="btn btn-forum" onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true) }}>
            + Nouvel événement
          </button>
        </div>

        <div className="calendar-wrapper">
          <Calendar
            localizer={localizer}
            events={calEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 650 }}
            messages={messages}
            culture="fr"
            view={view}
            onView={setView}
            selectable
            onSelectSlot={openCreate}
            onSelectEvent={openEdit}
            eventPropGetter={() => ({ className: 'cal-event' })}
          />
        </div>
      </div>

      {/* ── Modal création / édition ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-card-header">
              <h5>{editId ? 'Modifier l\'événement' : 'Nouvel événement'}</h5>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Titre</label>
                  <input className="form-control forum-input" required value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control forum-input" rows={2} value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label">Début</label>
                  <input type="datetime-local" className="form-control forum-input" required
                    value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label">Fin</label>
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
                      <input className="form-control forum-input" placeholder="Ex: Table, Chaise..."
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

              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-forum flex-grow-1">
                  {editId ? 'Enregistrer' : 'Créer'}
                </button>
                {editId && (
                  <>
                    <button type="button" className="btn btn-forum-outline" onClick={handleViewRegs}>👥 Inscrits</button>
                    <button type="button" className="btn btn-outline-danger" onClick={handleDelete}>🗑️</button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal inscrits ── */}
      {showRegs && (
        <div className="modal-overlay" onClick={() => setShowRegs(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-card-header">
              <h5>👥 Inscrits</h5>
              <button className="modal-close" onClick={() => setShowRegs(false)}>✕</button>
            </div>
            {registrations.length === 0 ? (
              <p className="text-muted">Aucun inscrit pour cet événement.</p>
            ) : (
              <ul className="user-list mt-2">
                {registrations.map((r, i) => (
                  <li key={i} className="user-list-item">
                    <div className="user-avatar">{r.firstName?.[0]}{r.lastName?.[0]}</div>
                    <div>
                      <div className="user-name">{r.firstName} {r.lastName}</div>
                      <div className="user-email">{r.email}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
