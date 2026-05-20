import api from "./api";

export const getAppointments = (headers = {}) =>
  api.get("/appointments", { headers });

export const createAppointment = (data, headers = {}) =>
  api.post("/appointments", data, { headers });

export const updateAppointment = (id, data, headers = {}) =>
  api.put(`/appointments/${id}`, data, { headers });

export const deleteAppointment = (id, headers = {}) =>
  api.delete(`/appointments/${id}`, { headers });