import api from "./api";

export const getMyClinic = (headers = {}) =>
  api.get("/clinics/me", { headers });

export const updateMyClinic = (data, headers = {}) =>
  api.put("/clinics/me", data, { headers });

export const getClinicUsers = (headers = {}) =>
  api.get("/clinics/me/users", { headers });

export const createClinicPsychologist = (data, headers = {}) =>
  api.post("/clinics/me/psychologists", data, { headers });

export const updateClinicUserStatus = (userId, data, headers = {}) =>
  api.patch(`/clinics/me/users/${userId}/status`, data, { headers });