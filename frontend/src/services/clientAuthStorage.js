const TOKEN_KEY = "client_token";
const CLIENT_KEY = "client_data";

export function saveClientAuth({ token, client }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(CLIENT_KEY, JSON.stringify(client));
}

export function getClientToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getClientData() {
  const raw = localStorage.getItem(CLIENT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearClientAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CLIENT_KEY);
}

export function isClientAuthenticated() {
  return !!getClientToken();
}