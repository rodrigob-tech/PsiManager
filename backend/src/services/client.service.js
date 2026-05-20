import api from "./api";

export const getClients = (headers = {}) =>
  api.get("/clients", { headers });

export const createClient = (data, headers = {}) =>
  api.post("/clients", data, { headers });

export const updateClient = (id, data, headers = {}) =>
  api.put(`/clients/${id}`, data, { headers });

export const deleteClient = (id, headers = {}) =>
  api.delete(`/clients/${id}`, { headers });