import api from './client'

export const getUsers = () => api.get('/admin/users')
export const getUser = (id) => api.get(`/admin/users/${id}`)
export const createUser = (data) => api.post('/admin/users', data)
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/admin/users/${id}`)
export const assignRole = (userId, role) => api.post(`/admin/users/${userId}/roles/${role}`)
export const removeRole = (userId, role) => api.delete(`/admin/users/${userId}/roles/${role}`)
export const getRoles = () => api.get('/admin/roles')
