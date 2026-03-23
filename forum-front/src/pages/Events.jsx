import { useEffect, useState } from 'react'
import { getEvents, registerToEvent, unregisterFromEvent } from '../api/events'
import { useAuth } from '../context/AuthContext'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState({})
  const [search, setSearch] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    getEvents().then(r => setEvents(r.data)).finally(() => setLoading(false))
  }, [])

  const isRegistered = (evt) =>
    evt.registrations?.some(r => r.userId === getUserId())

  const getUserId = () => {
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    } catch { return null }
  }

  const handleRegister = async (id) => {
    try {
      await registerToEvent(id)
      const r = await getEvents()
      setEvents(r.data)
      setFeedback({ [id]: { type: 'success', msg: 'Inscription confirmée !' } })
    } catch {
      setFeedback({ [id]: { type: 'danger', msg: 'Erreur lors de l\'inscription.' } })
    }
    setTimeout(() => setFeedback({}), 3000)
  }

  const handleUnregister = async (id) => {
    try {
      await unregisterFromEvent(id)
      const r = await getEvents()
      setEvents(r.data)
      setFeedback({ [id]: { type: 'warning', msg: 'Désinscription effectuée.' } })
    } catch {
      setFeedback({ [id]: { type: 'danger', msg: 'Erreur lors de la désinscription.' } })
    }
    setTimeout(() => setFeedback({}), 3000)
  }

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>📅 Événements</h1>
          <p>Découvrez et inscrivez-vous aux activités disponibles</p>
        </div>

        <div className="search-bar mb-4">
          <input
            type="text"
            className="form-control forum-input"
            placeholder="🔍 Rechercher un événement..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <span>📭</span>
            <p>Aucun événement trouvé.</p>
          </div>
        )}

        <div className="row g-4">
          {filtered.map(evt => (
            <div key={evt.id} className="col-md-6 col-lg-4">
              <div className="event-card">
                <div className="event-card-header">
                  <span className="event-badge">
                    {new Date(evt.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </span>
                  <h5>{evt.title}</h5>
                </div>
                <div className="event-card-body">
                  <p className="event-desc">{evt.description}</p>
                  <div className="event-dates">
                    <span>🕐 {new Date(evt.startDate).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    <span>→ {new Date(evt.endDate).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>

                  {evt.resources?.length > 0 && (
                    <div className="event-resources">
                      <p className="resources-title">📦 Ressources</p>
                      <div className="resources-list">
                        {evt.resources.map((r, i) => (
                          <span key={i} className="resource-tag">{r.resourceName} × {r.quantity}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="event-footer">
                    <span className="participants-count">
                      👥 {evt.registrations?.length ?? 0} inscrit(s)
                    </span>
                    {token && (
                      isRegistered(evt) ? (
                        <button className="btn btn-sm btn-outline-warning" onClick={() => handleUnregister(evt.id)}>
                          Se désinscrire
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-forum" onClick={() => handleRegister(evt.id)}>
                          S'inscrire
                        </button>
                      )
                    )}
                  </div>

                  {feedback[evt.id] && (
                    <div className={`alert alert-${feedback[evt.id].type} mt-2 py-1 small`}>
                      {feedback[evt.id].msg}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
