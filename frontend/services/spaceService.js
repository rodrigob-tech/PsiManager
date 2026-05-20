import api from "./api";

export const getSpaces = (headers = {}) =>
  api.get("/spaces", { headers });

export const createSpace = (data, headers = {}) =>
  api.post("/spaces", data, { headers });

export const updateSpace = (id, data, headers = {}) =>
  api.put(`/spaces/${id}`, data, { headers });

export const deleteSpace = (id, headers = {}) =>
  api.delete(`/spaces/${id}`, { headers });