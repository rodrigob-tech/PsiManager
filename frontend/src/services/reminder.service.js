import api from "./api";

export const sendPatientReminderEmail = (patientId, data, headers = {}) =>
  api.post(`/reminders/patients/${patientId}/email`, data, {
    headers,
  });