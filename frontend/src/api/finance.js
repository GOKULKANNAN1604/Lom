// src/api/finance.js — Salary + Expense CRUD
import api from './axios';
export const getSalaryRecords  = (params={}) => api.get('/salary/', { params });
export const getSalaryRecord   = (id)        => api.get(`/salary/${id}/`);
export const createSalaryRecord= (data)      => api.post('/salary/', data);
export const updateSalaryRecord= (id, data)  => api.put(`/salary/${id}/`, data);
export const deleteSalaryRecord= (id)        => api.delete(`/salary/${id}/`);

export const getExpenses       = (params={}) => api.get('/expenses/', { params });
export const createExpense     = (data)      => api.post('/expenses/', data);
export const updateExpense     = (id, data)  => api.put(`/expenses/${id}/`, data);
export const deleteExpense     = (id)        => api.delete(`/expenses/${id}/`);
