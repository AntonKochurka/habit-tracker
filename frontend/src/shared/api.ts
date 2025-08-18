import axios from "axios";
import { store } from "./store";
import { refreshThunk } from "@app/auth/redux/thunks";
import { logout } from "@app/auth/redux";

const api = axios.create({
	withCredentials: true,
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const state = store.getState()
  const token = state.auth;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
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
        const result = await store.dispatch(refreshThunk()).unwrap();
        
        originalRequest.headers.Authorization = `Bearer ${result.access}`;
        
        failedRequestsQueue.forEach(({ resolve }) => resolve(result.access));
        failedRequestsQueue = [];
        
        return api(originalRequest);
      } catch (refreshError) {
        failedRequestsQueue.forEach(({ reject }) => reject(refreshError));
        failedRequestsQueue = [];

        store.dispatch(logout());

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || "An error occurred";

      if (status === 403) {
        console.warn("Forbidden action attempted");
      }

      if (status >= 500) {
        console.error("Server error:", data);
      }

      throw new Error(message);
    }

    if (error.message === "Network Error") {
      console.error("Network Error: Please check your internet connection");
    }

    return Promise.reject(error);
  }
);

export default api;