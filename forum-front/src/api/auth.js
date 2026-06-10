import api from './client'

// Appels API vers /api/auth
export const login = (data) => api.post('/auth/login', data)       // Connexion
export const register = (data) => api.post('/auth/register', data) // Inscription
