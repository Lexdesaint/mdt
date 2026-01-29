import { logout, setToken } from "../store/authSlice";
import { store } from "../store/store";

const API_BASE = "http://localhost:3000/api/v1";

/* ================= TOKEN HELPERS ================= */
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() > payload.exp * 1000;
  } catch {
    return true;
  }
};

/**
 * Calls the refresh endpoint to get a NEW access token (and possibly new refresh token)
 */
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      throw new Error("Refresh failed");
    }

    const data = await res.json();
    // Adjust according to your actual response shape
    // Common patterns: { accessToken }, or { accessToken, refreshToken }
    return data.body || data; 
  } catch (err) {
    console.error("Refresh token error:", err);
    store.dispatch(logout());
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    return null;
  }
};

/**
 * Returns a valid access token — refreshes automatically if needed
 */
export const getValidAccessToken = async () => {
  let { token: accessToken } = store.getState().auth;

  // 1. We have a token and it's still valid → return it
  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken;
  }

  // 2. Try to refresh
  const newTokens = await refreshAccessToken();

  if (newTokens?.accessToken) {
    // Update Redux
    store.dispatch(setToken(newTokens));

    // Save to storage
    localStorage.setItem("accessToken", newTokens.accessToken);

    if (newTokens.refreshToken) {
      // Optional: refresh token rotation
      localStorage.setItem("refreshToken", newTokens.refreshToken);
    }

    return newTokens.accessToken;
  }

  // 3. Refresh failed → logout
  store.dispatch(logout());
  return null;
};

/* ================= API CORE ================= */
export const apiCall = async (url, options = {}) => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error("No valid authentication token");
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  // Optional: auto-logout on 401
  if (response.status === 401) {
    store.dispatch(logout());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  return response;
};

/* ================= HELPERS ================= */
export const apiGet = (url, options = {}) =>
  apiCall(url, { ...options, method: "GET" });

export const apiPost = (url, body, options = {}) =>
  apiCall(url, { ...options, method: "POST", body: JSON.stringify(body) });

export const apiPatch = (url, body, options = {}) =>
  apiCall(url, { ...options, method: "PATCH", body: JSON.stringify(body) });

export const apiDelete = (url, options = {}) =>
  apiCall(url, { ...options, method: "DELETE" });



