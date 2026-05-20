import api from "./api";

const optionalMedicalRecordFields = [
  "psychologistId",
  "mainComplaint",
  "diagnosisHypothesis",
  "clinicalNotes"
];

const normalizeMedicalRecordPayload = (data) => {
  const payload = { ...data };

  optionalMedicalRecordFields.forEach((field) => {
    if (payload[field] === "") {
      payload[field] = null;
    }
  });

  return payload;
};

export const createMedicalRecord = (data, headers = {}) =>
  api.post("/medical-records", normalizeMedicalRecordPayload(data), { headers });

export const getMedicalRecords = (headers = {}) =>
  api.get("/medical-records", { headers });

export const getMedicalRecordById = (id, headers = {}) =>
  api.get(`/medical-records/${id}`, { headers });

export const getMedicalRecordByPatientId = (patientId, headers = {}) =>
  api.get(`/medical-records/patient/${patientId}`, { headers });

export const updateMedicalRecord = (id, data, headers = {}) =>
  api.put(`/medical-records/${id}`, normalizeMedicalRecordPayload(data), {
    headers
  });
