import api from "./api";

const optionalPatientFields = [
  "email",
  "phone",
  "cpf",
  "birthDate",
  "gender",
  "emergencyName",
  "emergencyPhone",
  "guardianName",
  "guardianPhone",
  "address",
  "notes"
];

const normalizePatientPayload = (data) => {
  const payload = { ...data };

  optionalPatientFields.forEach((field) => {
    if (payload[field] === "") {
      payload[field] = null;
    }
  });

  return payload;
};

export const getPatients = (headers = {}) =>
  api.get("/patients", { headers });

export const getPatientById = (id, headers = {}) =>
  api.get(`/patients/${id}`, { headers });

export const createPatient = (data, headers = {}) =>
  api.post("/patients", normalizePatientPayload(data), { headers });

export const updatePatient = (id, data, headers = {}) =>
  api.put(`/patients/${id}`, normalizePatientPayload(data), { headers });

export const deletePatient = (id, headers = {}) =>
  api.delete(`/patients/${id}`, { headers });
