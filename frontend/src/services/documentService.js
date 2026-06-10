import api from "./api";

export const getPaymentReceipt = (paymentId, headers = {}) =>
  api.get(`/documents/payments/${paymentId}/receipt`, {
    headers,
    responseType: "blob",
  });