import api from './client'

export const getEvents = () => api.get('/event')
export const getEvent = (id) => api.get(`/event/${id}`)
export const createEvent = (data) => api.post('/event', data)
export const updateEvent = (id, data) => api.put(`/event/${id}`, data)
export const deleteEvent = (id) => api.delete(`/event/${id}`)
export const registerToEvent = (id) => api.post(`/event/${id}/register`)
export const unregisterFromEvent = (id) => api.delete(`/event/${id}/register`)
export const getEventRegistrations = (id) => api.get(`/event/${id}/registrations`)
