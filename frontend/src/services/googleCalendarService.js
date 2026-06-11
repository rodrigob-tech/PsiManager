import api from "./api";

export const getGoogleCalendarAuthUrl = (headers = {}) =>
  api.get("/google-calendar/auth", {
    headers,
  });

export const getGoogleCalendarStatus = (headers = {}) =>
  api.get("/google-calendar/status", {
    headers,
  });