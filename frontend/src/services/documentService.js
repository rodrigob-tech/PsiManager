import api from "./api";

export const getPaymentReceipt = (paymentId, headers = {}) =>
  api.get(`/documents/payments/${paymentId}/receipt`, {
    headers,
    responseType: "blob",
  });
  export const getPatientFile = (patientId, headers = {}) =>
  api.get(`/documents/patients/${patientId}/file`, {
    headers,
    responseType: "blob",
  });