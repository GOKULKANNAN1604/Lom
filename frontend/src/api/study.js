/**
 * src/api/study.js
 * Study pillar CRUD + custom actions (documents, revision cards)
 */
import api from './axios';

// Study Logs
export const getStudyLogs    = (params = {}) => api.get('/study/', { params });
export const getStudyLog     = (id)          => api.get(`/study/${id}/`);
export const createStudyLog  = (data)        => api.post('/study/', data);
export const updateStudyLog  = (id, data)    => api.put(`/study/${id}/`, data);
export const deleteStudyLog  = (id)          => api.delete(`/study/${id}/`);
export const getStudyStreak  = ()            => api.get('/study/streak/');
export const getStudyByDate  = (date)        => api.get('/study/by-date/', { params: { date } });

// Study Documents (PDFs)
export const getStudyDocuments   = ()            => api.get('/study-documents/');
export const getStudyDocument    = (id)          => api.get(`/study-documents/${id}/`);
export const createStudyDocument = (formData)    => api.post('/study-documents/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateStudyDocument = (id, data)    => api.patch(`/study-documents/${id}/`, data); // patch for page updates
export const deleteStudyDocument = (id)          => api.delete(`/study-documents/${id}/`);

// Revision Cards
export const getRevisionCards   = ()            => api.get('/revision-cards/');
export const createRevisionCard = (data)        => api.post('/revision-cards/', data);
export const deleteRevisionCard = (id)          => api.delete(`/revision-cards/${id}/`);
export const reviewRevisionCard = (id)          => api.post(`/revision-cards/${id}/review/`);
