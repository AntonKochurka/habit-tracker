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
  const state = store.getState();
  const token = state.auth.access;

  console.log(token);

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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const data = error.response?.data;

    const isAuthFailure = (respData: any, resp?: any) => {
      const detail = respData?.detail ?? respData?.message ?? "";
      const lower = String(detail).toLowerCase();

      if (
        lower.includes("not authenticated") ||
        lower.includes("token has expired") ||
        lower.includes("invalid token") ||
        lower.includes("unauthenticated")
      ) return true;

      const www = resp?.headers?.["www-authenticate"] ?? "";
      if (String(www).toLowerCase().includes("bearer")) return true;

      if (respData?.code && String(respData.code).toLowerCase().includes("not_authenticated")) return true;

      return false;
    };

    const shouldTryRefresh = (
      (status === 401) ||
      (status === 403 && isAuthFailure(data, error.response))
    ) && !originalRequest._retry;

    if (shouldTryRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const result = await store.dispatch(refreshThunk()).unwrap();
        const newAccess = result.access;

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        failedRequestsQueue.forEach(({ resolve }) => resolve(newAccess));
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

    if (status === 403) {
      return Promise.reject(new Error(data?.detail ?? data?.message ?? "Forbidden"));
    }

    if (error.response) {
      const message = data?.message ?? data?.detail ?? "An error occurred";
      if (status >= 500) console.error("Server error:", data);
      return Promise.reject(new Error(message));
    }

    if (error.message === "Network Error") {
      console.error("Network Error: check your connection");
    }

    return Promise.reject(error);
  }
);

export default api;