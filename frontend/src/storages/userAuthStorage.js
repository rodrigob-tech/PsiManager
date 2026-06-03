const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_data";

export function saveUserAuth({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUserToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUserData() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearUserAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isUserAuthenticated() {
  return !!getUserToken();
}