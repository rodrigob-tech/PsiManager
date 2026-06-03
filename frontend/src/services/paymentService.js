import api from "./api";

export const getPayments = (headers = {}) =>
  api.get("/payments", { headers });

export const getPaymentById = (id, headers = {}) =>
  api.get(`/payments/${id}`, { headers });

export const getPaymentByAppointmentId = (appointmentId, headers = {}) =>
  api.get(`/payments/appointment/${appointmentId}`, { headers });

export const createPayment = (data, headers = {}) =>
  api.post("/payments", data, { headers });

export const updatePayment = (id, data, headers = {}) =>
  api.put(`/payments/${id}`, data, { headers });

export const deletePayment = (id, headers = {}) =>
  api.delete(`/payments/${id}`, { headers });