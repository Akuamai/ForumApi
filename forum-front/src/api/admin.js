import api from './client'

// Appels API vers /api/admin (réservés aux Admins)
export const getUsers = () => api.get('/admin/users')                                    // Liste tous les utilisateurs
export const getUser = (id) => api.get(`/admin/users/${id}`)                            // Détail d'un utilisateur
export const createUser = (data) => api.post('/admin/users', data)                      // Créer un utilisateur
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data)             // Modifier un utilisateur
export const deleteUser = (id) => api.delete(`/admin/users/${id}`)                      // Supprimer un utilisateur
export const assignRole = (userId, role) => api.post(`/admin/users/${userId}/roles/${role}`)    // Assigner un rôle
export const removeRole = (userId, role) => api.delete(`/admin/users/${userId}/roles/${role}`)  // Retirer un rôle
export const getRoles = () => api.get('/admin/roles')                                   // Liste tous les rôles
