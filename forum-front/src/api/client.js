import axios from 'axios'

// Instance Axios partagée — baseURL relative à l'origine pour fonctionner en dev et en prod
const api = axios.create({
  baseURL: `${window.location.origin}/api`,
})

// Intercepteur : ajoute automatiquement le token JWT dans chaque requête si disponible
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
