export const API_BASE = (
  process.env.REACT_APP_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

/** Build an absolute backend URL from a path like "/admin/users". */
export function apiUrl(path) {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

/** fetch() against the backend; always sends the session cookie. */
export function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), { credentials: "include", ...options });
}

/** Resolve evidence download/view URL (Cloudinary via API, legacy local fallback). */
export function evidenceFileUrl(ev) {
  if (!ev) return "#";
  return (
    ev.file_url ||
    ev.cloudinary_url ||
    `${API_BASE}/uploads/${ev.filename}`
  );
}

/** End the server session and clear client-side state. */
export async function logout() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // network failure: still clear local state
  }
  sessionStorage.clear();
}
