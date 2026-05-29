import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * Axios instance with interceptors for auth token management
 * - Attaches access token to every request
 * - Automatically refreshes token on 401 responses
 * - Queues failed requests during refresh to avoid race conditions
 */
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // Send cookies (refresh token)
  headers: {
    "Content-Type": "application/json",
  },
});

// State for token refresh queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the failed request was the refresh endpoint itself
    if (originalRequest.url === "/auth/refresh") {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post("/auth/refresh");
      const newToken = data.data.accessToken;

      localStorage.setItem("accessToken", newToken);
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Refresh failed — clear auth state and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      // Dispatch custom event so AuthContext can react
      window.dispatchEvent(new CustomEvent("auth:logout"));

      // Create a clean user-facing error instead of leaking token details
      const cleanError = new Error("Your session has expired. Please log in again.");
      cleanError.response = { data: { message: "Your session has expired. Please log in again." } };
      return Promise.reject(cleanError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
