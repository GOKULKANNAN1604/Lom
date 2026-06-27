/**
 * src/api/performance.js
 * Performance pillar CRUD + custom actions
 */
import api from './axios';

const BASE = '/performance';

// List (summary, paginated)
// Supports: ?date_logged=YYYY-MM-DD, ?activity_type=GYM, ?ordering=-date_logged
export const getPerformanceLogs  = (params = {}) => api.get(BASE + '/', { params });

// Single log
export const getPerformanceLog   = (id)          => api.get(`${BASE}/${id}/`);

// Create
export const createPerformanceLog = (data)       => api.post(BASE + '/', data);

// Full update
export const updatePerformanceLog = (id, data)   => api.put(`${BASE}/${id}/`, data);

// Partial update (e.g. patch just `notes`)
export const patchPerformanceLog  = (id, data)   => api.patch(`${BASE}/${id}/`, data);

// Delete
export const deletePerformanceLog = (id)         => api.delete(`${BASE}/${id}/`);

// GET /api/performance/streak/
export const getPerformanceStreak = ()           => api.get(`${BASE}/streak/`);

// GET /api/performance/by-date/?date=YYYY-MM-DD
export const getPerformanceByDate = (date)       => api.get(`${BASE}/by-date/`, { params: { date } });
