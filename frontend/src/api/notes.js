// src/api/notes.js — Notes CRUD
import api from './axios';
const BASE = '/notes';
export const getNotes      = (params = {}) => api.get(BASE + '/', { params });
export const getNote       = (id)          => api.get(`${BASE}/${id}/`);
export const createNote    = (data)        => api.post(BASE + '/', data);
export const updateNote    = (id, data)    => api.put(`${BASE}/${id}/`, data);
export const patchNote     = (id, data)    => api.patch(`${BASE}/${id}/`, data);
export const deleteNote    = (id)          => api.delete(`${BASE}/${id}/`);
export const searchNotes   = (q)           => api.get(BASE + '/', { params: { search: q } });
