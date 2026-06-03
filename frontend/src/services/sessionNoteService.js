import api from "./api";

const optionalSessionNoteFields = [
  "appointmentId",
  "psychologistId",
  "conduct",
  "privateNotes"
];

const normalizeSessionNotePayload = (data) => {
  const payload = { ...data };

  optionalSessionNoteFields.forEach((field) => {
    if (payload[field] === "") {
      payload[field] = null;
    }
  });

  return payload;
};

export const createSessionNote = (data, headers = {}) =>
  api.post("/session-notes", normalizeSessionNotePayload(data), { headers });

export const getSessionNotesByMedicalRecordId = (medicalRecordId, headers = {}) =>
  api.get(`/session-notes/medical-record/${medicalRecordId}`, { headers });

export const getSessionNoteById = (id, headers = {}) =>
  api.get(`/session-notes/${id}`, { headers });

export const updateSessionNote = (id, data, headers = {}) =>
  api.put(`/session-notes/${id}`, normalizeSessionNotePayload(data), {
    headers
  });

export const deleteSessionNote = (id, headers = {}) =>
  api.delete(`/session-notes/${id}`, { headers });
