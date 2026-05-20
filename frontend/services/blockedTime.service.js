import api from "./api";

export const getBlockedTimes = (headers = {}) =>
  api.get("/blocked-times", { headers });

export const createBlockedTime = (data, headers = {}) =>
  api.post("/blocked-times", data, { headers });

export const updateBlockedTime = (id, data, headers = {}) =>
  api.put(`/blocked-times/${id}`, data, { headers });

export const deleteBlockedTime = (id, headers = {}) =>
  api.delete(`/blocked-times/${id}`, { headers });