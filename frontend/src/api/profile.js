/**
 * src/api/profile.js  — Personal Profile CRUD
 * src/api/journal.js  — Daily Journal CRUD
 * src/api/notes.js    — Notes CRUD
 * src/api/finance.js  — Salary + Expense CRUD
 */
import api from './axios';

// ── Profile (single record — GET or PUT) ─────────────────────
export const getProfile    = ()      => api.get('/profile/');
export const saveProfile   = (data)  => api.put('/profile/', data);
export const patchProfile  = (data)  => api.patch('/profile/', data);
