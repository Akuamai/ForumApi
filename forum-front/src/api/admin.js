import api from './client'

export const getUsers = () => api.get('/admin/users')
export const getUser = (id) => api.get(`/admin/users/${id}`)
export const assignRole = (userId, role) => api.post(`/admin/users/${userId}/roles/${role}`)
export const removeRole = (userId, role) => api.delete(`/admin/users/${userId}/roles/${role}`)
export const getRoles = () => api.get('/admin/roles')
export const createRole = (name) => api.post(`/admin/roles/${name}`)
