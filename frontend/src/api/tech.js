/**
 * src/api/tech.js
 * Tech pillar CRUD + custom actions
 */
import api from './axios';

const BASE = '/tech';

export const getTechLogs    = (params = {}) => api.get(BASE + '/', { params });
export const getTechLog     = (id)          => api.get(`${BASE}/${id}/`);
export const createTechLog  = (data)        => api.post(BASE + '/', data);
export const updateTechLog  = (id, data)    => api.put(`${BASE}/${id}/`, data);
export const patchTechLog   = (id, data)    => api.patch(`${BASE}/${id}/`, data);
export const deleteTechLog  = (id)          => api.delete(`${BASE}/${id}/`);
export const getTechStreak  = ()            => api.get(`${BASE}/streak/`);
export const getTechByDate  = (date)        => api.get(`${BASE}/by-date/`, { params: { date } });

// Search: GET /api/tech/?search=<query>
export const searchTechLogs = (query)       => api.get(BASE + '/', { params: { search: query } });
