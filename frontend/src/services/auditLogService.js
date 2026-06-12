import api from "./api";

export const getAuditLogs = (headers = {}) =>
  api.get("/audit-logs", {
    headers,
  });
  export const clearAuditLogs = (headers = {}) =>
  api.delete("/audit-logs", {
    headers,
  });