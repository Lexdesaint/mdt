import { useSelector } from "react-redux";

const API_BASE = "http://localhost:3000/api/v1";

export const getToken = () => {
  return useSelector((state) => state.auth.token);
};

export const createAuthHeader = (token) => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const apiCall = async (endpoint, method = "GET", data = null, token) => {
  const options = {
    method,
    headers: createAuthHeader(token),
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || "API Error");
    }

    return result;
  } catch (error) {
    throw error;
  }
};
