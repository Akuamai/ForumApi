import { useEffect, useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import { getEvents, registerToEvent, unregisterFromEvent } from '../api/events'
import { useAuth } from '../context/AuthContext'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { 'fr': fr }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), getDay, locales })

const messages = {
  next: '›', previous: '‹', today: "Aujourd'hui",
  month: 'Mois', week: 'Semaine', day: 'Jour', agenda: 'Agenda',
  noEventsInRange: 'Aucun événement sur cette période.',
  showMore: n => `+${n} de plus`
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState({ msg: '', type: '' })
  const [view, setView] = useState('month')
  const { token } = useAuth()

  useEffect(() => {
    getEvents().then(r => setEvents(r.data)).finally(() => setLoading(false))
  }, [])

  const getUserId = () => {
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    } catch { return null }
  }

  const isRegistered = (evt) => evt.registrations?.some(r => r.userId === getUserId())

  const notify = (msg, type) => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback({ msg: '', type: '' }), 3000)
  }

  const handleRegister = async (id) => {
    try {
      await registerToEvent(id)
      const r = await getEvents()
      setEvents(r.data)
      setSelected(r.data.find(e => e.id === id))
      notify('Inscription confirmée !', 'success')
    } catch { notify("Erreur lors de l'inscription.", 'danger') }
  }

  const handleUnregister = async (id) => {
    try {
      await unregisterFromEvent(id)
      const r = await getEvents()
      setEvents(r.data)
      setSelected(r.data.find(e => e.id === id))
      notify('Désinscription effectuée.', 'warning')
    } catch { notify('Erreur lors de la désinscription.', 'danger') }
  }

  const calEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    start: new Date(e.startDate),
    end: new Date(e.endDate),
    resource: e
  }))

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="page-wrapper">
      <div className="container-fluid px-4">
        <div className="page-header">
          <h1>📅 Événements</h1>
          <p>Cliquez sur un événement pour voir les détails et vous inscrire</p>
        </div>

        {/* ── Layout liste + calendrier ── */}
        <div className="d-flex gap-4 mb-4" style={{ alignItems: 'flex-start' }}>

          {/* Liste défilante */}
          <div className="events-scroll-list">
            {events.length === 0 && <p className="text-muted">Aucun événement disponible.</p>}
            {events.map(evt => (
              <div key={evt.id} className="event-card" onClick={() => setSelected(evt)} style={{ cursor: 'pointer' }}>
                <div className="event-card-header">
                  <span className="event-badge">
                    {new Date(evt.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <h5 className="event-title">{evt.title}</h5>
                </div>
                <div className="event-card-body">
                  {evt.description && <p className="event-description">{evt.description}</p>}
                  <div className="event-dates">
                    <span>🕐 {new Date(evt.startDate).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    <span>🏁 {new Date(evt.endDate).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="participants-count">👥 {evt.registrations?.length ?? 0} inscrit(s)</span>
                    {isRegistered(evt) && <span className="badge bg-success">Inscrit ✓</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Calendrier */}
          <div className="calendar-wrapper" style={{ flex: 1 }}>
            <Calendar
              localizer={localizer}
              events={calEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 550 }}
              messages={messages}
              culture="fr"
              view={view}
              onView={setView}
              onSelectEvent={calEvt => setSelected(calEvt.resource)}
              eventPropGetter={() => ({ className: 'cal-event' })}
            />
          </div>

        </div>

        {/* ── Modal détail événement ── */}
        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-card-header">
                <div>
                  <span className="event-badge mb-1 d-inline-block">
                    {new Date(selected.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <h5 className="mb-0">{selected.title}</h5>
                </div>
                <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
              </div>

              {selected.description && <p className="text-muted mb-3">{selected.description}</p>}

              <div className="event-dates mb-3">
                <span>🕐 Début : {new Date(selected.startDate).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                <span>🕐 Fin : {new Date(selected.endDate).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>

              {selected.resources?.length > 0 && (
                <div className="event-resources mb-3">
                  <p className="resources-title">📦 Ressources disponibles</p>
                  <div className="resources-list">
                    {selected.resources.map((r, i) => (
                      <span key={i} className="resource-tag">{r.resourceName} × {r.quantity}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mt-3">
                <span className="participants-count">👥 {selected.registrations?.length ?? 0} inscrit(s)</span>
                {token && (
                  isRegistered(selected) ? (
                    <button className="btn btn-outline-warning" onClick={() => handleUnregister(selected.id)}>
                      Se désinscrire
                    </button>
                  ) : (
                    <button className="btn btn-forum" onClick={() => handleRegister(selected.id)}>
                      S'inscrire
                    </button>
                  )
                )}
                {!token && <span className="text-muted small">Connectez-vous pour vous inscrire</span>}
              </div>

              {feedback.msg && (
                <div className={`alert alert-${feedback.type} mt-3 py-2`}>{feedback.msg}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
