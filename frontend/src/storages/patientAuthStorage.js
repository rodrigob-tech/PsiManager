const TOKEN_KEY = "patient_token";
const PATIENT_KEY = "patient_data";

export function savePatientAuth({ token, patient }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(PATIENT_KEY, JSON.stringify(patient));
}

export function getPatientToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getPatientData() {
  const raw = localStorage.getItem(PATIENT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearPatientAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PATIENT_KEY);
}

export function isPatientAuthenticated() {
  return !!getPatientToken();
}
