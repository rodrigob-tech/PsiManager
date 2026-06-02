import api from "./api";

export const getReports = (params = {}, headers = {}) =>
  api.get("/reports", {
    params,
    headers,
  });