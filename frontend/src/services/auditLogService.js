import api from "./api";

export const getAuditLogs = (headers = {}) =>
  api.get("/audit-logs", {
    headers,
  });