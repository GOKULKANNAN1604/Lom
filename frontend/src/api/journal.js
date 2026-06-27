// src/api/journal.js — Daily Journal CRUD
import api from './axios';
const BASE = '/journal';
export const getJournalEntries = (params = {}) => api.get(BASE + '/', { params });
export const getJournalEntry   = (id)          => api.get(`${BASE}/${id}/`);
export const getJournalByDate  = (date)        => api.get(BASE + '/', { params: { date } });
export const createJournalEntry = (data)       => api.post(BASE + '/', data);
export const updateJournalEntry = (id, data)   => api.put(`${BASE}/${id}/`, data);
export const patchJournalEntry  = (id, data)   => api.patch(`${BASE}/${id}/`, data);
export const deleteJournalEntry = (id)         => api.delete(`${BASE}/${id}/`);
