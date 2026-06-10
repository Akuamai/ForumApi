import api from './client'

// Appels API vers /api/event et /api/presta
export const getEvents = () => api.get('/event')
export const getEvent = (id) => api.get(`/event/${id}`)
export const createEvent = (data) => api.post('/event', data)
export const updateEvent = (id, data) => api.put(`/event/${id}`, data)
export const deleteEvent = (id) => api.delete(`/event/${id}`)
export const registerToEvent = (id) => api.post(`/event/${id}/register`)       // Inscription à un événement
export const unregisterFromEvent = (id) => api.delete(`/event/${id}/register`) // Désinscription
export const getEventRegistrations = (id) => api.get(`/event/${id}/registrations`) // Liste des inscrits (Admin)
export const getPrestas = () => api.get('/presta')
