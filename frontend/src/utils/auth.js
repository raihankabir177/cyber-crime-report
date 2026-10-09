// JWT is no longer used; auth is cookie-session based. Kept for backwards compatibility.
export function getToken() { return null; }
export function getUserRole() { return null; }
export async function fetchWithAuth(url, options = {}) {
  return fetch(url, { credentials: "include", ...options });
}
