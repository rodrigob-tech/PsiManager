import api from "./api";

export const getPatients = (headers = {}) =>
  api.get("/patients", { headers });

export const createPatient = (data, headers = {}) =>
  api.post("/patients", data, { headers });

export const updatePatient = (id, data, headers = {}) =>
  api.put(`/patients/${id}`, data, { headers });

export const deletePatient = (id, headers = {}) =>
  api.delete(`/patients/${id}`, { headers });
